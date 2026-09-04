"use client";

import { People, Timer1 } from "iconsax-react";
import { formatMinutesFa, toPersianDigits } from "@atlas/shared";
import { AuthLink } from "@/components/auth/AuthLink";
import { RecipeImage } from "@/components/recipe/RecipeImage";
import { SoftTag } from "@/components/ui/SoftTag";

export function PopularRecipeRow({
  href,
  title,
  imageUrl,
  cuisine,
  totalMinutes,
  servings,
}: {
  href: string;
  title: string;
  imageUrl: string;
  cuisine: string;
  totalMinutes: number;
  servings: number;
}) {
  return (
    <AuthLink href={href} className="block w-full text-right">
      <div
        className="flex w-full items-center gap-3 overflow-hidden rounded-atlas-lg p-2 shadow-[0_12px_32px_rgba(20,40,80,0.09),0_3px_10px_rgba(20,40,80,0.05)] dark:shadow-[0_14px_32px_rgba(8,16,40,0.32)]"
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
            <span className="mt-0.5 shrink-0 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700 ring-1 ring-inset ring-sky-200/80 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-400/25">
              {cuisine}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <SoftTag
              tone="white"
              size="sm"
              rounded="md"
              iconEnd
              icon={<Timer1 size={11} color="currentColor" />}
              label={formatMinutesFa(totalMinutes)}
            />
            <SoftTag
              tone="white"
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
