interface ChipProps {
  label: string;
  onRemove?: () => void;
  active?: boolean;
  onClick?: () => void;
}

export function Chip({ label, onRemove, active, onClick }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-caption transition ${
        active
          ? "border-atlas-primary bg-atlas-primary font-bold text-white"
          : "border-zinc-200/90 bg-zinc-50 font-medium text-atlas-ink dark:border-atlas-border dark:bg-atlas-surface-muted/40"
      }`}
    >
      {onClick ? (
        <button type="button" onClick={onClick} className="hover:opacity-90">
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
          className={`rounded-md px-1 text-body ${
            active ? "text-white/90" : "text-atlas-ink-muted"
          }`}
        >
          ×
        </button>
      ) : null}
    </span>
  );
}
