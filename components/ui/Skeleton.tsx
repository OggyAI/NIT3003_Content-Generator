// Grey placeholder shapes for loading.tsx skeletons. Each skeleton mirrors its page's real
// layout (same AppShell width, header, cards) so nothing jumps when the data arrives.
// Usage:
// <SkeletonPage label="Loading your drafts…">
//   <SkeletonHeader />
//   <Card><SkeletonBar className="h-4 w-1/2" /></Card>
// </SkeletonPage>
import type { ReactNode } from "react";

export function SkeletonBar({ className = "" }: { className?: string }) {
  return <div className={`rounded-full bg-slate-200 ${className}`} />;
}

// A box the size of a control (input, button, selectable card)
export function SkeletonBox({ className = "" }: { className?: string }) {
  return <div className={`rounded-control bg-slate-200 ${className}`} />;
}

/** Announces the label to screen readers; the shapes inside are hidden from them */
export function SkeletonPage({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="status" className="flex flex-col gap-6">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="flex animate-pulse flex-col gap-6">
        {children}
      </div>
    </div>
  );
}

/** Matches PageHeader: title and description on the left, an action on the right */
export function SkeletonHeader({ action = true }: { action?: boolean }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-3">
        <SkeletonBar className="h-8 w-56" />
        <SkeletonBar className="h-4 w-80 max-w-full" />
      </div>
      {action && <SkeletonBox className="h-10 w-36" />}
    </div>
  );
}
