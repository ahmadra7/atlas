"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  imageAlreadyLoaded,
  rememberLoadedImage,
} from "@/lib/image-cache";

const CHEF_SRC = "/avatars/chef-app.png";

/** App chef avatar — photo only, no square frame */
export function BrandMark({
  size = 40,
  className = "",
  status = false,
}: {
  size?: number;
  className?: string;
  status?: boolean;
}) {
  const [loaded, setLoaded] = useState(() => imageAlreadyLoaded(CHEF_SRC));

  function markReady() {
    rememberLoadedImage(CHEF_SRC);
    setLoaded(true);
  }

  const photo = Math.round(size * 0.82);
  const inset = Math.round((size - photo) / 2);
  const dot = Math.max(8, Math.round(size * 0.22));

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {!loaded ? (
        <span
          aria-hidden
          className="absolute overflow-hidden rounded-md bg-zinc-200 before:absolute before:inset-0 before:-translate-x-full before:animate-[skeletonShine_1.4s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent dark:bg-white/20"
          style={{ width: photo, height: photo }}
        />
      ) : null}
      <Image
        src={CHEF_SRC}
        alt="سرآشپز هوشمند"
        width={photo}
        height={photo}
        className={`object-contain ${loaded ? "opacity-100" : "opacity-0"}`}
        style={{
          width: photo,
          height: photo,
          filter: "drop-shadow(0 6px 14px rgba(17,17,17,0.22))",
        }}
        priority
        unoptimized
        onLoad={markReady}
        onError={markReady}
      />
      {status ? (
        <span
          aria-hidden
          className="pointer-events-none absolute z-10 rounded-full bg-emerald-500 ring-2 ring-white"
          style={{
            width: dot,
            height: dot,
            bottom: inset - dot * 0.28,
            right: inset - dot * 0.28,
          }}
        />
      ) : null}
    </span>
  );
}

export function BrandLockup({
  href = "/home",
  subtitle,
}: {
  href?: string;
  subtitle?: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-2.5">
      <BrandMark size={44} />
      <div className="leading-tight">
        <p className="text-body font-bold text-atlas-ink">سرآشپز هوشمند</p>
        {subtitle ? (
          <p className="text-caption text-atlas-ink-muted">{subtitle}</p>
        ) : (
          <p className="text-caption text-atlas-ink-faint">با آنچه دارید بپزید</p>
        )}
      </div>
    </Link>
  );
}
