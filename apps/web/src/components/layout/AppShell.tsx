"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Login } from "iconsax-react";
import { greetingFa } from "@atlas/shared";
import { useAuth } from "@/components/auth/AuthProvider";
import { AvatarMenu } from "@/components/layout/AvatarMenu";
import { navTabs, shouldHideNav } from "@/components/layout/BottomNav";
import { BackButton } from "@/components/ui/BackButton";
import { greetingFirstName } from "@/lib/phone";

export const homeAppTitle = "چی بپزم ؟!";

function HeaderGreeting() {
  const { isAuthenticated, user } = useAuth();
  const firstName = isAuthenticated ? greetingFirstName(user?.displayName) : null;

  return (
    <div className="min-w-0 leading-tight">
      <p className="truncate text-[11px] font-normal text-atlas-ink-muted">
        {firstName ? `سلام ${firstName}!` : "سلام!"}
      </p>
      <p className="truncate text-[11px] font-semibold text-atlas-ink">
        {greetingFa()} 👋
      </p>
    </div>
  );
}

function LoginEntryButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push("/auth")}
      className="inline-flex h-8 items-center gap-1 rounded-[8px] px-2.5 text-[12px] font-semibold text-atlas-primary transition hover:opacity-90 active:scale-95"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--atlas-primary) 10%, transparent)",
      }}
    >
      <Login size={15} color="currentColor" variant="Linear" />
      ورود
    </button>
  );
}

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
  hideBrand = false,
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
  /** Hide avatar + greeting in the app bar. */
  hideBrand?: boolean;
  /** Keep shell to viewport height; only children manage internal scroll. */
  lockScroll?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const showNav = hideNav === undefined ? !shouldHideNav(pathname) : !hideNav;
  const showHeader = Boolean(
    title || showBack || headerAction || brandAside || showBrand,
  );
  const showIdentity = showHeader && !hideBrand;

  useEffect(() => {
    for (const tab of navTabs) router.prefetch(tab.href);
  }, [router]);

  return (
    <div
      className={`atlas-phone relative flex flex-col ${
        lockScroll
          ? "h-svh max-h-svh !min-h-0 overflow-hidden"
          : "min-h-screen"
      }`}
    >
      {showHeader ? (
        <header className="sticky top-0 z-30 shrink-0 overflow-visible border-b border-atlas-border/70 bg-atlas-surface/80 px-4 py-3 backdrop-blur-xl dark:border-white/15">
          <div className="grid min-h-11 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1">
            <div className="z-10 flex min-w-0 items-center gap-1 ps-2">
              {showIdentity ? (
                <>
                  <AvatarMenu />
                  <HeaderGreeting />
                </>
              ) : null}
              {brandAside}
            </div>

            {title ? (
              <h1
                className={`text-center text-atlas-ink ${
                  splitTitle
                    ? "text-[18px] font-semibold leading-[1.25]"
                    : "text-[15px] font-medium leading-tight"
                }`}
              >
                {title}
              </h1>
            ) : (
              <div />
            )}

            <div className="z-10 flex items-center justify-end gap-1">
              {showIdentity && !isAuthenticated ? <LoginEntryButton /> : null}
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
