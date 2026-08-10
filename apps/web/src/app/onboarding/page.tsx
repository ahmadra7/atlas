"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft2,
  Cup,
  MagicStar,
  Timer1,
} from "iconsax-react";
import { AppShell } from "@/components/layout/AppShell";
import { BrandMark } from "@/components/brand/BrandMark";
import { Button } from "@/components/ui/Button";

const slides = [
  {
    title: "با مواد موجود پیشنهاد بگیرید",
    body: "مواد آشپزخانه را وارد کنید تا دقیق‌ترین دستورها، با اولویت تطبیق کامل، نمایش داده شود.",
    Icon: Cup,
    tone: "از مواد تا پیشنهاد",
  },
  {
    title: "پخت مرحله‌به‌مرحله و آرام",
    body: "در حالت پخت، هر مرحله کوتاه و واضح است؛ با تایمر، نکته و کنترل‌های بزرگ برای دست‌های مشغول.",
    Icon: Timer1,
    tone: "همراه شما تا پایان",
  },
  {
    title: "کمک فوری وقتی گیر می‌کنید",
    body: "دستیار و SOS برای مشکلات رایج مثل شور شدن یا سوختگی، همان لحظه کمکتان می‌کند.",
    Icon: MagicStar,
    tone: "هوشمند و بخشنده",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const Icon = slide.Icon;
  const isLast = index >= slides.length - 1;

  function next() {
    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }
    localStorage.setItem("atlas-onboarding-done", "1");
    router.push("/auth");
  }

  function skip() {
    localStorage.setItem("atlas-onboarding-done", "1");
    router.push("/auth");
  }

  return (
    <AppShell hideNav>
      <div className="flex min-h-[88vh] flex-col justify-between gap-6 py-2">
        <div className="flex items-center justify-between">
          <BrandMark size={40} />
          <button
            type="button"
            onClick={skip}
            className="text-caption text-atlas-ink-muted"
          >
            رد کردن
          </button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <div className="flex h-36 w-36 items-center justify-center rounded-full bg-atlas-primary-soft shadow-inner">
            <Icon size={64} color="#FF3737" variant="Bulk" />
          </div>
          <p className="rounded-full bg-zinc-100 px-3 py-1 text-caption text-atlas-ink-muted">
            {slide.tone}
          </p>
          <h1 className="max-w-xs text-h1 text-atlas-ink">{slide.title}</h1>
          <p className="max-w-sm text-body leading-7 text-atlas-ink-muted">
            {slide.body}
          </p>

          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-atlas-primary" : "w-2 bg-zinc-300"
                }`}
              />
            ))}
          </div>
        </div>

        <Button
          size="lg"
          className="w-full"
          onClick={next}
          icon={<ArrowLeft2 size={20} color="currentColor" />}
        >
          {isLast ? "شروع کنید" : "بعدی"}
        </Button>
      </div>
    </AppShell>
  );
}
