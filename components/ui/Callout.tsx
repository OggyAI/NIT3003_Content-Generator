// Usage:
// <Callout title="Suggestion">Add urgency such as "Ends this Sunday!"</Callout>
import type { ReactNode } from "react";

type CalloutProps = {
  title: string;
  children: ReactNode;
};

export default function Callout({ title, children }: CalloutProps) {
  return (
    <div role="note" className="rounded-control border border-amber-200 bg-warning-light p-4">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
        <span className="text-amber-700" aria-hidden="true">✦</span>
        {title}
      </p>
      <p className="mt-1 text-sm leading-6 text-amber-900">{children}</p>
    </div>
  );
}
