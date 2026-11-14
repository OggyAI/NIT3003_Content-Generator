// Usage:
// <SelectableCard label="Friendly" selected={voice === "friendly"} onSelect={() => setVoice("friendly")} />
// <SelectableCard label="Blog outline" description="Headings and key points" selected={...} onSelect={...} />
// <SelectableCard icon={<FormatIcon type="social" size="sm" />} label="Social post" ... />  (check mark moves right)
// Selection is shown three ways, never by colour alone: aria-pressed, a 2px teal-700 border and a check mark.
import type { ReactNode } from "react";
import { CheckIcon } from "@/components/icons";

type SelectableCardProps = {
  label: string;
  description?: string;
  /** Optional decorative tile shown before the label (e.g. a FormatIcon) */
  icon?: ReactNode;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  className?: string;
};

export default function SelectableCard({
  label,
  description,
  icon,
  selected,
  onSelect,
  disabled = false,
  className = "",
}: SelectableCardProps) {
  const check = (
    <span
      aria-hidden="true"
      className={
        "mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full " +
        (selected ? "bg-teal-700 text-white" : "border-2 border-field bg-white")
      }
    >
      {selected && <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />}
    </span>
  );
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      disabled={disabled}
      className={
        "flex min-h-14 rounded-control border-2 px-4 py-3 text-left text-sm text-ink transition-colors " +
        (icon ? "flex-col gap-3 " : "items-start gap-3 ") +
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy " +
        "disabled:cursor-not-allowed disabled:opacity-60 " +
        (selected ? "border-teal-700 bg-teal-light " : "border-field bg-white enabled:hover:border-navy enabled:hover:bg-navy-50 ") +
        className
      }
    >
      {icon ? (
        // Tile style: icon and check on top, words underneath (fits three across)
        <span className="flex w-full items-start justify-between gap-2">
          {icon}
          {check}
        </span>
      ) : (
        check
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-medium">{label}</span>
        {description && <span className="mt-0.5 text-sm leading-5 text-muted">{description}</span>}
      </span>
    </button>
  );
}
