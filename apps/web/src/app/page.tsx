"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { BrandMark } from "@/components/brand/BrandMark";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const done = localStorage.getItem("atlas-onboarding-done");
    const t = setTimeout(() => {
      router.replace(done ? "/home" : "/onboarding");
    }, 2600);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <AppShell hideNav>
      <div className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#ffe5e5_0%,transparent_45%),radial-gradient(circle_at_80%_70%,#f4f4f5_0%,transparent_40%)]" />
        <div className="relative animate-[pulse_2.4s_ease-in-out_infinite]">
          <div className="mx-auto mb-6 drop-shadow-xl">
            <BrandMark size={120} />
          </div>
          <h1 className="text-h1 text-atlas-ink">سرآشپز هوشمند</h1>
          <p className="mt-3 text-body text-atlas-ink-muted">
            هوشمندانه بپزید، با آنچه دارید.
          </p>
          <div className="mx-auto mt-8 h-1.5 w-28 overflow-hidden rounded-full bg-zinc-200">
            <div className="h-full w-full origin-right animate-[ping_1.6s_linear_infinite] rounded-full bg-atlas-primary/80 opacity-70" />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
