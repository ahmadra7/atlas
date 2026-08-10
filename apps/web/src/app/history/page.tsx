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
    void (async () => {
      try {
        setItems(await atlasClient.getHistory());
      } catch {
        setError("بارگذاری تاریخچه ناموفق بود.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AppShell title="تاریخچه پخت">
      <div className="space-y-3">
        {loading ? <LoadingBlock /> : null}
        {error ? <StateView tone="danger" title="خطا" description={error} /> : null}
        {!loading && !error && items.length === 0 ? (
          <StateView
            tone="empty"
            title="تاریخچه‌ای نیست"
            description="با شروع اولین پخت اینجا ثبت می‌شود."
          />
        ) : null}
        {items.map((item) => (
          <Link
            key={item.sessionId}
            href={`/recipes/${item.slug}`}
            className="atlas-surface block p-4"
          >
            <h2 className="text-h3 text-atlas-ink">{item.title}</h2>
            <p className="mt-1 text-caption text-atlas-ink-muted">
              {statusFa[item.status]} ·{" "}
              {toPersianDigits(
                new Date(item.startedAt).toLocaleDateString("fa-IR"),
              )}
            </p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
