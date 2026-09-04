"use client";

import { useEffect, useState } from "react";
import { Add, Clock, Heart, People, Timer1, Trash } from "iconsax-react";
import type { Recipe } from "@atlas/contracts";
import { formatMinutesFa, toPersianDigits } from "@atlas/shared";
import { AppShell } from "@/components/layout/AppShell";
import { Chip } from "@/components/ui/Chip";
import { SearchResultsSkeleton } from "@/components/ui/Skeleton";
import { SoftTag } from "@/components/ui/SoftTag";
import { RecipeImage } from "@/components/recipe/RecipeImage";
import { AuthLink } from "@/components/auth/AuthLink";
import { atlasClient } from "@/lib/client";

const popularTags = [
  "قرمه",
  "زرشک پلو",
  "کوکو",
  "آش",
  "خورش",
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>(["املت", "عدسی", "مرغ"]);
  const [results, setResults] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(() => {
      void atlasClient
        .searchRecipes(q, 40)
        .then((rows) => {
          if (!cancelled) setResults(rows as Recipe[]);
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  function submit(term: string) {
    const next = term.trim();
    if (!next) return;
    setQuery(next);
    setRecent((prev) => [next, ...prev.filter((x) => x !== next)].slice(0, 6));
  }

  function clearQuery() {
    setQuery("");
    setResults([]);
  }

  function clearRecent() {
    setRecent([]);
  }

  return (
    <AppShell title="جستجو">
      <div className="space-y-5">
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit(query);
            }}
            placeholder="جستجوی غذا"
            className={`h-11 w-full rounded-atlas border border-atlas-border bg-atlas-surface py-2 pr-4 text-body outline-none focus:border-atlas-primary ${
              query ? "pl-11" : "pl-4"
            }`}
          />
          {query ? (
            <button
              type="button"
              aria-label="پاک کردن متن"
              onClick={clearQuery}
              className="absolute left-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-atlas-ink-muted hover:bg-atlas-surface-muted hover:text-atlas-ink"
            >
              <Add
                size={18}
                color="currentColor"
                className="rotate-45"
              />
            </button>
          ) : null}
        </div>

        {!query ? (
          <>
            {recent.length > 0 ? (
              <section className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h2
                    className="flex items-center gap-2 text-[14px] font-medium text-atlas-ink"
                    style={{ opacity: 0.6 }}
                  >
                    <Clock size={16} color="currentColor" variant="Bold" />
                    جستجوهای اخیر
                  </h2>
                  <button
                    type="button"
                    aria-label="پاک کردن تاریخچه جستجو"
                    onClick={clearRecent}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-atlas-ink-faint transition hover:bg-atlas-surface-muted hover:text-atlas-danger"
                  >
                    <Trash size={18} color="currentColor" variant="Bold" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recent.map((term) => (
                    <Chip key={term} label={term} onClick={() => submit(term)} />
                  ))}
                </div>
              </section>
            ) : null}
            <section className="space-y-3">
              <h2
                className="flex items-center gap-2 text-[14px] font-medium text-atlas-ink"
                style={{ opacity: 0.6 }}
              >
                <Heart size={16} color="currentColor" variant="Bold" />
                جستجوهای محبوب
              </h2>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Chip key={tag} label={tag} onClick={() => submit(tag)} />
                ))}
              </div>
            </section>
          </>
        ) : (
          <section className="space-y-3">
            {loading ? (
              <SearchResultsSkeleton />
            ) : results.length === 0 ? (
              <p className="text-body text-atlas-ink-muted">نتیجه‌ای پیدا نشد.</p>
            ) : (
              results.map((recipe) => (
                <AuthLink
                  key={recipe.id}
                  href={`/recipes/${recipe.slug}`}
                  className="block w-full text-right"
                >
                  <div
                    className="flex w-full items-center gap-3 overflow-hidden rounded-atlas-lg p-2 shadow-[0_12px_32px_rgba(20,40,80,0.09),0_3px_10px_rgba(20,40,80,0.05)] dark:shadow-[0_14px_32px_rgba(8,16,40,0.32)]"
                    style={{ backgroundColor: "var(--atlas-surface)" }}
                  >
                  <RecipeImage
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="h-20 w-20 shrink-0 rounded-atlas"
                    width={160}
                  />
                  <div className="min-w-0 flex-1 py-0.5 pl-1">
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <p className="line-clamp-2 min-w-0 flex-1 text-[13px] font-semibold leading-5 text-atlas-ink">
                        {recipe.title}
                      </p>
                      <span className="mt-0.5 shrink-0 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700 ring-1 ring-inset ring-sky-200/80 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-400/25">
                        {recipe.cuisine}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <SoftTag
                        tone="white"
                        size="sm"
                        iconEnd
                        icon={<Timer1 size={11} color="currentColor" />}
                        label={formatMinutesFa(recipe.totalMinutes)}
                      />
                      <SoftTag
                        tone="white"
                        size="sm"
                        iconEnd
                        icon={<People size={11} color="currentColor" />}
                        label={`${toPersianDigits(recipe.servings)} نفر`}
                      />
                    </div>
                  </div>
                  </div>
                </AuthLink>
              ))
            )}
          </section>
        )}
      </div>
    </AppShell>
  );
}
