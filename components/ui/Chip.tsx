// Usage:
// <Chip label="Clothing" onRemove={() => removeProduct("Clothing")} />
// <Chip label="Read only" />   (no × button)
type ChipProps = {
  label: string;
  onRemove?: () => void;
};

export default function Chip({ label, onRemove }: ChipProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-slate-50 py-1 pl-1 pr-3 text-sm">
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="flex h-6 w-6 items-center justify-center rounded-full text-muted hover:bg-slate-200 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-navy"
        >
          ×
        </button>
      ) : (
        <span className="w-2" />
      )}
      {label}
    </span>
  );
}