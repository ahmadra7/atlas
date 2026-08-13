"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import type {
  DietMode,
  Difficulty,
  DishType,
  MealType,
  RecommendationFilters,
  RecommendationResult,
} from "@atlas/contracts";
import { Edit2 } from "iconsax-react";
import { AppShell } from "@/components/layout/AppShell";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import { Button } from "@/components/ui/Button";
import { RecommendationsSkeleton } from "@/components/ui/Skeleton";
import { StateView } from "@/components/ui/StateView";
import { atlasClient } from "@/lib/client";

const meals: MealType[] = ["any", "breakfast", "lunch", "dinner", "snack"];
const dietModes: DietMode[] = ["any", "diet", "regular"];
const dishTypes: DishType[] = [
  "any",
  "main",
  "appetizer",
  "soup",
  "salad",
  "dessert",
  "sweet",
  "drink",
  "side",
  "fast",
];
const difficulties: Array<Difficulty | "any"> = ["any", "easy", "medium", "hard"];

function parseFilters(searchParams: URLSearchParams): RecommendationFilters {
  const mealParam = searchParams.get("meal") as MealType | null;
  const maxParam = Number(searchParams.get("maxMinutes") || 60);
  const dietModeParam = searchParams.get("dietMode") as DietMode | null;
  const dishTypeParam = searchParams.get("dishType") as DishType | null;
  const difficultyParam = searchParams.get("difficulty") as
    | Difficulty
    | "any"
    | null;
  const cuisineParam = searchParams.get("cuisine");
  const tagsParam = searchParams.get("tags");
  const budgetParam = searchParams.get("budgetFriendly");

  return {
    meal: mealParam && meals.includes(mealParam) ? mealParam : "any",
    maxMinutes: Number.isFinite(maxParam) && maxParam > 0 ? maxParam : 60,
    dietMode:
      dietModeParam && dietModes.includes(dietModeParam)
        ? dietModeParam
        : "any",
    dishType:
      dishTypeParam && dishTypes.includes(dishTypeParam)
        ? dishTypeParam
        : "any",
    difficulty:
      difficultyParam && difficulties.includes(difficultyParam)
        ? difficultyParam
        : "any",
    cuisine: cuisineParam || undefined,
    budgetFriendly: budgetParam === "1",
    dietaryTags: tagsParam
      ? tagsParam.split(",").map((t) => t.trim()).filter(Boolean)
      : undefined,
  };
}

function RecommendationsContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<RecommendationFilters>(() =>
    parseFilters(searchParams),
  );
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
    const next = parseFilters(searchParams);
    setFilters(next);
    void load(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const cards = [
    ...(result?.exact ?? []),
    ...(result?.near ?? []),
    ...(result?.discovery ?? []),
  ];

  return (
    <AppShell hideNav showBack backHref="/home" title="لیست غذاها">
      <div className="space-y-4">
        {loading ? (
          <RecommendationsSkeleton />
        ) : (
          <>
            <div className="flex justify-end">
              <Link href="/home">
                <Button
                  variant="tertiary"
                  size="sm"
                  icon={<Edit2 size={16} color="currentColor" />}
                >
                  ویرایش مواد
                </Button>
              </Link>
            </div>

            {error ? (
              <StateView
                tone="danger"
                title="خطا"
                description={error}
                actionLabel="تلاش دوباره"
                onAction={() => void load()}
              />
            ) : null}
            {cards.length === 0 ? (
              <StateView
                tone="empty"
                title="نتیجه‌ای پیدا نشد"
                description="مواد را بیشتر کنید یا فیلتر را بازتر بگیرید."
              />
            ) : null}

            <div className="space-y-3">
              {cards.map((card) => (
                <RecipeCard key={card.recipeId} card={card} />
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

export default function RecommendationsPage() {
  return (
    <Suspense
      fallback={
        <AppShell hideNav showBack backHref="/home" title="لیست غذاها">
          <RecommendationsSkeleton />
        </AppShell>
      }
    >
      <RecommendationsContent />
    </Suspense>
  );
}
