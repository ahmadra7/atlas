"use client";

import { useRouter } from "next/navigation";
import { Google, ProfileCircle, Apple } from "iconsax-react";
import { AppShell } from "@/components/layout/AppShell";
import { BrandMark } from "@/components/brand/BrandMark";
import { Button } from "@/components/ui/Button";

export default function AuthPage() {
  const router = useRouter();

  function enterGuest() {
    localStorage.setItem("atlas-auth", "guest");
    router.push("/home");
  }

  return (
    <AppShell hideNav>
      <div className="flex min-h-[85vh] flex-col justify-between gap-6 py-6">
        <div className="space-y-3 text-center">
          <div className="mx-auto">
            <BrandMark size={88} />
          </div>
          <h1 className="text-h1 text-atlas-ink">ورود به سرآشپز هوشمند</h1>
          <p className="text-body text-atlas-ink-muted">
            برای شروع می‌توانید به‌صورت مهمان ادامه دهید.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full"
            onClick={enterGuest}
            icon={<ProfileCircle size={20} color="currentColor" />}
          >
            ادامه به‌عنوان مهمان
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="w-full"
            onClick={enterGuest}
            icon={<Google size={20} color="currentColor" variant="Bold" />}
          >
            ادامه با Google
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="w-full"
            onClick={enterGuest}
            icon={<Apple size={20} color="currentColor" variant="Bold" />}
          >
            ادامه با Apple
          </Button>
          <button
            type="button"
            className="w-full py-2 text-caption text-atlas-primary"
            onClick={enterGuest}
          >
            قبلاً حساب دارید؟ ورود
          </button>
        </div>
      </div>
    </AppShell>
  );
}
