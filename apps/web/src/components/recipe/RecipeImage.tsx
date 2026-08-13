"use client";

const FALLBACK =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=480&q=40&fm=webp";

/** Direct CDN URLs — skip Next `/_next/image` proxy (slow over tunnel/WebView). */
export function optimizeImageSrc(
  src?: string | null,
  width = 480,
  quality = 40,
): string {
  if (!src) return FALLBACK;
  try {
    const url = new URL(src);
    if (url.hostname === "images.unsplash.com") {
      url.searchParams.set("auto", "format");
      url.searchParams.set("fit", "crop");
      url.searchParams.set("w", String(width));
      url.searchParams.set("q", String(quality));
      url.searchParams.set("fm", "webp");
      return url.toString();
    }
  } catch {
    /* keep original */
  }
  return src;
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
  const optimized = optimizeImageSrc(src, width, 40);

  return (
    <div className={`relative overflow-hidden bg-zinc-100 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={optimized}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "low"}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/5" />
    </div>
  );
}
