"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Clock, Trash } from "iconsax-react";
import type { Recipe } from "@atlas/contracts";
import { AppShell } from "@/components/layout/AppShell";
import { Chip } from "@/components/ui/Chip";
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

  function clearRecent() {
    setRecent([]);
  }

  return (
    <AppShell title="جستجو">
      <div className="space-y-5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit(query);
          }}
          placeholder="جستجوی غذا"
          className="h-11 w-full rounded-atlas border border-atlas-border bg-atlas-surface px-4 text-body outline-none focus:border-atlas-primary"
        />

        {!query ? (
          <>
            {recent.length > 0 ? (
              <section className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-[1.05rem] font-bold text-atlas-ink">
                    <Clock size={20} color="currentColor" variant="Bold" />
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
              <h2 className="text-[1.05rem] font-bold text-atlas-ink">
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
            <h2 className="text-h3 text-atlas-ink">نتایج</h2>
            {loading ? (
              <p className="text-body text-atlas-ink-muted">در حال جستجو…</p>
            ) : results.length === 0 ? (
              <p className="text-body text-atlas-ink-muted">نتیجه‌ای پیدا نشد.</p>
            ) : (
              results.map((recipe) => (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.slug}`}
                  className="atlas-surface block p-4"
                >
                  <p className="text-body font-semibold text-atlas-ink">
                    {recipe.title}
                  </p>
                  <p className="mt-1 text-caption text-atlas-ink-muted">
                    {recipe.category}
                    {recipe.totalMinutes ? ` · ${recipe.totalMinutes} دقیقه` : ""}
                  </p>
                </Link>
              ))
            )}
          </section>
        )}
      </div>
    </AppShell>
  );
}
