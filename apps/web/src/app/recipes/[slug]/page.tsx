"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Recipe } from "@atlas/contracts";
import {
  difficultyLabelFa,
  formatMinutesFa,
  mealLabelFa,
  toPersianDigits,
} from "@atlas/shared";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { LoadingBlock, StateView } from "@/components/ui/StateView";
import { atlasClient } from "@/lib/client";

export default function RecipeDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await atlasClient.getRecipeBySlug(params.slug);
        if (!cancelled) {
          setRecipe(data);
          if (!data) setError("دستور پیدا نشد.");
        }
        const favorites = await atlasClient.getFavorites();
        if (!cancelled && data) {
          setFavorited(favorites.some((f) => f.recipeId === data.id));
        }
      } catch {
        if (!cancelled) setError("بارگذاری دستور با خطا مواجه شد.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [params.slug]);

  async function startCooking() {
    if (!recipe) return;
    setStarting(true);
    try {
      const session = await atlasClient.startCookingSession(recipe.id);
      router.push(`/cook/${session.id}`);
    } catch {
      setError("شروع پخت ممکن نشد.");
      setStarting(false);
    }
  }

  async function onToggleFavorite() {
    if (!recipe) return;
    const next = await atlasClient.toggleFavorite(recipe.id);
    setFavorited(next);
  }

  return (
    <AppShell>
      <div className="atlas-container space-y-6">
        {loading ? <LoadingBlock label="در حال بارگذاری دستور…" /> : null}
        {error && !recipe ? (
          <StateView
            tone="danger"
            title="خطا"
            description={error}
            actionLabel="بازگشت به پیشنهادها"
            onAction={() => router.push("/recommendations")}
          />
        ) : null}

        {recipe ? (
          <>
            <div className="overflow-hidden rounded-atlas-xl border border-atlas-border bg-atlas-surface shadow-atlas">
              <div
                className="h-56 bg-cover bg-center sm:h-72"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(28,36,33,0.05), rgba(28,36,33,0.45)), url(${recipe.imageUrl})`,
                  backgroundColor: "#d9e5df",
                }}
              />
              <div className="space-y-4 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-atlas-primary">
                      {mealLabelFa[recipe.meal]} · {recipe.cuisine}
                    </p>
                    <h1 className="mt-1 text-2xl font-bold text-atlas-ink sm:text-3xl">
                      {recipe.title}
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-atlas-ink-muted">
                      {recipe.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => void onToggleFavorite()}>
                      {favorited ? "حذف از علاقه‌مندی" : "ذخیره"}
                    </Button>
                    <Button onClick={() => void startCooking()} disabled={starting}>
                      {starting ? "در حال شروع…" : "شروع پخت"}
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-atlas-ink-muted">
                  <span>{formatMinutesFa(recipe.totalMinutes)}</span>
                  <span>•</span>
                  <span>{difficultyLabelFa[recipe.difficulty]}</span>
                  <span>•</span>
                  <span>{toPersianDigits(recipe.servings)} نفر</span>
                  {recipe.budgetFriendly ? (
                    <>
                      <span>•</span>
                      <span>اقتصادی</span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <section className="atlas-surface p-5">
                <h2 className="font-semibold text-atlas-ink">مواد لازم</h2>
                <ul className="mt-4 space-y-2 text-sm text-atlas-ink-muted">
                  {recipe.ingredients.map((ing) => (
                    <li
                      key={`${ing.ingredientId}-${ing.name}`}
                      className="flex items-center justify-between gap-3 border-b border-atlas-border/70 py-2 last:border-none"
                    >
                      <span>
                        {ing.name}
                        {ing.optional ? " (اختیاری)" : ""}
                      </span>
                      <span className="text-atlas-ink-faint">
                        {[ing.quantity, ing.unit].filter(Boolean).join(" ")}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
              <section className="atlas-surface p-5">
                <h2 className="font-semibold text-atlas-ink">مراحل</h2>
                <ol className="mt-4 space-y-3">
                  {recipe.steps.map((step) => (
                    <li key={step.id} className="text-sm leading-7 text-atlas-ink-muted">
                      <span className="font-medium text-atlas-ink">
                        مرحله {toPersianDigits(step.order)}:
                      </span>{" "}
                      {step.instruction}
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/recommendations">
                <Button variant="ghost">بازگشت به پیشنهادها</Button>
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
