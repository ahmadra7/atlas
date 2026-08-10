import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-atlas-primary text-white hover:bg-atlas-primary-hover disabled:bg-atlas-border",
  secondary:
    "bg-atlas-primary-soft text-atlas-primary hover:bg-[#d5ebe3] disabled:opacity-50",
  ghost:
    "bg-transparent text-atlas-ink-muted hover:bg-atlas-surface-muted disabled:opacity-50",
  danger:
    "bg-atlas-danger-soft text-atlas-danger hover:bg-[#fcdada] disabled:opacity-50",
  accent:
    "bg-atlas-accent text-white hover:brightness-95 disabled:opacity-50",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-atlas font-medium transition disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
