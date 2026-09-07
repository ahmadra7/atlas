"use client";

import { People, Timer1 } from "iconsax-react";
import { formatMinutesFa, toPersianDigits } from "@atlas/shared";
import { AuthLink } from "@/components/auth/AuthLink";
import { RecipeImage } from "@/components/recipe/RecipeImage";
import { SoftTag } from "@/components/ui/SoftTag";

function recipeTypeMeta(category: string | undefined, title: string) {
  const value = `${category ?? ""} ${title}`;
  if (/سالاد/.test(value)) {
    return {
      label: "سالاد",
      className:
        "bg-emerald-50 text-emerald-700 ring-emerald-200/70 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/25",
    };
  }
  if (/دسر|شیرینی|کیک|حلوا/.test(value)) {
    return {
      label: "دسر",
      className:
        "bg-violet-50 text-violet-700 ring-violet-200/70 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-400/25",
    };
  }
  if (/سوپ|آش/.test(value)) {
    return {
      label: "سوپ و آش",
      className:
        "bg-amber-50 text-amber-700 ring-amber-200/70 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/25",
    };
  }
  if (/پیش.?غذا/.test(value)) {
    return {
      label: "پیش‌غذا",
      className:
        "bg-sky-50 text-sky-700 ring-sky-200/70 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-400/25",
    };
  }
  if (/صبحانه|املت|نیمرو/.test(value)) {
    return {
      label: "صبحانه",
      className:
        "bg-orange-50 text-orange-700 ring-orange-200/70 dark:bg-orange-500/15 dark:text-orange-300 dark:ring-orange-400/25",
    };
  }
  if (/سریع|ساندویچ|پیتزا|پاستا|ماکارونی/.test(value)) {
    return {
      label: "غذای سریع",
      className:
        "bg-cyan-50 text-cyan-700 ring-cyan-200/70 dark:bg-cyan-500/15 dark:text-cyan-300 dark:ring-cyan-400/25",
    };
  }
  return {
    label: "غذای اصلی",
    className:
      "bg-rose-50 text-rose-700 ring-rose-200/70 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-400/25",
  };
}

export function RecipeTypeTag({
  category,
  title,
  className = "",
}: {
  category?: string;
  title: string;
  className?: string;
}) {
  const recipeType = recipeTypeMeta(category, title);
  return (
    <span
      className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium leading-4 ring-1 ring-inset ${recipeType.className} ${className}`}
    >
      {recipeType.label}
    </span>
  );
}

export function PopularRecipeRow({
  href,
  title,
  imageUrl,
  category,
  totalMinutes,
  servings,
}: {
  href: string;
  title: string;
  imageUrl: string;
  category?: string;
  totalMinutes: number;
  servings: number;
}) {
  return (
    <AuthLink href={href} className="block w-full text-right">
      <div
        className="flex w-full items-center gap-3 rounded-atlas-lg p-2 shadow-[0_12px_32px_rgba(20,40,80,0.09),0_3px_10px_rgba(20,40,80,0.05)] dark:shadow-[0_14px_32px_rgba(8,16,40,0.32)]"
        style={{ backgroundColor: "var(--atlas-surface)" }}
      >
        <RecipeImage
          src={imageUrl}
          alt={title}
          className="h-20 w-20 shrink-0 rounded-atlas"
          width={160}
        />
        <div className="min-w-0 flex-1 py-0.5 pl-1">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <p className="line-clamp-2 min-w-0 flex-1 text-[15px] font-semibold leading-5 text-atlas-ink">
              {title}
            </p>
            <RecipeTypeTag category={category} title={title} className="mt-0.5" />
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <SoftTag
              tone="mist"
              size="sm"
              rounded="md"
              iconEnd
              icon={<Timer1 size={11} color="currentColor" />}
              label={formatMinutesFa(totalMinutes)}
            />
            <SoftTag
              tone="mist"
              size="sm"
              rounded="md"
              iconEnd
              icon={<People size={11} color="currentColor" />}
              label={`${toPersianDigits(servings)} نفر`}
            />
          </div>
        </div>
      </div>
    </AuthLink>
  );
}
