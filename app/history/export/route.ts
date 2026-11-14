// Owner: Oggy — GET /history/export?type=&q= : the drafts listed on /history as a CSV file.
// Uses the signed-in user's Supabase client, so RLS limits it to their own business (NFR-02),
// and the same filters as the page (lib/history.ts), so the file matches what's on screen.
// /history/* is in PROTECTED (proxy.ts); the user check here is a second line of defence.
import { createClient } from '@/lib/supabase/server';
import { FORMAT_LABELS, fullDateTime } from '@/lib/display';
import { HISTORY_LIMIT, historyFilters, parseHistoryParams } from '@/lib/history';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = parseHistoryParams({ type: url.searchParams.get('type'), q: url.searchParams.get('q') });
  const f = historyFilters(params);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response('Please log in again, then export.', { status: 401 });

  let query = supabase
    .from('generated_content')
    .select('title, content_type, updated_at, keywords, seo_score, tone_match, body')
    .order('updated_at', { ascending: false })
    .limit(HISTORY_LIMIT);
  if (f.type) query = query.eq('content_type', f.type);
  if (f.search) query = query.or(f.search);
  const { data, error } = await query;
  if (error) {
    console.error('[history/export] query failed:', error.message);
    return new Response("Couldn't export your drafts. Please try again.", { status: 500 });
  }

  const rows: string[][] = [
    ['Title', 'Format', 'Last saved', 'Keyword score', 'Tone match', 'Keywords', 'Text'],
    ...(data ?? []).map((d) => [
      d.title?.trim() || 'Untitled draft',
      FORMAT_LABELS[d.content_type],
      fullDateTime(d.updated_at),
      d.seo_score === null ? '' : `${Math.round(d.seo_score * 100)}%`,
      d.tone_match === null ? '' : d.tone_match ? 'Yes' : 'No',
      d.keywords.join(', '),
      d.body,
    ]),
  ];
  // BOM so Excel reads the file as UTF-8 (emoji, accented café names)
  const csv = '﻿' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';

  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Melbourne' }).format(new Date());
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="drafts-${today}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}

function csvCell(value: string) {
  // Stop spreadsheet apps from running text that starts like a formula (CSV injection)
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}
