// Owner: Oggy — POST /api/generate (FR-07 to FR-11, Algorithm 1 generateContent).
//
// Flow (matches the sequence diagram in the proposal):
//   validate request → check signed in → load business profile
//   → 400 if incomplete → build prompt (FR-11) → call OpenAI (retries)
//   → log content_requests with status + generation_ms (NFR-03 evidence)
//   → save draft to generated_content → 200 {contentId, title, body, generationMs}
// Failures: 401 not signed in, 400 invalid/incomplete, 503 model failed,
// 500 save failed. The page keeps the user's typed request on any error (NFR-05).
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getBusinessContext } from '@/lib/business-context';
import { buildPrompt } from '@/lib/prompt-builder';
import { classifyOpenAIError, describeOpenAIError, generateTitleAndBody } from '@/lib/openai';
import { validateGenerateInput } from '@/lib/validation';
import type { GenerationFailureReason } from '@/lib/types';

// Worst case: 3 attempts × 20 s. Vercel must not cut the function off first.
export const maxDuration = 60;

export async function POST(request: Request) {
  // 1. Validate input
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_request', message: 'Request body must be JSON.' }, { status: 400 });
  }
  const validation = validateGenerateInput(raw);
  if (!validation.ok) {
    return NextResponse.json({ error: 'invalid_request', message: validation.message }, { status: 400 });
  }
  const input = validation.value;

  // 2. Signed in?
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorised' }, { status: 401 });
  }

  // 3. Load the business profile; refuse before calling the model if incomplete
  const ctx = await getBusinessContext(supabase);
  if (!ctx || ctx.missing.length > 0) {
    return NextResponse.json(
      { error: 'profile_incomplete', missing: ctx?.missing ?? ['business profile'] },
      { status: 400 },
    );
  }

  // 4. Build the prompt and call the model, timing the whole attempt
  const { instructions, input: promptInput } = buildPrompt(ctx, {
    contentType: input.contentType,
    platform: input.platform ?? undefined,
    request: input.request,
    keywords: input.keywords,
  });

  const started = Date.now();
  let generated: { title: string; body: string } | null = null;
  let failure: GenerationFailureReason = 'unknown';
  try {
    generated = await generateTitleAndBody(instructions, promptInput);
  } catch (err) {
    // Details stay in the server log; the browser only gets the short reason
    failure = classifyOpenAIError(err);
    console.error(`[api/generate] model call failed (${failure}):`, describeOpenAIError(err));
  }
  const generationMs = Date.now() - started;

  // 5. Log the request (success or failure) for history and NFR-03 timing evidence
  const { data: requestRow, error: requestError } = await supabase
    .from('content_requests')
    .insert({
      business_id: ctx.businessId,
      content_type: input.contentType,
      platform: input.platform,
      user_request: input.request,
      status: generated ? 'success' : 'failed',
      generation_ms: generationMs,
    })
    .select('id')
    .single();
  if (requestError) console.error('[api/generate] could not log request:', requestError.message);

  if (!generated) {
    return NextResponse.json({ error: 'generation_failed', reason: failure }, { status: 503 });
  }

  // 6. Save as a draft. Only report success once it is stored.
  const { data: saved, error: saveError } = await supabase
    .from('generated_content')
    .insert({
      business_id: ctx.businessId,
      request_id: requestRow?.id ?? null,
      content_type: input.contentType,
      title: generated.title,
      body: generated.body,
      keywords: input.keywords,
      is_draft: true,
    })
    .select('id')
    .single();

  if (saveError || !saved) {
    console.error('[api/generate] could not save draft:', saveError?.message);
    if (requestRow) {
      await supabase.from('content_requests').update({ status: 'failed' }).eq('id', requestRow.id);
    }
    return NextResponse.json({ error: 'save_failed' }, { status: 500 });
  }

  return NextResponse.json({
    contentId: saved.id,
    title: generated.title,
    body: generated.body,
    generationMs,
  });
}
