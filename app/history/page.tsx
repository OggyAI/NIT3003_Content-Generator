// Owner: Oggy — FR-14 content history (Figure 1.7).
// Lists this business's saved content newest first (RLS limits it to the
// owner), with a content-type filter, and Open / Duplicate actions.
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import Sidebar from '@/components/Sidebar';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { buttonClasses } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/server';
import type { ContentType } from '@/lib/types';
import DuplicateButton from './DuplicateButton';

const TYPE_LABELS: Record<ContentType, string> = {
  blog: 'Blog Post',
  social: 'Social Media',
  email: 'Email Newsletter',
};
const FILTERS: { value: ContentType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'social', label: 'Social Media' },
  { value: 'blog', label: 'Blog Posts' },
  { value: 'email', label: 'Emails' },
];

// "Saved today", "Saved yesterday", "Saved 3 days ago", then a date.
function savedLabel(iso: string) {
  const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((day(new Date()) - day(new Date(iso))) / 86_400_000);
  if (days <= 0) return 'Saved today';
  if (days === 1) return 'Saved yesterday';
  if (days < 7) return `Saved ${days} days ago`;
  return `Saved ${new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const filter = (FILTERS.some((f) => f.value === type) ? type : 'all') as ContentType | 'all';

  const supabase = await createClient();
  let query = supabase
    .from('generated_content')
    .select('id, title, content_type, seo_score, tone_match, updated_at')
    .order('updated_at', { ascending: false })
    .limit(100);
  if (filter !== 'all') query = query.eq('content_type', filter);
  const { data: items, error } = await query;

  return (
    <AppShell sidebar={<Sidebar title="Draft History" subtitle="Access and manage your saved drafts." />}>
      <Card className="p-8 sm:p-10">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Draft History</h1>
          <p className="mt-2 text-muted">View and manage your previously saved drafts.</p>
        </header>

        <nav aria-label="Filter by content type" className="mt-6 flex flex-wrap justify-center gap-2">
          {FILTERS.map((f) => {
            const active = f.value === filter;
            return (
              <Link
                key={f.value}
                href={f.value === 'all' ? '/history' : `/history?type=${f.value}`}
                aria-current={active ? 'page' : undefined}
                className={
                  'rounded-full border px-4 py-1 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ' +
                  (active ? 'border-teal bg-teal-light text-gray-900' : 'border-field bg-white text-gray-700 hover:border-slate-400')
                }
              >
                {f.label}
              </Link>
            );
          })}
        </nav>

        {error ? (
          <p role="alert" className="mt-8 rounded-control bg-warning-light p-4 text-center text-sm text-amber-900">
            Could not load your drafts — please refresh the page.
          </p>
        ) : !items?.length ? (
          <div className="mt-8 text-center">
            <p className="text-muted">
              {filter === 'all' ? 'No saved drafts yet.' : `No ${TYPE_LABELS[filter].toLowerCase()} drafts yet.`}
            </p>
            <Link href="/generate" className={`${buttonClasses()} mt-4`}>
              Create content
            </Link>
          </div>
        ) : (
          <ul className="mt-8 flex flex-col gap-4">
            {items.map((item) => (
              <li key={item.id} className="rounded-control border border-line p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold text-gray-900">{item.title || 'Untitled draft'}</h2>
                    <p className="text-sm text-muted">
                      {TYPE_LABELS[item.content_type]} • {savedLabel(item.updated_at)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {item.seo_score !== null && (
                      <Badge variant={item.seo_score >= 0.7 ? 'success' : 'warning'}>
                        {Math.round(item.seo_score * 100)}% SEO
                      </Badge>
                    )}
                    {item.tone_match !== null && (
                      <Badge variant={item.tone_match ? 'success' : 'warning'}>
                        {item.tone_match ? '✓ Tone match' : 'Tone mismatch'}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex gap-3">
                  <Link href={`/editor/${item.id}`} className={buttonClasses()}>
                    Open
                  </Link>
                  <DuplicateButton id={item.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </AppShell>
  );
}
