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
import {
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
  "relative flex min-h-10 w-full items-center gap-3 rounded-control px-3 py-2 text-left text-sm font-medium transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ";

/** One nav item: aria-current, a teal marker and a teal icon on the current page */
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
      className={itemClass + (active ? "bg-white/10 text-white" : "text-blue-100 hover:bg-white/5 hover:text-white")}
    >
      {active && <span aria-hidden="true" className="absolute inset-y-2 left-0 w-1 rounded-full bg-teal" />}
      <Icon className={active ? "h-5 w-5 text-teal-300" : "h-5 w-5"} />
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
        "flex w-64 shrink-0 flex-col bg-navy px-4 py-6 text-white " +
        (onClose ? "min-h-full" : "sticky top-0 h-dvh overflow-y-auto")
      }
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          href="/dashboard"
          className="rounded-control px-2 py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <BrandMark tone="dark" />
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control text-blue-100 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {business}

      <nav aria-label="Main" className="mt-6">
        <ul className="flex flex-col gap-1">
          {NAV.map(({ href, label, icon, match }) => (
            <li key={href}>
              <SidebarLink href={href} label={label} icon={icon} match={match} />
            </li>
          ))}
          {admin}
        </ul>
      </nav>

      <div className="mt-auto border-t border-white/15 pt-4">
        <button
          type="button"
          onClick={handleLogout}
          disabled={signingOut}
          aria-busy={signingOut}
          className={
            itemClass + "text-blue-100 hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          }
        >
          <LogoutIcon />
          {signingOut ? "Logging out..." : "Log out"}
        </button>
        {logoutError && (
          <p role="alert" className="mt-2 px-3 text-sm text-red-200">
            {logoutError}
          </p>
        )}
      </div>
    </aside>
  );
}
