"use client";
// Usage:
// <Textarea label="Generated Content" value={body} onChange={(e) => setBody(e.target.value)} />
// <Textarea label="Description" error="Description is too long" rows={4} />
import { useId, type TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export default function Textarea({ label, error, hint, id, rows = 8, className = "", ...rest }: TextareaProps) {
  const autoId = useId();
  const textareaId = id ?? autoId;
  const hintId = `${textareaId}-hint`;
  const errorId = `${textareaId}-error`;
  const describedBy = [hint ? hintId : "", error ? errorId : ""].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={textareaId} className="text-sm font-medium text-ink">
        {label}
      </label>
      <textarea
        id={textareaId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={
          "resize-y rounded-control border bg-white px-3 py-2 text-sm leading-6 text-ink placeholder:text-muted " +
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy " +
          "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-muted " +
          (error ? "border-danger " : "border-field ") +
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
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}