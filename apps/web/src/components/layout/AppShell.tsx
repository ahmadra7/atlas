"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Heart, Home2, Profile, SearchNormal1 } from "iconsax-react";
import { BrandMark } from "@/components/brand/BrandMark";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { BackButton } from "@/components/ui/BackButton";

const tabs = [
  { href: "/home", label: "خانه", Icon: Home2 },
  { href: "/search", label: "جستجو", Icon: SearchNormal1 },
  { href: "/favorites", label: "علاقه", Icon: Heart },
  { href: "/profile", label: "پروفایل", Icon: Profile },
];

const hideNavPrefixes = [
  "/",
  "/onboarding",
  "/auth",
  "/cook",
  "/recipes",
  "/recommendations",
];

function shouldHideNav(pathname: string) {
  if (pathname === "/") return true;
  return hideNavPrefixes.some(
    (p) => p !== "/home" && p !== "/" && pathname.startsWith(p),
  );
}

export function AppShell({
  children,
  hideNav,
  title,
  showBack = false,
  backHref,
  headerAction,
  brandAside,
  showBrand = true,
  lockScroll = false,
}: {
  children: ReactNode;
  hideNav?: boolean;
  title?: string;
  showBack?: boolean;
  backHref?: string;
  headerAction?: ReactNode;
  /** Optional content shown beside the brand mark (or alone when brand is hidden). */
  brandAside?: ReactNode;
  /** When false, hides the app-bar brand avatar. */
  showBrand?: boolean;
  /** Keep shell to viewport height; only children manage internal scroll. */
  lockScroll?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const showNav = hideNav === undefined ? !shouldHideNav(pathname) : !hideNav;
  const showHeader = Boolean(
    title || showBack || headerAction || brandAside || showBrand,
  );
  const showThemeToggle = pathname === "/home";

  useEffect(() => {
    for (const tab of tabs) router.prefetch(tab.href);
  }, [router]);

  return (
    <div
      className={`atlas-phone relative flex flex-col ${
        lockScroll ? "h-dvh max-h-dvh overflow-hidden" : "min-h-screen"
      }`}
    >
      {showHeader ? (
        <header className="sticky top-0 z-30 shrink-0 border-b border-atlas-border/70 bg-atlas-surface/80 px-4 py-3 backdrop-blur-xl dark:border-white/15">
          <div className="relative flex min-h-11 items-center">
            <div className="z-10 flex max-w-[58%] items-center gap-2.5">
              {showBrand ? (
                <Link
                  href="/profile"
                  aria-label="پروفایل"
                  className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-atlas-primary-soft shadow-[0_6px_16px_rgba(255,55,55,0.18)] ring-2 ring-white transition hover:scale-105 active:scale-95 dark:ring-atlas-surface"
                >
                  <BrandMark size={44} className="h-11 w-11" />
                  <span
                    aria-hidden
                    className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-atlas-surface"
                  />
                </Link>
              ) : null}
              {brandAside}
            </div>

            {title ? (
              <h1 className="pointer-events-none absolute inset-x-0 text-center text-h3 font-bold text-atlas-ink">
                {title}
              </h1>
            ) : null}

            <div className="absolute left-0 z-10 flex items-center gap-1">
              {showThemeToggle ? <ThemeToggle /> : null}
              {headerAction}
              {showBack ? <BackButton href={backHref} /> : null}
            </div>
          </div>
        </header>
      ) : null}

      <main
        className={`flex min-h-0 flex-1 flex-col px-4 ${
          lockScroll
            ? "overflow-hidden pt-4"
            : showNav
              ? "pb-32 pt-4"
              : "pb-6 pt-4"
        }`}
      >
        {children}
      </main>

      {showNav ? (
        <nav className="pointer-events-none fixed bottom-5 left-1/2 z-40 w-[calc(100%-2rem)] max-w-[22.5rem] -translate-x-1/2">
          <div className="pointer-events-auto overflow-hidden rounded-full border border-white/80 bg-white/95 shadow-[0_12px_32px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.06)] backdrop-blur-[48px] dark:border-white/20 dark:bg-atlas-surface/90 dark:shadow-[0_12px_32px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,77,77,0.08)]">
            <ul className="grid grid-cols-4 items-stretch gap-1 bg-white/70 p-1.5 dark:bg-black/30">
              {tabs.map((tab) => {
                const active =
                  pathname === tab.href || pathname.startsWith(`${tab.href}/`);
                const Icon = tab.Icon;
                return (
                  <li key={tab.href} className="flex min-h-[3.4rem]">
                    <Link
                      href={tab.href}
                      prefetch
                      scroll={false}
                      className={`flex w-full flex-col items-center justify-center gap-1 rounded-full px-1 py-1.5 text-caption transition ${
                        active
                          ? "bg-transparent text-atlas-primary"
                          : "text-atlas-ink-faint hover:bg-atlas-surface-muted/70 hover:text-atlas-ink"
                      }`}
                    >
                      <Icon
                        size={20}
                        variant={active ? "Bold" : "Linear"}
                        color="currentColor"
                      />
                      {active ? (
                        <span className="text-caption font-medium leading-tight text-atlas-primary">
                          {tab.label}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
