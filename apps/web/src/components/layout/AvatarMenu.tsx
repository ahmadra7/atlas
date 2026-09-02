"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Clock, Heart, Logout, Award, Moon, Profile, Sun1, User } from "iconsax-react";
import { toPersianDigits } from "@atlas/shared";
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
        className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center overflow-visible bg-transparent transition hover:scale-105 active:scale-95"
      >
        <ChefHatAvatar />
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

function ChefHatAvatar() {
  const size = 28;
  const dot = 8;
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <span className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[0.5rem] bg-white shadow-[0_3px_10px_rgba(17,17,17,0.14)] ring-1 ring-black/10 dark:ring-white/20">
        <svg viewBox="0 0 24 24" width={16} height={16} fill="#111111" aria-hidden>
          <path d="M12 3.1c-1.7 0-3.15.95-3.85 2.35A3.55 3.55 0 0 0 4.4 8.9c0 1.25.65 2.35 1.65 3v5.35c0 .45.4.8.9.8h10.1c.5 0 .9-.35.9-.8V11.9c1-.65 1.65-1.75 1.65-3 0-1.9-1.45-3.45-3.3-3.55C15.6 4.05 14 3.1 12 3.1Z" />
          <rect x="6.35" y="17.85" width="11.3" height="2.35" rx="1.05" />
        </svg>
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute z-10 rounded-full bg-emerald-500 ring-2 ring-white"
        style={{
          width: dot,
          height: dot,
          bottom: -dot * 0.28,
          right: -dot * 0.28,
        }}
      />
    </span>
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
