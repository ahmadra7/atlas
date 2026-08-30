import { AppShell } from "@/components/layout/AppShell";
import { ProfileSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <AppShell title="پروفایل">
      <ProfileSkeleton />
    </AppShell>
  );
}
