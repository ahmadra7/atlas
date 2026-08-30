"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { instantReplace } from "@/components/navigation/InstantNav";
import { BrandMark } from "@/components/brand/BrandMark";

export default function SplashPage() {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem("atlas-onboarding-done");
    const leaveAt = window.setTimeout(() => setLeaving(true), 2200);
    const goAt = window.setTimeout(() => {
      instantReplace(router, done ? "/home" : "/onboarding");
    }, 2800);
    return () => {
      window.clearTimeout(leaveAt);
      window.clearTimeout(goAt);
    };
  }, [router]);

  return (
    <div
      className={`relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-atlas-primary px-6 text-center transition-opacity duration-500 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-black/10 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 rounded-full bg-white/10 blur-xl" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-7 animate-[splashPop_0.7s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="relative flex h-32 w-32 items-center justify-center rounded-[2rem] bg-white shadow-[0_18px_40px_rgba(0,0,0,0.22)] ring-1 ring-white/70">
            <BrandMark size={88} />
            <span className="absolute -inset-2 -z-10 animate-ping rounded-[2.2rem] bg-white/25" />
          </div>
        </div>

        <h1 className="animate-[splashUp_0.7s_0.15s_both] text-[1.85rem] font-extrabold tracking-tight text-white">
          سرآشپز هوشمند
        </h1>
        <p className="mt-3 max-w-[16rem] animate-[splashUp_0.7s_0.28s_both] text-body leading-7 text-white/85">
          هوشمندانه بپزید، با آنچه دارید.
        </p>

        <div className="mt-10 h-1.5 w-32 overflow-hidden rounded-full bg-white/25 animate-[splashUp_0.7s_0.4s_both]">
          <div className="h-full w-1/3 animate-[splashBar_1.4s_ease-in-out_infinite] rounded-full bg-white" />
        </div>
      </div>
    </div>
  );
}
