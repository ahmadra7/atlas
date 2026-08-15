"use client";

import { useState } from "react";

const PLACEHOLDER = "/images/recipe-placeholder.svg";

function isMissingOrPlaceholder(src?: string | null): boolean {
  if (!src) return true;
  const s = src.trim();
  if (!s) return true;
  return (
    s.includes("recipe-placeholder") ||
    s === "null" ||
    s === "undefined"
  );
}

/** Prefer local food icon when recipe has no photo. */
export function optimizeImageSrc(
  src?: string | null,
  _width = 480,
  _quality = 40,
): string {
  if (isMissingOrPlaceholder(src)) return PLACEHOLDER;
  return src!.trim();
}

export function RecipeImage({
  src,
  alt,
  className = "",
  priority = false,
  width = 480,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  width?: number;
}) {
  const [broken, setBroken] = useState(false);
  const optimized = broken
    ? PLACEHOLDER
    : optimizeImageSrc(src, width, 40);
  const isPlaceholder = isMissingOrPlaceholder(optimized) || broken;

  return (
    <div
      className={`relative overflow-hidden ${
        isPlaceholder ? "bg-[#EDE8E0]" : "bg-zinc-100"
      } ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={optimized}
        alt={isPlaceholder ? "" : alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "low"}
        onError={() => setBroken(true)}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {!isPlaceholder ? (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/5" />
      ) : null}
    </div>
  );
}
