"use client";
// The one navigation sidebar for every signed-in page. AppShell renders it on desktop,
// and MobileNav renders it inside the slide-in menu (with onClose). Pages don't use it directly.
// Items: Dashboard, Create content, Draft history, Business profile, Settings, then Log out.
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
  SlidersIcon,
  SparkleIcon,
  StoreIcon,
} from "@/components/icons";

// `match` lists the URL prefixes that mark each item as the current page
const NAV = [
  { href: "/dashboard", label: "Dashboard", Icon: HomeIcon, match: ["/dashboard"] },
  { href: "/generate", label: "Create content", Icon: SparkleIcon, match: ["/generate"] },
  { href: "/history", label: "Draft history", Icon: DocumentsIcon, match: ["/history", "/editor"] },
  { href: "/profile", label: "Business profile", Icon: StoreIcon, match: ["/profile"] },
  { href: "/settings", label: "Settings", Icon: SlidersIcon, match: ["/settings"] },
];

const itemClass =
  "relative flex min-h-10 w-full items-center gap-3 rounded-control px-3 py-2 text-left text-sm font-medium transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ";

type SidebarProps = {
  /** Business name block, streamed in from the server by AppShell */
  business?: ReactNode;
  /** Only inside the mobile menu: shows a Close button */
  onClose?: () => void;
};

export default function Sidebar({ business, onClose }: SidebarProps) {
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
          {NAV.map(({ href, label, Icon, match }) => {
            const active = match.some((p) => pathname === p || pathname.startsWith(`${p}/`));
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={
                    itemClass + (active ? "bg-white/10 text-white" : "text-blue-100 hover:bg-white/5 hover:text-white")
                  }
                >
                  {active && (
                    <span aria-hidden="true" className="absolute inset-y-2 left-0 w-1 rounded-full bg-teal" />
                  )}
                  <Icon className={active ? "h-5 w-5 text-teal-300" : "h-5 w-5"} />
                  {label}
                </Link>
              </li>
            );
          })}
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
