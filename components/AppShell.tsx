// Usage:
// <AppShell width="wide">
//   <PageHeader title="Draft history" description="..." />
//   ...page content...
// </AppShell>
// width: "narrow" (max-w-3xl: profile, settings, generate)
//        "wide"   (max-w-6xl: dashboard, history, admin)
//        "editor" (room for a ~70ch writing column plus a 320px analysis column at lg)
// Content sits at the top left of the page, next to the sidebar.
// Desktop (md and up): navy sidebar on the left. Mobile: navy top bar with a menu button.
// The first Tab on every page shows a "Skip to main content" link (WCAG 2.4.1).
import { Suspense, type ReactNode } from "react";
import MobileNav from "./MobileNav";
import Sidebar from "./Sidebar";
import SidebarBusiness, { SidebarBusinessPlaceholder } from "./SidebarBusiness";

const WIDTHS = {
  narrow: "max-w-3xl",
  wide: "max-w-6xl",
  editor: "max-w-[calc(70ch+22rem)]",
};

type AppShellProps = {
  width?: keyof typeof WIDTHS;
  children: ReactNode;
};

export default function AppShell({ width = "narrow", children }: AppShellProps) {
  // Streams in without holding up the page (and works inside loading.tsx skeletons)
  const business = (
    <Suspense fallback={<SidebarBusinessPlaceholder />}>
      <SidebarBusiness />
    </Suspense>
  );

  return (
    <div className="min-h-screen md:flex">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-control focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-navy focus:shadow-lg focus:outline-2 focus:outline-navy"
      >
        Skip to main content
      </a>
      <MobileNav business={business} />
      <div className="hidden md:flex">
        <Sidebar business={business} />
      </div>
      <main
        id="main-content"
        tabIndex={-1}
        className="min-w-0 flex-1 px-4 py-6 focus:outline-none md:px-8 md:py-10"
      >
        <div className={`w-full ${WIDTHS[width]}`}>{children}</div>
      </main>
    </div>
  );
}
