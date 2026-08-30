"use client";

import { useEffect, useRef, useState } from "react";
import {
  imageAlreadyLoaded,
  rememberLoadedImage,
} from "@/lib/image-cache";

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
  const trimmed = src!.trim();
  if (trimmed.startsWith("/") || trimmed.startsWith("data:")) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:") return PLACEHOLDER;
    return `/api/img?u=${encodeURIComponent(trimmed)}`;
  } catch {
    return PLACEHOLDER;
  }
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
  const [shown, setShown] = useState(
    () => isPlaceholder || imageAlreadyLoaded(optimized),
  );
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) {
      rememberLoadedImage(optimized);
      setShown(true);
    }
  }, [optimized]);

  return (
    <div
      className={`relative overflow-hidden ${
        isPlaceholder ? "bg-[#EDE8E0]" : "bg-zinc-100"
      } ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={optimized}
        alt={isPlaceholder ? "" : alt}
        loading={
          shown || priority || imageAlreadyLoaded(optimized) ? "eager" : "lazy"
        }
        decoding="async"
        fetchPriority={priority || shown ? "high" : "low"}
        referrerPolicy="no-referrer"
        onLoad={() => {
          rememberLoadedImage(optimized);
          setShown(true);
        }}
        onError={() => {
          setBroken(true);
          setShown(true);
        }}
        className="absolute inset-0 h-full w-full object-cover opacity-100"
      />
      {!isPlaceholder ? (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/5" />
      ) : null}
    </div>
  );
}
