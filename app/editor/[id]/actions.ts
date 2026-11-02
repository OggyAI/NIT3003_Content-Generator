'use server';
// Owner: Oggy — FR-12 editing and FR-13 draft storage (Algorithm 2 editAndSaveDraft),
// plus duplicate (Figure 1.7) and delete (FR-13 "drafts removed by the user").
//
// Every action re-checks the signed-in user on the server, and RLS means a
// query for another business's content simply finds nothing — so we answer
// "not found or not yours" without revealing whether it exists (UC-04 E4).
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { isUuid, validateContentInput } from '@/lib/validation';

export type ActionResult =
  | { ok: true; id: string; updatedAt?: string; message: string }
  | { ok: false; message: string };

const NOT_YOURS = 'This content was not found, or you do not have permission to edit it.';
const SAVE_FAILED = 'Could not save the draft — please try again.';

async function signedIn() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? supabase : null;
}

function refresh(id?: string) {
  revalidatePath('/history');
  revalidatePath('/dashboard');
  if (id) revalidatePath(`/editor/${id}`);
}

/** Algorithm 2, createNewVersion = false: update the existing draft. */
export async function saveDraft(id: string, input: unknown): Promise<ActionResult> {
  const v = validateContentInput(input);
  if (!v.ok) return v;
  if (!isUuid(id)) return { ok: false, message: NOT_YOURS };
  const supabase = await signedIn();
  if (!supabase) return { ok: false, message: 'Your session has expired. Please log in again.' };

  const { data, error } = await supabase
    .from('generated_content')
    .update({
      title: v.value.title,
      body: v.value.body,
      keywords: v.value.keywords,
      is_draft: true,
      // The text changed, so earlier analysis no longer applies.
      seo_score: null,
      tone_match: null,
    })
    .eq('id', id)
    .select('id, updated_at')
    .maybeSingle();

  if (error) return { ok: false, message: SAVE_FAILED };
  if (!data) return { ok: false, message: NOT_YOURS };
  refresh(id);
  return { ok: true, id: data.id, updatedAt: data.updated_at, message: 'Draft saved successfully.' };
}

/** Algorithm 2, createNewVersion = true: keep the original and save a copy with the edits. */
export async function saveAsNewVersion(id: string, input: unknown): Promise<ActionResult> {
  const v = validateContentInput(input);
  if (!v.ok) return v;
  return copyContent(id, v.value, 'New version saved.');
}

/** History "Duplicate": copy a draft as-is. */
export async function duplicateDraft(id: string): Promise<ActionResult> {
  return copyContent(id, null, 'Draft duplicated.');
}

async function copyContent(
  id: string,
  edits: { title: string; body: string; keywords: string[] } | null,
  message: string,
): Promise<ActionResult> {
  if (!isUuid(id)) return { ok: false, message: NOT_YOURS };
  const supabase = await signedIn();
  if (!supabase) return { ok: false, message: 'Your session has expired. Please log in again.' };

  const { data: original } = await supabase
    .from('generated_content')
    .select('business_id, request_id, content_type, title, body, keywords')
    .eq('id', id)
    .maybeSingle();
  if (!original) return { ok: false, message: NOT_YOURS };

  const baseTitle = edits?.title ?? original.title ?? 'Untitled draft';
  const { data, error } = await supabase
    .from('generated_content')
    .insert({
      business_id: original.business_id,
      request_id: original.request_id,
      content_type: original.content_type,
      title: edits ? baseTitle.slice(0, 200) : `${baseTitle} (copy)`.slice(0, 200),
      body: edits?.body ?? original.body,
      keywords: edits?.keywords ?? original.keywords,
      is_draft: true,
    })
    .select('id')
    .single();

  if (error || !data) return { ok: false, message: SAVE_FAILED };
  refresh();
  return { ok: true, id: data.id, message };
}

export async function deleteDraft(id: string): Promise<ActionResult> {
  if (!isUuid(id)) return { ok: false, message: NOT_YOURS };
  const supabase = await signedIn();
  if (!supabase) return { ok: false, message: 'Your session has expired. Please log in again.' };

  const { data, error } = await supabase.from('generated_content').delete().eq('id', id).select('id');
  if (error) return { ok: false, message: 'Could not delete the draft — please try again.' };
  if (!data?.length) return { ok: false, message: NOT_YOURS };
  refresh();
  return { ok: true, id, message: 'Draft deleted.' };
}
