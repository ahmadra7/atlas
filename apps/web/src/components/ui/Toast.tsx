"use client";

import { useEffect, useRef, useState } from "react";
import { Add, Danger } from "iconsax-react";

const SHOW_MS = 3000;
const EXIT_MS = 280;

export function BottomToast({
  open,
  title,
  message,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
}) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setLeaving(false);
      return;
    }
    setLeaving(false);
    const exitAt = window.setTimeout(() => setLeaving(true), SHOW_MS - EXIT_MS);
    const hideAt = window.setTimeout(() => onCloseRef.current(), SHOW_MS);
    return () => {
      window.clearTimeout(exitAt);
      window.clearTimeout(hideAt);
    };
  }, [open, message, title]);

  if (!open) return null;

  function dismiss() {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(() => onCloseRef.current(), EXIT_MS);
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[4.75rem] z-[60] flex justify-center px-4">
      <div
        role="status"
        className="pointer-events-auto relative w-full max-w-sm rounded-2xl bg-black px-4 py-3.5 pl-11 shadow-[0_16px_36px_rgba(0,0,0,0.35)]"
        style={{
          animation: leaving
            ? `toastOut ${EXIT_MS}ms ease-in forwards`
            : `toastIn ${EXIT_MS}ms ease-out`,
        }}
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="بستن"
          className="absolute left-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center text-white/80 transition hover:text-white active:scale-90"
        >
          <span className="inline-flex rotate-45">
            <Add size={18} color="currentColor" variant="Linear" />
          </span>
        </button>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-atlas-danger-soft text-atlas-danger">
            <Danger size={22} color="currentColor" variant="Bold" />
          </span>
          <div className="min-w-0 text-right">
            <p className="text-[16px] font-bold leading-6 text-white">{title}</p>
            <p className="mt-1 text-[14px] leading-6 text-white">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
