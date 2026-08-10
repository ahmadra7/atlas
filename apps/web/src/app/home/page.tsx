"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { InventoryItem, RecommendationCard } from "@atlas/contracts";
import { formatMinutesFa, toPersianDigits } from "@atlas/shared";
import {
  Add,
  ArrowLeft2,
  DocumentText,
  People,
  SearchNormal1,
  Timer1,
} from "iconsax-react";
import { IngredientsPanel } from "@/components/ingredients/IngredientsPanel";
import { AppShell } from "@/components/layout/AppShell";
import { RecipeImage } from "@/components/recipe/RecipeImage";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { SoftTag } from "@/components/ui/SoftTag";
import { atlasClient } from "@/lib/client";

export default function HomePage() {
  const router = useRouter();
  const [popular, setPopular] = useState<RecommendationCard[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetInventory, setSheetInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    void (async () => {
      const rec = await atlasClient.getRecommendations({
        meal: "any",
        maxMinutes: 60,
      });
      setPopular([...rec.exact, ...rec.near, ...rec.discovery].slice(0, 4));
    })();
  }, []);

  return (
    <AppShell title="خانه">
      <div className="space-y-5">
        <div>
          <p className="text-caption text-atlas-ink-muted">سلام احمد!</p>
          <h2 className="text-h2 text-atlas-ink">صبح بخیر 👋</h2>
        </div>

        <section className="relative z-10 mb-1 overflow-visible pb-2 pt-6">
          <div className="relative overflow-visible rounded-atlas-xl border border-zinc-200/80 bg-zinc-100 shadow-sm">
            <img
              src="/icons/hero-serve.png"
              alt=""
              width={140}
              height={140}
              className="pointer-events-none absolute -top-5 left-[-10px] z-20 h-[7.75rem] w-[7.75rem] object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.22)]"
            />
            <div className="relative space-y-2.5 px-4 pb-4 pt-4 text-atlas-ink">
              <div className="pl-[6.5rem]">
                <h3 className="text-h3 text-black">موادتان را اضافه کنید</h3>
                <p className="mt-1 text-caption leading-5 text-zinc-600">
                  با مواد موجود، پیشنهاد دقیق بگیرید و مرحله‌به‌مرحله بپزید.
                </p>
              </div>
              <button
                type="button"
                dir="ltr"
                onClick={() => setSheetOpen(true)}
                className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-atlas bg-atlas-primary text-body font-semibold text-white shadow-sm hover:bg-atlas-primary-hover"
              >
                <Add size={20} color="currentColor" />
                <span dir="rtl">افزودن مواد</span>
              </button>
            </div>
          </div>
        </section>

        <Link
          href="/search"
          className="flex h-11 items-center gap-2 rounded-atlas border border-atlas-border bg-atlas-surface px-4 text-body text-atlas-ink-faint"
        >
          <SearchNormal1 size={18} color="currentColor" />
          جستجوی دستور یا ماده…
        </Link>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-h3 text-atlas-ink">دستورهای محبوب</h3>
            <Link
              href="/recommendations"
              dir="ltr"
              className="inline-flex items-center gap-1 text-caption text-atlas-primary"
            >
              <ArrowLeft2 size={14} color="currentColor" />
              <span dir="rtl">همه</span>
            </Link>
          </div>
          <div className="space-y-3">
            {popular.map((card) => (
              <Link
                key={card.recipeId}
                href={`/recipes/${card.slug}`}
                className="atlas-surface flex items-center gap-3 overflow-hidden p-2"
              >
                <RecipeImage
                  src={card.imageUrl}
                  alt={card.title}
                  className="h-16 w-16 shrink-0 rounded-atlas"
                />
                <div className="min-w-0 flex-1 py-1 pl-1">
                  <div className="mb-1 flex flex-wrap gap-1">
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 ring-1 ring-inset ring-zinc-200/80">
                      {card.cuisine}
                    </span>
                  </div>
                  <p className="truncate text-body font-semibold text-atlas-ink">
                    {card.title}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <SoftTag
                      tone="soft"
                      icon={<Timer1 size={12} color="currentColor" />}
                      label={formatMinutesFa(card.totalMinutes)}
                    />
                    <SoftTag
                      tone="soft"
                      icon={<People size={12} color="currentColor" />}
                      label={`${toPersianDigits(card.servings)} نفر`}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <BottomSheet
        open={sheetOpen}
        title="افزودن مواد"
        onClose={() => setSheetOpen(false)}
        footer={
          <Button
            size="lg"
            className="w-full"
            disabled={sheetInventory.length === 0}
            icon={<DocumentText size={20} color="currentColor" />}
            onClick={() => {
              setSheetOpen(false);
              router.push("/recommendations");
            }}
          >
            دریافت دستورها
          </Button>
        }
      >
        <IngredientsPanel onInventoryChange={setSheetInventory} />
      </BottomSheet>
    </AppShell>
  );
}
