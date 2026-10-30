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
        "flex min-h-16 items-center justify-center gap-1 rounded-control border-2 px-4 py-3 text-sm font-medium text-gray-900 transition-colors " +
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy " +
        (selected ? "border-teal bg-teal-light " : "border-line bg-white hover:border-slate-400 ") +
        className
      }
    >
      {selected && (
        <span className="text-teal-700" aria-hidden="true">
          ✓
        </span>
      )}
      {label}
    </button>
  );
}