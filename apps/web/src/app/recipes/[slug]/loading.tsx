import { AppShell } from "@/components/layout/AppShell";
import { RecipeSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <AppShell hideNav showBack title="دستور" lockScroll>
      <RecipeSkeleton />
    </AppShell>
  );
}
