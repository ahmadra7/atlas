"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FavoriteItem } from "@atlas/contracts";
import { difficultyLabelFa, formatMinutesFa } from "@atlas/shared";
import { AppShell } from "@/components/layout/AppShell";
import { RecipeImage } from "@/components/recipe/RecipeImage";
import { Button } from "@/components/ui/Button";
import { LoadingBlock, StateView } from "@/components/ui/StateView";
import { atlasClient } from "@/lib/client";

export default function FavoritesPage() {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setItems(await atlasClient.getFavorites());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <AppShell title="علاقه‌مندی‌ها">
      <div className="space-y-4">
        {loading ? <LoadingBlock /> : null}
        {!loading && items.length === 0 ? (
          <StateView
            tone="empty"
            title="هنوز چیزی ذخیره نشده"
            description="از صفحه دستور، ذخیره در علاقه‌مندی را بزنید."
            actionLabel="رفتن به خانه"
            onAction={() => {
              window.location.href = "/home";
            }}
          />
        ) : null}
        {items.map((item) => (
          <article
            key={item.recipeId}
            className="atlas-surface overflow-hidden"
          >
            <RecipeImage
              src={item.imageUrl}
              alt={item.title}
              className="h-36 w-full"
            />
            <div className="p-4">
              <h2 className="text-h3 text-atlas-ink">{item.title}</h2>
              <p className="mt-1 text-caption text-atlas-ink-muted">
                {formatMinutesFa(item.totalMinutes)} ·{" "}
                {difficultyLabelFa[item.difficulty]}
              </p>
              <div className="mt-3 flex gap-2">
                <Link href={`/recipes/${item.slug}`}>
                  <Button size="sm">مشاهده</Button>
                </Link>
                <Button
                  size="sm"
                  variant="tertiary"
                  onClick={async () => {
                    await atlasClient.toggleFavorite(item.recipeId);
                    await load();
                  }}
                >
                  حذف
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
