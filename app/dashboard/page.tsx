// Owner: Harry — dashboard (Figure 1.2, refreshed layout)
import Link from "next/link";
import type { ReactNode } from "react";
import AppShell from "@/components/AppShell";
import Sidebar from "@/components/Sidebar";
import { buttonClasses } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";

type ContentType = "blog" | "social" | "email";

function Icon({ children, className = "h-5 w-5" }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const ICONS = {
  social: (
    <Icon>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
    </Icon>
  ),
  blog: (
    <Icon>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M14 3v6h6M8 13h8M8 17h5" />
    </Icon>
  ),
  email: (
    <Icon>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </Icon>
  ),
  drafts: (
    <Icon>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </Icon>
  ),
  profile: (
    <Icon>
      <path d="M4 9.5 5.5 4h13L20 9.5" />
      <path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0" />
      <path d="M5 12v8h14v-8" />
      <path d="M10 20v-4h4v4" />
    </Icon>
  ),
  sparkle: (
    <Icon className="h-4 w-4">
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
    </Icon>
  ),
  chevron: (
    <Icon className="h-4 w-4">
      <path d="m9 6 6 6-6 6" />
    </Icon>
  ),
};

const TYPES: Record<ContentType, { label: string; tile: string; icon: ReactNode }> = {
  social: { label: "Social media", tile: "bg-teal-50 text-teal-700", icon: ICONS.social },
  blog: { label: "Blog post", tile: "bg-navy-50 text-navy", icon: ICONS.blog },
  email: { label: "Email newsletter", tile: "bg-amber-50 text-amber-700", icon: ICONS.email },
};

// What each format produces (shown in the "create" panel)
const FORMATS: { type: ContentType; text: string }[] = [
  { type: "social", text: "An Instagram or Facebook caption with hashtags" },
  { type: "blog", text: "A title, an outline and an introduction" },
  { type: "email", text: "Three subject lines and the email body" },
];

// "today", "yesterday", "3 days ago"
function relativeDate(iso: string) {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(new Date()) - startOfDay(new Date(iso))) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  // Who is logged in? Row-level security only returns this user's business rows.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let businessName: string | null = null;
  let draftCount = 0;
  let recent: { id: string; title: string | null; content_type: string; created_at: string }[] = [];

  if (user) {
    const [{ data: profile }, { data: content }, { count }] = await Promise.all([
      supabase.from("business_profile").select("business_name").eq("owner_id", user.id).maybeSingle(),
      supabase
        .from("generated_content")
        .select("id, title, content_type, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase.from("generated_content").select("id", { count: "exact", head: true }),
    ]);
    businessName = profile?.business_name ?? null;
    recent = content ?? [];
    draftCount = count ?? 0;
  }

  return (
    <AppShell sidebar={<Sidebar title="Dashboard" subtitle="Create, manage, and optimise your content." />}>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">
          {businessName ? `Welcome back, ${businessName}` : "Welcome back"}
        </h1>
        <p className="mt-2 text-muted">Ready to create your next marketing campaign?</p>
      </header>

      {/* Create panel: the main action on this page */}
      <section
        aria-labelledby="create-heading"
        className="relative isolate overflow-hidden rounded-card bg-navy p-6 text-white shadow-card sm:p-10"
      >
        <div aria-hidden="true" className="absolute -right-24 -top-28 -z-10 h-80 w-80 rounded-full bg-teal/30 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-40 left-1/4 -z-10 h-80 w-80 rounded-full bg-blue-500/30 blur-3xl" />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-md">
            <h2 id="create-heading" className="text-2xl font-bold sm:text-3xl">
              What do you want to create today?
            </h2>
            <p className="mt-2 text-blue-100">
              We&apos;ll write it in your brand voice, using your saved business profile.
            </p>
          </div>
          <Link
            href="/generate"
            className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy shadow-lg transition-colors hover:bg-navy-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:self-auto"
          >
            {ICONS.sparkle}
            Start creating
          </Link>
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-3">
          {FORMATS.map((f) => (
            <li key={f.type} className="rounded-control bg-white/10 p-4 ring-1 ring-white/15">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15" aria-hidden="true">
                {TYPES[f.type].icon}
              </span>
              <p className="mt-3 font-semibold">{TYPES[f.type].label}</p>
              <p className="mt-1 text-sm text-blue-100">{f.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Recent activity */}
        <section
          aria-labelledby="recent-heading"
          className="overflow-hidden rounded-card border border-line bg-white shadow-card lg:col-span-2"
        >
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 id="recent-heading" className="text-lg font-bold text-ink">
              Recent activity
            </h2>
            <Link
              href="/history"
              className="rounded text-sm font-semibold text-navy hover:underline focus-visible:outline-2 focus-visible:outline-navy"
            >
              View all
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="font-semibold text-ink">No content yet</p>
              <p className="mt-1 text-sm text-muted">Your drafts will appear here once you create something.</p>
              <Link href="/generate" className={`${buttonClasses()} mt-5`}>
                Create your first post
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((item) => {
                const type = TYPES[item.content_type as ContentType];
                return (
                  <li key={item.id}>
                    <Link
                      href={`/editor/${item.id}`}
                      className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-navy"
                    >
                      <span
                        aria-hidden="true"
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${type?.tile ?? "bg-slate-100 text-slate-600"}`}
                      >
                        {type?.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-ink">{item.title ?? "Untitled"}</span>
                        <span className="block text-sm text-muted">{type?.label ?? item.content_type}</span>
                      </span>
                      <span className="hidden text-sm text-muted sm:block">{relativeDate(item.created_at)}</span>
                      <span className="text-slate-400">{ICONS.chevron}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Shortcuts */}
        <div className="flex flex-col gap-6">
          <Link
            href="/history"
            className="rounded-card border border-line bg-white p-6 shadow-card transition-colors hover:border-navy/30 focus-visible:outline-2 focus-visible:outline-navy"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy" aria-hidden="true">
              {ICONS.drafts}
            </span>
            <h2 className="mt-4 text-base font-bold text-ink">Draft history</h2>
            <p className="mt-1 text-sm text-muted">
              {draftCount === 1 ? "1 saved draft" : `${draftCount} saved drafts`}. Open, edit or duplicate them.
            </p>
          </Link>
          <Link
            href="/profile"
            className="rounded-card border border-line bg-white p-6 shadow-card transition-colors hover:border-navy/30 focus-visible:outline-2 focus-visible:outline-navy"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700" aria-hidden="true">
              {ICONS.profile}
            </span>
            <h2 className="mt-4 text-base font-bold text-ink">Business profile</h2>
            <p className="mt-1 text-sm text-muted">Keep your brand voice, products and audience up to date.</p>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
