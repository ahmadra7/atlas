"use client";

import { Moon, Sun1 } from "iconsax-react";
import { useTheme } from "@/components/theme/ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "تم روشن" : "تم تیره"}
      title={isDark ? "تم روشن" : "تم تیره"}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-atlas-border bg-atlas-surface text-atlas-ink shadow-sm transition hover:border-atlas-primary/40 hover:bg-atlas-surface-muted active:scale-95 dark:shadow-[0_0_0_1px_rgba(255,77,77,0.12),0_6px_16px_rgba(0,0,0,0.35)] ${className}`}
    >
      {isDark ? (
        <Sun1 size={18} color="#FFFFFF" variant="Bold" />
      ) : (
        <Moon size={18} color="#3F3F46" variant="Bold" />
      )}
    </button>
  );
}
