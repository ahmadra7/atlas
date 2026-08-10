import type { Difficulty, MatchTier, MealType } from "@atlas/contracts";

/** Persian ingredient normalization per content spec. */
export function normalizePersian(input: string): string {
  return input
    .trim()
    .replace(/\u200c/g, " ")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("fa");
}

export function toPersianDigits(value: string | number): string {
  const map = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(value).replace(/\d/g, (d) => map[Number(d)] ?? d);
}

export function formatMinutesFa(minutes: number): string {
  return `${toPersianDigits(minutes)} دقیقه`;
}

export const difficultyLabelFa: Record<Difficulty, string> = {
  easy: "آسان",
  medium: "متوسط",
  hard: "سخت",
};

export const mealLabelFa: Record<MealType, string> = {
  breakfast: "صبحانه",
  lunch: "ناهار",
  dinner: "شام",
  snack: "میان‌وعده",
  any: "همه",
};

export const matchTierLabelFa: Record<MatchTier, string> = {
  exact: "دقیقاً با مواد من",
  near: "یک ماده کم",
  discovery: "چند ماده کم / کشف",
};

export function formatDurationClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${toPersianDigits(String(m).padStart(2, "0"))}:${toPersianDigits(
    String(s).padStart(2, "0"),
  )}`;
}
