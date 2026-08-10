"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Chip } from "@/components/ui/Chip";
import { MOCK_RECIPES } from "@atlas/api-client";
import { normalizePersian } from "@atlas/shared";

const popularTags = [
  "شام سریع",
  "کم‌کالری",
  "گیاهی",
  "اقتصادی",
  "کمتر از ۳۰ دقیقه",
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>(["املت", "عدسی", "مرغ"]);

  const results = useMemo(() => {
    const q = normalizePersian(query);
    if (!q) return [];
    return MOCK_RECIPES.filter((r) =>
      normalizePersian(`${r.title} ${r.description} ${r.category}`).includes(q),
    );
  }, [query]);

  function submit(term: string) {
    const next = term.trim();
    if (!next) return;
    setQuery(next);
    setRecent((prev) => [next, ...prev.filter((x) => x !== next)].slice(0, 6));
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
          placeholder="جستجوی دستور یا تگ…"
          className="h-11 w-full rounded-atlas border border-atlas-border bg-atlas-surface px-4 text-body outline-none focus:border-atlas-primary"
        />

        {!query ? (
          <>
            <section className="space-y-3">
              <h2 className="text-h3 text-atlas-ink">جستجوهای اخیر</h2>
              <div className="flex flex-wrap gap-2">
                {recent.map((term) => (
                  <Chip key={term} label={term} onClick={() => submit(term)} />
                ))}
              </div>
            </section>
            <section className="space-y-3">
              <h2 className="text-h3 text-atlas-ink">تگ‌های محبوب</h2>
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
            {results.length === 0 ? (
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
