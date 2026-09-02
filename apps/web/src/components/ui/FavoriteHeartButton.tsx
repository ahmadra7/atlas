"use client";

import { Heart } from "iconsax-react";

export function FavoriteHeartButton({
  active,
  onToggle,
  busy,
}: {
  active: boolean;
  onToggle: () => void;
  busy?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={active ? "حذف از علاقه‌مندی" : "افزودن به علاقه‌مندی"}
      aria-pressed={active}
      disabled={busy}
      onClick={onToggle}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-atlas-surface-muted disabled:opacity-50"
    >
      <Heart
        size={22}
        color={active ? "#D4022F" : "#A1A1AA"}
        variant={active ? "Bold" : "Linear"}
      />
    </button>
  );
}
