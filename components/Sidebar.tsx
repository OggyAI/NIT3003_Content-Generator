"use client";
// The one navigation sidebar for every signed-in page. AppShell renders it on desktop,
// and MobileNav renders it inside the slide-in menu (with onClose). Pages don't use it directly.
// Items: Dashboard, Create content, Draft history, Business profile, Settings, then Admin
// (admins only, streamed in by AppShell), then Log out.
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import BrandMark from "@/components/BrandMark";
import { buttonClasses } from "@/components/ui/Button";
import {
  PlusIcon,
  CloseIcon,
  DocumentsIcon,
  HomeIcon,
  LogoutIcon,
  ShieldIcon,
  SlidersIcon,
  SparkleIcon,
  StoreIcon,
} from "@/components/icons";

// By name, so a server component can render a SidebarLink (functions can't cross that boundary)
const ICONS = {
  home: HomeIcon,
  create: SparkleIcon,
  drafts: DocumentsIcon,
  profile: StoreIcon,
  settings: SlidersIcon,
  admin: ShieldIcon,
};

// `match` lists the URL prefixes that mark each item as the current page
const NAV: { href: string; label: string; icon: keyof typeof ICONS; match: string[] }[] = [
  { href: "/dashboard", label: "Dashboard", icon: "home", match: ["/dashboard"] },
  { href: "/generate", label: "Create content", icon: "create", match: ["/generate"] },
  { href: "/history", label: "Draft history", icon: "drafts", match: ["/history", "/editor"] },
  { href: "/profile", label: "Business profile", icon: "profile", match: ["/profile"] },
  { href: "/settings", label: "Settings", icon: "settings", match: ["/settings"] },
];

const itemClass =
  "relative flex min-h-10 w-full items-center gap-3 rounded-control px-3 py-2 text-left text-sm transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ";

/** One nav item: aria-current plus a navy pill on the current page (white sidebar, refresh v2) */
export function SidebarLink({
  href,
  label,
  icon,
  match,
}: {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
  match: string[];
}) {
  const pathname = usePathname();
  const active = match.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const Icon = ICONS[icon];
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        itemClass +
        (active ? "bg-navy-50 font-semibold text-navy" : "font-medium text-slate-600 hover:bg-slate-50 hover:text-ink")
      }
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}

type SidebarProps = {
  /** Business name block, streamed in from the server by AppShell */
  business?: ReactNode;
  /** Admin nav item: renders nothing for non-admins (streamed in from the server by AppShell) */
  admin?: ReactNode;
  /** Only inside the mobile menu: shows a Close button */
  onClose?: () => void;
};

export default function Sidebar({ business, admin, onClose }: SidebarProps) {
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
    <aside
      className={
        "flex w-64 shrink-0 flex-col border-r border-line bg-white px-4 py-6 text-ink " +
        (onClose ? "min-h-full" : "sticky top-0 h-dvh overflow-y-auto")
      }
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          href="/dashboard"
          className="rounded-control px-2 py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        >
          <BrandMark />
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control text-muted hover:bg-slate-100 hover:text-ink focus-visible:outline-2 focus-visible:outline-navy"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {/* The one call to action in the chrome */}
      <Link href="/generate" className={`${buttonClasses()} mt-6 w-full`}>
        <PlusIcon className="h-4 w-4" />
        New content
      </Link>

      {business}

      <nav aria-label="Main" className="mt-5">
        <ul className="flex flex-col gap-1">
          {NAV.map(({ href, label, icon, match }) => (
            <li key={href}>
              <SidebarLink href={href} label={label} icon={icon} match={match} />
            </li>
          ))}
          {admin}
        </ul>
      </nav>

      <div className="mt-auto border-t border-line pt-4">
        <button
          type="button"
          onClick={handleLogout}
          disabled={signingOut}
          aria-busy={signingOut}
          className={
            itemClass +
            "font-medium text-slate-600 hover:bg-slate-50 hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
          }
        >
          <LogoutIcon />
          {signingOut ? "Logging out..." : "Log out"}
        </button>
        {logoutError && (
          <p role="alert" className="mt-2 px-3 text-sm text-danger">
            {logoutError}
          </p>
        )}
      </div>
    </aside>
  );
}
