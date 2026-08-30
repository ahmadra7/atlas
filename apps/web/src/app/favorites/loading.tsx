import { AppShell } from "@/components/layout/AppShell";
import { FavoritesSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <AppShell title="علاقه‌مندی‌ها">
      <FavoritesSkeleton />
    </AppShell>
  );
}
