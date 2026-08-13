"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Trash } from "iconsax-react";
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

  function removeRecent(term: string) {
    setRecent((prev) => prev.filter((x) => x !== term));
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
                <div className="flex flex-wrap gap-2">
                  {recent.map((term) => (
                    <span
                      key={term}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200/90 bg-zinc-50 px-2.5 py-1.5 text-caption text-atlas-ink dark:border-atlas-border dark:bg-atlas-surface-muted/40"
                    >
                      <button
                        type="button"
                        onClick={() => submit(term)}
                        className="hover:opacity-80"
                      >
                        {term}
                      </button>
                      <button
                        type="button"
                        aria-label={`حذف ${term}`}
                        onClick={() => removeRecent(term)}
                        className="inline-flex text-atlas-ink-faint transition hover:text-atlas-danger"
                      >
                        <Trash size={14} color="currentColor" variant="Linear" />
                      </button>
                    </span>
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
