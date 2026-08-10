"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft2 } from "iconsax-react";

export function BackButton({
  href,
  className = "",
}: {
  href?: string;
  className?: string;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label="بازگشت"
      onClick={() => {
        if (href) router.push(href);
        else router.back();
      }}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-atlas-ink transition hover:bg-atlas-surface-muted ${className}`}
    >
      <ArrowLeft2 size={22} color="#111111" variant="Linear" />
    </button>
  );
}
