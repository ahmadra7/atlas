import { AppShell } from "@/components/layout/AppShell";
import { RecommendationsSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <AppShell hideNav showBack backHref="/home" title="لیست غذاها">
      <RecommendationsSkeleton />
    </AppShell>
  );
}
