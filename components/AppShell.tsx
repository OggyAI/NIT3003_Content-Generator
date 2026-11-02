// Usage:
// <AppShell sidebar={<Sidebar title="Dashboard" />}>
//   <Card>...page content...</Card>
// </AppShell>
// Desktop (md and up): sidebar on the left. Mobile: top bar with a ☰ menu that opens the sidebar.
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
        className="flex flex-1 items-start justify-center px-4 py-6 focus:outline-none md:items-center md:px-8 md:py-12"
      >
        <div className="w-full max-w-2xl">{children}</div>
      </main>
    </div>
  );
}