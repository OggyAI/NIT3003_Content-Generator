// Owner: Harry (first version, Figure 1.2). Rebuilt by Oggy for the UI overhaul (CLAUDE.md §2.2).
// Leads with the business name and one primary action that depends on the profile:
// incomplete → "Complete business profile" (and what's missing), complete → "Create content".
// Lists the 5 most recently saved drafts (NFR-04: one small query, only the columns shown).
import Link from "next/link";
import AppShell from "@/components/AppShell";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { buttonClasses } from "@/components/ui/Button";
import { CheckIcon, ChevronRightIcon, SparkleIcon, StoreIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import { getBusinessContext, type BusinessContext } from "@/lib/business-context";
import { FORMAT_LABELS, VOICE_LABELS, fullDateTime, listInWords, timeAgo } from "@/lib/display";

const RECENT_LIMIT = 5;

// The four things the completeness rule checks (lib/business-context.ts → missing[])
const PROFILE_ITEMS = [
  { key: "business name", label: "Business name" },
  { key: "industry", label: "Industry" },
  { key: "brand voice", label: "Brand voice" },
  { key: "target audience", label: "Target audience" },
];

export default async function DashboardPage() {
  const supabase = await createClient();

  // RLS limits both queries to the signed-in user's own business
  const [ctx, drafts] = await Promise.all([
    getBusinessContext(supabase),
    supabase
      .from("generated_content")
      .select("id, title, content_type, updated_at", { count: "exact" })
      .order("updated_at", { ascending: false })
      .limit(RECENT_LIMIT),
  ]);

  const missing = ctx?.missing ?? PROFILE_ITEMS.map((i) => i.key);
  const complete = missing.length === 0;
  const items = drafts.data ?? [];
  const total = drafts.count ?? items.length;

  return (
    <AppShell width="wide">
      <div className="flex flex-col gap-6">
        <PageHeader
          title={ctx?.businessName || "Dashboard"}
          description={
            complete
              ? "Create, check and save marketing content in your brand voice."
              : `Add your ${listInWords(missing)} to start creating content.`
          }
          meta={
            complete && ctx?.voice ? (
              <>
                <span>{VOICE_LABELS[ctx.voice]} voice</span>
                {ctx.industry && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{ctx.industry}</span>
                  </>
                )}
              </>
            ) : undefined
          }
          actions={
            complete ? (
              <Link href="/generate" className={buttonClasses()}>
                <SparkleIcon />
                Create content
              </Link>
            ) : (
              <Link href="/profile" className={buttonClasses()}>
                <StoreIcon />
                Complete business profile
              </Link>
            )
          }
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <section aria-labelledby="recent-heading" className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
              <div>
                <h2 id="recent-heading" className="text-lg font-semibold text-ink">
                  Recent drafts
                </h2>
                {total > 0 && (
                  <p className="text-sm text-muted">
                    {total} {total === 1 ? "draft" : "drafts"} saved
                  </p>
                )}
              </div>
              {total > 0 && (
                <Link href="/history" className={buttonClasses("ghost", "sm")}>
                  View all drafts
                  <ChevronRightIcon className="h-4 w-4" />
                </Link>
              )}
            </div>

            {drafts.error ? (
              <p role="alert" className="rounded-control border border-danger/30 bg-danger-light p-4 text-sm text-danger">
                Couldn&apos;t load your drafts. Refresh the page to try again.
              </p>
            ) : items.length === 0 ? (
              <EmptyState
                headingLevel="h3"
                title="No drafts yet"
                text={
                  complete
                    ? "Create your first post and it will show up here, ready to edit."
                    : "Once your profile is complete, create your first post and it will show up here."
                }
                action={
                  complete ? (
                    <Link href="/generate" className={buttonClasses("secondary")}>
                      Create your first post
                    </Link>
                  ) : undefined
                }
              />
            ) : (
              <Card padded={false}>
                <ul className="divide-y divide-line">
                  {items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/editor/${item.id}`}
                        className="group flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-navy-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-navy sm:px-6"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-ink group-hover:text-navy">
                            {item.title?.trim() || "Untitled draft"}
                          </span>
                          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
                            <Badge variant="info">{FORMAT_LABELS[item.content_type]}</Badge>
                            <time dateTime={item.updated_at} title={fullDateTime(item.updated_at)}>
                              Saved {timeAgo(item.updated_at)}
                            </time>
                          </span>
                        </span>
                        <ChevronRightIcon className="h-5 w-5 text-muted group-hover:text-navy" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </section>

          {complete && ctx ? <BrandSummary ctx={ctx} /> : <ProfileChecklist missing={missing} />}
        </div>
      </div>
    </AppShell>
  );
}

function ProfileChecklist({ missing }: { missing: string[] }) {
  const done = PROFILE_ITEMS.filter((i) => !missing.includes(i.key)).length;
  return (
    <Card>
      <section aria-labelledby="profile-heading" className="flex flex-col gap-4">
        <div>
          <h2 id="profile-heading" className="text-lg font-semibold text-ink">
            Finish your profile
          </h2>
          <p className="mt-1 text-sm text-muted">
            {done} of {PROFILE_ITEMS.length} done. We use these to write in your voice.
          </p>
        </div>
        <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-navy-50">
          <div className="h-full rounded-full bg-teal" style={{ width: `${(done / PROFILE_ITEMS.length) * 100}%` }} />
        </div>
        <ul className="flex flex-col gap-2">
          {PROFILE_ITEMS.map((item) => {
            const isDone = !missing.includes(item.key);
            return (
              <li key={item.key} className="flex items-center gap-3 text-sm">
                <span
                  aria-hidden="true"
                  className={
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full " +
                    (isDone ? "bg-teal-700 text-white" : "border-2 border-field")
                  }
                >
                  {isDone && <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />}
                </span>
                <span className={isDone ? "text-muted" : "font-medium text-ink"}>
                  <span className="sr-only">{isDone ? "Done: " : "Missing: "}</span>
                  {item.label}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </Card>
  );
}

function BrandSummary({ ctx }: { ctx: BusinessContext }) {
  const products = ctx.products.map((p) => p.name);
  return (
    <Card>
      <section aria-labelledby="brand-heading" className="flex flex-col gap-4">
        <h2 id="brand-heading" className="text-lg font-semibold text-ink">
          Your brand
        </h2>
        <dl className="flex flex-col gap-3 text-sm">
          {ctx.voice && (
            <div>
              <dt className="text-muted">Brand voice</dt>
              <dd className="font-medium text-ink">{VOICE_LABELS[ctx.voice]}</dd>
            </div>
          )}
          {ctx.audience?.description && (
            <div>
              <dt className="text-muted">Target audience</dt>
              <dd className="line-clamp-3 text-ink">{ctx.audience.description}</dd>
            </div>
          )}
          {products.length > 0 && (
            <div>
              <dt className="text-muted">Products and services</dt>
              <dd className="line-clamp-2 text-ink">{products.join(", ")}</dd>
            </div>
          )}
        </dl>
        <Link href="/profile" className={`${buttonClasses("ghost", "sm")} -ml-3 self-start`}>
          Edit business profile
        </Link>
      </section>
    </Card>
  );
}
