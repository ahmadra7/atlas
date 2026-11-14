"use client";

import Link from "next/link";
import { Heart, Home2, Profile, SearchNormal1 } from "iconsax-react";

export const navTabs = [
  { href: "/home", label: "خانه", Icon: Home2 },
  { href: "/search", label: "جستجو", Icon: SearchNormal1 },
  { href: "/favorites", label: "علاقه", Icon: Heart },
  { href: "/profile", label: "پروفایل", Icon: Profile },
] as const;

const hideNavPrefixes = [
  "/",
  "/onboarding",
  "/auth",
  "/cook",
  "/recipes",
  "/recommendations",
  "/popular",
  "/admin",
];

export function shouldHideNav(pathname: string) {
  if (pathname === "/") return true;
  return hideNavPrefixes.some(
    (p) => p !== "/home" && p !== "/" && pathname.startsWith(p),
  );
}

export function tabIsActive(tabHref: string, path: string) {
  return path === tabHref || path.startsWith(`${tabHref}/`);
}

export function BottomNav({
  activePath,
  onSelectTab,
}: {
  activePath: string;
  onSelectTab?: (href: string) => void;
}) {
  if (shouldHideNav(activePath)) return null;

  const activeIndex = Math.max(
    0,
    navTabs.findIndex((tab) => tabIsActive(tab.href, activePath)),
  );

  return (
    <nav className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-[100] w-[calc(100%-2rem)] max-w-[22.5rem] -translate-x-1/2">
      <div className="overflow-hidden rounded-full border border-atlas-border/70 bg-white/92 shadow-[0_8px_24px_rgba(17,17,17,0.08)] backdrop-blur-xl dark:border-white/15 dark:bg-atlas-surface/80 dark:shadow-[0_8px_28px_rgba(0,0,0,0.4)]">
        <div className="p-1.5">
          <div className="relative">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 w-1/4 rounded-full bg-atlas-primary/12 dark:bg-atlas-primary/20"
              style={{
                insetInlineStart: `${activeIndex * 25}%`,
                transition:
                  "inset-inline-start 380ms cubic-bezier(0.22, 1.25, 0.36, 1)",
              }}
            />
            <ul className="relative grid grid-cols-4 items-stretch">
              {navTabs.map((tab) => {
                const active = tabIsActive(tab.href, activePath);
                const Icon = tab.Icon;
                return (
                  <li key={tab.href} className="flex min-h-[3.4rem]">
                    <Link
                      href={tab.href}
                      prefetch
                      scroll={false}
                      onPointerDown={(event) => {
                        if (event.button !== 0) return;
                        onSelectTab?.(tab.href);
                      }}
                      className={`flex w-full flex-col items-center justify-center gap-0.5 rounded-full px-1 py-1.5 text-caption ${
                        active
                          ? "text-atlas-primary"
                          : "text-black/75 hover:text-black dark:text-white/75 dark:hover:text-white"
                      }`}
                    >
                      <span
                        key={active ? `${tab.href}-on` : `${tab.href}-off`}
                        className={active ? "animate-[navIconPop_380ms_ease]" : ""}
                      >
                        <Icon
                          size={20}
                          variant={active ? "Bold" : "Linear"}
                          color="currentColor"
                        />
                      </span>
                      {active ? (
                        <span className="animate-[navLabelIn_280ms_ease] text-caption font-medium leading-tight text-atlas-primary">
                          {tab.label}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
