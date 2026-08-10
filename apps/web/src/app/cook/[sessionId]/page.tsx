"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { CookingSession } from "@atlas/contracts";
import { formatDurationClock, toPersianDigits } from "@atlas/shared";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { LoadingBlock, StateView } from "@/components/ui/StateView";
import { atlasClient } from "@/lib/client";

const sosIssues = [
  { code: "burning", label: "داره می‌سوزه" },
  { code: "too_salty", label: "شور شده" },
  { code: "undercooked", label: "خام مونده" },
  { code: "missing_tool", label: "ابزار ندارم" },
  { code: "other", label: "مشکل دیگر" },
];

export default function CookingPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [session, setSession] = useState<CookingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timerLeft, setTimerLeft] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showSos, setShowSos] = useState(false);
  const [showAsk, setShowAsk] = useState(false);
  const [askText, setAskText] = useState("");
  const [helpReply, setHelpReply] = useState<string | null>(null);
  const [showAbandon, setShowAbandon] = useState(false);
  const [abandonReason, setAbandonReason] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await atlasClient.getCookingSession(params.sessionId);
        if (!cancelled) {
          setSession(data);
          if (!data) setError("نشست پخت پیدا نشد.");
        }
      } catch {
        if (!cancelled) setError("بارگذاری نشست پخت ناموفق بود.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [params.sessionId]);

  const step = useMemo(() => {
    if (!session) return null;
    return (
      session.steps.find((s) => s.order === session.currentStepOrder) ??
      session.steps[session.steps.length - 1]
    );
  }, [session]);

  useEffect(() => {
    if (!timerRunning || timerLeft === null) return;
    if (timerLeft <= 0) {
      setTimerRunning(false);
      return;
    }
    const id = setInterval(() => {
      setTimerLeft((prev) => (prev === null ? prev : Math.max(0, prev - 1)));
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning, timerLeft]);

  useEffect(() => {
    if (step?.timerSeconds) {
      setTimerLeft(step.timerSeconds);
      setTimerRunning(false);
    } else {
      setTimerLeft(null);
      setTimerRunning(false);
    }
    setHelpReply(null);
  }, [step?.id, step?.timerSeconds]);

  async function goNext() {
    if (!session || !step) return;
    const isLast = step.order >= session.totalSteps;
    if (isLast) {
      const updated = await atlasClient.completeSession(session.id);
      setSession(updated);
      return;
    }
    const updated = await atlasClient.completeStep(session.id, step.id);
    setSession(updated);
  }

  async function onSos(issueCode: string) {
    if (!session) return;
    const res = await atlasClient.sendSos(session.id, issueCode);
    setHelpReply(res.reply);
    setShowSos(false);
  }

  async function onAsk() {
    if (!session || !askText.trim()) return;
    const res = await atlasClient.askAssistant(session.id, askText.trim());
    setHelpReply(res.reply);
    setShowAsk(false);
    setAskText("");
  }

  async function onAbandon() {
    if (!session) return;
    await atlasClient.abandonSession(session.id, abandonReason || undefined);
    router.push("/recommendations");
  }

  if (loading) {
    return (
      <AppShell hideNav>
        <div className="atlas-container py-10">
          <LoadingBlock label="آماده‌سازی حالت پخت…" />
        </div>
      </AppShell>
    );
  }

  if (error || !session || !step) {
    return (
      <AppShell hideNav>
        <div className="atlas-container py-10">
          <StateView
            tone="danger"
            title="نشست پخت در دسترس نیست"
            description={error ?? "لطفاً دوباره از صفحه دستور شروع کنید."}
            actionLabel="بازگشت"
            onAction={() => router.push("/recommendations")}
          />
        </div>
      </AppShell>
    );
  }

  if (session.status === "completed") {
    return (
      <AppShell hideNav>
        <div className="atlas-container py-10">
          <StateView
            title="پخت تمام شد"
            description={`«${session.recipeTitle}» با موفقیت کامل شد. بازخورد اجباری نیست.`}
            actionLabel="بازگشت به پیشنهادها"
            onAction={() => router.push("/recommendations")}
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell hideNav>
      <div className="min-h-screen bg-[#f4f7f5]">
        <div className="atlas-container space-y-4 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-atlas-ink-faint">{session.recipeTitle}</p>
              <h1 className="text-lg font-bold text-atlas-ink">
                مرحله {toPersianDigits(step.order)} از{" "}
                {toPersianDigits(session.totalSteps)}
              </h1>
            </div>
            <Button variant="ghost" onClick={() => setShowAbandon(true)}>
              خروج
            </Button>
          </div>

          <div
            className="h-52 rounded-atlas-xl bg-cover bg-center sm:h-64"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(28,36,33,0.05), rgba(28,36,33,0.35)), url(${step.imageUrl ?? ""})`,
              backgroundColor: "#d5e3dc",
            }}
          />

          <section className="atlas-surface space-y-4 p-5 sm:p-6">
            <p className="text-lg font-medium leading-8 text-atlas-ink sm:text-xl">
              {step.instruction}
            </p>
            {step.tip ? (
              <div className="rounded-atlas border border-atlas-accent/30 bg-atlas-accent-soft px-4 py-3 text-sm leading-7 text-atlas-ink">
                نکته مهم: {step.tip}
              </div>
            ) : null}

            {timerLeft !== null ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-atlas bg-atlas-surface-muted px-4 py-3">
                <div>
                  <p className="text-xs text-atlas-ink-faint">تایمر مرحله</p>
                  <p className="text-2xl font-bold tabular-nums text-atlas-ink">
                    {formatDurationClock(timerLeft)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setTimerRunning((v) => !v)}
                  >
                    {timerRunning ? "توقف" : "شروع تایمر"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setTimerLeft(step.timerSeconds ?? 0);
                      setTimerRunning(false);
                    }}
                  >
                    ریست
                  </Button>
                </div>
              </div>
            ) : null}

            {helpReply ? (
              <div className="rounded-atlas border border-atlas-primary/20 bg-atlas-primary-soft px-4 py-3 text-sm leading-7 text-atlas-ink">
                {helpReply}
              </div>
            ) : null}

            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="secondary" onClick={() => setShowAsk(true)}>
                بپرس از ما
              </Button>
              <Button variant="danger" onClick={() => setShowSos(true)}>
                کمک فوری (SOS)
              </Button>
            </div>

            <Button className="w-full" size="lg" onClick={() => void goNext()}>
              {step.order >= session.totalSteps ? "پایان پخت" : "مرحله بعد"}
            </Button>
            <p className="text-center text-xs text-atlas-ink-faint">
              کنترل صوتی مکمل است؛ دکمه‌های بصری همیشه در دسترس‌اند.
            </p>
          </section>
        </div>
      </div>

      {showSos ? (
        <Modal title="کمک فوری" onClose={() => setShowSos(false)}>
          <div className="grid gap-2">
            {sosIssues.map((issue) => (
              <Button
                key={issue.code}
                variant="secondary"
                onClick={() => void onSos(issue.code)}
              >
                {issue.label}
              </Button>
            ))}
          </div>
        </Modal>
      ) : null}

      {showAsk ? (
        <Modal title="سؤال درباره همین مرحله" onClose={() => setShowAsk(false)}>
          <textarea
            value={askText}
            onChange={(e) => setAskText(e.target.value)}
            rows={4}
            className="w-full rounded-atlas border border-atlas-border bg-atlas-surface-muted p-3 text-sm outline-none focus:border-atlas-primary"
            placeholder="مثلاً حرارت زیاد است؟ چقدر صبر کنم؟"
          />
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowAsk(false)}>
              انصراف
            </Button>
            <Button onClick={() => void onAsk()}>ارسال</Button>
          </div>
        </Modal>
      ) : null}

      {showAbandon ? (
        <Modal title="خروج از پخت" onClose={() => setShowAbandon(false)}>
          <p className="text-sm leading-7 text-atlas-ink-muted">
            بازخورد اختیاری است. می‌توانید بدون توضیح خارج شوید.
          </p>
          <textarea
            value={abandonReason}
            onChange={(e) => setAbandonReason(e.target.value)}
            rows={3}
            className="mt-3 w-full rounded-atlas border border-atlas-border bg-atlas-surface-muted p-3 text-sm outline-none focus:border-atlas-primary"
            placeholder="دلیل (اختیاری)"
          />
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowAbandon(false)}>
              ادامه پخت
            </Button>
            <Button variant="danger" onClick={() => void onAbandon()}>
              خروج
            </Button>
          </div>
        </Modal>
      ) : null}
    </AppShell>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-atlas-xl border border-atlas-border bg-atlas-surface p-5 shadow-atlas">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-semibold text-atlas-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-atlas-ink-muted"
          >
            بستن
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
