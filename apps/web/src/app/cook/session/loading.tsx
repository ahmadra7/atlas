import { AppShell } from "@/components/layout/AppShell";
import { CookSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <AppShell hideNav showBack title="پخت">
      <CookSkeleton />
    </AppShell>
  );
}
