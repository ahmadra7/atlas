"use client";

import { useEffect, useState } from "react";
import type { UserProfile } from "@atlas/contracts";
import { toPersianDigits } from "@atlas/shared";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingBlock, StateView } from "@/components/ui/StateView";
import { atlasClient } from "@/lib/client";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await atlasClient.getProfile();
        if (!cancelled) setProfile(data);
      } catch {
        if (!cancelled) setError("پروفایل بارگذاری نشد.");
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
          <h1 className="text-2xl font-bold text-atlas-ink">پروفایل</h1>
          <p className="mt-2 text-sm text-atlas-ink-muted">
            پروفایل سبک MVP؛ ترجیحات غذایی و زمان پیش‌فرض.
          </p>
        </div>

        {loading ? <LoadingBlock /> : null}
        {error ? (
          <StateView tone="danger" title="خطا" description={error} />
        ) : null}

        {profile ? (
          <section className="atlas-surface space-y-4 p-5">
            <div>
              <p className="text-xs text-atlas-ink-faint">نام نمایشی</p>
              <p className="text-lg font-semibold text-atlas-ink">
                {profile.displayName}
              </p>
            </div>
            <div>
              <p className="text-xs text-atlas-ink-faint">زبان</p>
              <p className="text-sm text-atlas-ink">فارسی (fa)</p>
            </div>
            <div>
              <p className="text-xs text-atlas-ink-faint">حداکثر زمان پیش‌فرض</p>
              <p className="text-sm text-atlas-ink">
                {profile.defaultMaxMinutes
                  ? `${toPersianDigits(profile.defaultMaxMinutes)} دقیقه`
                  : "تعیین نشده"}
              </p>
            </div>
            <div>
              <p className="text-xs text-atlas-ink-faint">ترجیحات غذایی</p>
              <p className="text-sm text-atlas-ink-muted">
                {profile.dietaryPreferences.length
                  ? profile.dietaryPreferences.join("، ")
                  : "هنوز ترجیحی ثبت نشده (P1)"}
              </p>
            </div>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
