"use client";
// Usage:
// const [open, setOpen] = useState(false);
// <Toast open={open} message="Draft saved" onClose={() => setOpen(false)} />
// <Toast open={open} variant="error" message="Generation failed, please try again" onClose={...} />
import { useEffect } from "react";
import { CheckIcon, AlertIcon, CloseIcon } from "@/components/icons";

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
        "fixed inset-x-4 bottom-4 z-50 flex items-center gap-3 rounded-control py-2 pl-4 pr-2 text-sm font-medium text-white shadow-lg sm:inset-x-auto sm:bottom-6 sm:right-6 " +
        (variant === "success" ? "bg-green-700" : "bg-danger")
      }
    >
      {variant === "success" ? <CheckIcon /> : <AlertIcon />}
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
