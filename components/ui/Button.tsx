// Usage:
// <Button onClick={save}>Save</Button>
// <Button variant="secondary">Back</Button>
// <Button loading>Generating Draft...</Button>
// For a link that looks like a button:
// <Link href="/generate" className={buttonClasses()}>Create</Link>
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary";

export function buttonClasses(variant: Variant = "primary") {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-control px-5 py-2 text-sm font-semibold transition-colors " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy " +
    "disabled:cursor-not-allowed disabled:opacity-60 ";
  const styles = {
    primary: "bg-navy text-white hover:bg-navy-dark",
    secondary: "border border-navy bg-white text-navy hover:bg-slate-50",
  };
  return base + styles[variant];
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
};

export default function Button({
  variant = "primary",
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
      className={`${buttonClasses(variant)} ${className}`}
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