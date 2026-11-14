// Usage:
// <Chip label="Clothing" onRemove={() => removeProduct("Clothing")} />
// <Chip label="Read only" />   (no × button)
import { CloseIcon } from "@/components/icons";

type ChipProps = {
  label: string;
  onRemove?: () => void;
};

export default function Chip({ label, onRemove }: ChipProps) {
  return (
    <span
      className={
        "inline-flex min-h-8 items-center gap-1 rounded-full border border-field bg-white py-0.5 text-sm text-ink " +
        (onRemove ? "pl-3 pr-1" : "px-3")
      }
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-slate-100 hover:text-ink focus-visible:outline-2 focus-visible:outline-navy"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      )}
    </span>
  );
}
