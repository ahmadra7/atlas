"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AppShell, homeAppTitle } from "@/components/layout/AppShell";
import { BottomNav, shouldHideNav } from "@/components/layout/BottomNav";
import {
  CookSkeleton,
  FavoritesSkeleton,
  HomeSkeleton,
  ProfileSkeleton,
  RecipeSkeleton,
  RecommendationsSkeleton,
  SearchSkeleton,
} from "@/components/ui/Skeleton";

let pendingHref: string | null = null;
const listeners = new Set<(href: string | null) => void>();

export function beginInstantNav(href: string) {
  pendingHref = href;
  listeners.forEach((fn) => fn(href));
}

export function cancelInstantNav() {
  pendingHref = null;
  listeners.forEach((fn) => fn(null));
}

export function instantPush(
  router: { push: (href: string) => void },
  href: string,
) {
  beginInstantNav(href);
  router.push(href);
}

export function instantReplace(
  router: { replace: (href: string) => void },
  href: string,
) {
  beginInstantNav(href);
  router.replace(href);
}

function pendingScreen(href: string) {
  const path = href.split("?")[0] ?? href;

  if (path.startsWith("/recommendations")) {
    return (
      <AppShell hideNav showBack backHref="/home" title="لیست غذاها">
        <RecommendationsSkeleton />
      </AppShell>
    );
  }
  if (path.startsWith("/recipes/")) {
    return (
      <AppShell hideNav showBack title="دستور" lockScroll>
        <RecipeSkeleton />
      </AppShell>
    );
  }
  if (path.startsWith("/cook")) {
    return (
      <AppShell hideNav showBack title="پخت">
        <CookSkeleton />
      </AppShell>
    );
  }
  if (path.startsWith("/search")) {
    return (
      <AppShell title="جستجو">
        <SearchSkeleton />
      </AppShell>
    );
  }
  if (path.startsWith("/favorites")) {
    return (
      <AppShell title="علاقه‌مندی‌ها">
        <FavoritesSkeleton />
      </AppShell>
    );
  }
  if (path.startsWith("/profile")) {
    return (
      <AppShell title="پروفایل">
        <ProfileSkeleton />
      </AppShell>
    );
  }
  if (path.startsWith("/home")) {
    return (
      <AppShell title={homeAppTitle} splitTitle>
        <HomeSkeleton />
      </AppShell>
    );
  }
  return (
    <AppShell title={homeAppTitle} splitTitle>
      <HomeSkeleton />
    </AppShell>
  );
}

function selectTab(href: string, pathname: string) {
  const path = href.split("?")[0] ?? href;
  const pendingPath = pendingHref?.split("?")[0] ?? null;
  if (path === pendingPath) return;
  if (path === pathname) {
    if (pendingPath) cancelInstantNav();
    return;
  }
  beginInstantNav(href);
}

export function InstantNav({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [pending, setPending] = useState<string | null>(pendingHref);

  useEffect(() => {
    const onChange = (href: string | null) => setPending(href);
    listeners.add(onChange);
    return () => {
      listeners.delete(onChange);
    };
  }, []);

  useEffect(() => {
    if (!pending) return;
    const dest = pending.split("?")[0] ?? pending;
    if (pathname !== dest && !(dest !== "/" && pathname.startsWith(`${dest}/`))) {
      return;
    }
    let cancelled = false;
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (cancelled) return;
        pendingHref = null;
        setPending(null);
      });
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [pathname, pending]);

  useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(() => {
      pendingHref = null;
      setPending(null);
    }, 12000);
    return () => window.clearTimeout(timer);
  }, [pending]);

  useEffect(() => {
    const onPop = () => cancelInstantNav();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const target = (event.target as HTMLElement | null)?.closest("a[href]");
      if (!(target instanceof HTMLAnchorElement)) return;
      if (target.target && target.target !== "_self") return;
      if (target.hasAttribute("download")) return;
      const url = new URL(target.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      const href = `${url.pathname}${url.search}`;
      const path = url.pathname;
      const pendingPath = pendingHref?.split("?")[0] ?? null;
      if (path === pendingPath) return;
      if (path === pathname) {
        if (pendingPath) cancelInstantNav();
        return;
      }
      beginInstantNav(href);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  const overlayPath = pending?.split("?")[0] ?? null;
  const overlayCoversNav = overlayPath ? shouldHideNav(overlayPath) : true;

  return (
    <>
      {children}
      {pending && overlayPath ? (
        <div className="pointer-events-none fixed inset-y-0 left-1/2 z-[80] w-full max-w-md -translate-x-1/2 bg-atlas-background">
          <div
            className={`overflow-y-auto ${
              overlayCoversNav ? "h-full" : "h-[calc(100%-6.75rem)]"
            } pointer-events-auto`}
          >
            {pendingScreen(pending)}
          </div>
        </div>
      ) : null}
      <BottomNav
        activePath={overlayPath || pathname}
        onSelectTab={(href) => selectTab(href, pathname)}
      />
    </>
  );
}
