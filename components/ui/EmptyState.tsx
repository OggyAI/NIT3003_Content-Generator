// Shown when a list has nothing in it: say what goes here, and offer one action.
// Usage:
// <EmptyState
//   title="No drafts yet"
//   text="Create your first post and it will appear here."
//   action={<Link href="/generate" className={buttonClasses()}>Create content</Link>}
// />
// Use headingLevel="h3" when it sits under an h2 section title.
import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  text: ReactNode;
  action?: ReactNode;
  headingLevel?: "h2" | "h3";
};

export default function EmptyState({ title, text, action, headingLevel = "h2" }: EmptyStateProps) {
  const Heading = headingLevel;
  return (
    <div className="flex flex-col items-start gap-2 rounded-card border border-dashed border-field bg-white p-6 sm:p-8">
      <Heading className="text-base font-semibold text-ink">{title}</Heading>
      <p className="max-w-prose text-sm leading-6 text-muted">{text}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
