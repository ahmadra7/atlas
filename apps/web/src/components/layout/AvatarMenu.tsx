"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Clock, Heart, Login, Logout, Award, Moon, Profile, Sun1 } from "iconsax-react";
import { toPersianDigits } from "@atlas/shared";
import { useAuth } from "@/components/auth/AuthProvider";
import { SignOutConfirmSheet } from "@/components/auth/SignOutConfirmSheet";
import { instantPush, lockInstantNav, unlockInstantNav } from "@/components/navigation/InstantNav";
import { useTheme } from "@/components/theme/ThemeProvider";
import { IosSwitch } from "@/components/ui/IosSwitch";
import { atlasClient } from "@/lib/client";
import { pageCache } from "@/lib/page-cache";

function chefRankFa(completed: number): string {
  if (completed <= 0) return "آشپز تازه‌کار";
  if (completed < 5) return "آشپز خانگی";
  if (completed < 15) return "آشپز ماهر";
  if (completed < 30) return "سرآشپز";
  return "استاد آشپزی";
}

export function AvatarMenu() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const name = isAuthenticated
    ? user?.displayName?.trim() || "کاربر"
    : "مهمان";
  const avatarUrl = isAuthenticated ? user?.avatarUrl ?? null : null;
  const [cooks, setCooks] = useState(0);
  const [favs, setFavs] = useState(() =>
    isAuthenticated ? (pageCache.favorites?.length ?? 0) : 0,
  );
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [portalReady, setPortalReady] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const [scrimLock, setScrimLock] = useState(false);

  useEffect(() => {
    if (!open || !isAuthenticated) return;
    let cancelled = false;
    void Promise.all([
      atlasClient.getProfile(),
      atlasClient.getHistory(),
      atlasClient.getFavorites(),
    ]).then(([profile, history, favorites]) => {
      if (cancelled) return;
      pageCache.profile = profile;
      pageCache.favorites = favorites;
      setCooks(history.filter((item) => item.status === "completed").length);
      setFavs(favorites.length);
    });
    return () => {
      cancelled = true;
    };
  }, [open, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) return;
    setCooks(0);
    setFavs(0);
  }, [isAuthenticated]);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function place() {
      const el = buttonRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setMenuPos({
        top: r.bottom + 10,
        right: window.innerWidth - r.right,
      });
    }
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  function dismiss() {
    setOpen(false);
    setScrimLock(true);
  }

  useEffect(() => {
    if (!scrimLock) return;
    const id = window.setTimeout(() => setScrimLock(false), 180);
    return () => window.clearTimeout(id);
  }, [scrimLock]);

  useEffect(() => {
    if (!open && !scrimLock) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    function isMenuNode(node: EventTarget | null) {
      return (
        node instanceof Node &&
        Boolean(
          dialogRef.current?.contains(node) ||
            buttonRef.current?.contains(node),
        )
      );
    }
    function blockOutside(e: Event) {
      if (open && isMenuNode(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (open && (e.type === "pointerdown" || e.type === "click")) {
        dismiss();
      }
    }
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", blockOutside, true);
    document.addEventListener("click", blockOutside, true);
    document.addEventListener("touchend", blockOutside, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", blockOutside, true);
      document.removeEventListener("click", blockOutside, true);
      document.removeEventListener("touchend", blockOutside, true);
    };
  }, [open, scrimLock]);

  useEffect(() => {
    if (!open && !scrimLock) return;
    lockInstantNav();
    return () => unlockInstantNav();
  }, [open, scrimLock]);

  const rank = chefRankFa(cooks);

  function go(href: string) {
    setOpen(false);
    instantPush(router, href);
  }

  return (
    <div className="relative z-20 shrink-0">
      <button
        ref={buttonRef}
        type="button"
        aria-label="منوی حساب"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center overflow-visible bg-transparent transition hover:scale-105 active:scale-95"
      >
        <UserAvatar src={avatarUrl} />
      </button>

      {(open || scrimLock) && portalReady
        ? createPortal(
            <>
              <button
                type="button"
                aria-label="بستن منو"
                className="fixed inset-0 z-[400] cursor-default"
                style={{ backgroundColor: "rgba(0,0,0,0.01)" }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (open) dismiss();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              />
              {open ? (
              <div
                ref={dialogRef}
                role="dialog"
                aria-label="حساب کاربری"
                style={{ top: menuPos.top, right: menuPos.right }}
                className="fixed z-[401] w-[min(17.5rem,calc(100vw-2rem))] overflow-hidden rounded-[1.75rem] border border-atlas-border/80 bg-atlas-surface p-2 shadow-[0_18px_40px_rgba(17,17,17,0.16)] dark:border-white/20 dark:shadow-[0_18px_40px_rgba(0,0,0,0.5)]"
              >
            <div className="flex items-start gap-3 px-3 pt-3">
              <UserAvatar src={avatarUrl} framed={false} status={false} size={68} />
              <div className="min-w-0 flex-1 text-right">
                <p className="truncate text-[14px] font-semibold text-atlas-ink">
                  {name}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-[12px] font-normal text-atlas-ink-muted">
                  <Award size={14} color="#F5C400" variant="Bold" />
                  {rank}
                </p>
                <p className="mt-1 flex items-center text-[11px] font-normal text-atlas-ink-faint">
                  <span>{toPersianDigits(cooks)} پخت</span>
                  <span
                    aria-hidden
                    className="mx-2.5 h-3 w-px bg-atlas-ink/15 dark:bg-white/20"
                  />
                  <span>{toPersianDigits(favs)} علاقه‌مندی</span>
                </p>
              </div>
            </div>

            <div
              aria-hidden
              className="mx-3 mt-2.5 h-px bg-atlas-ink/[0.07] dark:bg-white/10"
            />

            <div>
              {isAuthenticated ? (
                <MenuItem
                  icon={<Profile size={18} color="currentColor" variant="Bold" />}
                  label="پروفایل کاربری"
                  onClick={() => go("/profile")}
                />
              ) : (
                <div className="px-1 pb-1 pt-1.5">
                  <button
                    type="button"
                    onClick={() => go("/auth")}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-atlas-primary bg-transparent text-[13px] font-semibold text-atlas-primary transition hover:bg-atlas-primary-soft active:scale-[0.99]"
                  >
                    <Login size={18} color="currentColor" variant="Linear" />
                    ورود / ثبت‌نام
                  </button>
                </div>
              )}
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
              <div
                role="button"
                tabIndex={0}
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setTheme(theme === "light" ? "dark" : "light");
                  }
                }}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-2xl px-2.5 py-2.5 text-atlas-ink hover:bg-atlas-surface-muted"
              >
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-atlas-surface-muted text-atlas-ink-muted">
                  {theme === "dark" ? (
                    <Moon size={18} color="currentColor" variant="Bold" />
                  ) : (
                    <Sun1 size={18} color="currentColor" variant="Bold" />
                  )}
                </span>
                <span className="min-w-0 flex-1 text-right text-[13px] font-normal">
                  {theme === "light" ? "روز" : "شب"}
                </span>
                <IosSwitch
                  checked={theme === "light"}
                  onChange={(on) => setTheme(on ? "light" : "dark")}
                  ariaLabel="تم روشن"
                />
              </div>
              {isAuthenticated ? (
                <MenuItem
                  icon={<Logout size={18} color="currentColor" variant="Bold" />}
                  label="خروج از حساب"
                  danger
                  onClick={() => {
                    setOpen(false);
                    setSignOutOpen(true);
                  }}
                />
              ) : null}
            </div>
          </div>
              ) : null}
            </>,
            document.body,
          )
        : null}
      <SignOutConfirmSheet
        open={signOutOpen}
        onClose={() => setSignOutOpen(false)}
        onConfirm={() => {
          setSignOutOpen(false);
          signOut();
        }}
      />
    </div>
  );
}

