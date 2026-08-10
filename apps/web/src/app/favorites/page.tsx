"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FavoriteItem } from "@atlas/contracts";
import { difficultyLabelFa, formatMinutesFa } from "@atlas/shared";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { LoadingBlock, StateView } from "@/components/ui/StateView";
import { atlasClient } from "@/lib/client";

export default function FavoritesPage() {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await atlasClient.getFavorites());
    } catch {
      setError("بارگذاری علاقه‌مندی‌ها ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <AppShell>
      <div className="atlas-container space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-atlas-ink">علاقه‌مندی‌ها</h1>
          <p className="mt-2 text-sm text-atlas-ink-muted">
            دستورهایی که برای پخت بعدی ذخیره کرده‌اید.
          </p>
        </div>

        {loading ? <LoadingBlock /> : null}
        {error ? (
          <StateView
            tone="danger"
            title="خطا"
            description={error}
            actionLabel="تلاش دوباره"
            onAction={() => void load()}
          />
        ) : null}
        {!loading && !error && items.length === 0 ? (
          <StateView
            title="هنوز چیزی ذخیره نشده"
            description="از صفحه دستور، دکمه ذخیره را بزنید."
            actionLabel="رفتن به پیشنهادها"
            onAction={() => {
              window.location.href = "/recommendations";
            }}
          />
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article key={item.recipeId} className="atlas-surface overflow-hidden">
              <div
                className="h-36 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${item.imageUrl})`,
                  backgroundColor: "#d9e5df",
                }}
              />
              <div className="space-y-3 p-4">
                <h2 className="font-semibold text-atlas-ink">{item.title}</h2>
                <p className="text-xs text-atlas-ink-faint">
                  {formatMinutesFa(item.totalMinutes)} ·{" "}
                  {difficultyLabelFa[item.difficulty]}
                </p>
                <div className="flex gap-2">
                  <Link href={`/recipes/${item.slug}`}>
                    <Button size="sm">مشاهده</Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
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
      </div>
    </AppShell>
  );
}
