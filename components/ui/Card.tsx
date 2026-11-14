// Usage:
// <Card>Anything inside a white rounded panel</Card>
// <Card className="max-w-sm">Smaller card</Card>
// Use for top-level panels only: don't put a Card inside a Card.
import type { HTMLAttributes } from "react";

export default function Card({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-card border border-line bg-white p-4 shadow-card sm:p-6 ${className}`} {...rest}>
      {children}
    </div>
  );
}
