// Full-page message for the 404 and error pages, which render outside AppShell.
// Matches the auth pages: product mark at the top, one white card with the message and actions.
// Usage:
// <StatusPage eyebrow="404" title="We can't find that page" text="..." actions={<Link ...>} />
import type { ReactNode } from "react";
import BrandMark from "@/components/BrandMark";

type StatusPageProps = {
  eyebrow: string;
  title: string;
  text: ReactNode;
  actions: ReactNode;
  role?: "alert";
};

export default function StatusPage({ eyebrow, title, text, actions, role }: StatusPageProps) {
  return (
    <main className="flex min-h-screen flex-col bg-page px-4 py-8 sm:px-8">
      <BrandMark />
      <div className="flex flex-1 items-center justify-center py-8">
        <div role={role} className="w-full max-w-md rounded-card border border-line bg-white p-6 shadow-card sm:p-8">
          <p className="text-sm font-semibold text-teal-700">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
          <div className="mt-6 flex flex-wrap gap-3">{actions}</div>
        </div>
      </div>
    </main>
  );
}
