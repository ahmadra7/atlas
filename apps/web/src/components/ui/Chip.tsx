interface ChipProps {
  label: string;
  onRemove?: () => void;
  active?: boolean;
  onClick?: () => void;
}

export function Chip({ label, onRemove, active, onClick }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
        active
          ? "border-atlas-primary bg-atlas-primary text-white"
          : "border-atlas-border bg-atlas-surface text-atlas-ink"
      }`}
    >
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className="hover:opacity-90"
        >
          {label}
        </button>
      ) : (
        <span>{label}</span>
      )}
      {onRemove ? (
        <button
          type="button"
          aria-label={`حذف ${label}`}
          onClick={onRemove}
          className={`rounded-full px-1 text-xs ${
            active
              ? "text-white/90 hover:bg-white/10"
              : "text-atlas-ink-muted hover:bg-atlas-surface-muted"
          }`}
        >
          ×
        </button>
      ) : null}
    </span>
  );
}
