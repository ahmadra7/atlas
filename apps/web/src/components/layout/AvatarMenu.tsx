"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Clock, Heart, Logout, Award, Moon, Profile, Sun1, User } from "iconsax-react";
import { toPersianDigits } from "@atlas/shared";
import { BrandMark } from "@/components/brand/BrandMark";
import { instantPush } from "@/components/navigation/InstantNav";
import { useTheme } from "@/components/theme/ThemeProvider";
import { IosSwitch } from "@/components/ui/IosSwitch";
import { atlasClient } from "@/lib/client";
import { pageCache } from "@/lib/page-cache";
import { postToNative } from "@/lib/voiceBridgeClient";

function chefRankFa(completed: number): string {
  if (completed <= 0) return "آشپز تازه‌کار";
  if (completed < 5) return "آشپز خانگی";
  if (completed < 15) return "آشپز ماهر";
  if (completed < 30) return "سرآشپز";
  return "استاد آشپزی";
}

function exitApp() {
  if (postToNative({ type: "atlas-app/exit" })) return;
  window.location.assign("/");
}

export function AvatarMenu() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(
    () => pageCache.profile?.displayName ?? "احمد رضایی",
  );
  const [cooks, setCooks] = useState(0);
  const [favs, setFavs] = useState(() => pageCache.favorites?.length ?? 0);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void Promise.all([
      atlasClient.getProfile(),
      atlasClient.getHistory(),
      atlasClient.getFavorites(),
    ]).then(([profile, history, favorites]) => {
      if (cancelled) return;
      pageCache.profile = profile;
      pageCache.favorites = favorites;
      setName(profile.displayName);
      setCooks(history.filter((item) => item.status === "completed").length);
      setFavs(favorites.length);
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const rank = chefRankFa(cooks);

  function go(href: string) {
    setOpen(false);
    instantPush(router, href);
  }

  return (
    <div className="relative z-20 shrink-0">
      <button
        type="button"
        aria-label="منوی حساب"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-atlas-primary-soft shadow-[0_6px_16px_rgba(212,2,47,0.18)] ring-2 ring-white transition hover:scale-105 active:scale-95 dark:ring-atlas-surface"
      >
        <BrandMark size={44} className="h-11 w-11" />
        <span
          aria-hidden
          className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-atlas-surface"
        />
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="بستن منو"
            className="fixed inset-0 z-[120] cursor-default bg-transparent"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-label="حساب کاربری"
            className="absolute top-[calc(100%+10px)] start-0 z-[121] w-[min(17.5rem,calc(100vw-2rem))] overflow-hidden rounded-[1.75rem] border border-atlas-border/80 bg-atlas-surface p-2 shadow-[0_18px_40px_rgba(17,17,17,0.16)] dark:border-white/12 dark:shadow-[0_18px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center gap-3 rounded-[1.35rem] bg-atlas-surface-muted/70 px-3 py-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-atlas-primary-soft text-atlas-primary">
                <User size={22} color="currentColor" variant="Bold" />
              </span>
              <div className="min-w-0 flex-1 text-right">
                <p className="truncate text-[14px] font-bold text-atlas-ink">
                  {name}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-[12px] font-medium text-atlas-ink-muted">
                  <Award size={14} color="#D4022F" variant="Bold" />
                  {rank}
                </p>
                <p className="mt-0.5 text-[11px] font-normal text-atlas-ink-faint">
                  {toPersianDigits(cooks)} پخت · {toPersianDigits(favs)} علاقه‌مندی
                </p>
              </div>
            </div>

            <div className="mt-1 py-0.5">
              <MenuItem
                icon={<Profile size={18} color="currentColor" variant="Bold" />}
                label="رفتن به پروفایل"
                onClick={() => go("/profile")}
              />
              <MenuItem
                icon={<Heart size={18} color="currentColor" variant="Bold" />}
                label="علاقه‌مندی‌ها"
                onClick={() => go("/favorites")}
              />
              <MenuItem
                icon={<Clock size={18} color="currentColor" variant="Bold" />}
                label="تاریخچه پخت"
                onClick={() => go("/history")}
              />
              <div className="flex w-full items-center gap-2.5 rounded-2xl px-2.5 py-2.5 text-atlas-ink">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-atlas-surface-muted text-atlas-ink">
                  {theme === "dark" ? (
                    <Moon size={18} color="currentColor" variant="Bold" />
                  ) : (
                    <Sun1 size={18} color="currentColor" variant="Bold" />
                  )}
                </span>
                <span className="min-w-0 flex-1 text-right text-[13px] font-medium">
                  تغییر تم
                </span>
                <IosSwitch
                  checked={theme === "light"}
                  onChange={(on) => setTheme(on ? "light" : "dark")}
                  ariaLabel="تم روشن"
                />
              </div>
              <MenuItem
                icon={<Logout size={18} color="currentColor" variant="Bold" />}
                label="خروج از برنامه"
                danger
                onClick={exitApp}
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-2xl px-2.5 py-2.5 text-right transition ${
        danger
          ? "text-atlas-danger hover:bg-atlas-danger-soft"
          : "text-atlas-ink hover:bg-atlas-surface-muted"
      }`}
    >
      <span
        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          danger
            ? "bg-atlas-danger-soft text-atlas-danger"
            : "bg-atlas-surface-muted text-atlas-ink"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-[13px] font-medium">{label}</span>
    </button>
  );
}
