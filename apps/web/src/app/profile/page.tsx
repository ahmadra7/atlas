"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { HistoryItem, UserProfile } from "@atlas/contracts";
import { toPersianDigits } from "@atlas/shared";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingBlock } from "@/components/ui/StateView";
import { atlasClient } from "@/lib/client";

const statusFa: Record<HistoryItem["status"], string> = {
  active: "در حال پخت",
  completed: "تمام‌شده",
  abandoned: "نیمه‌کاره",
  paused: "متوقف",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const [p, h] = await Promise.all([
          atlasClient.getProfile(),
          atlasClient.getHistory(),
        ]);
        setProfile(p);
        setHistory(h.slice(0, 5));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AppShell title="پروفایل">
      <div className="space-y-4">
        {loading ? <LoadingBlock /> : null}
        {profile ? (
          <section className="atlas-surface space-y-3 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-atlas-primary text-h3 text-white">
                {profile.displayName.slice(0, 1)}
              </div>
              <div>
                <h2 className="text-h3 text-atlas-ink">{profile.displayName}</h2>
                <p className="text-caption text-atlas-ink-muted">
                  مهمان · فارسی
                </p>
              </div>
            </div>
            <p className="text-body text-atlas-ink-muted">
              حداکثر زمان پیش‌فرض:{" "}
              {profile.defaultMaxMinutes
                ? `${toPersianDigits(profile.defaultMaxMinutes)} دقیقه`
                : "—"}
            </p>
          </section>
        ) : null}

        <section className="space-y-3">
          <h3 className="text-h3 text-atlas-ink">تاریخچه اخیر</h3>
          {history.length === 0 ? (
            <p className="text-caption text-atlas-ink-muted">هنوز تاریخی نیست.</p>
          ) : (
            history.map((item) => (
              <Link
                key={item.sessionId}
                href={`/recipes/${item.slug}`}
                className="atlas-surface block p-4"
              >
                <p className="text-body font-semibold text-atlas-ink">
                  {item.title}
                </p>
                <p className="text-caption text-atlas-ink-muted">
                  {statusFa[item.status]}
                </p>
              </Link>
            ))
          )}
          <Link href="/history" className="text-caption text-atlas-primary">
            مشاهده همه تاریخچه
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
