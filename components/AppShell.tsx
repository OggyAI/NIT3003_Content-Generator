// Usage:
// <AppShell sidebar={<Sidebar title="Dashboard" />}>
//   <Card>...page content...</Card>
// </AppShell>
// Desktop (md and up): sidebar on the left. Mobile: top bar with a menu button that opens the sidebar.
// The first Tab on every page shows a "Skip to main content" link (WCAG 2.4.1).
import type { ReactNode } from "react";
import MobileNav from "./MobileNav";

type AppShellProps = {
  sidebar: ReactNode;
  children: ReactNode;
};

export default function AppShell({ sidebar, children }: AppShellProps) {
  return (
    <div className="min-h-screen md:flex">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-control focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-navy focus:shadow-lg focus:outline-2 focus:outline-navy"
      >
        Skip to main content
      </a>
      <MobileNav sidebar={sidebar} />
      <div className="hidden md:flex">{sidebar}</div>
      <main
        id="main-content"
        tabIndex={-1}
        className="relative isolate min-w-0 flex-1 px-4 py-6 focus:outline-none sm:px-6 md:px-10 md:py-10"
      >
        {/* Soft navy/teal glow at the top of every page (decorative) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(55%_100%_at_15%_0%,rgb(30_58_138/0.10),transparent),radial-gradient(45%_100%_at_90%_0%,rgb(20_184_166/0.12),transparent)]"
        />
        <div className="mx-auto w-full max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
