"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import type { HistoryItem, UserProfile } from "@atlas/contracts";
import { toPersianDigits } from "@atlas/shared";
import {
  ArrowLeft2,
  Clock,
  Edit2,
  Global,
  Heart,
  InfoCircle,
  Logout,
  MessageQuestion,
  Moon,
  Notification,
  Setting2,
  ShieldTick,
  Sun1,
  UserEdit,
} from "iconsax-react";
import { AppShell } from "@/components/layout/AppShell";
import { BrandMark } from "@/components/brand/BrandMark";
import { useTheme } from "@/components/theme/ThemeProvider";
import { IosSwitch } from "@/components/ui/IosSwitch";
import { ProfileSkeleton } from "@/components/ui/Skeleton";
import { atlasClient } from "@/lib/client";
import { pageCache } from "@/lib/page-cache";

const statusFa: Record<HistoryItem["status"], string> = {
  active: "در حال پخت",
  completed: "تمام‌شده",
  abandoned: "نیمه‌کاره",
  paused: "متوقف",
};

function MenuRow({
  href,
  icon,
  title,
  subtitle,
  onClick,
  danger,
  trailing,
}: {
  href?: string;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  danger?: boolean;
  trailing?: ReactNode;
}) {
  const content = (
    <>
      <span
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          danger
            ? "bg-atlas-danger-soft text-atlas-danger"
            : "bg-atlas-surface-muted text-atlas-ink"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-right">
        <span
          className={`block text-body font-semibold ${
            danger ? "text-atlas-danger" : "text-atlas-ink"
          }`}
        >
          {title}
        </span>
        {subtitle ? (
          <span className="mt-0.5 block text-[12px] font-normal text-atlas-ink-faint">
            {subtitle}
          </span>
        ) : null}
      </span>
      {trailing ?? (
        <ArrowLeft2
          size={16}
          color="currentColor"
          className="shrink-0 text-atlas-ink-faint"
        />
      )}
    </>
  );

  const className =
    "flex w-full items-center gap-3 px-4 py-3.5 text-right transition hover:bg-atlas-surface-muted/70";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  if (!onClick) {
    return <div className={className}>{content}</div>;
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

export default function ProfilePage() {
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(
    () => pageCache.profile,
  );
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [loading, setLoading] = useState(() => pageCache.profile === null);

  useEffect(() => {
    void (async () => {
      try {
        const [p, h, favs] = await Promise.all([
          atlasClient.getProfile(),
          atlasClient.getHistory(),
          atlasClient.getFavorites(),
        ]);
        pageCache.profile = p;
        pageCache.favorites = favs;
        setProfile(p);
        setHistory(h.slice(0, 4));
        setCompletedCount(h.filter((item) => item.status === "completed").length);
        setFavoritesCount(favs.length);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AppShell title="پروفایل">
      <div className="space-y-4 pb-8">
        {loading ? <ProfileSkeleton /> : null}

        {profile ? (
          <>
            <section className="overflow-hidden rounded-atlas-xl bg-atlas-primary px-4 pb-5 pt-5 text-white shadow-[0_14px_32px_rgba(212,2,47,0.28)]">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <BrandMark size={64} status />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-h3 text-white">
                    {profile.displayName}
                  </h2>
                  <p className="mt-1 text-[12px] font-normal text-white/80">مهمان</p>
                </div>
                <Link
                  href="/auth"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                  aria-label="ویرایش پروفایل"
                >
                  <UserEdit size={18} color="currentColor" />
                </Link>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {[
                  {
                    label: "پخت‌ها",
                    value: toPersianDigits(completedCount),
                  },
                  {
                    label: "علاقه‌مندی",
                    value: toPersianDigits(favoritesCount),
                  },
                  {
                    label: "زمان پیش‌فرض",
                    value: profile.defaultMaxMinutes
                      ? toPersianDigits(profile.defaultMaxMinutes)
                      : "—",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-atlas bg-white/12 px-2 py-2.5 text-center backdrop-blur-sm"
                  >
                    <p className="text-h3 font-bold text-white">{stat.value}</p>
                    <p className="mt-0.5 text-[11px] text-white/75">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="overflow-hidden rounded-atlas-xl border border-atlas-border bg-atlas-surface dark:border-white/15">
              <p className="px-4 pb-1 pt-3 text-caption font-semibold text-atlas-ink-faint">
                حساب کاربری
              </p>
              <MenuRow
                href="/auth"
                icon={<Edit2 size={18} color="currentColor" />}
                title="ویرایش پروفایل"
                subtitle="نام، عکس و اطلاعات شخصی"
              />
              <MenuRow
                href="/favorites"
                icon={<Heart size={18} color="currentColor" />}
                title="علاقه‌مندی‌ها"
                subtitle={`${toPersianDigits(favoritesCount)} مورد ذخیره شده`}
              />
              <MenuRow
                href="/history"
                icon={<Clock size={18} color="currentColor" />}
                title="تاریخچه پخت"
                subtitle="آخرین دستورهایی که پختی"
              />
            </section>

            <section className="overflow-hidden rounded-atlas-xl border border-atlas-border bg-atlas-surface dark:border-white/15">
              <p className="px-4 pb-1 pt-3 text-caption font-semibold text-atlas-ink-faint">
                تنظیمات
              </p>
              <MenuRow
                href="/home"
                icon={<Setting2 size={18} color="currentColor" />}
                title="ترجیحات آشپزی"
                subtitle={
                  profile.dietaryPreferences.length
                    ? profile.dietaryPreferences.join("، ")
                    : "رژیم، نوع غذا و زمان"
                }
              />
              <MenuRow
                icon={
                  theme === "dark" ? (
                    <Moon size={18} color="currentColor" />
                  ) : (
                    <Sun1 size={18} color="currentColor" />
                  )
                }
                title="ظاهر برنامه"
                subtitle={
                  theme === "dark" ? "تم تیره فعال است" : "تم روشن فعال است"
                }
                trailing={
                  <IosSwitch
                    checked={theme === "light"}
                    onChange={(on) => setTheme(on ? "light" : "dark")}
                    ariaLabel="تم روشن"
                  />
                }
              />
              <MenuRow
                icon={<Notification size={18} color="currentColor" />}
                title="اعلان‌ها"
                subtitle="یادآوری تایمر و پیشنهادها"
              />
              <MenuRow
                icon={<Global size={18} color="currentColor" />}
                title="زبان"
                subtitle="فارسی"
              />
              <MenuRow
                icon={<ShieldTick size={18} color="currentColor" />}
                title="حریم خصوصی و امنیت"
                subtitle="دسترسی‌ها و داده‌های شما"
              />
            </section>

            <section className="overflow-hidden rounded-atlas-xl border border-atlas-border bg-atlas-surface dark:border-white/15">
              <p className="px-4 pb-1 pt-3 text-caption font-semibold text-atlas-ink-faint">
                پشتیبانی
              </p>
              <MenuRow
                icon={<MessageQuestion size={18} color="currentColor" />}
                title="راهنما و سوالات متداول"
                subtitle="چطور از اپ استفاده کنم؟"
              />
              <MenuRow
                icon={<InfoCircle size={18} color="currentColor" />}
                title="درباره سرآشپز هوشمند"
                subtitle="نسخه ۱٫۰٫۰"
              />
              <MenuRow
                href="/auth"
                icon={<Logout size={18} color="currentColor" />}
                title="خروج از حساب"
                subtitle="ادامه به‌صورت مهمان"
                danger
              />
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-h3 text-atlas-ink">فعالیت اخیر</h3>
                <Link
                  href="/history"
                  className="text-caption font-medium text-atlas-primary"
                >
                  همه
                </Link>
              </div>
              {history.length === 0 ? (
                <div className="rounded-atlas-xl border border-dashed border-atlas-border px-4 py-6 text-center dark:border-white/15">
                  <p className="text-caption text-atlas-ink-muted">
                    هنوز پختی ثبت نشده. از خانه شروع کن!
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-atlas-xl border border-atlas-border bg-atlas-surface dark:border-white/15">
                  {history.map((item, idx) => (
                    <Link
                      key={item.sessionId}
                      href={`/recipes/${item.slug}`}
                      className={`flex items-center justify-between gap-3 px-4 py-3.5 transition hover:bg-atlas-surface-muted/70 ${
                        idx < history.length - 1
                          ? "border-b border-atlas-border dark:border-white/10"
                          : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-body font-semibold text-atlas-ink">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-[12px] font-normal text-atlas-ink-faint">
                          {statusFa[item.status]}
                        </p>
                      </div>
                      <ArrowLeft2
                        size={16}
                        color="currentColor"
                        className="shrink-0 text-atlas-ink-faint"
                      />
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
