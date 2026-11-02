// Usage:
// <AppShell sidebar={<Sidebar title="Dashboard" />}>
//   <Card>...page content...</Card>
// </AppShell>
// Desktop (md and up): sidebar on the left. Mobile: top bar with a ☰ menu that opens the sidebar.
import type { ReactNode } from "react";
import MobileNav from "./MobileNav";

type AppShellProps = {
  sidebar: ReactNode;
  children: ReactNode;
};

export default function AppShell({ sidebar, children }: AppShellProps) {
  return (
    <div className="min-h-screen md:flex">
      <MobileNav sidebar={sidebar} />
      <div className="hidden md:flex">{sidebar}</div>
      <main className="flex flex-1 items-start justify-center px-4 py-6 md:items-center md:px-8 md:py-12">
        <div className="w-full max-w-2xl">{children}</div>
      </main>
    </div>
  );
}