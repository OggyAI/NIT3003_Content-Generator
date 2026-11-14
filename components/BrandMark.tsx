// Product mark + name, used in the sidebar, the mobile top bar and the auth pages.
// Usage:
// <BrandMark />                      on a light background (ink text)
// <BrandMark tone="dark" />          on navy (white text)
// <BrandMark size="sm" />            smaller, for the mobile top bar
// <BrandMark showName={false} />     just the tile
import { SparkleIcon } from "@/components/icons";

type BrandMarkProps = {
  tone?: "light" | "dark";
  size?: "sm" | "md";
  showName?: boolean;
};

export default function BrandMark({ tone = "light", size = "md", showName = true }: BrandMarkProps) {
  const tile =
    (size === "sm" ? "h-8 w-8 rounded-lg " : "h-9 w-9 rounded-control ") +
    (tone === "dark" ? "bg-white/10 text-teal-300 ring-1 ring-white/20" : "bg-navy text-white");

  return (
    <span className="inline-flex items-center gap-2.5">
      <span aria-hidden="true" className={`flex shrink-0 items-center justify-center ${tile}`}>
        <SparkleIcon className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
      </span>
      {showName && (
        <span
          className={
            "font-semibold leading-tight tracking-tight " +
            (size === "sm" ? "text-base " : "text-lg ") +
            (tone === "dark" ? "text-white" : "text-ink")
          }
        >
          AI Content Generator
        </span>
      )}
    </span>
  );
}
