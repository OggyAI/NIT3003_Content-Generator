// Owner: Oggy — POST /api/analyse (FR-15, FR-16, Algorithm 3 analyseContent).
//
// Analyses the SAVED version of a content item (the editor saves first):
//   SEO  — keyword coverage and density, computed locally (lib/analysis/seo.ts)
//   tone — one OpenAI call compared with the stored brand voice (lib/analysis/tone.ts)
// Results are stored on generated_content (seo_score, tone_match).
// Errors: 400 invalid / too short / no brand voice, 401, 404 not yours or
// missing (RLS hides other businesses' rows, so we never reveal they exist),
// 503 when only the tone check was requested and the AI service failed.
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyseSeo, countWords, MIN_ANALYSIS_WORDS } from '@/lib/analysis/seo';
import { analyseTone } from '@/lib/analysis/tone';
import { isUuid } from '@/lib/validation';
import type { AnalyseResponse } from '@/lib/types';

export const maxDuration = 60;

const TYPES = ['seo', 'tone', 'both'] as const;
type AnalysisType = (typeof TYPES)[number];

export async function POST(request: Request) {
  let raw: Record<string, unknown>;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_request', message: 'Request body must be JSON.' }, { status: 400 });
  }
  const contentId = raw?.contentId;
  const analysisType = raw?.analysisType as AnalysisType;
  if (!isUuid(contentId) || !TYPES.includes(analysisType)) {
    return NextResponse.json(
      { error: 'invalid_request', message: 'Send a contentId and analysisType of seo, tone or both.' },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorised' }, { status: 401 });

  // RLS: returns null for content belonging to another business.
  const { data: content } = await supabase
    .from('generated_content')
    .select('id, business_id, title, body, keywords')
    .eq('id', contentId)
    .maybeSingle();
  if (!content) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  // UC-05 E1: too short to analyse meaningfully
  if (countWords(content.body) < MIN_ANALYSIS_WORDS) {
    return NextResponse.json(
      { error: 'too_short', message: `Content needs at least ${MIN_ANALYSIS_WORDS} words to analyse accurately.` },
      { status: 400 },
    );
  }

  const wantSeo = analysisType !== 'tone';
  const wantTone = analysisType !== 'seo';
  const report: AnalyseResponse = {
    seoScore: null,
    keywordStats: [],
    seoSuggestion: null,
    toneMatch: null,
    detectedTone: null,
    suggestion: null,
  };

  if (wantSeo) {
    const seo = analyseSeo(content.title ?? '', content.body, content.keywords ?? []);
    report.seoScore = seo.seoScore;
    report.keywordStats = seo.keywordStats;
    report.seoSuggestion = seo.suggestion;
  }

  if (wantTone) {
    // UC-05 E2: need a brand voice to compare against
    const { data: voiceRow } = await supabase
      .from('brand_voice')
      .select('voice')
      .eq('business_id', content.business_id)
      .maybeSingle();
    if (!voiceRow) {
      return NextResponse.json(
        { error: 'no_brand_voice', message: 'Select a brand voice in your business profile before running tone analysis.' },
        { status: 400 },
      );
    }
    try {
      const tone = await analyseTone(`${content.title ?? ''}\n\n${content.body}`, voiceRow.voice);
      report.toneMatch = tone.toneMatch;
      report.detectedTone = tone.detectedTone;
      report.suggestion = tone.suggestion;
    } catch (err) {
      // UC-05 E3: analysis service unavailable
      console.error('[api/analyse] tone check failed:', err instanceof Error ? err.message : err);
      if (!wantSeo) {
        return NextResponse.json(
          { error: 'analysis_failed', message: 'Tone analysis is unavailable right now — please try again.' },
          { status: 503 },
        );
      }
      report.toneError = 'Tone analysis is unavailable right now — the SEO result is still shown.';
    }
  }

  // Persist only the parts that were actually computed (Algorithm 3).
  const update: { seo_score?: number | null; tone_match?: boolean | null } = {};
  if (wantSeo) update.seo_score = report.seoScore;
  if (wantTone && !report.toneError) update.tone_match = report.toneMatch;
  const { error: updateError } = await supabase.from('generated_content').update(update).eq('id', content.id);
  if (updateError) console.error('[api/analyse] could not store results:', updateError.message);

  return NextResponse.json(report);
}
