"use client";
// Usage:
// Main nav:        <Sidebar title="Dashboard" subtitle="Create, manage, and optimise your content." />
// Progress steps:  <Sidebar mode="steps" title="Content Creation Process" currentStep={1} />
//   currentStep: 0 = Business Profile, 1 = Generate Content, 2 = Content Editor, 3 = Draft History
// Nav mode: logo, "New content" button, menu, and Log out at the bottom.
// Steps mode: logo, progress steps, and "Back to Dashboard" at the bottom.
// title/subtitle are shown in steps mode; in nav mode the page's own heading names the page.
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import BrandMark from "@/components/BrandMark";
import { buttonClasses } from "@/components/ui/Button";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
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
  home: (
    <Icon>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20h5v-6h4v6h5V9.5" />
    </Icon>
  ),
  create: (
    <Icon>
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
      <path d="M19 15l.6 1.4L21 17l-1.4.6L19 19l-.6-1.4L17 17l1.4-.6z" />
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
  logout: (
    <Icon>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 17l-5-5 5-5" />
      <path d="M5 12h11" />
    </Icon>
  ),
  back: (
    <Icon>
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </Icon>
  ),
  plus: (
    <Icon>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  ),
};

// `match` lists the URL prefixes that highlight each menu item
const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: ICONS.home, match: ["/dashboard"] },
  { href: "/generate", label: "Create content", icon: ICONS.create, match: ["/generate"] },
  { href: "/history", label: "Draft history", icon: ICONS.drafts, match: ["/history", "/editor"] },
  { href: "/profile", label: "Business profile", icon: ICONS.profile, match: ["/profile"] },
];

const STEPS = ["Business profile", "Generate content", "Content editor", "Draft history"];

const itemClass =
  "flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-left text-sm font-medium transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-navy ";

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
    <aside className="sticky top-0 flex h-screen w-[256px] shrink-0 flex-col overflow-y-auto border-r border-line bg-white px-4 py-6">
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 rounded-control px-2 py-1 focus-visible:outline-2 focus-visible:outline-navy"
      >
        <BrandMark />
        <span className="font-display text-[15px] font-bold leading-tight text-ink">
          AI Content
          <br />
          Generator
        </span>
      </Link>

      {mode === "nav" ? (
        <>
          <Link href="/generate" className={`${buttonClasses()} mt-6 w-full`}>
            {ICONS.plus}
            New content
          </Link>

          <nav aria-label="Main" className="mt-6">
            <ul className="flex flex-col gap-1">
              {NAV.map((item) => {
                const active = item.match.some((p) => pathname === p || pathname.startsWith(`${p}/`));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={
                        itemClass +
                        (active ? "bg-navy-50 font-semibold text-navy" : "text-slate-600 hover:bg-slate-50 hover:text-ink")
                      }
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-auto border-t border-line pt-4">
            <button
              type="button"
              onClick={handleLogout}
              disabled={signingOut}
              aria-busy={signingOut}
              className={itemClass + "text-slate-600 hover:bg-slate-50 hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"}
            >
              {ICONS.logout}
              {signingOut ? "Logging out..." : "Log out"}
            </button>
            {logoutError && (
              <p role="alert" className="mt-2 px-3 text-sm text-red-700">
                {logoutError}
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="mt-8 px-3">
            <p className="font-display text-base font-bold text-ink">{title ?? "Content creation process"}</p>
            {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
          </div>

          <ol aria-label="Progress" className="mt-4 flex flex-col gap-1">
            {STEPS.map((label, i) => {
              const done = i < currentStep;
              const current = i === currentStep;
              return (
                <li
                  key={label}
                  aria-current={current ? "step" : undefined}
                  className={
                    "flex items-center gap-3 rounded-control px-3 py-2.5 text-sm " +
                    (current ? "bg-navy-50 font-semibold text-navy" : done ? "text-slate-700" : "text-muted")
                  }
                >
                  <span
                    aria-hidden="true"
                    className={
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold " +
                      (done
                        ? "bg-teal-600 text-white"
                        : current
                          ? "bg-navy text-white"
                          : "border border-field bg-white text-muted")
                    }
                  >
                    {done ? (
                      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="m5 10.5 3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </span>
                  {label}
                  {done && <span className="sr-only">(completed)</span>}
                </li>
              );
            })}
          </ol>

          <div className="mt-auto border-t border-line pt-4">
            <Link href="/dashboard" className={itemClass + "text-slate-600 hover:bg-slate-50 hover:text-ink"}>
              {ICONS.back}
              Back to Dashboard
            </Link>
          </div>
        </>
      )}
    </aside>
  );
}
