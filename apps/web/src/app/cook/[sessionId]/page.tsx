"use client";

import type { ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { CookingSession } from "@atlas/contracts";
import { formatDurationClock, toPersianDigits } from "@atlas/shared";
import {
  ArrowLeft2,
  ArrowRight2,
  CloseCircle,
  Danger,
  LogoutCurve,
  Send2,
  TickCircle,
} from "iconsax-react";
import { AppShell } from "@/components/layout/AppShell";
import { BottomBar } from "@/components/ui/BottomBar";
import { Button } from "@/components/ui/Button";
import { LoadingBlock, StateView } from "@/components/ui/StateView";
import { RecipeImage } from "@/components/recipe/RecipeImage";
import { atlasClient } from "@/lib/client";

const sosIssues = [
  { code: "too_salty", label: "شور شده" },
  { code: "burning", label: "سوخته / داره می‌سوزه" },
  { code: "undercooked", label: "خام مونده" },
  { code: "missing_tool", label: "ابزار ندارم" },
  { code: "other", label: "مشکل دیگر" },
];

type Panel = "none" | "ask" | "abandon";

export default function CookingPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [session, setSession] = useState<CookingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timerLeft, setTimerLeft] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [panel, setPanel] = useState<Panel>("none");
  const [askText, setAskText] = useState("");
  const [helpReply, setHelpReply] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [rating, setRating] = useState(0);
  const [saveFavorite, setSaveFavorite] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await atlasClient.getCookingSession(params.sessionId);
        if (!cancelled) {
          setSession(data);
          if (!data) setError("نشست پخت پیدا نشد.");
        }
      } catch {
        if (!cancelled) setError("بارگذاری نشست ناموفق بود.");
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
    setHelpReply(null);
    if (step?.timerSeconds) {
      setTimerLeft(step.timerSeconds);
      setTimerRunning(false);
    } else {
      setTimerLeft(null);
      setTimerRunning(false);
    }
  }, [step?.id, step?.timerSeconds]);

  async function goNext() {
    if (!session || !step) return;
    if (step.order >= session.totalSteps) {
      setSession(await atlasClient.completeSession(session.id));
      return;
    }
    setSession(await atlasClient.completeStep(session.id, step.id));
  }

  async function goPrev() {
    if (!session || !step || step.order <= 1) return;
    setSession({
      ...session,
      currentStepOrder: step.order - 1,
    });
  }

  async function sendAsk() {
    if (!session || !askText.trim()) return;
    setSending(true);
    try {
      const res = await atlasClient.askAssistant(session.id, askText.trim());
      setHelpReply(res.reply);
      setAskText("");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <AppShell hideNav showBack backHref="/home" title="پخت">
        <LoadingBlock label="آماده‌سازی حالت پخت…" />
      </AppShell>
    );
  }

  if (error || !session || !step) {
    return (
      <AppShell hideNav showBack backHref="/home" title="پخت">
        <StateView
          tone="danger"
          title="نشست پخت در دسترس نیست"
          description={error ?? undefined}
          actionLabel="رفتن به خانه"
          onAction={() => router.push("/home")}
        />
      </AppShell>
    );
  }

  if (session.status === "completed") {
    return (
      <AppShell hideNav showBack backHref="/home" title="اتمام پخت">
        <div className="space-y-5 pb-36 pt-4 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-atlas-secondary-soft text-4xl">
            🎉
          </div>
          <h1 className="text-h1 text-atlas-ink">پخت تمام شد!</h1>
          <p className="text-body text-atlas-ink-muted">
            «{session.recipeTitle}» آماده است. چطور بود؟
          </p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={`text-2xl ${rating >= n ? "text-atlas-accent" : "text-atlas-border-strong"}`}
              >
                ★
              </button>
            ))}
          </div>
          <label className="flex items-center justify-center gap-2 text-body text-atlas-ink">
            <input
              type="checkbox"
              checked={saveFavorite}
              onChange={(e) => setSaveFavorite(e.target.checked)}
            />
            ذخیره در علاقه‌مندی‌ها
          </label>
        </div>

        <BottomBar>
          <Button
            size="lg"
            className="w-full"
            icon={<TickCircle size={20} color="currentColor" />}
            onClick={async () => {
              if (saveFavorite) {
                await atlasClient.toggleFavorite(session.recipeId);
              }
              router.push("/home");
            }}
          >
            ذخیره و ادامه
          </Button>
          <Button
            variant="tertiary"
            size="lg"
            className="w-full"
            icon={<LogoutCurve size={18} color="currentColor" />}
            onClick={() => router.push("/home")}
          >
            پایان
          </Button>
        </BottomBar>
      </AppShell>
    );
  }

  const displaySeconds = timerLeft ?? step.timerSeconds ?? null;

  return (
    <AppShell hideNav showBack title="پخت">
      <div className="relative flex min-h-[70vh] flex-col pb-28">
        <div className="flex items-center justify-between gap-3">
          <p className="text-caption font-semibold text-atlas-ink-muted">
            مرحله {toPersianDigits(step.order)} از{" "}
            {toPersianDigits(session.totalSteps)}
          </p>
          <button
            type="button"
            aria-label="خروج از پخت"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-atlas-surface-muted"
            onClick={() => setPanel("abandon")}
          >
            <LogoutCurve size={20} color="#111111" />
          </button>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-atlas-border">
          <div
            className="h-full rounded-full bg-atlas-primary transition-all"
            style={{
              width: `${(step.order / session.totalSteps) * 100}%`,
            }}
          />
        </div>

        <div className="relative mt-4 overflow-hidden rounded-atlas-xl">
          <RecipeImage
            src={step.imageUrl}
            alt={session.recipeTitle}
            className="h-36 w-full scale-105 blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/55 to-white" />
        </div>

        <div className="relative z-10 -mt-10 flex flex-1 flex-col items-center justify-center px-2 text-center">
          <p className="max-w-[22rem] text-[1.75rem] font-extrabold leading-[2.35rem] tracking-tight text-atlas-ink sm:text-[2rem] sm:leading-[2.6rem]">
            {step.instruction}
          </p>
          {step.tip ? (
            <p className="mt-4 max-w-sm text-caption leading-6 text-atlas-ink-muted">
              نکته: {step.tip}
            </p>
          ) : null}
        </div>

        {displaySeconds !== null ? (
          <div className="mt-6 flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (timerLeft === null) {
                  setTimerLeft(step.timerSeconds ?? 300);
                }
                setTimerRunning((v) => !v);
              }}
              className="group flex flex-col items-center gap-1 rounded-atlas-xl px-4 py-2 transition active:scale-95"
              aria-label={timerRunning ? "توقف تایمر" : "شروع تایمر"}
            >
              <span
                className={`relative inline-flex h-20 w-20 items-center justify-center transition ${
                  timerRunning ? "scale-105 drop-shadow-lg" : "drop-shadow-md"
                }`}
              >
                <img
                  src="/icons/clock-3d.svg"
                  alt=""
                  width={80}
                  height={80}
                  className="pointer-events-none select-none"
                />
                {timerRunning ? (
                  <span className="absolute inset-0 animate-ping rounded-full bg-atlas-primary/15" />
                ) : null}
              </span>
              <span
                dir="ltr"
                className={`font-mono text-2xl font-bold tabular-nums tracking-wide ${
                  timerRunning ? "text-atlas-primary" : "text-atlas-ink"
                }`}
              >
                {formatDurationClock(timerLeft ?? displaySeconds)}
              </span>
              <span className="text-[11px] text-atlas-ink-faint">
                {timerRunning ? "برای توقف بزنید" : "برای شروع بزنید"}
              </span>
            </button>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        aria-label="دستیار هوشمند"
        onClick={() => setPanel("ask")}
        className="fixed bottom-28 left-5 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-[0_12px_28px_rgba(255,55,55,0.4)] transition hover:scale-105 active:scale-95"
      >
        <img src="/icons/ai-fab.svg" alt="" width={56} height={56} />
      </button>

      <BottomBar>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            size="lg"
            disabled={step.order <= 1}
            icon={<ArrowRight2 size={18} color="currentColor" />}
            onClick={() => void goPrev()}
          >
            قبلی
          </Button>
          <Button
            size="lg"
            icon={
              step.order >= session.totalSteps ? (
                <TickCircle size={18} color="currentColor" />
              ) : (
                <ArrowLeft2 size={18} color="currentColor" />
              )
            }
            onClick={() => void goNext()}
          >
            {step.order >= session.totalSteps ? "اتمام پخت" : "مرحله بعد"}
          </Button>
        </div>
      </BottomBar>

      {panel === "ask" ? (
        <Modal onClose={() => setPanel("none")} title="دستیار هوشمند">
          <div className="space-y-4">
            {helpReply ? (
              <div className="rounded-atlas bg-zinc-50 px-4 py-3 text-body leading-7 text-atlas-ink">
                {helpReply}
              </div>
            ) : (
              <p className="text-caption text-atlas-ink-muted">
                سؤال بپرسید یا برای مشکل فوری یکی از گزینه‌های SOS را بزنید.
              </p>
            )}

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-caption font-semibold text-atlas-danger">
                <Danger size={14} color="currentColor" />
                کمک فوری (SOS)
              </p>
              <div className="flex flex-wrap gap-2">
                {sosIssues.map((issue) => (
                  <button
                    key={issue.code}
                    type="button"
                    className="rounded-full border border-atlas-border bg-white px-3 py-1.5 text-caption text-atlas-ink hover:border-atlas-danger hover:bg-atlas-danger-soft"
                    onClick={async () => {
                      const res = await atlasClient.sendSos(
                        session.id,
                        issue.code,
                      );
                      setHelpReply(res.reply);
                    }}
                  >
                    {issue.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <textarea
                value={askText}
                onChange={(e) => setAskText(e.target.value)}
                rows={2}
                className="min-h-[48px] flex-1 resize-none rounded-atlas border border-atlas-border bg-atlas-surface-muted p-3 text-body outline-none focus:border-atlas-primary"
                placeholder="سؤال خود را بپرسید…"
              />
              <Button
                className="shrink-0 self-end"
                disabled={!askText.trim() || sending}
                icon={<Send2 size={18} color="currentColor" />}
                onClick={() => void sendAsk()}
              >
                ارسال
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}

      {panel === "abandon" ? (
        <Modal onClose={() => setPanel("none")} title="خروج از پخت">
          <p className="text-body text-atlas-ink-muted">
            بازخورد اختیاری است. می‌توانید بدون توضیح خارج شوید.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="tertiary" onClick={() => setPanel("none")}>
              ادامه پخت
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                await atlasClient.abandonSession(session.id);
                router.push("/home");
              }}
            >
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
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="بستن"
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-t-atlas-xl border border-atlas-border bg-atlas-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-atlas sm:rounded-atlas-xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-h3 text-atlas-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-atlas-ink-muted hover:bg-atlas-surface-muted"
          >
            <CloseCircle size={24} color="currentColor" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
