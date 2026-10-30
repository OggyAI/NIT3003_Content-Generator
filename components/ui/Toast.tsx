"use client";
// Usage:
// const [open, setOpen] = useState(false);
// <Toast open={open} message="Draft saved" onClose={() => setOpen(false)} />
// <Toast open={open} variant="error" message="Generation failed, please try again" onClose={...} />
import { useEffect } from "react";

type ToastProps = {
  open: boolean;
  message: string;
  onClose: () => void;
  variant?: "success" | "error";
  duration?: number; // milliseconds before it hides itself
};

export default function Toast({ open, message, onClose, variant = "success", duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={
        "fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-control px-4 py-3 text-sm font-medium text-white shadow-lg " +
        (variant === "success" ? "bg-green-700" : "bg-red-700")
      }
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className="rounded px-1 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
      >
        ×
      </button>
    </div>
  );
}