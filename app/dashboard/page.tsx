// Owner: Harry (first version, Figure 1.2). Rebuilt by Oggy for the UI overhaul (CLAUDE.md §2.2),
// restyled in Harry's direction for visual refresh v2 (Karma, 14 Nov).
// One primary action that depends on the profile (completeness rule, §1.7):
// incomplete → "Complete business profile" (and what's missing), complete → "Start creating".
// Lists the 5 most recently saved drafts (NFR-04: one small query, only the columns shown).
import Link from "next/link";
import type { ReactNode } from "react";
import AppShell from "@/components/AppShell";
import FormatIcon from "@/components/ui/FormatIcon";
import {
  ChatIcon,
  CheckIcon,
  ChevronRightIcon,
  DocumentsIcon,
  MailIcon,
  PageIcon,
  SparkleIcon,
  StoreIcon,
} from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import { getBusinessContext } from "@/lib/business-context";
import { FORMAT_LABELS, FORMAT_OPTIONS, VOICE_LABELS, fullDateTime, listInWords, timeAgo } from "@/lib/display";

const RECENT_LIMIT = 5;

// The four things the completeness rule checks (lib/business-context.ts → missing[])
const PROFILE_ITEMS = [
  { key: "business name", label: "Business name" },
  { key: "industry", label: "Industry" },
  { key: "brand voice", label: "Brand voice" },
  { key: "target audience", label: "Target audience" },
];

const HERO_ICONS = { social: ChatIcon, blog: PageIcon, email: MailIcon };

