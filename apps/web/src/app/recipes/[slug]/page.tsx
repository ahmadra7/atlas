"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Recipe } from "@atlas/contracts";
import { formatMinutesFa, toPersianDigits } from "@atlas/shared";
import { AppShell } from "@/components/layout/AppShell";
import { BottomBar } from "@/components/ui/BottomBar";
import { Button } from "@/components/ui/Button";
import { FavoriteHeartButton } from "@/components/ui/FavoriteHeartButton";
import { RecipeSkeleton } from "@/components/ui/Skeleton";
import { StateView } from "@/components/ui/StateView";
import { SoftTag, TagRow } from "@/components/ui/SoftTag";
import { PotIcon } from "@/components/ui/PotIcon";
import { RecipeImage } from "@/components/recipe/RecipeImage";
import { atlasClient } from "@/lib/client";
import { appNavigateSoftOrHard } from "@/lib/navigate";
import { Profile2User, Timer1 } from "iconsax-react";

export default function RecipeDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [starting, setStarting] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const raw = params?.slug;
    const slug = Array.isArray(raw) ? raw[0] : raw;
    if (!slug) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await atlasClient.getRecipeBySlug(slug);
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
  }, [params?.slug]);

  return (
    <AppShell hideNav showBack title="دستور" lockScroll>
      {loading ? <RecipeSkeleton /> : null}
      {error && !recipe && !loading ? (
        <StateView tone="danger" title="خطا" description={error} />
      ) : null}

      {recipe && !loading ? (
        <div className="flex min-h-0 flex-1 flex-col gap-3 pb-[5.75rem]">
          <div className="shrink-0 space-y-3">
            <RecipeImage
              src={recipe.imageUrl}
              alt={recipe.title}
              className="h-40 w-full rounded-atlas-xl"
              priority
              width={480}
            />

            <div className="flex items-start gap-2">
              <h1 className="min-w-0 flex-1 text-h2 text-atlas-ink">
                {recipe.title}
              </h1>
              <FavoriteHeartButton
                active={favorited}
                busy={toggling}
                onToggle={async () => {
                  setToggling(true);
                  try {
                    setFavorited(await atlasClient.toggleFavorite(recipe.id));
                  } finally {
                    setToggling(false);
                  }
                }}
              />
            </div>

            <TagRow>
              <SoftTag
                label={formatMinutesFa(recipe.totalMinutes)}
                tone="soft"
                size="sm"
                iconEnd
                icon={<Timer1 size={12} color="currentColor" />}
              />
              <SoftTag
                label={`${toPersianDigits(recipe.servings)} نفر`}
                tone="soft"
                size="sm"
                iconEnd
                icon={<Profile2User size={12} color="currentColor" />}
              />
            </TagRow>
          </div>

          <section className="atlas-surface flex min-h-0 flex-1 flex-col overflow-hidden p-4">
            <div className="flex shrink-0 items-center justify-between gap-2">
              <h2 className="text-h3 text-atlas-ink">مواد لازم</h2>
              <span className="inline-flex items-center rounded-full bg-atlas-surface-muted px-2.5 py-1 text-caption font-medium text-atlas-ink-muted ring-1 ring-inset ring-atlas-border">
                {toPersianDigits(recipe.ingredients.length)} مورد
              </span>
            </div>
            <div className="atlas-scroll-y mt-3 min-h-0 flex-1 pe-1">
              <ul className="space-y-2">
                {recipe.ingredients.map((ing) => (
                  <li
                    key={`${ing.ingredientId}-${ing.name}`}
                    className="flex items-center justify-between gap-3 border-b border-atlas-border py-2.5 text-body last:border-none"
                  >
                    <span className="min-w-0 font-medium">
                      {ing.name}
                      {ing.optional ? " (اختیاری)" : ""}
                    </span>
                    <span className="shrink-0 text-caption text-atlas-ink-muted">
                      {[ing.quantity, ing.unit].filter(Boolean).join(" ")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <BottomBar>
            <Button
              size="lg"
              className="w-full"
              disabled={starting}
              icon={<PotIcon size={20} color="currentColor" />}
              onClick={() => {
                setStarting(true);
                appNavigateSoftOrHard(
                  `/cook/start?recipeId=${encodeURIComponent(recipe.id)}`,
                  (h) => router.push(h),
                );
              }}
            >
              {starting ? "در حال شروع…" : "بزن بریم برای پخت"}
            </Button>
          </BottomBar>
        </div>
      ) : null}
    </AppShell>
  );
}
