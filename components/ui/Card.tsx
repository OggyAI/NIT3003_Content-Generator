// Usage:
// <Card>Anything inside a white rounded box</Card>
// <Card className="max-w-sm">Smaller card</Card>
import type { HTMLAttributes } from "react";

export default function Card({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-card border border-slate-100 bg-white p-6 shadow-sm ${className}`} {...rest}>
      {children}
    </div>
  );
}