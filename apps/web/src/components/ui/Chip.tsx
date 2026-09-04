import { Add } from "iconsax-react";

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
      className={`inline-flex h-7 items-center gap-0.5 border px-2 text-[14px] leading-none transition ${
        ink ? "rounded-xl" : "rounded-lg"
      } ${
        active
          ? "border-atlas-primary bg-atlas-primary font-bold text-white"
          : ink
            ? unusual
              ? "border-2 border-atlas-danger bg-black/5 font-medium text-atlas-danger dark:bg-white/5"
              : "border-transparent bg-black/5 font-medium text-black dark:bg-white/5 dark:text-white"
            : unusual
              ? "border-2 border-atlas-danger bg-zinc-50 font-medium text-atlas-danger dark:bg-atlas-surface-muted"
              : "border-zinc-200/90 bg-zinc-50 font-medium text-atlas-ink dark:border-white/25 dark:bg-atlas-surface-muted"
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
          className={`inline-flex shrink-0 items-center justify-center ${
            unusual
              ? "text-atlas-danger"
              : active
                ? "text-white"
                : ink
                  ? "text-black dark:text-white"
                  : "text-atlas-ink-muted"
          }`}
        >
          <Add
            size={14}
            color="currentColor"
            variant="Linear"
            className="rotate-45"
          />
        </button>
      ) : null}
    </span>
  );
}
