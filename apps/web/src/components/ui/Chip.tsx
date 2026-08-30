interface ChipProps {
  label: string;
  onRemove?: () => void;
  active?: boolean;
  unusual?: boolean;
  ink?: boolean;
  onClick?: () => void;
}

export function Chip({
  label,
  onRemove,
  active,
  unusual,
  ink,
  onClick,
}: ChipProps) {
  return (
    <span
      title={unusual ? "این مورد ماده غذایی به نظر نمی‌رسد" : undefined}
      className={`inline-flex items-center gap-1.5 border px-3 py-2 text-caption transition ${
        ink ? "rounded-xl" : "rounded-lg"
      } ${
        active
          ? "border-atlas-primary bg-atlas-primary font-bold text-white"
          : ink
            ? unusual
              ? "border-2 border-atlas-danger bg-black font-medium text-atlas-danger"
              : "border-black bg-black font-medium text-white"
            : unusual
              ? "border-2 border-atlas-danger bg-zinc-50 font-medium text-atlas-danger dark:bg-atlas-surface-muted/40"
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
          className={`rounded-md px-0.5 text-[15px] leading-none ${
            unusual
              ? "text-atlas-danger"
              : active || ink
                ? "text-white"
                : "text-atlas-ink-muted"
          }`}
        >
          ×
        </button>
      ) : null}
    </span>
  );
}
