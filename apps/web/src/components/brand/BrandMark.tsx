"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  imageAlreadyLoaded,
  rememberLoadedImage,
} from "@/lib/image-cache";

const CHEF_SRC = "/avatars/chef-cute-3d.png";

/** Cute 3D chef avatar for app bar / profile entry */
export function BrandMark({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(() => imageAlreadyLoaded(CHEF_SRC));

  function markReady() {
    rememberLoadedImage(CHEF_SRC);
    setLoaded(true);
  }

  return (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      {!loaded ? (
        <span
          aria-hidden
          className="absolute inset-0 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/20 before:absolute before:inset-0 before:-translate-x-full before:animate-[skeletonShine_1.4s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent"
        />
      ) : null}
      <Image
        src={CHEF_SRC}
        alt="سرآشپز هوشمند"
        width={size}
        height={size}
        className={`h-full w-full rounded-full object-cover object-top ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        priority
        unoptimized
        onLoad={markReady}
        onError={markReady}
      />
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
