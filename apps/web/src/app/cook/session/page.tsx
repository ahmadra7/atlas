"use client";

import type { ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import type { CookingSession } from "@atlas/contracts";
import { formatDurationClock, toPersianDigits } from "@atlas/shared";
import {
  ArrowLeft2,
  ArrowRight2,
  CloseCircle,
  Danger,
  Home2,
  LampOn,
  LogoutCurve,
  Send2,
  TickCircle,
  VolumeHigh,
  VolumeSlash,
} from "iconsax-react";
import { BrandMark } from "@/components/brand/BrandMark";
import { AppShell } from "@/components/layout/AppShell";
import { BottomBar } from "@/components/ui/BottomBar";
import { Button } from "@/components/ui/Button";
import { CookSkeleton } from "@/components/ui/Skeleton";
import { StateView } from "@/components/ui/StateView";
import { RecipeImage } from "@/components/recipe/RecipeImage";
import { instantPush } from "@/components/navigation/InstantNav";
import { atlasClient } from "@/lib/client";
import {
  buildStepSpeech,
  getVoiceStepsEnabled,
  preloadSpeechVoices,
  setVoiceStepsEnabled,
  speakPersian,
  stopSpeaking,
} from "@/lib/speak";

const sosIssues = [
  { code: "too_salty", label: "شور شده" },
  { code: "burning", label: "سوخته / داره می‌سوزه" },
  { code: "undercooked", label: "خام مونده" },
  { code: "missing_tool", label: "ابزار ندارم" },
  { code: "other", label: "مشکل دیگر" },
];

type Panel = "none" | "ask" | "abandon";

function CookingPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("id")?.trim() ?? "";
  const voiceParam = searchParams.get("voice");
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
  const [filledStars, setFilledStars] = useState(0);
  const [ratingLocked, setRatingLocked] = useState(false);
  const [askReason, setAskReason] = useState(false);
  const [reasonText, setReasonText] = useState("");
  const [voiceSteps, setVoiceSteps] = useState(
    () => voiceParam === "1" || voiceParam === "true",
  );
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    preloadSpeechVoices();
  }, []);

  useEffect(() => {
    if (voiceParam === "1" || voiceParam === "true") {
      setVoiceSteps(true);
      setVoiceStepsEnabled(true);
      return;
    }
    if (voiceParam === "0" || voiceParam === "false") {
      setVoiceSteps(false);
      setVoiceStepsEnabled(false);
      return;
    }
    setVoiceSteps(getVoiceStepsEnabled());
  }, [voiceParam]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!sessionId) {
        setError("نشست پخت پیدا نشد.");
        setLoading(false);
        return;
      }
      try {
        const data = await atlasClient.getCookingSession(sessionId);
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
  }, [sessionId]);

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

  function speakCurrentStep() {
    if (!step?.instruction) return;
    const text = buildStepSpeech(step.instruction, step.tip);
    setSpeaking(true);
    void speakPersian(text).finally(() => setSpeaking(false));
  }

  useEffect(() => {
    if (!voiceSteps || !step?.instruction || session?.status === "completed") {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    const timer = window.setTimeout(() => {
      speakCurrentStep();
    }, 280);
    return () => {
      window.clearTimeout(timer);
      stopSpeaking();
      setSpeaking(false);
    };
    // Intentionally keyed by step identity + voice toggle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceSteps, step?.id, step?.instruction, step?.tip, session?.status]);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    if (session?.status !== "completed") return;
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [session?.status]);

  async function goNext() {
    if (!session || !step) return;
    if (step.order >= session.totalSteps) {
      setSession(await atlasClient.completeSession(session.id));
      return;
    }
    setSession(await atlasClient.completeStep(session.id, step.order));
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
        <CookSkeleton />
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
          onAction={() => instantPush(router, "/home")}
        />
      </AppShell>
    );
  }

  if (session.status === "completed") {
    function finishAndGoHome() {
      instantPush(router, "/home");
    }

    function handleRate(n: number) {
      if (ratingLocked) return;
      setRatingLocked(true);
      setFilledStars(0);
      for (let i = 1; i <= n; i += 1) {
        window.setTimeout(() => setFilledStars(i), i * 140);
      }
      const low = n <= 3;
      window.setTimeout(() => {
        if (low) {
          setAskReason(true);
          return;
        }
        finishAndGoHome();
      }, n * 140 + (low ? 400 : 2200));
    }

    return (
      <AppShell hideNav showBack backHref="/home" title="اتمام پخت" lockScroll>
        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-2 text-center">
            <div
              className={`mx-auto flex items-center justify-center rounded-full bg-gradient-to-b from-amber-50 to-orange-50 shadow-[0_8px_24px_rgba(245,158,11,0.18)] ring-1 ring-amber-100 ${
                askReason ? "h-14 w-14 text-3xl" : "h-20 w-20 text-4xl"
              }`}
            >
              🎉
            </div>
            <h1
              className={`text-atlas-ink ${askReason ? "mt-3 text-h2" : "mt-5 text-h1"}`}
            >
              پخت تمام شد!
            </h1>
            {askReason ? null : (
              <p className="mt-2 max-w-xs text-body leading-7 text-atlas-ink-muted">
                «{session.recipeTitle}» آماده است.
                <br />
                به نظرت چطور از آب دراومد؟
              </p>
            )}

            <div
              className={`flex items-center justify-center gap-3 ${askReason ? "mt-4" : "mt-7"}`}
            >
              {[1, 2, 3, 4, 5].map((n) => {
                const on = filledStars >= n;
                return (
                  <button
                    key={n}
                    type="button"
                    disabled={ratingLocked}
                    onClick={() => handleRate(n)}
                    aria-label={`${toPersianDigits(n)} ستاره`}
                    className={`transition-all duration-300 ease-out disabled:cursor-default ${
                      on
                        ? "scale-125 opacity-100 drop-shadow-[0_6px_10px_rgba(245,158,11,0.45)]"
                        : ratingLocked
                          ? "scale-95 opacity-25"
                          : "scale-100 opacity-40 hover:scale-105 hover:opacity-70"
                    }`}
                  >
                    <svg
                      width="36"
                      height="36"
                      viewBox="0 0 24 24"
                      aria-hidden
                      className={`transition-[fill,stroke,transform] duration-300 ease-out ${
                        on ? "animate-[starPop_0.35s_ease-out]" : ""
                      }`}
                    >
                      <path
                        d="M12 3.1c.28 0 .52.16.63.42l1.72 4.1c.2.48.64.82 1.16.9l4.4.5c.66.07.93.9.43 1.34l-3.35 2.95c-.4.35-.58.9-.45 1.4l1.02 4.3c.15.64-.54 1.14-1.1.8l-3.72-2.3a1.35 1.35 0 0 0-1.48 0l-3.72 2.3c-.56.34-1.25-.16-1.1-.8l1.02-4.3c.13-.5-.05-1.05-.45-1.4L3.66 10.36c-.5-.44-.23-1.27.43-1.34l4.4-.5c.52-.08.96-.42 1.16-.9l1.72-4.1A.7.7 0 0 1 12 3.1Z"
                        fill={on ? "#FBBF24" : "#E4E4E7"}
                        stroke={on ? "#F59E0B" : "#D4D4D8"}
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                );
              })}
            </div>

            {askReason ? (
              <div className="mt-5 w-full max-w-sm pb-3">
                <p className="text-center text-[16px] font-medium leading-7 text-atlas-ink">
                  مشکل چی بود؟
                </p>
                <textarea
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  rows={2}
                  className="mt-3 w-full resize-none rounded-atlas border border-atlas-border bg-atlas-surface p-3 text-center text-body text-atlas-ink outline-none focus:border-atlas-primary dark:bg-atlas-surface-muted"
                  placeholder="مثلاً طعم، زمان پخت، مراحل…"
                />
                <Button className="mt-3 w-full" onClick={finishAndGoHome}>
                  ثبت
                </Button>
              </div>
            ) : ratingLocked ? (
              <p className="mt-4 text-caption font-medium text-amber-700">
                ممنون از امتیازت!
              </p>
            ) : null}
          </div>

          <div className="shrink-0 bg-atlas-background px-2 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Button
              variant="tertiary"
              className="mx-auto w-full max-w-xs font-medium"
              disabled={ratingLocked && !askReason}
              iconEnd
              icon={<Home2 size={18} color="currentColor" />}
              onClick={finishAndGoHome}
            >
              بازگشت به خانه
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  const displaySeconds = timerLeft ?? step.timerSeconds ?? null;

  return (
    <AppShell hideNav showBack title="پخت">
      <div className="relative flex min-h-[70vh] flex-col pb-28">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              role="switch"
              aria-checked={voiceSteps}
              aria-label="پخش مراحل با صدا"
              onClick={() => {
                const next = !voiceSteps;
                setVoiceSteps(next);
                setVoiceStepsEnabled(next);
                if (!next) {
                  stopSpeaking();
                  setSpeaking(false);
                }
              }}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-caption font-semibold transition ${
                voiceSteps
                  ? "bg-atlas-primary-soft text-atlas-primary"
                  : "text-atlas-ink-muted hover:bg-atlas-surface-muted"
              }`}
            >
              {voiceSteps ? (
                <VolumeHigh size={18} color="currentColor" variant="Bold" />
              ) : (
                <VolumeSlash size={18} color="currentColor" variant="Linear" />
              )}
              <span>{voiceSteps ? "صدا روشن" : "صدا خاموش"}</span>
            </button>
            <button
              type="button"
              aria-label="تکرار خواندن مرحله"
              disabled={!step?.instruction}
              onClick={() => {
                if (!voiceSteps) {
                  setVoiceSteps(true);
                  setVoiceStepsEnabled(true);
                }
                speakCurrentStep();
              }}
              className="inline-flex items-center gap-1 rounded-full border border-atlas-border bg-atlas-surface px-2.5 py-1.5 text-caption font-semibold text-atlas-ink transition hover:bg-atlas-surface-muted disabled:opacity-45"
            >
              <VolumeHigh size={16} color="currentColor" variant="Bold" />
              <span>{speaking ? "تکرار دوباره" : "تکرار"}</span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => setPanel("abandon")}
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-caption font-semibold text-atlas-ink hover:bg-atlas-surface-muted"
          >
            <LogoutCurve size={18} color="#111111" />
            <span>خروج از پخت</span>
          </button>
        </div>

        <div className="mt-4 flex flex-col items-center gap-3">
          <div className="relative w-full overflow-hidden rounded-atlas-xl">
            <RecipeImage
              src={step.imageUrl}
              alt={session.recipeTitle}
              className="h-44 w-full"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent px-3 pb-3 pt-10">
              <div className="flex items-center justify-between gap-3 text-white">
                <p className="text-caption font-medium tracking-wide">
                  مرحله {toPersianDigits(step.order)} از{" "}
                  {toPersianDigits(session.totalSteps)}
                </p>
                <p className="text-caption font-semibold tabular-nums">
                  {toPersianDigits(
                    Math.round((step.order / session.totalSteps) * 100),
                  )}
                  ٪
                </p>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/30">
                <div
                  className="h-full rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.55)] transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.max(
                      8,
                      (step.order / session.totalSteps) * 100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-10 flex flex-1 flex-col items-center justify-end px-2 pb-2 text-center">
          <p className="max-w-[22rem] text-[17px] font-medium leading-8 text-atlas-ink">
            {step.instruction}
          </p>
          {step.tip ? (
            <div className="mt-4 inline-flex max-w-sm items-center gap-2 rounded-full bg-amber-50 px-3.5 py-2 text-right ring-1 ring-inset ring-amber-200/80">
              <LampOn
                size={16}
                color="#D97706"
                variant="Bold"
                className="shrink-0"
              />
              <p className="text-caption font-medium leading-5 text-amber-800">
                {step.tip}
              </p>
            </div>
          ) : null}
        </div>

        {displaySeconds !== null ? (
          <div className="mt-4 flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (timerLeft === null) {
                  setTimerLeft(step.timerSeconds ?? 300);
                }
                setTimerRunning((v) => !v);
              }}
              className="group flex flex-col items-center gap-2.5 rounded-atlas-xl px-4 py-2 transition active:scale-95"
              aria-label={timerRunning ? "توقف تایمر" : "شروع تایمر"}
            >
              <span
                className={`relative inline-flex h-14 w-14 items-center justify-center transition ${
                  timerRunning ? "scale-105 drop-shadow-lg" : "drop-shadow-md"
                }`}
              >
                <img
                  src="/icons/alarm-clock-3d.png"
                  alt=""
                  width={56}
                  height={56}
                  className="pointer-events-none select-none object-contain"
                />
                {timerRunning ? (
                  <span className="absolute inset-0 animate-ping rounded-full bg-atlas-primary/15" />
                ) : null}
              </span>
              <span
                dir="ltr"
                className={`mt-0.5 text-xl font-bold tracking-[0.08em] ${
                  timerRunning ? "text-atlas-primary" : "text-atlas-ink"
                }`}
              >
                {formatDurationClock(timerLeft ?? displaySeconds)}
              </span>
              <span className="text-caption text-atlas-ink-faint">
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
        className="fixed bottom-28 left-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_12px_28px_rgba(17,17,17,0.18)] ring-1 ring-zinc-200 transition hover:scale-105 active:scale-95"
      >
        <BrandMark size={40} />
      </button>

      <BottomBar>
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="lg"
            iconEnd={step.order < session.totalSteps}
            icon={
              step.order >= session.totalSteps ? (
                <TickCircle size={18} color="currentColor" />
              ) : (
                <ArrowLeft2
                  size={18}
                  color="currentColor"
                  className="-scale-x-100"
                />
              )
            }
            onClick={() => void goNext()}
          >
            {step.order >= session.totalSteps ? "اتمام پخت" : "مرحله بعد"}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            disabled={step.order <= 1}
            icon={
              <ArrowRight2
                size={18}
                color="currentColor"
                className="-scale-x-100"
              />
            }
            onClick={() => void goPrev()}
          >
            مرحله قبل
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
                instantPush(router, "/home");
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
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="بستن"
        className={`absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity duration-300 ease-out ${
          entered ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 w-full max-w-md rounded-t-atlas-xl border border-atlas-border bg-atlas-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-atlas transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          entered ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-zinc-300" />
        <div className="relative mb-4 flex items-center justify-center">
          <h2 className="text-center text-h3 text-atlas-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="absolute left-0 inline-flex h-9 w-9 items-center justify-center rounded-full text-atlas-ink-muted hover:bg-atlas-surface-muted"
          >
            <CloseCircle size={24} color="currentColor" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function CookingPage() {
  return (
    <Suspense
      fallback={
        <AppShell hideNav showBack backHref="/home" title="پخت">
          <CookSkeleton />
        </AppShell>
      }
    >
      <CookingPageContent />
    </Suspense>
  );
}
