"use client";
// Usage:
// <Select label="Industry" placeholder="Select your industry" options={["Retail", "Hospitality"]} />
// <Select label="Platform" options={[{ value: "instagram", label: "Instagram" }]} error="Required" />
import { useId, type SelectHTMLAttributes } from "react";

type Option = { value: string; label: string };

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: (string | Option)[];
  placeholder?: string;
  error?: string;
  hint?: string;
};

export default function Select({ label, options, placeholder, error, hint, id, className = "", ...rest }: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const hintId = `${selectId}-hint`;
  const errorId = `${selectId}-error`;
  const describedBy = [hint ? hintId : "", error ? errorId : ""].filter(Boolean).join(" ") || undefined;

  // Show the placeholder first if nothing is chosen yet
  const startEmpty =
    placeholder && rest.value === undefined && rest.defaultValue === undefined ? { defaultValue: "" } : {};

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={selectId} className="text-sm font-semibold text-gray-900">
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={
            "w-full appearance-none rounded-control border bg-white py-2 pl-3 pr-10 text-sm " +
            "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-navy " +
            (error ? "border-red-600 " : "border-line ") +
            className
          }
          {...startEmpty}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const o = typeof opt === "string" ? { value: opt, label: opt } : opt;
            return (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            );
          })}
        </select>
        {/* Down arrow */}
        <svg
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5.5 7.5 10 12l4.5-4.5h-9z" />
        </svg>
      </div>
      {hint && <p id={hintId} className="text-sm text-muted">{hint}</p>}
      {error && <p id={errorId} className="text-sm text-red-600">{error}</p>}
    </div>
  );
}