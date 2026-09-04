"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Call, Login, Sms } from "iconsax-react";
import { toPersianDigits } from "@atlas/shared";
import { useAuth } from "@/components/auth/AuthProvider";
import { instantReplace } from "@/components/navigation/InstantNav";
import { BackButton } from "@/components/ui/BackButton";
import { atlasClient } from "@/lib/client";
import { persistAuthSession, safeNextPath } from "@/lib/auth-session";
import {
  beginGoogleLogin,
  fetchGoogleProfile,
  readGoogleRedirectToken,
  clearGoogleRedirectHash,
} from "@/lib/google-auth";
import { formatIranMobile, normalizeIranMobile } from "@/lib/phone";

function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.3 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.3 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.5 5.6-6.6 7.1l6.3 5.3C38.3 37.3 44 32 44 24c0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}

function authErrorFa(err: unknown): string {
  const code = err instanceof Error ? err.message : "";
  if (code.includes("INVALID_PHONE")) return "شماره موبایل را درست وارد کنید.";
  if (code.includes("OTP_RATE_LIMIT"))
    return "کد قبلاً ارسال شده. کمی بعد دوباره تلاش کنید.";
  if (code.includes("OTP_EXPIRED")) return "کد منقضی شده. دوباره ارسال کنید.";
  if (code.includes("OTP_INVALID")) return "کد تأیید نادرست است.";
  if (code.includes("OTP_LOCKED"))
    return "تعداد تلاش بیش از حد بود. دوباره کد بگیرید.";
  if (code.includes("OTP_NOT_FOUND")) return "ابتدا کد تأیید را دریافت کنید.";
  if (code.includes("GOOGLE_NOT_CONFIGURED"))
    return "گوگل هنوز این اپ را نمی‌شناسد، برای همین صفحه جیمیل باز نمی‌شود.";
  if (code.includes("GOOGLE_CANCELLED")) return "ورود گوگل لغو شد.";
  if (code.includes("GOOGLE")) return "ورود با گوگل انجام نشد. دوباره تلاش کنید.";
  return "مشکلی پیش آمد. دوباره تلاش کنید.";
}

function AuthScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, signIn } = useAuth();
  const nextPath = safeNextPath(searchParams.get("next"));
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const normalized = useMemo(() => normalizeIranMobile(phone), [phone]);
  const otpValue = otp.join("");

  useEffect(() => {
    if (isAuthenticated) instantReplace(router, nextPath);
  }, [isAuthenticated, nextPath, router]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setTimeout(() => setResendIn((v) => v - 1), 1000);
    return () => window.clearTimeout(id);
  }, [resendIn]);

  useEffect(() => {
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  async function finishLogin(accessToken: string, user: Parameters<typeof signIn>[0]["user"]) {
    persistAuthSession({ accessToken, user });
    signIn({ accessToken, user });
    instantReplace(router, nextPath);
  }

  async function completeGoogle(accessToken: string) {
    const profile = await fetchGoogleProfile(accessToken);
    const result = await atlasClient.loginWithGoogle({
      accessToken,
      googleId: profile.googleId,
      email: profile.email,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
    });
    await finishLogin(result.accessToken, result.user);
  }

  useEffect(() => {
    const token = readGoogleRedirectToken();
    if (!token) return;
    clearGoogleRedirectHash();
    setGoogleBusy(true);
    void completeGoogle(token)
      .catch((err) => setError(authErrorFa(err)))
      .finally(() => setGoogleBusy(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendCode() {
    if (!normalized || busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await atlasClient.requestOtp(normalized);
      setDebugCode(result.debugCode ?? null);
      setOtp(["", "", "", "", ""]);
      setResendIn(result.resendInSec);
      setStep("otp");
      window.setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch (err) {
      setError(authErrorFa(err));
    } finally {
      setBusy(false);
    }
  }

  async function confirmCode(code = otpValue) {
    if (!normalized || code.length !== 5 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await atlasClient.verifyOtp(normalized, code);
      await finishLogin(result.accessToken, result.user);
    } catch (err) {
      setError(authErrorFa(err));
      setOtp(["", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setBusy(false);
    }
  }

  async function googleLogin() {
    if (googleBusy) return;
    setGoogleBusy(true);
    setError(null);
    try {
      await beginGoogleLogin();
    } catch (err) {
      setError(authErrorFa(err));
      setGoogleBusy(false);
    }
  }

  function onOtpChange(index: number, raw: string) {
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      setOtp((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }
    if (digits.length > 1) {
      const chars = digits.slice(0, 5).split("");
      const next = ["", "", "", "", ""];
      chars.forEach((ch, i) => {
        next[i] = ch;
      });
      setOtp(next);
      const focusAt = Math.min(chars.length, 4);
      otpRefs.current[focusAt]?.focus();
      if (chars.length === 5) void confirmCode(chars.join(""));
      return;
    }
    setOtp((prev) => {
      const next = [...prev];
      next[index] = digits;
      return next;
    });
    if (index < 4) otpRefs.current[index + 1]?.focus();
    const assembled = otp.map((v, i) => (i === index ? digits : v)).join("");
    if (assembled.length === 5) void confirmCode(assembled);
  }

  function onOtpKeyDown(index: number, key: string) {
    if (key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  return (
    <div className="atlas-phone relative mx-auto flex h-svh max-h-svh w-full max-w-md !min-h-0 flex-col overflow-hidden bg-atlas-background">
      <div className="pointer-events-none absolute -left-16 top-10 h-48 w-48 rounded-full bg-atlas-primary/12 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-24 h-56 w-56 rounded-full bg-[#F5C400]/20 blur-3xl" />

      <header className="relative z-10 flex shrink-0 items-center justify-between px-4 pb-1 pt-4">
        <div className="w-10" />
        <p className="text-[15px] font-medium text-atlas-ink">ورود | ثبت‌نام</p>
        <BackButton href="/home" />
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden px-5 pb-4 pt-3">
        <div className="flex shrink-0 flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/avatars/chef-character.png?v=4"
            alt=""
            className="h-[5rem] w-auto object-contain drop-shadow-[0_5px_12px_rgba(20,40,80,0.10)]"
          />
          <h1 className="mt-2 text-[16px] font-semibold text-atlas-ink">
            {step === "phone" ? "کاربر گرامی خوش آمدید" : "کد تأیید"}
          </h1>
          {step === "otp" ? (
            <p className="mt-2 max-w-[17rem] text-[13px] font-normal leading-6 text-atlas-ink-muted">
              کد ۵ رقمی ارسال‌شده به {toPersianDigits(formatIranMobile(normalized ?? phone))} را وارد کنید.
            </p>
          ) : null}
        </div>

        {step === "phone" ? (
          <form
            className="mt-5 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void sendCode();
            }}
          >
            <label className="block text-right">
              <span className="mb-2 block text-[12px] font-medium text-atlas-ink-muted">
                شماره موبایل
              </span>
              <span className="flex h-12 items-center gap-2 rounded-2xl border border-atlas-border bg-atlas-surface px-3 focus-within:border-atlas-primary dark:border-white/15">
                <Call size={18} color="currentColor" className="text-atlas-ink-muted" />
                <input
                  dir="ltr"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="0912 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-full w-full bg-transparent text-left text-[16px] font-medium tracking-wide text-atlas-ink outline-none"
                />
              </span>
            </label>
            <button
              type="submit"
              disabled={!normalized || busy}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-atlas bg-atlas-primary text-[15px] font-semibold text-white shadow-sm transition hover:bg-atlas-primary-hover disabled:bg-atlas-border disabled:text-atlas-ink-faint"
            >
              <Sms size={20} color="currentColor" variant="Bold" />
              {busy ? "در حال ارسال..." : "دریافت کد تأیید"}
            </button>
          </form>
        ) : (
          <div className="mt-5 space-y-5">
            {debugCode ? (
              <div className="rounded-2xl border border-[#F5C400]/40 bg-[#F5C400]/12 px-4 py-3 text-right">
                <p className="text-[11px] font-medium text-atlas-ink-muted">
                  پیامک سرآشپز هوشمند
                </p>
                <p className="mt-1 text-[14px] font-semibold text-atlas-ink">
                  کد تأیید شما: {toPersianDigits(debugCode)}
                </p>
              </div>
            ) : null}
            <div dir="ltr" className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpRefs.current[index] = el;
                  }}
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={digit}
                  onChange={(e) => onOtpChange(index, e.target.value)}
                  onKeyDown={(e) => onOtpKeyDown(index, e.key)}
                  className="h-12 w-12 rounded-2xl border border-atlas-border bg-atlas-surface text-center text-[22px] font-bold text-atlas-ink outline-none focus:border-atlas-primary dark:border-white/15"
                />
              ))}
            </div>
            <button
              type="button"
              disabled={otpValue.length !== 5 || busy}
              onClick={() => void confirmCode()}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-atlas bg-atlas-primary text-[15px] font-semibold text-white shadow-sm transition hover:bg-atlas-primary-hover disabled:bg-atlas-border disabled:text-atlas-ink-faint"
            >
              <Login size={20} color="currentColor" variant="Linear" />
              {busy ? "در حال ورود..." : "تأیید و ورود"}
            </button>
            <div className="flex items-center justify-between text-[12px] text-atlas-ink-muted">
              <button
                type="button"
                className="font-medium text-atlas-primary"
                onClick={() => {
                  setStep("phone");
                  setError(null);
                  setDebugCode(null);
                }}
              >
                تغییر شماره
              </button>
              {resendIn > 0 ? (
                <span>ارسال دوباره تا {toPersianDigits(resendIn)} ثانیه</span>
              ) : (
                <button
                  type="button"
                  className="font-medium text-atlas-ink"
                  onClick={() => void sendCode()}
                >
                  ارسال دوباره کد
                </button>
              )}
            </div>
          </div>
        )}

        {error ? (
          <p className="mt-4 text-center text-[12px] font-medium text-atlas-danger">
            {error}
          </p>
        ) : null}

        {step === "phone" ? (
          <>
            <div className="my-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-atlas-border dark:bg-white/10" />
              <span className="text-[12px] text-atlas-ink-faint">یا</span>
              <span className="h-px flex-1 bg-atlas-border dark:bg-white/10" />
            </div>
            <button
              type="button"
              onClick={() => void googleLogin()}
              disabled={googleBusy}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-atlas border border-atlas-border bg-white text-[14px] font-semibold text-atlas-ink shadow-[0_8px_20px_rgba(17,17,17,0.04)] transition hover:bg-atlas-surface-muted active:scale-[0.99] disabled:opacity-60 dark:border-white/15 dark:bg-atlas-surface"
            >
              <GoogleMark />
              {googleBusy ? "در حال اتصال به گوگل..." : "ورود با Gmail"}
            </button>
            <p className="mt-2 text-center text-[11px] leading-5 text-atlas-ink-faint">
              با ورود، نام و عکس پروفایل از حساب گوگل خوانده می‌شود.
            </p>
          </>
        ) : null}

        <p className="mt-auto shrink-0 pt-3 text-center text-[11px] leading-5 text-atlas-ink-faint">
          ادامه به‌معنای پذیرش قوانین استفاده از سرآشپز هوشمند است.
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="atlas-phone min-h-svh bg-atlas-background" />
      }
    >
      <AuthScreen />
    </Suspense>
  );
}
