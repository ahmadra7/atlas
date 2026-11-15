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
      className={`flex w-full items-center gap-2 ${
        compact ? "py-0.5" : "py-1"
      } ${className}`}
    >
      <span
        className={`inline-flex shrink-0 items-center justify-center ${
          checked ? "text-atlas-primary" : "text-atlas-ink-muted"
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

      <p
        className={`min-w-0 flex-1 text-right font-medium text-atlas-ink ${
          compact ? "text-[12px] leading-4" : "text-[13px] leading-5"
        }`}
      >
        پخش مراحل با صدا
      </p>

      {onRepeat ? (
        <button
          type="button"
          aria-label="تکرار خواندن مرحله"
          onClick={(e) => {
            e.stopPropagation();
            onRepeat();
          }}
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-2 text-[11px] font-semibold text-atlas-ink-muted transition hover:bg-atlas-surface-muted hover:text-atlas-ink"
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
