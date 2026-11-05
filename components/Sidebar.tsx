"use client";
// Usage:
// Main nav (Dashboard):  <Sidebar title="Dashboard" subtitle="Create, manage, and optimise your content." />
// Progress steps:        <Sidebar mode="steps" title="Content Creation Process" currentStep={1} />
//   currentStep: 0 = Business Profile, 1 = Generate Content, 2 = Content Editor, 3 = Draft History
// Nav mode shows a "Log out" button at the bottom.
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/generate", label: "Create Content", icon: "📝" },
  { href: "/history", label: "Draft History", icon: "📁" },
  { href: "/profile", label: "Business Profile", icon: "👤" },
];

const STEPS = ["Business Profile", "Generate Content", "Content Editor", "Draft History"];

type SidebarProps = {
  mode?: "nav" | "steps";
  title?: string;
  subtitle?: string;
  currentStep?: number;
};

export default function Sidebar({ mode = "nav", title, subtitle, currentStep = 0 }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  async function handleLogout() {
    setSigningOut(true);
    setLogoutError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      setSigningOut(false);
      setLogoutError("Couldn't log out. Please try again.");
      return;
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 flex h-screen w-[280px] shrink-0 flex-col bg-navy px-6 py-10 text-white">
      <div className="mb-8 border-b border-white/20 pb-6">
        <p className="text-2xl font-bold">
          {title ?? (mode === "nav" ? "AI Content Generator" : "Content Creation Process")}
        </p>
        {subtitle && <p className="mt-2 text-sm text-blue-100">{subtitle}</p>}
      </div>

      {mode === "nav" ? (
        <>
          <nav aria-label="Main">
            <ul className="flex flex-col gap-1">
              {NAV.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={
                        "flex items-center gap-3 rounded-control px-3 py-2 text-base font-medium transition-colors " +
                        "focus-visible:outline-2 focus-visible:outline-white " +
                        (active ? "bg-white/10 text-teal-300" : "text-white hover:bg-white/5")
                      }
                    >
                      <span aria-hidden="true">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-auto border-t border-white/20 pt-4">
            <button
              type="button"
              onClick={handleLogout}
              disabled={signingOut}
              aria-busy={signingOut}
              className={
                "flex w-full items-center gap-3 rounded-control px-3 py-2 text-left text-base font-medium text-white transition-colors " +
                "hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-white " +
                "disabled:cursor-not-allowed disabled:opacity-60"
              }
            >
              <span aria-hidden="true">🚪</span>
              {signingOut ? "Logging out..." : "Log out"}
            </button>
            {logoutError && (
              <p role="alert" className="mt-2 px-3 text-sm text-red-200">
                {logoutError}
              </p>
            )}
          </div>
        </>
        ) : (
        <>
        <ol aria-label="Progress" className="flex flex-col gap-4">
          {STEPS.map((label, i) => {
            const done = i < currentStep;
            const current = i === currentStep;
            return (
              <li
                key={label}
                aria-current={current ? "step" : undefined}
                className={"flex items-center gap-3 text-base font-medium " + (current ? "text-teal-300" : "text-white")}
              >
                <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center">
                  {done || current ? (
                    <span className="text-teal-300">✓</span>
                  ) : (
                    <span className="h-4 w-4 rounded-full border-2 border-white" />
                  )}
                </span>
                {label}
                {done && <span className="sr-only">(completed)</span>}
              </li>
            );
          })}
             </ol>
          <div className="mt-auto border-t border-white/20 pt-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-control px-3 py-2 text-base font-medium text-white transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-white"
            >
              <span aria-hidden="true">←</span>
              Back to Dashboard
            </Link>
          </div>
        </>
      )}
         </aside>
  );
}