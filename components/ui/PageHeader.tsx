// The one h1 on every signed-in page: title + one-line description on the left, actions on the right.
// Below sm the actions stack under the title.
// Usage:
// <PageHeader title="Draft history" description="Open, search and export your saved drafts." />
// <PageHeader
//   title="Create content"
//   meta={<>Writing for Bean There Café · Friendly voice</>}
//   actions={<Link href="/history" className={buttonClasses("secondary")}>Draft history</Link>}
// />
import type { ReactNode } from "react";

type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
};

export default function PageHeader({ title, description, actions, meta }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight break-words text-ink md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm leading-6 text-muted md:text-base">{description}</p>}
        {meta && (
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">{meta}</div>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">{actions}</div>}
    </header>
  );
}
