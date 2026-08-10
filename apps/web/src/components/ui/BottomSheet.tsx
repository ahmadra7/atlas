"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { CloseCircle } from "iconsax-react";

export function BottomSheet({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="بستن"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 flex max-h-[94vh] w-full max-w-md translate-y-0 flex-col rounded-t-atlas-xl border border-atlas-border bg-atlas-surface shadow-atlas transition-transform duration-300 ease-out"
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-zinc-300" />
        <div className="flex items-center justify-between px-5 pb-2 pt-3">
          <h2 className="text-h3 text-atlas-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-atlas-ink-muted hover:bg-atlas-surface-muted"
            aria-label="بستن"
          >
            <CloseCircle size={22} color="currentColor" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">{children}</div>
        {footer ? (
          <div className="shrink-0 border-t border-atlas-border bg-atlas-surface px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
