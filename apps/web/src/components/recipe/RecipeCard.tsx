"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { RecommendationCard } from "@atlas/contracts";
import { formatMinutesFa, toPersianDigits } from "@atlas/shared";
import { SoftTag } from "@/components/ui/SoftTag";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { RecipeImage } from "./RecipeImage";
import { isAtlasMobileWebView } from "@/lib/navigate";
import { AuthLink } from "@/components/auth/AuthLink";
import { recipePath } from "@/lib/recipe-path";
import { ArrowDown2, ArrowLeft2, ArrowUp2, ShoppingCart, Timer1 } from "iconsax-react";

function shopSearchUrl(
  shop: "okala" | "snapp",
  ingredients: string[],
): string {
  const q = encodeURIComponent(ingredients.join(" "));
  if (shop === "okala") {
    return `https://www.okala.com/search?q=${q}`;
  }
  return `https://snapp.market/search?query=${q}`;
}

export function RecipeCard({ card }: { card: RecommendationCard }) {
  const [missingOpen, setMissingOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const hasMissing = card.missingCount > 0;
  const missing = card.missingIngredients;

  const shopLinks = useMemo(
    () => ({
      okala: shopSearchUrl("okala", missing),
      snapp: shopSearchUrl("snapp", missing),
    }),
    [missing],
  );

  const openShopInSameWindow = isAtlasMobileWebView();

  return (
    <article className="atlas-surface overflow-hidden transition">
      <AuthLink
        href={recipePath(card.slug)}
        className="block active:scale-[0.99]"
      >
        <RecipeImage
          src={card.imageUrl}
          alt={card.title}
          className="h-40 w-full"
          width={420}
        />
        <div className="flex items-start justify-between gap-3 p-4 pb-2">
          <h3 className="text-[0.95rem] font-bold leading-6 text-atlas-ink">
            {card.title}
          </h3>
          <SoftTag
            label={`${toPersianDigits(card.matchScore)}٪`}
            tone="black"
          />
        </div>
      </AuthLink>

      <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
        <SoftTag
          label={formatMinutesFa(card.totalMinutes)}
          tone="gray"
          icon={<Timer1 size={14} color="currentColor" />}
        />
        {hasMissing ? (
          <button
            type="button"
            onClick={() => setMissingOpen((v) => !v)}
            aria-expanded={missingOpen}
            className="inline-flex items-center gap-0.5"
          >
            <SoftTag
              label={`${toPersianDigits(card.missingCount)} ماده کم`}
              tone="danger"
            />
            <span className="inline-flex text-red-500 dark:text-red-300">
              {missingOpen ? (
                <ArrowUp2 size={14} color="currentColor" />
              ) : (
                <ArrowDown2 size={14} color="currentColor" />
              )}
            </span>
          </button>
        ) : null}
      </div>

      {hasMissing && missingOpen ? (
        <div className="space-y-3 border-t border-atlas-border/70 px-4 py-3">
          <ul className="space-y-1.5 rounded-atlas bg-red-50/70 px-3 py-2.5 dark:bg-red-500/10">
            {missing.map((name) => (
              <li
                key={name}
                className="text-caption leading-6 text-red-700 dark:text-red-300"
              >
                {name}
              </li>
            ))}
          </ul>
          <button
            type="button"
            dir="ltr"
            onClick={() => setShopOpen(true)}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-atlas bg-atlas-primary text-body font-bold text-white shadow-sm transition hover:bg-atlas-primary-hover active:scale-[0.99]"
          >
            <ShoppingCart size={18} color="currentColor" variant="Bold" />
            <span dir="rtl">برام تهیه کن</span>
          </button>
        </div>
      ) : null}

      <BottomSheet
        open={shopOpen}
        tall={false}
        title="تهیه مواد کم"
        onClose={() => setShopOpen(false)}
      >
        <div className="space-y-4 pb-2 pt-1">
          <p className="text-center text-caption leading-6 text-atlas-ink-muted">
            مواد کم این غذا را از یکی از فروشگاه‌ها سفارش بده:
          </p>
          <ul className="flex flex-wrap justify-center gap-1.5">
            {missing.map((name) => (
              <li key={name}>
                <SoftTag label={name} tone="danger" size="sm" />
              </li>
            ))}
          </ul>

          <div className="space-y-3 pt-1">
            <a
              href={shopLinks.okala}
              {...(openShopInSameWindow
                ? {}
                : { target: "_blank", rel: "noopener noreferrer" })}
              className="flex items-center gap-3 rounded-atlas-xl border border-atlas-border bg-white px-4 py-3.5 shadow-[0_8px_24px_rgba(17,17,17,0.06)] transition hover:border-[#E6123D]/40 hover:bg-red-50/40 active:scale-[0.99] dark:bg-atlas-surface"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl">
                <Image
                  src="/brands/okala-logo.png"
                  alt="اکالا"
                  width={48}
                  height={48}
                  className="h-12 w-12 object-cover"
                  unoptimized
                />
              </span>
              <span className="min-w-0 flex-1 text-right">
                <span className="block text-[15px] font-medium text-atlas-ink/70">
                  خرید از اکالا
                </span>
                <span className="mt-0.5 block text-[12px] font-light text-atlas-ink-muted/55">
                  سوپرمارکت آنلاین اُکالا
                </span>
              </span>
              <ArrowLeft2 size={18} color="#E6123D" />
            </a>

            <a
              href={shopLinks.snapp}
              {...(openShopInSameWindow
                ? {}
                : { target: "_blank", rel: "noopener noreferrer" })}
              className="flex items-center gap-3 rounded-atlas-xl border border-atlas-border bg-white px-4 py-3.5 shadow-[0_8px_24px_rgba(17,17,17,0.06)] transition hover:border-[#FF6B00]/40 hover:bg-orange-50/40 active:scale-[0.99] dark:bg-atlas-surface"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl">
                <Image
                  src="/brands/snapp-market-logo.png"
                  alt="اسنپ مارکت"
                  width={48}
                  height={48}
                  className="h-12 w-12 object-cover"
                  unoptimized
                />
              </span>
              <span className="min-w-0 flex-1 text-right">
                <span className="block text-[15px] font-medium text-atlas-ink/70">
                  خرید از اسنپ مارکت
                </span>
                <span className="mt-0.5 block text-[12px] font-light text-atlas-ink-muted/55">
                  سفارش سریع از سوپرمارکت‌های اطراف
                </span>
              </span>
              <ArrowLeft2 size={18} color="#FF6B00" />
            </a>
          </div>
        </div>
      </BottomSheet>
    </article>
  );
}
