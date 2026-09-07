"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Recipe } from "@atlas/contracts";
import { formatMinutesFa, isPantryStaple, toPersianDigits } from "@atlas/shared";
import { AppShell } from "@/components/layout/AppShell";
import { BottomBar } from "@/components/ui/BottomBar";
import { Button } from "@/components/ui/Button";
import { FavoriteHeartButton } from "@/components/ui/FavoriteHeartButton";
import { RecipeSkeleton } from "@/components/ui/Skeleton";
import { StateView } from "@/components/ui/StateView";
import { SoftTag, TagRow } from "@/components/ui/SoftTag";
import { PotIcon } from "@/components/ui/PotIcon";
import { RecipeImage } from "@/components/recipe/RecipeImage";
import { RecipeTypeTag } from "@/components/recipe/PopularRecipeRow";
import { useAuth } from "@/components/auth/AuthProvider";
import { atlasClient } from "@/lib/client";
import { pageCache } from "@/lib/page-cache";
import { appNavigateSoftOrHard } from "@/lib/navigate";
import { Profile2User, Timer1 } from "iconsax-react";

export default function RecipeDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { isAuthenticated, requestLogin } = useAuth();
  const slugParam = params?.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  const cached = slug ? (pageCache.recipes[slug] ?? null) : null;
  const [recipe, setRecipe] = useState<Recipe | null>(() => cached);
  const [loading, setLoading] = useState(() => cached === null);
  const [error, setError] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    async function load() {
      const hit = pageCache.recipes[slug];
      if (!hit) setLoading(true);
      setError(null);
      try {
        const data = await atlasClient.getRecipeBySlug(slug);
        if (cancelled) return;
        if (data) pageCache.recipes[slug] = data;
        setRecipe(data);
        setLoading(false);
        if (!data) setError("دستور پیدا نشد.");
        void atlasClient.getFavorites().then((favorites) => {
          if (!cancelled && data) {
            setFavorited(favorites.some((f) => f.recipeId === data.id));
          }
        });
      } catch {
        if (!cancelled) {
          setError("بارگذاری دستور ناموفق بود.");
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <AppShell hideNav showBack title="دستور" lockScroll>
      {loading && !recipe ? <RecipeSkeleton /> : null}
      {error && !recipe && !loading ? (
        <StateView tone="danger" title="خطا" description={error} />
      ) : null}

      {recipe ? (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="shrink-0 space-y-3">
            <RecipeImage
              src={recipe.imageUrl}
              alt={recipe.title}
              className="h-40 w-full rounded-atlas-xl"
              priority
              width={480}
            />

            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-start gap-1">
                <h1 className="min-w-0 text-[18px] font-bold leading-7 text-atlas-ink">
                  {recipe.title}
                </h1>
                <RecipeTypeTag
                  category={recipe.category}
                  title={recipe.title}
                  className="mt-1"
                />
              </div>
              <FavoriteHeartButton
                active={favorited}
                busy={toggling}
                onToggle={async () => {
                  if (!isAuthenticated) {
                    requestLogin(`/recipes/${recipe.slug}`);
                    return;
                  }
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

          <section className="-mx-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[2rem] rounded-b-none border-0 bg-atlas-surface px-4 pt-4 shadow-atlas">
            <div className="flex shrink-0 items-center justify-center gap-2">
              <h2 className="text-[15px] font-bold text-atlas-ink">مواد لازم :</h2>
              <span className="inline-flex items-center rounded-xl bg-atlas-primary px-2.5 py-1 text-[11px] font-bold leading-none text-white">
                {toPersianDigits(recipe.ingredients.length)} مورد
              </span>
            </div>
            <div className="atlas-scroll-y mt-3 min-h-0 flex-1 pe-1 pb-[5.75rem]">
              <ul className="space-y-2">
                {recipe.ingredients.map((ing) => (
                  <li
                    key={`${ing.ingredientId}-${ing.name}`}
                    className="flex items-center justify-between gap-3 border-b border-atlas-border py-2 text-[13px] last:border-none"
                  >
                    <span className="min-w-0 font-medium">
                      {ing.name}
                      {ing.optional ? " (اختیاری)" : ""}
                    </span>
                    <span className="shrink-0 text-[12px] font-normal text-atlas-ink-muted">
                      {isPantryStaple(ing.name)
                        ? "به مقدار لازم"
                        : [ing.quantity, ing.unit].filter(Boolean).join(" ")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <BottomBar overlay>
            <Button
              size="lg"
              className="w-full text-[14px] font-medium"
              icon={<PotIcon size={20} color="currentColor" />}
              onClick={() => {
                if (!isAuthenticated) {
                  requestLogin(`/recipes/${recipe.slug}`);
                  return;
                }
                const href = `/cook/start?recipeId=${encodeURIComponent(recipe.id)}`;
                appNavigateSoftOrHard(href, (h) => router.push(h));
              }}
            >
              می‌پزم
            </Button>
          </BottomBar>
        </div>
      ) : null}
    </AppShell>
  );
}
