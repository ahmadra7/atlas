"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { HistoryItem } from "@atlas/contracts";
import { toPersianDigits } from "@atlas/shared";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingBlock, StateView } from "@/components/ui/StateView";
import { atlasClient } from "@/lib/client";

const statusFa: Record<HistoryItem["status"], string> = {
  active: "در حال پخت",
  completed: "تمام‌شده",
  abandoned: "نیمه‌کاره",
  paused: "متوقف",
};

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await atlasClient.getHistory();
        if (!cancelled) setItems(data);
      } catch {
        if (!cancelled) setError("بارگذاری تاریخچه ناموفق بود.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell>
      <div className="atlas-container space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-atlas-ink">تاریخچه پخت</h1>
          <p className="mt-2 text-sm text-atlas-ink-muted">
            نشست‌های کامل‌شده و رها‌شده برای پیگیری عادت آشپزی.
          </p>
        </div>

        {loading ? <LoadingBlock /> : null}
        {error ? (
          <StateView tone="danger" title="خطا" description={error} />
        ) : null}
        {!loading && !error && items.length === 0 ? (
          <StateView
            title="تاریخچه‌ای نیست"
            description="با شروع اولین پخت، اینجا ثبت می‌شود."
          />
        ) : null}

        <div className="space-y-3">
          {items.map((item) => (
            <article
              key={item.sessionId}
              className="atlas-surface flex flex-wrap items-center justify-between gap-4 p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-14 w-14 rounded-atlas bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${item.imageUrl})`,
                    backgroundColor: "#d9e5df",
                  }}
                />
                <div>
                  <h2 className="font-semibold text-atlas-ink">{item.title}</h2>
                  <p className="text-xs text-atlas-ink-faint">
                    {statusFa[item.status]} ·{" "}
                    {toPersianDigits(
                      new Date(item.startedAt).toLocaleDateString("fa-IR"),
                    )}
                  </p>
                </div>
              </div>
              <Link
                href={`/recipes/${item.slug}`}
                className="text-sm text-atlas-primary hover:underline"
              >
                مشاهده دستور
              </Link>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
