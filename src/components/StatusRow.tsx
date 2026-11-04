import { Check, ChevronRight } from "lucide-react";

export function StatusRow({
  label,
  statusLabel,
  dotClassName,
  selected,
  disabled,
  onClick,
}: {
  label: string;
  statusLabel: string;
  dotClassName: string;
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-between px-4 py-3 border-b border-stone-100 last:border-b-0 transition-colors ${
        disabled
          ? "opacity-40 cursor-not-allowed"
          : `cursor-pointer hover:bg-stone-50 ${selected ? "bg-accent/5" : ""}`
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotClassName}`} />
        <span className="font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2 text-stone-500 text-sm">
        <span>{statusLabel}</span>
        {selected ? <Check size={16} className="text-accent" /> : <ChevronRight size={16} />}
      </div>
    </button>
  );
}

export default StatusRow;
