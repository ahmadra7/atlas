"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FavoriteItem } from "@atlas/contracts";
import { difficultyLabelFa, formatMinutesFa } from "@atlas/shared";
import { AppShell } from "@/components/layout/AppShell";
import { RecipeImage } from "@/components/recipe/RecipeImage";
import { Button } from "@/components/ui/Button";
import { FavoritesSkeleton } from "@/components/ui/Skeleton";
import { StateView } from "@/components/ui/StateView";
import { instantPush } from "@/components/navigation/InstantNav";
import { atlasClient } from "@/lib/client";
import { pageCache } from "@/lib/page-cache";

export default function FavoritesPage() {
  const router = useRouter();
  const [items, setItems] = useState<FavoriteItem[]>(
    () => pageCache.favorites ?? [],
  );
  const [loading, setLoading] = useState(() => pageCache.favorites === null);

  async function load(showSkeleton = pageCache.favorites === null) {
    if (showSkeleton) setLoading(true);
    try {
      const next = await atlasClient.getFavorites();
      pageCache.favorites = next;
      setItems(next);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(false);
  }, []);

  return (
    <AppShell title="علاقه‌مندی‌ها">
      <div className="space-y-4">
        {loading ? <FavoritesSkeleton /> : null}
        {!loading && items.length === 0 ? (
          <StateView
            tone="empty"
            title="هنوز چیزی ذخیره نشده"
            description="از صفحه دستور، روی قلب بالای صفحه بزنید."
            actionLabel="رفتن به خانه"
            onAction={() => instantPush(router, "/home")}
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
                <Link href={`/recipes/${item.slug}`} prefetch>
                  <Button size="sm">مشاهده</Button>
                </Link>
                <Button
                  size="sm"
                  variant="tertiary"
                  onClick={async () => {
                    await atlasClient.toggleFavorite(item.recipeId);
                    await load(false);
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
