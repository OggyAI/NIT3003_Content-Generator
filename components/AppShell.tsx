// Usage:
// <AppShell sidebar={<Sidebar title="Dashboard" />}>
//   <Card>...page content...</Card>
// </AppShell>
import type { ReactNode } from "react";

type AppShellProps = {
  sidebar: ReactNode;
  children: ReactNode;
};

export default function AppShell({ sidebar, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen">
      {sidebar}
      <main className="flex flex-1 items-center justify-center px-8 py-12">
        <div className="w-full max-w-2xl">{children}</div>
      </main>
    </div>
  );
}