// Usage:
// <Badge variant="success">81% SEO</Badge>
// <Badge variant="warning">Tone mismatch</Badge>
import type { ReactNode } from "react";

type BadgeProps = {
  variant?: "success" | "warning" | "neutral";
  children: ReactNode;
};

export default function Badge({ variant = "neutral", children }: BadgeProps) {
  const styles = {
    success: "bg-success-light text-green-800",
    warning: "bg-warning-light text-amber-800",
    neutral: "bg-slate-100 text-slate-700",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${styles[variant]}`}>
      {children}
    </span>
  );
}