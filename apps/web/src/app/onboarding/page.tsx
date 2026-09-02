"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft2,
  Cup,
  MagicStar,
  Timer1,
} from "iconsax-react";
import { instantPush } from "@/components/navigation/InstantNav";
import { BrandMark } from "@/components/brand/BrandMark";
import { Button } from "@/components/ui/Button";

const slides = [
  {
    title: "چیا تو یخچال داری؟",
    body: "مواد موجودت رو بگو تا برات بهترین غذاها رو پیشنهاد بدم؛ دقیق، سریع و بدون سردرگمی.",
    Icon: Cup,
    eyebrow: "گام ۱ از ۳",
  },
  {
    title: "پخت مرحله‌به‌مرحله",
    body: "هر مرحله کوتاه و واضحه. تایمر، نکته و راهنما کنارت هستن تا آروم و مطمئن بپزی.",
    Icon: Timer1,
    eyebrow: "گام ۲ از ۳",
  },
  {
    title: "وقتی گیر کردی کمکت می‌کنم",
    body: "دستیار هوشمند و کمک فوری برای مشکلات رایج مثل شور شدن یا سوختگی، همون لحظه آماده‌ست.",
    Icon: MagicStar,
    eyebrow: "گام ۳ از ۳",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const Icon = slide.Icon;
  const isLast = index >= slides.length - 1;

  function finish() {
    localStorage.setItem("atlas-onboarding-done", "1");
    instantPush(router, "/home");
  }

  function next() {
    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }
    finish();
  }

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-hidden bg-atlas-background px-5 pb-6 pt-5">
      <div className="pointer-events-none absolute -left-20 top-0 h-56 w-56 rounded-full bg-atlas-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-24 h-48 w-48 rounded-full bg-atlas-primary/10 blur-3xl" />

      <div className="relative z-10 flex items-center justify-between">
        <BrandMark size={40} />
        <button
          type="button"
          onClick={finish}
          className="rounded-full px-3 py-1.5 text-caption font-medium text-atlas-ink-muted transition hover:bg-atlas-surface-muted hover:text-atlas-ink"
        >
          رد کردن
        </button>
      </div>

      <div
        key={index}
        className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5 py-8 text-center animate-[splashUp_0.45s_ease-out_both]"
      >
        <div className="relative flex h-40 w-40 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-atlas-primary/15" />
          <span className="absolute inset-3 rounded-full bg-atlas-primary/20" />
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-atlas-primary shadow-[0_16px_36px_rgba(212,2,47,0.35)]">
            <Icon size={52} color="#FFFFFF" variant="Bold" />
          </div>
        </div>

        <p className="rounded-full bg-atlas-primary-soft px-3 py-1 text-caption font-semibold text-atlas-primary">
          {slide.eyebrow}
        </p>
        <h1 className="max-w-xs text-h1 text-atlas-ink">{slide.title}</h1>
        <p className="max-w-sm text-body leading-7 text-atlas-ink-muted">
          {slide.body}
        </p>

        <div className="mt-2 flex items-center gap-2">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index
                  ? "w-7 bg-atlas-primary"
                  : i < index
                    ? "w-2 bg-atlas-primary/45"
                    : "w-2 bg-atlas-border"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 space-y-3">
        <Button
          size="lg"
          className="w-full"
          onClick={next}
          iconEnd
          icon={<ArrowLeft2 size={20} color="currentColor" />}
        >
          {isLast ? "بزن بریم" : "بعدی"}
        </Button>
        {!isLast ? (
          <p className="text-center text-caption text-atlas-ink-faint">
            {`${index + 1} از ${slides.length}`}
          </p>
        ) : null}
      </div>
    </div>
  );
}
