"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { CookSkeleton } from "@/components/ui/Skeleton";
import { StateView } from "@/components/ui/StateView";
import { instantReplace } from "@/components/navigation/InstantNav";
import { atlasClient } from "@/lib/client";

function StartCookContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recipeId = searchParams.get("recipeId");
  const voiceOn =
    searchParams.get("voice") === "1" || searchParams.get("voice") === "true";
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recipeId) {
      setError("دستور مشخص نشده است.");
      return;
    }
    let cancelled = false;
    void atlasClient
      .startCookingSession(recipeId)
      .then((session) => {
        if (!cancelled) {
          const params = new URLSearchParams({
            id: session.id,
            recipeId,
          });
          if (voiceOn) params.set("voice", "1");
          instantReplace(router, `/cook/session?${params.toString()}`);
        }
      })
      .catch(() => {
        if (!cancelled) setError("شروع پخت ممکن نشد.");
      });
    return () => {
      cancelled = true;
    };
  }, [recipeId, router, voiceOn]);

  if (error) {
    return (
      <StateView
        tone="danger"
        title="خطا"
        description={error}
        actionLabel="بازگشت"
        onAction={() => router.back()}
      />
    );
  }

  return <CookSkeleton />;
}

export default function StartCookPage() {
  return (
    <AppShell hideNav showBack title="پخت">
      <Suspense fallback={<CookSkeleton />}>
        <StartCookContent />
      </Suspense>
    </AppShell>
  );
}
