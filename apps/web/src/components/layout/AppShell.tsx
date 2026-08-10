"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Heart,
  Home2,
  Profile,
  Reserve,
  SearchNormal1,
} from "iconsax-react";
import { BrandMark } from "@/components/brand/BrandMark";
import { BackButton } from "@/components/ui/BackButton";

const tabs = [
  { href: "/home", label: "خانه", Icon: Home2 },
  { href: "/search", label: "جستجو", Icon: SearchNormal1 },
  { href: "/ingredients", label: "آشپزی", Icon: Reserve },
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
}: {
  children: ReactNode;
  hideNav?: boolean;
  title?: string;
  showBack?: boolean;
  backHref?: string;
}) {
  const pathname = usePathname();
  const showNav = hideNav === undefined ? !shouldHideNav(pathname) : !hideNav;

  return (
    <div className="atlas-phone relative flex min-h-screen flex-col">
      {title || showBack ? (
        <header className="sticky top-0 z-30 border-b border-atlas-border/70 bg-white/75 px-4 py-3 backdrop-blur-xl">
          <div className="relative flex min-h-11 items-center">
            <div className="z-10 flex max-w-[42%] items-center gap-2">
              <BrandMark size={36} />
            </div>

            {title ? (
              <h1 className="pointer-events-none absolute inset-x-0 text-center text-h3 font-bold text-atlas-ink">
                {title}
              </h1>
            ) : null}

            {showBack ? (
              <div className="absolute left-0 z-10">
                <BackButton href={backHref} />
              </div>
            ) : null}
          </div>
        </header>
      ) : null}

      <main className={`flex-1 px-4 ${showNav ? "pb-32 pt-4" : "pb-6 pt-4"}`}>
        {children}
      </main>

      {showNav ? (
        <nav className="pointer-events-none fixed bottom-5 left-1/2 z-40 w-[calc(100%-2rem)] max-w-[22.5rem] -translate-x-1/2">
          <div className="pointer-events-auto overflow-hidden rounded-full border border-white/50 shadow-[0_12px_40px_rgba(17,17,17,0.16)]">
            <ul className="grid grid-cols-5 gap-1 bg-white/25 p-1.5 backdrop-blur-3xl supports-[backdrop-filter]:bg-white/20">
              {tabs.map((tab) => {
                const active =
                  pathname === tab.href || pathname.startsWith(`${tab.href}/`);
                const Icon = tab.Icon;
                return (
                  <li key={tab.href}>
                    <Link
                      href={tab.href}
                      className={`flex flex-col items-center gap-0.5 rounded-full px-1 py-2.5 text-caption transition ${
                        active
                          ? "bg-transparent text-black"
                          : "text-atlas-ink-faint hover:bg-white/35 hover:text-atlas-ink"
                      }`}
                    >
                      <Icon
                        size={20}
                        variant={active ? "Bold" : "Linear"}
                        color="currentColor"
                      />
                      <span
                        className={`text-[10px] ${
                          active ? "font-bold text-black" : "font-medium"
                        }`}
                      >
                        {tab.label}
                      </span>
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
