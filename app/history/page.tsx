// Owner: Oggy — FR-14 content history (Figure 1.7). Rebuilt for the UI overhaul (CLAUDE.md §2.2).
// Lists this business's saved content newest first (RLS limits it to the owner), with a
// format filter (?type=), a search on title and text (?q=, server-side), a CSV export of
// exactly what's listed, and Open / Duplicate on every row. NFR-04: one query, only the
// columns shown, at most HISTORY_LIMIT rows.
import Link from 'next/link';
import Form from 'next/form';
import AppShell from '@/components/AppShell';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { buttonClasses } from '@/components/ui/Button';
import { DownloadIcon, SearchIcon } from '@/components/icons';
import { createClient } from '@/lib/supabase/server';
import { FORMAT_LABELS, fullDateTime, timeAgo } from '@/lib/display';
import { HISTORY_LIMIT, SEARCH_MAX, historyFilters, historyHref, parseHistoryParams, type HistoryFilter } from '@/lib/history';
import DuplicateButton from './DuplicateButton';

const FILTERS: { value: HistoryFilter; label: string; empty: string }[] = [
  { value: 'all', label: 'All', empty: 'drafts' },
  { value: 'social', label: 'Social posts', empty: 'social post drafts' },
  { value: 'blog', label: 'Blog outlines', empty: 'blog outline drafts' },
  { value: 'email', label: 'Email newsletters', empty: 'email newsletter drafts' },
];

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string | string[]; q?: string | string[] }>;
}) {
  const params = parseHistoryParams(await searchParams);
  const { filter, q } = params;
  const f = historyFilters(params);

  const supabase = await createClient();
  let query = supabase
    .from('generated_content')
    .select('id, title, content_type, seo_score, tone_match, updated_at')
    .order('updated_at', { ascending: false })
    .limit(HISTORY_LIMIT);
  if (f.type) query = query.eq('content_type', f.type);
  if (f.search) query = query.or(f.search);
  const { data: items, error } = await query;

  const count = items?.length ?? 0;
  const filterInfo = FILTERS.find((x) => x.value === filter) ?? FILTERS[0];

  return (
    <AppShell width="wide">
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Draft history"
          description="Open, search and export your saved drafts."
          actions={
            count > 0 ? (
              // A plain link: the browser downloads the file instead of navigating
              <a href={historyHref(params, '/history/export')} download className={buttonClasses('secondary')}>
                <DownloadIcon className="h-4 w-4" />
                Export CSV
              </a>
            ) : undefined
          }
        />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <nav aria-label="Filter by format" className="min-w-0">
            <ul className="flex flex-wrap gap-1 rounded-control border border-field bg-white p-1">
              {FILTERS.map((x) => {
                const active = x.value === filter;
                return (
                  <li key={x.value}>
                    <Link
                      href={historyHref({ filter: x.value, q })}
                      aria-current={active ? 'page' : undefined}
                      className={
                        'flex min-h-9 items-center rounded-lg px-3 text-sm font-medium transition-colors ' +
                        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ' +
                        (active ? 'bg-navy text-white' : 'text-ink hover:bg-navy-50')
                      }
                    >
                      {x.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* GET form: updates ?q= and keeps the current filter */}
          <Form action="/history" role="search" className="flex items-end gap-2 lg:w-96">
            {filter !== 'all' && <input type="hidden" name="type" value={filter} />}
            <div className="min-w-0 flex-1">
              <Input
                type="search"
                name="q"
                label="Search drafts"
                placeholder="Words in the title or text"
                defaultValue={q}
                maxLength={SEARCH_MAX}
              />
            </div>
            <button type="submit" className={buttonClasses('secondary')}>
              <SearchIcon className="h-4 w-4" />
              Search
            </button>
          </Form>
        </div>

        {(q || count > 0) && !error && (
          <p role="status" className="-mt-2 text-sm text-muted">
            {q ? (
              <>
                {count} {count === 1 ? 'draft matches' : 'drafts match'} &ldquo;{q}&rdquo;
                {filter !== 'all' && ` in ${filterInfo.label.toLowerCase()}`}.{' '}
                <Link
                  href={historyHref({ filter, q: '' })}
                  className="font-medium text-navy underline underline-offset-4 hover:no-underline"
                >
                  Clear search
                </Link>
              </>
            ) : count >= HISTORY_LIMIT ? (
              `Showing your ${HISTORY_LIMIT} most recent drafts.`
            ) : (
              `${count} ${count === 1 ? 'draft' : 'drafts'}, newest first.`
            )}
          </p>
        )}

        {error ? (
          <p role="alert" className="rounded-control border border-danger/30 bg-danger-light p-4 text-sm text-danger">
            Couldn&apos;t load your drafts. Refresh the page to try again.
          </p>
        ) : count === 0 ? (
          q ? (
            <EmptyState
              title={`No drafts match “${q}”`}
              text="Try a different word, or clear the search to see everything."
              action={
                <Link href={historyHref({ filter, q: '' })} className={buttonClasses('secondary')}>
                  Clear search
                </Link>
              }
            />
          ) : (
            <EmptyState
              title={`No ${filterInfo.empty} yet`}
              text={
                filter === 'all'
                  ? 'Drafts you create are saved here automatically.'
                  : `When you create a ${filterInfo.label.toLowerCase().replace(/s$/, '')}, it will show up here.`
              }
              action={
                <Link href="/generate" className={buttonClasses()}>
                  Create content
                </Link>
              }
            />
          )
        ) : (
          // @container: rows go single-line only when the list itself is wide enough (not at 768px
          // next to the sidebar, where titles would be cut short)
          <Card padded={false} className="@container">
            <ul className="divide-y divide-line">
              {(items ?? []).map((item) => {
                const title = item.title?.trim() || 'Untitled draft';
                return (
                  <li
                    key={item.id}
                    className="flex flex-col gap-3 px-4 py-4 sm:px-6 @2xl:flex-row @2xl:items-center @2xl:gap-4 @2xl:py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <h2 className="font-medium break-words text-ink @2xl:truncate">{title}</h2>
                      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
                        <Badge variant="info">{FORMAT_LABELS[item.content_type]}</Badge>
                        <time dateTime={item.updated_at} title={fullDateTime(item.updated_at)}>
                          Saved {timeAgo(item.updated_at)}
                        </time>
                      </p>
                    </div>
                    {(item.seo_score !== null || item.tone_match !== null) && (
                      <div className="flex flex-wrap items-center gap-2 @2xl:justify-end">
                        {item.seo_score !== null && (
                          <Badge variant={item.seo_score >= 0.7 ? 'success' : 'warning'}>
                            {Math.round(item.seo_score * 100)}% keywords
                          </Badge>
                        )}
                        {item.tone_match !== null && (
                          <Badge variant={item.tone_match ? 'success' : 'warning'}>
                            {item.tone_match ? '✓ Tone match' : 'Tone mismatch'}
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Link href={`/editor/${item.id}`} className={buttonClasses('primary', 'sm')}>
                        Open<span className="sr-only">: {title}</span>
                      </Link>
                      <DuplicateButton id={item.id} title={title} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
