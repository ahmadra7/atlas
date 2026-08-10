import { Button } from "./Button";

interface StateViewProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: "neutral" | "warning" | "danger" | "empty";
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
      ? "border-atlas-danger/20 bg-atlas-danger-soft"
      : tone === "warning"
        ? "border-atlas-warning/20 bg-atlas-warning-soft"
        : "border-atlas-border bg-atlas-surface";

  return (
    <div className={`rounded-atlas-lg border p-6 text-center ${toneClass}`}>
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-atlas-primary-soft text-atlas-primary">
        {tone === "empty" ? "∅" : tone === "danger" ? "!" : "…"}
      </div>
      <h2 className="text-h3 text-atlas-ink">{title}</h2>
      {description ? (
        <p className="mt-2 text-body leading-7 text-atlas-ink-muted">
          {description}
        </p>
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
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-atlas-lg border border-atlas-border bg-atlas-surface p-6">
      <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-atlas-border border-t-atlas-primary" />
      <span className="text-caption text-atlas-ink-muted">{label}</span>
    </div>
  );
}
