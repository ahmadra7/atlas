import { Button } from "./Button";

interface StateViewProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: "neutral" | "warning" | "danger";
}

export function StateView({
  title,
  description,
  actionLabel,
  onAction,
  tone = "neutral",
}: StateViewProps) {
  const toneClass =
    tone === "danger"
      ? "border-atlas-danger/30 bg-atlas-danger-soft"
      : tone === "warning"
        ? "border-atlas-warning/30 bg-atlas-warning-soft"
        : "border-atlas-border bg-atlas-surface";

  return (
    <div className={`atlas-surface rounded-atlas-lg border p-8 text-center ${toneClass}`}>
      <h2 className="text-lg font-semibold text-atlas-ink">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm leading-7 text-atlas-ink-muted">{description}</p>
      ) : null}
      {actionLabel && onAction ? (
        <div className="mt-5">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      ) : null}
    </div>
  );
}

export function LoadingBlock({ label = "در حال بارگذاری…" }: { label?: string }) {
  return (
    <div className="atlas-surface flex min-h-40 items-center justify-center p-8">
      <div className="flex items-center gap-3 text-atlas-ink-muted">
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-atlas-border border-t-atlas-primary" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}
