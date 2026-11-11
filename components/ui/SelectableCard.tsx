// Usage:
// <SelectableCard label="Friendly" selected={voice === "friendly"} onSelect={() => setVoice("friendly")} />
type SelectableCardProps = {
  label: string;
  selected: boolean;
  onSelect: () => void;
  className?: string;
};

export default function SelectableCard({ label, selected, onSelect, className = "" }: SelectableCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={
        "flex min-h-14 min-w-0 items-center justify-center gap-2 rounded-control border px-4 py-3 text-center text-sm font-medium leading-tight transition-colors " +
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy " +
        (selected
          ? "border-teal-600 bg-teal-50 text-ink ring-1 ring-teal-600 "
          : "border-field bg-white text-slate-700 hover:border-navy/60 hover:bg-slate-50 ") +
        className
      }
    >
      {selected && (
        <span
          aria-hidden="true"
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white"
        >
          <svg viewBox="0 0 20 20" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="m5 10.5 3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
      {label}
    </button>
  );
}
