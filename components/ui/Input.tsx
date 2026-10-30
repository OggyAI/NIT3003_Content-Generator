"use client";
// Usage:
// <Input label="Business Name" placeholder="Enter your business name" />
// <Input label="Email" error="Please enter a valid email" />
// <Input label="Topic" hint="e.g. Promote our EOFY sale to local customers" />
import { useId, type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export default function Input({ label, error, hint, id, className = "", ...rest }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = [hint ? hintId : "", error ? errorId : ""].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-semibold text-gray-900">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={
          "rounded-control border bg-white px-3 py-2 text-sm placeholder:text-muted " +
          "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-navy " +
          (error ? "border-red-600 " : "border-line ") +
          className
        }
        {...rest}
      />
      {hint && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}