// Small logo tile used in the sidebar, the mobile top bar and the login page.
// Usage: <BrandMark />  or  <BrandMark size="sm" />
export default function BrandMark({ size = "md" }: { size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-7 w-7 rounded-lg" : "h-9 w-9 rounded-xl";
  const icon = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center bg-linear-to-br from-navy to-teal-600 text-white shadow-cta ring-1 ring-white/20 ${box}`}
    >
      <svg viewBox="0 0 24 24" className={icon} fill="currentColor">
        <path d="M12 2.5l2.2 6.3 6.3 2.2-6.3 2.2L12 19.5l-2.2-6.3L3.5 11l6.3-2.2z" />
        <path d="M19 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
      </svg>
    </span>
  );
}
