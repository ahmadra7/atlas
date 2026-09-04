"use client";

import { useRouter } from "next/navigation";
import { appNavigateSoftOrHard } from "@/lib/navigate";

export function BackArrowIcon({
  size = 22,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M19 12H5.5M11 18.5 4.5 12 11 5.5"
        stroke="currentColor"
        strokeWidth="2.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
        if (href) appNavigateSoftOrHard(href, (h) => router.push(h));
        else router.back();
      }}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-atlas-ink transition hover:bg-atlas-surface-muted ${className}`}
    >
      <BackArrowIcon size={22} />
    </button>
  );
}
