"use client";

import { Refresh, VolumeHigh, VolumeSlash } from "iconsax-react";
import { IosSwitch } from "@/components/ui/IosSwitch";

export function VoiceStepsToggle({
  checked,
  onChange,
  onRepeat,
  speaking = false,
  compact = false,
  className = "",
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  onRepeat?: () => void;
  speaking?: boolean;
  /** Smaller row for cook header / dense layouts */
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex w-full items-center gap-2.5 ${
        compact
          ? "rounded-xl border border-atlas-border bg-atlas-surface px-2.5 py-2"
          : "rounded-2xl border border-atlas-border bg-atlas-background px-3.5 py-3"
      } ${checked ? "border-atlas-primary/25 bg-atlas-primary-soft/40" : ""} ${className}`}
    >
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-xl ${
          compact ? "h-8 w-8" : "h-9 w-9"
        } ${
          checked
            ? "bg-atlas-primary text-white"
            : "bg-atlas-surface-muted text-atlas-ink-muted"
        }`}
      >
        {checked ? (
          <VolumeHigh
            size={compact ? 16 : 18}
            color="currentColor"
            variant="Bold"
          />
        ) : (
          <VolumeSlash
            size={compact ? 16 : 18}
            color="currentColor"
            variant="Linear"
          />
        )}
      </span>

      <div className="min-w-0 flex-1 text-right">
        <p
          className={`font-semibold text-atlas-ink ${
            compact ? "text-[12px] leading-4" : "text-[13px] leading-5"
          }`}
        >
          پخش مراحل با صدا
        </p>
        {!compact ? (
          <p className="mt-0.5 text-[11px] font-medium leading-5 text-atlas-ink-muted">
            متن هر مرحله هنگام پخت برایت خوانده می‌شود
          </p>
        ) : null}
      </div>

      {onRepeat ? (
        <button
          type="button"
          aria-label="تکرار خواندن مرحله"
          onClick={(e) => {
            e.stopPropagation();
            onRepeat();
          }}
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-atlas-border bg-atlas-surface px-2 text-[11px] font-semibold text-atlas-ink transition hover:bg-atlas-surface-muted"
        >
          <Refresh size={14} color="currentColor" variant="Bold" />
          <span>{speaking ? "…" : "تکرار"}</span>
        </button>
      ) : null}

      <IosSwitch
        checked={checked}
        onChange={onChange}
        ariaLabel="پخش مراحل با صدا"
      />
    </div>
  );
}
