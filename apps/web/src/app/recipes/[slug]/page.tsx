"use client";

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
import { BottomBar } from "@/components/ui/BottomBar";
import { Button } from "@/components/ui/Button";
import { LoadingBlock, StateView } from "@/components/ui/StateView";
import { SoftTag, TagRow } from "@/components/ui/SoftTag";
import { RecipeImage } from "@/components/recipe/RecipeImage";
import { atlasClient } from "@/lib/client";
import { Heart, HeartAdd, Profile2User, Timer1 } from "iconsax-react";

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
        if (!cancelled) setError("بارگذاری دستور ناموفق بود.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [params.slug]);

  return (
    <AppShell hideNav showBack title="دستور">
      <div className="space-y-4">
        {loading ? <LoadingBlock /> : null}
        {error && !recipe ? (
          <StateView tone="danger" title="خطا" description={error} />
        ) : null}

        {recipe ? (
          <>
            <RecipeImage
              src={recipe.imageUrl}
              alt={recipe.title}
              className="h-52 w-full rounded-atlas-xl"
              priority
            />

            <div className="space-y-3">
              <TagRow>
                <SoftTag label={mealLabelFa[recipe.meal]} tone="red" />
                <SoftTag label={recipe.cuisine} tone="amber" />
                <SoftTag label={difficultyLabelFa[recipe.difficulty]} tone="gray" />
                {recipe.budgetFriendly ? (
                  <SoftTag label="اقتصادی" tone="green" />
                ) : null}
              </TagRow>
              <h1 className="text-h1 text-atlas-ink">{recipe.title}</h1>
              <p className="text-body text-atlas-ink-muted">
                {recipe.description}
              </p>
              <TagRow>
                <SoftTag
                  label={formatMinutesFa(recipe.totalMinutes)}
                  tone="soft"
                  icon={<Timer1 size={14} color="currentColor" />}
                />
                <SoftTag
                  label={`${toPersianDigits(recipe.servings)} نفر`}
                  tone="soft"
                  icon={<Profile2User size={14} color="currentColor" />}
                />
              </TagRow>
            </div>

            <section className="atlas-surface mb-28 p-4">
              <h2 className="text-h3 text-atlas-ink">مواد لازم</h2>
              <ul className="mt-3 space-y-2">
                {recipe.ingredients.map((ing) => (
                  <li
                    key={`${ing.ingredientId}-${ing.name}`}
                    className="flex items-center justify-between border-b border-atlas-border py-2 text-body last:border-none"
                  >
                    <span>
                      {ing.name}
                      {ing.optional ? " (اختیاری)" : ""}
                    </span>
                    <span className="text-caption text-atlas-ink-faint">
                      {[ing.quantity, ing.unit].filter(Boolean).join(" ")}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <BottomBar>
              <Button
                size="lg"
                className="w-full"
                disabled={starting}
                icon={<Timer1 size={20} color="currentColor" />}
                onClick={async () => {
                  setStarting(true);
                  try {
                    const session = await atlasClient.startCookingSession(
                      recipe.id,
                    );
                    router.push(`/cook/${session.id}`);
                  } catch {
                    setError("شروع پخت ممکن نشد.");
                    setStarting(false);
                  }
                }}
              >
                {starting ? "در حال شروع…" : "بزن بریم برای پخت"}
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                icon={
                  favorited ? (
                    <Heart size={18} color="currentColor" variant="Bold" />
                  ) : (
                    <HeartAdd size={18} color="currentColor" />
                  )
                }
                onClick={async () => {
                  setFavorited(await atlasClient.toggleFavorite(recipe.id));
                }}
              >
                {favorited ? "حذف از علاقه‌مندی" : "ذخیره در علاقه‌مندی"}
              </Button>
            </BottomBar>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
