import { AppShell, homeAppTitle } from "@/components/layout/AppShell";
import { HomeSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <AppShell title={homeAppTitle} splitTitle>
      <HomeSkeleton />
    </AppShell>
  );
}
