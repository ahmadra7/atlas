"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { CloseCircle } from "iconsax-react";

const ANIM_MS = 320;

export function BottomSheet({
  open,
  title,
  onClose,
  children,
  footer,
  tall = true,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** When false, sheet sizes to content up to ~88vh instead of nearly full screen. */
  tall?: boolean;
}) {
  const [mounted, setMounted] = useState(open);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setEntered(true));
      });
      return () => cancelAnimationFrame(id);
    }
    setEntered(false);
    const t = window.setTimeout(() => setMounted(false), ANIM_MS);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="بستن"
        className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
          entered ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 flex w-full max-w-md flex-col rounded-t-atlas-xl border border-atlas-border bg-atlas-surface shadow-atlas transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          tall ? "h-[92vh] max-h-[98vh]" : "max-h-[88vh]"
        } ${entered ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-zinc-300" />
        <div className="relative flex items-center justify-center px-5 pb-2 pt-3">
          <h2 className="text-center text-h3 text-atlas-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute left-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-atlas-ink-muted hover:bg-atlas-surface-muted"
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
