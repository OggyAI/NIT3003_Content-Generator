// Owner: Oggy. Draft history filters (FR-14), shared by /history and its CSV export so the
// export always contains exactly the drafts on screen. RLS limits every query to the
// signed-in user's own business; these helpers only narrow it further.
import type { ContentType } from '@/lib/types';

/** NFR-04: the list stays small and fast; history shows the most recent 100 */
export const HISTORY_LIMIT = 100;
export const SEARCH_MAX = 100;

export type HistoryFilter = ContentType | 'all';
export type HistoryParams = { filter: HistoryFilter; q: string };

export function parseHistoryParams(sp: { type?: string | string[] | null; q?: string | string[] | null }): HistoryParams {
  const type = typeof sp.type === 'string' ? sp.type : '';
  const filter: HistoryFilter = type === 'blog' || type === 'social' || type === 'email' ? type : 'all';
  const q = (typeof sp.q === 'string' ? sp.q : '').trim().slice(0, SEARCH_MAX);
  return { filter, q };
}

/**
 * Filters to apply to a generated_content query:
 *   if (f.type) query = query.eq('content_type', f.type);
 *   if (f.search) query = query.or(f.search);
 * The search is a case-insensitive match on title or body. LIKE wildcards in the user's text
 * are escaped, and characters that would break PostgREST's or() syntax are dropped.
 */
export function historyFilters({ filter, q }: HistoryParams): { type: ContentType | null; search: string | null } {
  let search: string | null = null;
  const cleaned = q.replace(/[,()"]/g, ' ').trim();
  if (cleaned) {
    const pattern = `%${cleaned.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    search = `title.ilike.${pattern},body.ilike.${pattern}`;
  }
  return { type: filter === 'all' ? null : filter, search };
}

/** /history URL for a filter and search, leaving out empty parts */
export function historyHref({ filter, q }: HistoryParams, base = '/history'): string {
  const sp = new URLSearchParams();
  if (filter !== 'all') sp.set('type', filter);
  if (q) sp.set('q', q);
  const s = sp.toString();
  return s ? `${base}?${s}` : base;
}
