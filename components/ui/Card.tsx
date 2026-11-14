// Usage:
// <Card>Anything inside a white rounded panel</Card>
// <Card className="max-w-sm">Smaller card</Card>
// <Card padded={false}>  for full-width rows (lists) that bring their own padding
// Use for top-level panels only: don't put a Card inside a Card.
import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & { padded?: boolean };

export default function Card({ className = "", padded = true, children, ...rest }: CardProps) {
  return (
    <div
      className={`rounded-card border border-line bg-white shadow-card ${padded ? "p-4 sm:p-6" : "overflow-hidden"} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
