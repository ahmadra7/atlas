import { AppShell } from "@/components/layout/AppShell";
import { SearchSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <AppShell title="جستجو">
      <SearchSkeleton />
    </AppShell>
  );
}
