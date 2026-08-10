import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "ghost"
  | "danger"
  | "accent";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-atlas-primary text-white hover:bg-atlas-primary-hover disabled:bg-atlas-border disabled:text-atlas-ink-faint shadow-sm",
  secondary:
    "border border-atlas-ink bg-atlas-surface text-atlas-ink hover:bg-atlas-surface-muted disabled:opacity-50",
  tertiary:
    "bg-transparent text-atlas-primary hover:bg-atlas-primary-soft disabled:opacity-50",
  ghost:
    "bg-transparent text-atlas-ink-muted hover:bg-atlas-surface-muted disabled:opacity-50",
  danger:
    "bg-atlas-danger-soft text-atlas-danger hover:bg-[#fecaca] disabled:opacity-50",
  accent:
    "bg-atlas-secondary text-white hover:bg-black disabled:opacity-50",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-caption",
  md: "h-11 px-4 text-body",
  lg: "h-12 px-5 text-body font-semibold",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  children: ReactNode;
}

/** Icon always renders on the visual left of the label. */
export function Button({
  variant = "primary",
  size = "md",
  icon,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      dir="ltr"
      className={`inline-flex items-center justify-center gap-2 rounded-atlas font-semibold transition disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon ? <span className="inline-flex shrink-0">{icon}</span> : null}
      <span dir="rtl">{children}</span>
    </button>
  );
}
