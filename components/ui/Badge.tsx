// Usage:
// <Badge variant="success">81% SEO</Badge>
// <Badge variant="warning">Tone mismatch</Badge>
// <Badge variant="info">Instagram post</Badge>     (format labels)
// Never rely on the colour alone: the text must say what the badge means.
import type { ReactNode } from "react";

type BadgeProps = {
  variant?: "success" | "warning" | "neutral" | "info";
  children: ReactNode;
};

export default function Badge({ variant = "neutral", children }: BadgeProps) {
  const styles = {
    success: "bg-success-light text-green-800",
    warning: "bg-warning-light text-amber-800",
    neutral: "bg-slate-100 text-slate-700",
    info: "bg-navy-50 text-navy",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
