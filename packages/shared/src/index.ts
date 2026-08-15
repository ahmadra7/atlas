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

/**
 * Loose equivalence for pantry matching:
 * «گوجه» ≈ «گوجه فرنگی», but not «رب گوجه فرنگی» / «سس گوجه».
 */
export function ingredientsLooselyMatch(a: string, b: string): boolean {
  const na = normalizePersian(a);
  const nb = normalizePersian(b);
  if (!na || !nb) return false;
  if (na === nb) return true;

  const shorter = na.length <= nb.length ? na : nb;
  const longer = na.length > nb.length ? na : nb;
  if (shorter.length < 3) return false;

  const productPrefixes = [
    "رب ",
    "سس ",
    "اب ",
    "آب ",
    "پوره ",
    "کنسرو ",
    "زرده ",
    "سفیده ",
    "پودر ",
  ];
  if (productPrefixes.some((p) => longer.startsWith(normalizePersian(p)))) {
    return false;
  }

  return longer === shorter || longer.startsWith(`${shorter} `);
}

/** Salt / pepper / common spices — ignore when counting missing ingredients. */
export function isPantryStaple(name: string): boolean {
  const n = normalizePersian(name);
  if (!n) return false;

  // Fresh peppers / vegetables — not pantry staples
  if (
    n.includes("فلفل دلمه") ||
    n.includes("فلفل سبز") ||
    n.includes("فلفل تازه") ||
    n.includes("فلفل کبابی")
  ) {
    return false;
  }

  if (
    n === "فلفل" ||
    n.startsWith("فلفل سیاه") ||
    n.startsWith("فلفل سفید") ||
    n.startsWith("فلفل قرمز") ||
    n.startsWith("فلفل شیرین") ||
    n.includes("پودر فلفل")
  ) {
    return true;
  }

  if (n === "نمک" || n.startsWith("نمک ") || n.startsWith("نمک")) {
    return true;
  }

  if (n === "ادویه" || n.startsWith("ادویه")) {
    return true;
  }

  const spices = [
    "زردچوبه",
    "زعفران",
    "دارچین",
    "زیره",
    "سماق",
    "پاپریکا",
    "میخک",
    "هل",
    "وانیل",
    "بکینگ پودر",
    "بیکینگ پودر",
    "جوش شیرین",
    "پودر سیر",
    "پودر پیاز",
    "آویشن",
    "پونه",
    "گلپر",
    "رازیانه",
    "پودر کاری",
    "کاری",
    "چوب دارچین",
    "پودر خردل",
    "دانه خردل",
    "میخک سبز",
    "جوز هندی",
    "میخک خشک",
  ];

  return spices.some((s) => {
    if (n === s || n.startsWith(`${s} `)) return true;
    // Avoid short false-positives (e.g. هل → هلو)
    return s.length >= 4 && n.startsWith(s);
  });
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
