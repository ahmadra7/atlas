"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type {
  MealType,
  RecommendationFilters,
  RecommendationResult,
} from "@atlas/contracts";
import { Edit2 } from "iconsax-react";
import { mealLabelFa } from "@atlas/shared";
import { AppShell } from "@/components/layout/AppShell";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { LoadingBlock, StateView } from "@/components/ui/StateView";
import { atlasClient } from "@/lib/client";

const meals: MealType[] = ["any", "breakfast", "lunch", "dinner", "snack"];

export default function RecommendationsPage() {
  const [filters, setFilters] = useState<RecommendationFilters>({
    meal: "any",
    maxMinutes: 60,
    difficulty: "any",
  });
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(next = filters) {
    setLoading(true);
    setError(null);
    try {
      setResult(await atlasClient.getRecommendations(next));
    } catch {
      setError("دریافت پیشنهادها ممکن نشد.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cards = [
    ...(result?.exact ?? []),
    ...(result?.near ?? []),
    ...(result?.discovery ?? []),
  ];

  return (
    <AppShell hideNav showBack backHref="/ingredients" title="پیشنهادها">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-body text-atlas-ink-muted">
            بهترین تطبیق‌ها برای مواد شما
          </p>
          <Link href="/ingredients">
            <Button
              variant="tertiary"
              size="sm"
              icon={<Edit2 size={16} color="currentColor" />}
            >
              ویرایش مواد
            </Button>
          </Link>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {meals.map((meal) => (
            <Chip
              key={meal}
              label={mealLabelFa[meal]}
              active={filters.meal === meal}
              onClick={() => setFilters((f) => ({ ...f, meal }))}
            />
          ))}
        </div>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => void load(filters)}
        >
          اعمال فیلتر
        </Button>

        {error ? (
          <StateView
            tone="danger"
            title="خطا"
            description={error}
            actionLabel="تلاش دوباره"
            onAction={() => void load()}
          />
        ) : null}
        {loading ? <LoadingBlock label="در حال پیدا کردن بهترین‌ها…" /> : null}
        {!loading && cards.length === 0 ? (
          <StateView
            tone="empty"
            title="نتیجه‌ای پیدا نشد"
            description="مواد را بیشتر کنید یا فیلتر را بازتر بگیرید."
          />
        ) : null}

        {!loading && (result?.exact.length ?? 0) === 0 && cards.length > 0 ? (
          <StateView
            tone="warning"
            title="تطبیق دقیق نیست"
            description="پیشنهادهای نزدیک را ببینید."
          />
        ) : null}

        <div className="space-y-3">
          {cards.map((card) => (
            <RecipeCard key={card.recipeId} card={card} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
