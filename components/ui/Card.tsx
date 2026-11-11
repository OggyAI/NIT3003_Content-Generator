// Usage:
// <Card>Anything inside a white rounded box</Card>
// <Card className="max-w-sm">Smaller card</Card>
import type { HTMLAttributes } from "react";

export default function Card({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-card border border-line bg-white p-6 shadow-card ${className}`} {...rest}>
      {children}
    </div>
  );
}