export function UserAvatar({
  src,
  size = 34,
  framed = true,
  status = true,
}: {
  src?: string | null;
  size?: number;
  framed?: boolean;
  status?: boolean;
}) {
  if (!src) {
    return <ChefHatAvatar size={size} framed={framed} status={status} />;
  }

  const photo = (
    <img
      src={src}
      alt=""
      className={`h-full w-full object-cover ${
        framed ? "rounded-[0.6rem]" : "rounded-lg"
      }`}
    />
  );

  if (!framed) {
    return (
      <span
        className="inline-flex shrink-0 overflow-hidden rounded-lg"
        style={{ width: size, height: size }}
      >
        {photo}
      </span>
    );
  }

  const dot = Math.max(8, Math.round(size * 0.26));
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <span className="absolute inset-0 overflow-hidden rounded-[0.6rem] bg-white shadow-[0_3px_10px_rgba(17,17,17,0.14)] dark:bg-white/15 dark:shadow-none">
        {photo}
      </span>
      {status ? (
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
      ) : null}
    </span>
  );
}

function ChefHatAvatar({
  framed = true,
  status = true,
  size = 34,
}: {
  framed?: boolean;
  status?: boolean;
  size?: number;
}) {
  const hat = framed ? Math.round(size * (26 / 34)) : Math.round(size * (32 / 34));
  const dot = 9;
  const gradId = `chefToqueGrad-${useId().replace(/:/g, "")}`;
  const svg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 14 14"
      width={hat}
      height={hat}
      fill="none"
      aria-hidden
    >
      <path
        fill={`url(#${gradId})`}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.37586 1.42067C4.99551.700751 5.94587.25 6.99759.25c1.0522 0 2.00295.451158 2.62258 1.17165.27094-.06702.55513-.10258.84743-.10258 1.7705 0 3.2824 1.32421 3.2824 3.04814 0 1.29249-.6822 2.4486-1.9456 2.87508.0493.83957.0497 1.48812.0042 2.29022-1.5101-.03858-3.26921-.07304-4.80857-.07304-1.53936 0-3.29842.03446-4.80854.07304-.04547-.80209-.045-1.45065.00433-2.29015C.932339 6.81593.25 5.65978.25 4.36721c0-1.72393 1.5119-3.04814 3.28242-3.04814.29089 0 .5737.03521.84344.1016ZM2.2781 10.7807c.0253.3625.05297.7546.07998 1.0391.01323.1393.02634.2773.03912.4146.06731.7231.63433 1.3203 1.37844 1.3842 2.04068.1752 4.40808.1752 6.44876 0 .7441-.0639 1.3111-.6611 1.3784-1.3842.0128-.1373.0259-.2754.0392-.4147.027-.2844.0547-.6765.0799-1.039-1.493-.0379-3.21617-.0712-4.72187-.0712-1.50571 0-3.22885.0333-4.72193.0712Z"
      />
      <defs>
        <linearGradient
          id={gradId}
          x1="2.457"
          x2="13.36"
          y1="2.846"
          y2="8.887"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ffd600" />
          <stop offset="1" stopColor="#00d078" />
        </linearGradient>
      </defs>
    </svg>
  );

  if (!framed) {
    return <span className="inline-flex shrink-0 pt-0.5">{svg}</span>;
  }

  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <span className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[0.6rem] bg-white shadow-[0_3px_10px_rgba(17,17,17,0.14)] dark:bg-white/15 dark:shadow-none">
        {svg}
      </span>
      {status ? (
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
      ) : null}
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
            ? "bg-atlas-danger-soft text-atlas-danger/70"
            : "bg-atlas-surface-muted text-atlas-ink-muted"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-[13px] font-normal">{label}</span>
    </button>
  );
}
