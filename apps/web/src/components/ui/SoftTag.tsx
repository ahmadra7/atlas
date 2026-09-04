import type { ReactNode } from "react";

const tones: Record<string, string> = {
  red: "bg-atlas-primary-soft text-atlas-primary",
  black: "bg-atlas-surface-muted text-atlas-ink",
  gray: "bg-atlas-surface-muted text-atlas-ink-muted ring-1 ring-inset ring-atlas-border",
  soft: "bg-atlas-surface/90 text-atlas-ink-muted ring-1 ring-inset ring-atlas-border",
  white:
    "bg-white text-zinc-600 ring-1 ring-inset ring-zinc-200/80 dark:bg-atlas-surface-muted dark:text-zinc-400 dark:ring-white/10",
  amber:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  green:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  blue: "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  violet:
    "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  danger:
    "bg-red-50 text-red-600 ring-1 ring-inset ring-red-200/80 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-400/25",
};

export function SoftTag({
  label,
  tone = "soft",
  icon,
  iconEnd = false,
  size = "md",
  rounded = "full",
}: {
  label: string;
  tone?: keyof typeof tones;
  icon?: ReactNode;
  /** Place icon on the visual right of the label. */
  iconEnd?: boolean;
  size?: "sm" | "md";
  rounded?: "full" | "md";
}) {
  const sizeClass =
    size === "sm"
      ? "gap-1 px-2 py-0.5 text-[11px] leading-4"
      : "gap-1.5 px-2.5 py-1 text-caption";

  return (
    <span
      dir="ltr"
      className={`inline-flex items-center font-medium tracking-tight ${
        rounded === "md" ? "rounded-md" : "rounded-full"
      } ${sizeClass} ${tones[tone]}`}
    >
      {!iconEnd && icon ? (
        <span className="inline-flex shrink-0 opacity-70">{icon}</span>
      ) : null}
      <span dir="rtl">{label}</span>
      {iconEnd && icon ? (
        <span className="inline-flex shrink-0 opacity-70">{icon}</span>
      ) : null}
    </span>
  );
}

export function TagRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}
