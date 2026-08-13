import type {
  DietMode,
  Difficulty,
  DishType,
  MatchTier,
  MealType,
} from "@atlas/contracts";

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

/** Local-time greeting bands for home header. */
export function greetingFa(date = new Date()): string {
  const minutes = date.getHours() * 60 + date.getMinutes();
  // 03:00–11:00 صبح | 11:00–15:00 ظهر | 15:00–19:00 عصر | 19:00–03:00 شب
  if (minutes >= 3 * 60 && minutes < 11 * 60) return "صبح بخیر";
  if (minutes >= 11 * 60 && minutes < 15 * 60) return "ظهر بخیر";
  if (minutes >= 15 * 60 && minutes < 19 * 60) return "عصر بخیر";
  return "شب بخیر";
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

export const dietModeLabelFa: Record<DietMode, string> = {
  any: "همه",
  diet: "رژیمی",
  regular: "غیر رژیمی",
};

export const dishTypeLabelFa: Record<DishType, string> = {
  any: "همه",
  main: "غذای اصلی",
  appetizer: "پیش‌غذا",
  soup: "سوپ و آش",
  salad: "سالاد",
  dessert: "دسر",
  sweet: "شیرینی",
  drink: "نوشیدنی",
  side: "مخلفات",
  fast: "فست‌فود",
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
