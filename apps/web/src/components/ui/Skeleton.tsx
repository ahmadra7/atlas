import type { ReactNode } from "react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-md bg-atlas-surface-muted",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[skeletonShine_1.4s_ease-in-out_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/45 before:to-transparent",
        "dark:before:via-white/10",
        className,
      )}
    />
  );
}

export function SkeletonText({
  lines = 2,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cx("space-y-2", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={cx("h-3", i === lines - 1 ? "w-[72%]" : "w-full")}
        />
      ))}
    </div>
  );
}

export function PageSkeleton({ children }: { children: ReactNode }) {
  return (
    <div className="animate-[splashUp_0.35s_ease-out_both] space-y-4 pb-6">
      {children}
    </div>
  );
}

/** Matches fridge card + a couple popular rows (minimal). */
export function HomeSkeleton() {
  return (
    <PageSkeleton>
      <div className="rounded-atlas-xl bg-atlas-surface px-5 pb-6 pt-6 shadow-[0_18px_40px_rgba(17,17,17,0.08)]">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-[4.6rem] w-[4.6rem] shrink-0 rounded-lg" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-7 w-[85%]" />
            <Skeleton className="h-3 w-[70%]" />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex justify-center">
              <Skeleton className="h-[4.5rem] w-[4.5rem] rounded-full" />
            </div>
            <Skeleton className="mx-auto h-3 w-6" />
            <div className="flex items-start gap-2">
              <Skeleton className="h-11 min-w-0 flex-1 rounded-atlas" />
              <Skeleton className="h-11 w-11 shrink-0 rounded-atlas" />
            </div>
          </div>
          <Skeleton className="h-12 w-full rounded-atlas" />
        </div>
      </div>

      <Skeleton className="h-11 w-full rounded-atlas" />

      <div className="space-y-3">
        <Skeleton className="h-5 w-28" />
        {Array.from({ length: 2 }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-atlas-lg bg-atlas-surface p-2 shadow-[0_2px_8px_rgba(17,17,17,0.04)]"
          >
            <Skeleton className="h-20 w-20 shrink-0 rounded-atlas" />
            <div className="flex min-w-0 flex-1 flex-col gap-2 py-0.5">
              <Skeleton className="h-4 w-[80%]" />
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-12 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageSkeleton>
  );
}

export function RecipeSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 pb-[5.75rem] animate-[splashUp_0.35s_ease-out_both]">
      <Skeleton className="h-40 w-full rounded-atlas-xl" />
      <div className="flex items-start gap-2">
        <Skeleton className="h-7 flex-1" />
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-md" />
        <Skeleton className="h-6 w-14 rounded-md" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-atlas-xl border border-atlas-border/50 bg-atlas-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-6 w-14 rounded-md" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3.5 w-12" />
            </div>
          ))}
        </div>
      </div>
      <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-atlas-border/80 bg-atlas-surface/95 px-4 pb-4 pt-3 backdrop-blur">
        <Skeleton className="h-12 w-full rounded-atlas" />
      </div>
    </div>
  );
}

export function RecommendationsSkeleton() {
  return (
    <PageSkeleton>
      <div className="flex justify-end">
        <Skeleton className="h-9 w-24 rounded-atlas" />
      </div>
      {Array.from({ length: 2 }, (_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-atlas-lg border border-atlas-border/50 bg-atlas-surface"
        >
          <Skeleton className="h-40 w-full rounded-none" />
          <div className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-5 w-[65%]" />
              <Skeleton className="h-6 w-10 rounded-md" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </PageSkeleton>
  );
}

export function ProfileSkeleton() {
  return (
    <PageSkeleton>
      <div className="rounded-atlas-xl bg-atlas-primary/90 px-4 pb-5 pt-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-16 w-16 shrink-0 rounded-full bg-white/25 before:via-white/40" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32 bg-white/25 before:via-white/40" />
            <Skeleton className="h-3.5 w-20 bg-white/20 before:via-white/35" />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton
              key={i}
              className="h-14 w-full bg-white/15 before:via-white/30"
            />
          ))}
        </div>
      </div>
      {Array.from({ length: 2 }, (_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-atlas-xl border border-atlas-border/50 bg-atlas-surface"
        >
          {Array.from({ length: 2 }, (_, j) => (
            <div key={j} className="flex items-center gap-3 px-4 py-3.5">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </PageSkeleton>
  );
}

export function FavoritesSkeleton() {
  return (
    <PageSkeleton>
      {Array.from({ length: 2 }, (_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-atlas-lg border border-atlas-border/50 bg-atlas-surface"
        >
          <Skeleton className="h-36 w-full rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-5 w-[60%]" />
            <Skeleton className="h-3.5 w-24" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-9 w-20 rounded-atlas" />
              <Skeleton className="h-9 w-16 rounded-atlas" />
            </div>
          </div>
        </div>
      ))}
    </PageSkeleton>
  );
}

export function HistorySkeleton() {
  return (
    <PageSkeleton>
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 rounded-atlas-xl border border-atlas-border/50 bg-atlas-surface p-4"
        >
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[65%]" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
      ))}
    </PageSkeleton>
  );
}

export function CookSkeleton() {
  return (
    <div className="flex min-h-[70vh] flex-col pb-28 animate-[splashUp_0.35s_ease-out_both]">
      <div className="flex justify-end">
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
      <Skeleton className="mt-4 h-44 w-full rounded-atlas-xl" />
      <div className="mt-10 flex flex-1 flex-col items-center justify-end gap-3 px-4">
        <Skeleton className="h-7 w-[88%]" />
        <Skeleton className="h-7 w-[70%]" />
      </div>
      <div className="mt-6 flex flex-col items-center gap-2">
        <Skeleton className="h-14 w-14 rounded-full" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-atlas-border/80 bg-atlas-surface/95 px-4 pb-4 pt-3 backdrop-blur">
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-12 w-full rounded-atlas" />
          <Skeleton className="h-12 w-full rounded-atlas" />
        </div>
      </div>
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <PageSkeleton>
      <Skeleton className="h-11 w-full rounded-atlas" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-16 rounded-md" />
        ))}
      </div>
      <Skeleton className="h-5 w-28" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-md" />
        ))}
      </div>
    </PageSkeleton>
  );
}
