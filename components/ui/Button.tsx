// Usage:
// <Button onClick={save}>Save draft</Button>
// <Button variant="secondary">Save as new version</Button>
// <Button variant="ghost" size="sm">Duplicate</Button>
// <Button variant="danger">Yes, delete</Button>          (confirming a destructive action)
// <Button variant="danger-ghost">Delete draft</Button>   (quiet trigger that opens the confirmation)
// <Button loading>Generating…</Button>        (sets disabled + aria-busy and shows a spinner)
// For a link that looks like a button:
// <Link href="/generate" className={buttonClasses()}>Create content</Link>
// <Link href="/history" className={buttonClasses("ghost", "sm")}>View all</Link>
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "danger-ghost";
type Size = "md" | "sm";

export function buttonClasses(variant: Variant = "primary", size: Size = "md") {
  const base =
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-control font-semibold transition-colors " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy " +
    "disabled:cursor-not-allowed disabled:opacity-60 ";
  // sm stays 40px tall on touch screens (below md) so tap targets meet the 40px rule
  const sizes = {
    md: "min-h-10 px-4 py-2 text-sm ",
    sm: "min-h-10 px-3 py-1.5 text-sm md:min-h-8 ",
  };
  const styles = {
    primary: "bg-navy text-white hover:bg-navy-dark",
    secondary: "border border-navy bg-white text-navy hover:bg-navy-50",
    ghost: "text-navy hover:bg-navy-50",
    danger: "bg-danger text-white hover:bg-red-800",
    "danger-ghost": "text-danger hover:bg-danger-light",
  };
  return base + sizes[size] + styles[variant];
}

// ComponentProps includes `ref` (a normal prop in React 19), so callers can focus the button
type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`${buttonClasses(variant, size)} ${className}`}
      {...rest}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
