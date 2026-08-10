import type { ReactNode } from "react";

const tones: Record<string, string> = {
  red: "bg-atlas-primary-soft text-atlas-primary",
  black: "bg-zinc-200 text-atlas-ink",
  gray: "bg-zinc-100 text-zinc-600 ring-1 ring-inset ring-zinc-200/80",
  soft: "bg-white/80 text-zinc-600 ring-1 ring-inset ring-zinc-200/90 shadow-sm",
  amber: "bg-amber-50 text-amber-700",
  green: "bg-emerald-50 text-emerald-700",
  blue: "bg-sky-50 text-sky-700",
  violet: "bg-violet-50 text-violet-700",
};

export function SoftTag({
  label,
  tone = "soft",
  icon,
}: {
  label: string;
  tone?: keyof typeof tones;
  icon?: ReactNode;
}) {
  return (
    <span
      dir="ltr"
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-tight ${tones[tone]}`}
    >
      {icon ? (
        <span className="inline-flex shrink-0 opacity-70">{icon}</span>
      ) : null}
      <span dir="rtl">{label}</span>
    </span>
  );
}

export function TagRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}
