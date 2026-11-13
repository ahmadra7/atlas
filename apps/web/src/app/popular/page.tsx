"use client";

import { useEffect, useMemo, useState } from "react";
import type { Recipe } from "@atlas/contracts";
import { normalizePersian, toPersianDigits } from "@atlas/shared";
import { SearchNormal1, Setting4 } from "iconsax-react";
import { AppShell } from "@/components/layout/AppShell";
import { PopularRecipeRow } from "@/components/recipe/PopularRecipeRow";
import {
  RecipeSettingsSheet,
  type RecipeFilterDraft,
} from "@/components/recipe/RecipeSettingsSheet";
import { SearchResultsSkeleton } from "@/components/ui/Skeleton";
import { atlasClient } from "@/lib/client";
import { recipePath } from "@/lib/recipe-path";

const DISH_LABELS: Record<string, string[]> = {
  main: ["غذای اصلی"],
  appetizer: ["پیش غذا", "پیش‌غذا"],
  soup: ["سوپ", "آش"],
  salad: ["سالاد"],
  dessert: ["دسر"],
  sweet: ["شیرینی", "کیک"],
  drink: ["نوشیدنی"],
  side: ["مخلفات", "چاشنی"],
  fast: ["ساندویچ", "پیتزا", "ماکارونی", "پاستا"],
};

const DIET_HINTS = ["رژیمی", "کم‌کالری", "گیاهی", "وگان", "بدون گلوتن"];

const emptyDraft: RecipeFilterDraft = {
  meal: "any",
  maxMinutes: 180,
  dietMode: "any",
  dishType: "any",
  difficulty: "any",
  cuisine: "any",
  budgetFriendly: false,
  preferences: [],
};

function matchesFilters(
  recipe: Recipe,
  query: string,
  filters: RecipeFilterDraft,
): boolean {
  const needle = normalizePersian(query);
  if (needle) {
    const hay = normalizePersian(
      `${recipe.title} ${recipe.description} ${recipe.category} ${recipe.cuisine}`,
    );
    if (!hay.includes(needle)) return false;
  }
  if (filters.meal !== "any" && recipe.meal !== filters.meal) return false;
  if (recipe.totalMinutes > filters.maxMinutes) return false;
  if (filters.difficulty !== "any" && recipe.difficulty !== filters.difficulty) {
    return false;
  }
  if (filters.cuisine !== "any" && !recipe.cuisine.includes(filters.cuisine)) {
    return false;
  }
  if (filters.budgetFriendly && !recipe.budgetFriendly) return false;
  if (filters.dishType !== "any") {
    const labels = DISH_LABELS[filters.dishType] ?? [];
    if (
      labels.length > 0 &&
      !labels.some((label) => recipe.category.includes(label))
    ) {
      return false;
    }
  }
  if (filters.dietMode !== "any") {
    const isDiet = recipe.dietaryTags.some((tag) =>
      DIET_HINTS.some((hint) => tag.includes(hint)),
    );
    if (filters.dietMode === "diet" ? !isDiet : isDiet) return false;
  }
  if (filters.preferences.length > 0) {
    const ok = filters.preferences.every((wanted) =>
      recipe.dietaryTags.some((tag) => tag.includes(wanted)),
    );
    if (!ok) return false;
  }
  return true;
}

export default function PopularRecipesPage() {
  const [query, setQuery] = useState("");
  const [all, setAll] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);
  const [filters, setFilters] = useState<RecipeFilterDraft>(emptyDraft);
  const [draft, setDraft] = useState<RecipeFilterDraft>(emptyDraft);

  useEffect(() => {
    let cancelled = false;
    void atlasClient
      .searchRecipes("", 80)
      .then((rows) => {
        if (!cancelled) setAll(rows);
      })
      .catch(() => {
        if (!cancelled) setAll([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(
    () => all.filter((recipe) => matchesFilters(recipe, query, filters)),
    [all, query, filters],
  );

  const advancedCount = useMemo(() => {
    let n = 0;
    if (filters.meal !== "any") n += 1;
    if (filters.maxMinutes !== 180) n += 1;
    if (filters.dietMode !== "any") n += 1;
    if (filters.dishType !== "any") n += 1;
    if (filters.difficulty !== "any") n += 1;
    if (filters.cuisine !== "any") n += 1;
    if (filters.budgetFriendly) n += 1;
    n += filters.preferences.length;
    return n;
  }, [filters]);

  return (
    <AppShell hideNav showBack backHref="/home" title="دستورهای محبوب" lockScroll>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 bg-atlas-background pb-3">
          <div className="flex items-start gap-2">
            <div className="relative min-w-0 flex-1">
              <span className="pointer-events-none absolute right-3 top-1/2 z-20 -translate-y-1/2 text-atlas-ink-faint">
                <SearchNormal1 size={18} color="currentColor" />
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="جستجوی غذا…"
                className="h-12 w-full rounded-atlas border border-atlas-border bg-atlas-surface py-2 pr-10 pl-3 text-body text-atlas-ink outline-none focus:border-atlas-primary"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setDraft(filters);
                setMoreOpen(true);
              }}
              aria-label="تنظیمات"
              style={
                advancedCount > 0
                  ? { backgroundColor: "rgba(212, 2, 47, 0.2)" }
                  : undefined
              }
              className={`relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-atlas border transition ${
                advancedCount > 0
                  ? "border-atlas-border text-atlas-ink-muted"
                  : "border-atlas-border bg-atlas-surface text-atlas-ink-muted hover:border-atlas-border-strong hover:bg-atlas-surface-muted hover:text-atlas-ink"
              }`}
            >
              <Setting4 size={22} color="currentColor" variant="Outline" />
              {advancedCount > 0 ? (
                <span className="absolute -left-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-atlas-primary px-0.5 text-[11px] font-medium leading-none text-white">
                  {toPersianDigits(advancedCount)}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        <div className="atlas-scroll-y min-h-0 flex-1 -mx-2 px-2">
          {loading ? (
            <div className="pb-8 pt-2">
              <SearchResultsSkeleton />
            </div>
          ) : visible.length === 0 ? (
            <p className="pt-8 text-center text-body text-atlas-ink-muted">
              غذایی با این مشخصات پیدا نشد.
            </p>
          ) : (
            <div className="space-y-3 pb-8 pt-2">
              {visible.map((recipe) => (
                <PopularRecipeRow
                  key={recipe.id}
                  href={recipePath(recipe.slug)}
                  title={recipe.title}
                  imageUrl={recipe.imageUrl}
                  category={recipe.category}
                  totalMinutes={recipe.totalMinutes}
                  servings={recipe.servings}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <RecipeSettingsSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        draft={draft}
        onChange={setDraft}
        onApply={() => {
          setFilters(draft);
          setMoreOpen(false);
        }}
        onReset={() => setDraft(emptyDraft)}
      />
    </AppShell>
  );
}
