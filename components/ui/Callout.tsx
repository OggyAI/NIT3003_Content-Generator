// Usage:
// <Callout title="Suggestion">Add urgency such as "Ends this Sunday!"</Callout>
import type { ReactNode } from "react";

type CalloutProps = {
  title: string;
  children: ReactNode;
};

export default function Callout({ title, children }: CalloutProps) {
  return (
    <div role="note" className="rounded-control bg-warning-light p-4 text-center">
      <p className="flex items-center justify-center gap-1 text-sm font-semibold text-gray-900">
        <span className="text-amber-600" aria-hidden="true">✦</span>
        {title}
      </p>
      <p className="mt-2 text-sm text-amber-800">{children}</p>
    </div>
  );
}