"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { AvatarMenu } from "@/components/layout/AvatarMenu";
import { navTabs, shouldHideNav } from "@/components/layout/BottomNav";
import { BackButton } from "@/components/ui/BackButton";

export const homeAppTitle = (
  <>
    <span className="block">سرآشپز</span>
    <span className="block">هوشمند</span>
  </>
);

export function AppShell({
  children,
  hideNav,
  title,
  splitTitle = false,
  showBack = false,
  backHref,
  headerAction,
  brandAside,
  showBrand = false,
  lockScroll = false,
}: {
  children: ReactNode;
  hideNav?: boolean;
  title?: ReactNode;
  /** Two-line brand name so it fits beside the greeting. */
  splitTitle?: boolean;
  showBack?: boolean;
  backHref?: string;
  headerAction?: ReactNode;
  /** Optional content shown beside the brand mark (or alone when brand is hidden). */
  brandAside?: ReactNode;
  /** When true, shows the home avatar menu. */
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

  useEffect(() => {
    for (const tab of navTabs) router.prefetch(tab.href);
  }, [router]);

  return (
    <div
      className={`atlas-phone relative flex flex-col ${
        lockScroll ? "h-svh max-h-svh overflow-hidden" : "min-h-screen"
      }`}
    >
      {showHeader ? (
        <header className="sticky top-0 z-30 shrink-0 overflow-visible border-b border-atlas-border/70 bg-atlas-surface/80 px-4 py-3 backdrop-blur-xl dark:border-white/15">
          <div className="grid min-h-11 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1">
            <div className="z-10 flex min-w-0 items-center gap-2">
              {showBrand ? <AvatarMenu /> : null}
              {brandAside}
            </div>

            {title ? (
              <h1
                className={`text-center font-medium text-atlas-ink ${
                  splitTitle
                    ? "text-[15px] leading-[1.25]"
                    : "text-[14px] leading-tight"
                }`}
              >
                {title}
              </h1>
            ) : (
              <div />
            )}

            <div className="z-10 flex items-center justify-end gap-1">
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
    </div>
  );
}
