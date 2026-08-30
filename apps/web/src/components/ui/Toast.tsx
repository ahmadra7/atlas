"use client";

import { useEffect } from "react";
import { CloseCircle } from "iconsax-react";

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
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(onClose, 3400);
    return () => window.clearTimeout(t);
  }, [open, message, onClose]);

  if (!open) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[4.75rem] z-[60] flex justify-center px-4">
      <div
        role="status"
        className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl bg-black px-4 py-3.5 shadow-[0_16px_36px_rgba(0,0,0,0.35)]"
        style={{ animation: "toastDown 0.38s ease-out" }}
      >
        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
          <CloseCircle size={20} color="currentColor" variant="Bold" />
        </span>
        <div className="min-w-0 text-right">
          <p className="text-[16px] font-bold leading-6 text-white">{title}</p>
          <p className="mt-1 text-[14px] leading-6 text-white">{message}</p>
        </div>
      </div>
    </div>
  );
}
