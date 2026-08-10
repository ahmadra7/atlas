import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "خانه" },
  { href: "/ingredients", label: "مواد" },
  { href: "/recommendations", label: "پیشنهادها" },
  { href: "/favorites", label: "علاقه‌مندی" },
  { href: "/history", label: "تاریخچه" },
  { href: "/profile", label: "پروفایل" },
];

export function AppShell({
  children,
  hideNav = false,
}: {
  children: ReactNode;
  hideNav?: boolean;
}) {
  return (
    <div className="min-h-screen">
      {!hideNav ? (
        <header className="sticky top-0 z-40 border-b border-atlas-border/80 bg-atlas-surface/90 backdrop-blur">
          <div className="atlas-container flex h-16 items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-atlas bg-atlas-primary text-sm font-bold text-white">
                A
              </span>
              <div className="leading-tight">
                <div className="text-base font-bold tracking-tight text-atlas-ink">
                  ATLAS
                </div>
                <div className="text-xs text-atlas-ink-faint">آشپزی هوشمند</div>
              </div>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-atlas px-3 py-2 text-sm text-atlas-ink-muted transition hover:bg-atlas-surface-muted hover:text-atlas-ink"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <nav className="atlas-container flex gap-1 overflow-x-auto pb-3 md:hidden">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-full border border-atlas-border bg-atlas-surface px-3 py-1.5 text-xs text-atlas-ink-muted"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
      ) : null}
      <main className={hideNav ? "" : "pb-10 pt-6"}>{children}</main>
    </div>
  );
}