// The white pill on the navy hero
const HERO_CTA =
  "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-navy shadow-lg transition-colors hover:bg-navy-50 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:self-auto";

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
  const voice = ctx?.voice ? VOICE_LABELS[ctx.voice] : null;
  const done = PROFILE_ITEMS.filter((i) => !missing.includes(i.key)).length;

  return (
    <AppShell width="wide">
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight break-words text-ink sm:text-4xl">
            {ctx?.businessName ? `Welcome back, ${ctx.businessName}` : "Welcome back"}
          </h1>
          <p className="mt-2 text-muted">
            {complete
              ? `Ready for your next post? We'll write it in your ${voice?.toLowerCase() ?? "brand"} voice.`
              : `Add your ${listInWords(missing)} and we can start writing for you.`}
          </p>
        </header>

        {/* The one bold element on the page: the main action */}
        <section
          aria-labelledby="hero-heading"
          className="relative isolate overflow-hidden rounded-card bg-navy p-6 text-white shadow-card sm:p-8"
        >
          <div aria-hidden="true" className="absolute -top-28 -right-24 -z-10 h-80 w-80 rounded-full bg-teal/30 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-40 left-1/4 -z-10 h-80 w-80 rounded-full bg-blue-500/30 blur-3xl" />

          {complete ? (
            <>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-md">
                  <h2 id="hero-heading" className="text-2xl font-bold sm:text-3xl">
                    What do you want to create today?
                  </h2>
                  <p className="mt-2 text-blue-100">Pick a format and tell us what it&apos;s about.</p>
                </div>
                <Link href="/generate" className={HERO_CTA}>
                  <SparkleIcon className="h-4 w-4" />
                  Start creating
                </Link>
              </div>
              <ul className="mt-7 grid gap-3 sm:grid-cols-3">
                {FORMAT_OPTIONS.map((f) => {
                  const Icon = HERO_ICONS[f.value];
                  return (
                  <li key={f.value}>
                    <Link
                      href={`/generate?type=${f.value}`}
                      className="group flex h-full flex-col rounded-control bg-white/10 p-4 ring-1 ring-white/15 transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                        <Icon className="h-5 w-5 text-teal-300" />
                      </span>
                      <span className="mt-3 flex items-center gap-1 font-semibold">
                        {FORMAT_LABELS[f.value]}
                        <ChevronRightIcon className="h-4 w-4 opacity-70 transition-transform group-hover:translate-x-0.5" />
                      </span>
                      <span className="mt-1 text-sm text-blue-100">{f.description}</span>
                    </Link>
                  </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-lg">
                <h2 id="hero-heading" className="text-2xl font-bold sm:text-3xl">
                  Finish your business profile
                </h2>
                <p className="mt-2 text-blue-100">
                  {done} of {PROFILE_ITEMS.length} done. We use these to write content that sounds like you.
                </p>
                <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                  {PROFILE_ITEMS.map((item) => {
                    const isDone = !missing.includes(item.key);
                    return (
                      <li key={item.key} className="flex items-center gap-2.5 text-sm">
                        <span
                          aria-hidden="true"
                          className={
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full " +
                            (isDone ? "bg-teal-300 text-navy" : "border-2 border-white/50")
                          }
                        >
                          {isDone && <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />}
                        </span>
                        <span className={isDone ? "text-blue-100" : "font-medium text-white"}>
                          <span className="sr-only">{isDone ? "Done: " : "Missing: "}</span>
                          {item.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <Link href="/profile" className={HERO_CTA}>
                <StoreIcon className="h-4 w-4" />
                Complete business profile
              </Link>
            </div>
          )}
        </section>

        <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
          {/* Recent drafts */}
          <section
            aria-labelledby="recent-heading"
            className="min-w-0 overflow-hidden rounded-card border border-line bg-white shadow-card lg:col-span-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4 sm:px-6">
              <h2 id="recent-heading" className="text-lg font-bold text-ink">
                Recent drafts
              </h2>
              {total > 0 && (
                <Link
                  href="/history"
                  className="rounded text-sm font-semibold text-navy hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
                >
                  View all {total}
                </Link>
              )}
            </div>

            {drafts.error ? (
              <p role="alert" className="m-5 rounded-control border border-danger/30 bg-danger-light p-4 text-sm text-danger">
                Couldn&apos;t load your drafts. Refresh the page to try again.
              </p>
            ) : items.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="font-display font-semibold text-ink">No drafts yet</p>
                <p className="mt-1 text-sm text-muted">
                  {complete
                    ? "Create your first post and it will show up here, ready to edit."
                    : "Once your profile is complete, your drafts will show up here."}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/editor/${item.id}`}
                      className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-page focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-navy sm:px-6"
                    >
                      <FormatIcon type={item.content_type} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-ink group-hover:text-navy">
                          {item.title?.trim() || "Untitled draft"}
                        </span>
                        <span className="text-sm text-muted">{FORMAT_LABELS[item.content_type]}</span>
                      </span>
                      <time
                        dateTime={item.updated_at}
                        title={fullDateTime(item.updated_at)}
                        className="hidden shrink-0 text-sm text-muted sm:block"
                      >
                        {timeAgo(item.updated_at)}
                      </time>
                      <ChevronRightIcon className="h-4 w-4 shrink-0 text-muted group-hover:text-navy" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Quieter links */}
          <div className="flex flex-col gap-6">
            <LinkCard
              href="/history"
              icon={<DocumentsIcon />}
              tile="bg-navy-50 text-navy"
              title="Draft history"
              text={
                total > 0
                  ? `${total} saved ${total === 1 ? "draft" : "drafts"}. Search, open or duplicate them.`
                  : "Every draft you create is saved here."
              }
            />
            <LinkCard
              href="/profile"
              icon={<StoreIcon />}
              tile="bg-teal-50 text-teal-700"
              title="Business profile"
              text={
                complete
                  ? `${voice} voice${ctx?.industry ? ` · ${ctx.industry}` : ""}. Keep your products and audience up to date.`
                  : `Still needed: ${listInWords(missing)}.`
              }
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function LinkCard({
  href,
  icon,
  tile,
  title,
  text,
}: {
  href: string;
  icon: ReactNode;
  tile: string;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-card border border-line bg-white p-5 shadow-card transition-colors hover:border-navy/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy sm:p-6"
    >
      <span aria-hidden="true" className={`flex h-10 w-10 items-center justify-center rounded-xl ${tile}`}>
        {icon}
      </span>
      <span className="mt-4 flex items-center gap-1 font-display text-lg font-bold text-ink group-hover:text-navy">
        {title}
        <ChevronRightIcon className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-navy" />
      </span>
      <span className="mt-1 block text-sm leading-6 text-muted">{text}</span>
    </Link>
  );
}
