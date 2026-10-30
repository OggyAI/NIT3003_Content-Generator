// Owner: Harry — dashboard (Figure 1.2)
import Link from "next/link";
import AppShell from "@/components/AppShell";
import Sidebar from "@/components/Sidebar";
import Card from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";

type ContentType = "blog" | "social" | "email";

const TYPE_LABELS: Record<ContentType, string> = {
  blog: "Blog Post",
  social: "Social Media",
  email: "Email Newsletter",
};

const QUICK_ACTIONS = [
  { title: "Create Content", text: "Generate new AI-powered marketing content.", href: "/generate", button: "Create" },
  { title: "View Drafts", text: "Access your saved content drafts.", href: "/history", button: "Open" },
  { title: "Business Profile", text: "Update your business details.", href: "/profile", button: "Manage" },
];

// "Today", "Yesterday", "3 days ago"
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
  let recent: { id: string; title: string | null; content_type: string; created_at: string }[] = [];

  if (user) {
    const [{ data: profile }, { data: content }] = await Promise.all([
      supabase.from("business_profile").select("business_name").eq("owner_id", user.id).maybeSingle(),
      supabase
        .from("generated_content")
        .select("id, title, content_type, created_at")
        .order("created_at", { ascending: false })
        .limit(3),
    ]);
    businessName = profile?.business_name ?? null;
    recent = content ?? [];
  }

  return (
    <AppShell
      sidebar={
        <Sidebar
          title="Dashboard"
          subtitle={businessName ? `${businessName}: create, manage, and optimise your content.` : "Create, manage, and optimise your content."}
        />
      }
    >
      <Card className="p-8 sm:p-10">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
          <p className="mt-2 text-muted">Ready to create your next marketing campaign?</p>
        </header>

        <section aria-labelledby="quick-actions" className="mt-8">
          <h2 id="quick-actions" className="mb-4 text-center text-xl font-semibold text-gray-900">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {QUICK_ACTIONS.map((a) => (
              <div key={a.href} className="flex flex-col rounded-control border border-line p-4">
                <h3 className="font-semibold text-gray-900">{a.title}</h3>
                <p className="mt-2 mb-4 text-sm text-muted">{a.text}</p>
                <Link href={a.href} className={`${buttonClasses()} mt-auto self-center`}>
                  {a.button}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="recent-activity" className="mt-10">
          <h2 id="recent-activity" className="mb-4 text-center text-xl font-semibold text-gray-900">
            Recent Activity
          </h2>
          {recent.length === 0 ? (
            <p className="text-center text-sm text-muted">
              No content yet.{" "}
              <Link href="/generate" className="font-semibold text-navy underline">
                Create your first post
              </Link>
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-slate-100">
              {recent.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/editor/${item.id}`}
                    className="block rounded-control px-2 py-3 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-navy"
                  >
                    <p className="font-medium text-gray-900">{item.title ?? "Untitled"}</p>
                    <p className="text-sm text-muted">
                      {TYPE_LABELS[item.content_type as ContentType] ?? item.content_type} • Created{" "}
                      {relativeDate(item.created_at)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </Card>
    </AppShell>
  );
}