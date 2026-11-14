"use client";
// Usage:
// <Textarea label="Generated Content" value={body} onChange={(e) => setBody(e.target.value)} />
// <Textarea label="Description" error="Description is too long" rows={4} />
// <Textarea label="Draft" autoGrow />   (editor: larger text, grows with its content so only the page scrolls;
//                                        browsers without field-sizing fall back to `rows` and a resize handle)
import { useId, type TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  hint?: string;
  autoGrow?: boolean;
};

export default function Textarea({ label, error, hint, id, rows = 8, autoGrow = false, className = "", ...rest }: TextareaProps) {
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
          "resize-y rounded-control border bg-white text-ink placeholder:text-muted " +
          (autoGrow ? "field-sizing-content min-h-72 px-4 py-3 text-base leading-7 " : "px-3 py-2 text-sm leading-6 ") +
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