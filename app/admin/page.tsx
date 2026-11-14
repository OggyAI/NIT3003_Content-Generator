// Owner: Oggy. Admin (UI overhaul Phase 2, plan approved by Karma 14 Nov 2026).
// Businesses and usage across the app, from admin_business_overview() (migration 003), which
// checks the admin role itself and returns business-level totals only: no emails, no draft text.
// Non-admins get the standard 404, so the page doesn't reveal that it exists.
import { notFound } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin';
import { fullDateTime, timeAgo } from '@/lib/display';
import type { AdminBusinessRow } from '@/lib/types';
import DisableButton from './DisableButton';

const seconds = (ms: number | null) => (ms === null ? '–' : `${(ms / 1000).toFixed(1)} s`);

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-ink">{value}</p>
    </Card>
  );
}

export default async function AdminPage() {
  if (!(await isAdmin())) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('admin_business_overview');
  const rows: AdminBusinessRow[] = data ?? [];

  const totals = rows.reduce(
    (t, r) => ({
      drafts: t.drafts + Number(r.draft_count),
      requests: t.requests + Number(r.request_count),
      // Weighted by successful requests, so busy businesses count for more
      msSum: t.msSum + (r.avg_generation_ms ?? 0) * (Number(r.request_count) - Number(r.failed_requests)),
      okRequests: t.okRequests + (r.avg_generation_ms === null ? 0 : Number(r.request_count) - Number(r.failed_requests)),
    }),
    { drafts: 0, requests: 0, msSum: 0, okRequests: 0 },
  );
  const overallAvg = totals.okRequests > 0 ? totals.msSum / totals.okRequests : null;

  return (
    <AppShell width="wide">
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Admin"
          description="Businesses and usage across the app. Totals only: no emails or draft text."
        />

        {error ? (
          <p role="alert" className="rounded-control border border-danger/30 bg-danger-light p-4 text-sm text-danger">
            Couldn&apos;t load the overview. If you were just made an admin, log out and back in, then try again.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Stat label="Businesses" value={String(rows.length)} />
              <Stat label="Drafts" value={String(totals.drafts)} />
              <Stat label="Generation requests" value={String(totals.requests)} />
              <Stat label="Average generation time" value={seconds(overallAvg)} />
            </div>

            <section aria-labelledby="businesses-heading" className="flex flex-col gap-3">
              <h2 id="businesses-heading" className="text-lg font-semibold text-ink">
                Businesses
              </h2>
              {rows.length === 0 ? (
                <EmptyState headingLevel="h3" title="No businesses yet" text="Businesses appear here once people register." />
              ) : (
                <Card padded={false} className="@container">
                  <ul className="divide-y divide-line">
                    {rows.map((r) => (
                      <li
                        key={r.business_id}
                        className="flex flex-col gap-3 px-4 py-4 sm:px-6 @3xl:flex-row @3xl:items-center @3xl:gap-6"
                      >
                        <div className="min-w-0 flex-1">
                          <h3 className="flex flex-wrap items-center gap-2 font-medium break-words text-ink">
                            {r.business_name}
                            {r.is_admin && <Badge variant="info">Admin</Badge>}
                            {r.disabled ? <Badge variant="warning">Disabled</Badge> : <Badge variant="success">Active</Badge>}
                          </h3>
                          <p className="mt-1 text-sm text-muted">
                            {r.industry ?? 'No industry yet'} · Joined{' '}
                            <time dateTime={r.joined_at} title={fullDateTime(r.joined_at)}>
                              {timeAgo(r.joined_at)}
                            </time>
                          </p>
                        </div>
                        <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm @md:grid-cols-4 @3xl:w-[30rem] @3xl:shrink-0">
                          <div>
                            <dt className="text-muted">Drafts</dt>
                            <dd className="font-medium text-ink">{r.draft_count}</dd>
                          </div>
                          <div>
                            <dt className="text-muted">Requests</dt>
                            <dd className="font-medium text-ink">
                              {r.request_count}
                              {Number(r.failed_requests) > 0 && (
                                <span className="font-normal text-muted"> ({r.failed_requests} failed)</span>
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-muted">Avg time</dt>
                            <dd className="font-medium text-ink">{seconds(r.avg_generation_ms)}</dd>
                          </div>
                          <div>
                            <dt className="text-muted">Last active</dt>
                            <dd className="font-medium text-ink">
                              {r.last_active_at ? (
                                <time dateTime={r.last_active_at} title={fullDateTime(r.last_active_at)}>
                                  {timeAgo(r.last_active_at)}
                                </time>
                              ) : (
                                '–'
                              )}
                            </dd>
                          </div>
                        </dl>
                        {/* Admins (including you) can't be disabled here */}
                        <div className="@3xl:w-56 @3xl:shrink-0">
                          {!r.is_admin && (
                            <DisableButton
                              businessId={r.business_id}
                              businessName={r.business_name}
                              disabled={r.disabled}
                            />
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
