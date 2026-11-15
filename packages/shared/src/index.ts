import type {
  DietMode,
  Difficulty,
  DishType,
  MatchTier,
  MealType,
} from "@atlas/contracts";
import { FOOD_ALIASES, FOOD_NAMES } from "./foodIngredients";

export { FOOD_ALIASES, FOOD_NAMES } from "./foodIngredients";

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
export function compactPersian(input: string): string {
  return normalizePersian(input).replace(/\s+/g, "");
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
  if (compactPersian(na) === compactPersian(nb)) return true;

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

const FRESH_PEPPER_HINTS = [
  "فلفل دلمه",
  "فلفل سبز",
  "فلفل تازه",
  "فلفل کبابی",
  "هالوپینو",
];

/** Dry spices / salt / pepper — never count these as missing in recommendations. */
const SPICE_PHRASES = [
  "نمک",
  "ادویه",
  "فلفل سیاه",
  "فلفل سفید",
  "فلفل قرمز",
  "فلفل شیرین",
  "فلفل تند",
  "فلفل چیلی",
  "پودر فلفل",
  "زردچوبه",
  "زعفران",
  "دارچین",
  "چوب دارچین",
  "زیره",
  "سماق",
  "پاپریکا",
  "میخک",
  "هل",
  "وانیل",
  "بکینگ پودر",
  "بیکینگ پودر",
  "بیکینگپودر",
  "جوش شیرین",
  "پودر سیر",
  "پودر پیاز",
  "آویشن",
  "پونه",
  "گلپر",
  "رازیانه",
  "پودر کاری",
  "کاری",
  "پودر خردل",
  "دانه خردل",
  "جوز هندی",
  "برگ بو",
  "سیاهدانه",
  "سیاه دانه",
  "نعناع خشک",
  "جعفری خشک",
  "گشنیز خشک",
  "سبزی خشک",
];

/** Everyday cooking fats / water — treated like spices for pantry matching. */
const COOKING_STAPLE_PHRASES = [
  "روغن سرخ کردنی",
  "روغن سرخ‌کردنی",
  "روغن زیتون",
  "روغن کنجد",
  "روغن گیاهی",
  "روغن نباتی",
  "روغن آفتابگردان",
  "روغن آفتاب گردان",
  "روغن کانولا",
  "روغن مایع",
  "روغن جامد",
  "روغن ذرت",
  "روغن حیوانی",
  "مارگارین",
  "روغن",
  "آب",
  "اب",
];

const NON_STAPLE_FAT_HINTS = ["بادام", "فندق", "پسته", "شکلات"];

const MEASURE_RE =
  /به مقدار لازم|به میزان لازم|به اندازه لازم|بر حسب ذائقه|برحسب ذائقه|به دلخواه|\d+(?:[./]\d+)?|قاشق(?: چایخوری| غذاخوری)?|نوک قاشق|پیمانه|فنجان|لیوان|گرم|کیلو(?:گرم)?|سی سی|میلی ?لیتر|عدد|بسته|کمی|اندکی|مقداری|کافی/g;

function stripMeasures(n: string): string {
  return n
    .replace(MEASURE_RE, " ")
    .replace(/(^|\s)(یک|دو|سه|چهار|نیم|چند|مقدار)(\s|$)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const SPICE_PHRASES_BY_LENGTH = [...SPICE_PHRASES].sort(
  (a, b) => b.length - a.length,
);
const COOKING_STAPLE_BY_LENGTH = [...COOKING_STAPLE_PHRASES].sort(
  (a, b) => b.length - a.length,
);

function phraseHasSpice(phrase: string): boolean {
  if (!phrase) return false;
  if (phrase === "فلفل") return true;
  return SPICE_PHRASES_BY_LENGTH.some((spice) => {
    if (phrase === spice) return true;
    if (phrase.startsWith(`${spice} `)) return true;
    return spice.length >= 4 && phrase.startsWith(spice);
  });
}

function phraseIsCookingFatOrWater(phrase: string): boolean {
  if (!phrase) return false;
  if (NON_STAPLE_FAT_HINTS.some((hint) => phrase.includes(hint))) return false;
  if (
    phrase === "کره" ||
    phrase.startsWith("کره ") ||
    phrase.startsWith("کره")
  ) {
    return !NON_STAPLE_FAT_HINTS.some((hint) => phrase.includes(hint));
  }
  return COOKING_STAPLE_BY_LENGTH.some((item) => {
    if (phrase === item) return true;
    if (phrase.startsWith(`${item} `)) return true;
    return item.length >= 3 && phrase.startsWith(item);
  });
}

function phraseIsPantryStaple(phrase: string): boolean {
  return phraseHasSpice(phrase) || phraseIsCookingFatOrWater(phrase);
}

/**
 * Salt / pepper / spices / everyday oil & water —
 * ignore when counting missing ingredients for recommendations.
 */
export function isPantryStaple(name: string): boolean {
  const n = normalizePersian(name);
  if (!n) return false;
  if (FRESH_PEPPER_HINTS.some((hint) => n.includes(hint))) return false;

  const stripped = stripMeasures(n);
  const chunks = (stripped || n)
    .split(/\s+و\s+|[،,]/)
    .map((part) => stripMeasures(part))
    .filter(Boolean);
  const parts = chunks.length > 0 ? chunks : [n];
  return parts.every(phraseIsPantryStaple);
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

const FOOD_KEYS = new Set(
  FOOD_NAMES.map((name) => normalizePersian(name)).filter((n) => n.length >= 2),
);

const FOOD_COMPACT = new Map<string, string>();
for (const name of FOOD_NAMES) {
  const compact = compactPersian(name);
  if (compact.length >= 2 && !FOOD_COMPACT.has(compact)) {
    FOOD_COMPACT.set(compact, name);
  }
}

const ALIAS_TO_FOOD = new Map<string, string>();
for (const [canonical, aliases] of Object.entries(FOOD_ALIASES)) {
  for (const alias of [canonical, ...aliases]) {
    const key = normalizePersian(alias);
    const compact = compactPersian(alias);
    if (key) ALIAS_TO_FOOD.set(key, canonical);
    if (compact) ALIAS_TO_FOOD.set(compact, canonical);
  }
}

/** Map a spoken/typed phrase to a catalog food name, or null. */
export function canonicalFoodName(raw: string): string | null {
  const key = normalizePersian(raw);
  const compact = compactPersian(raw);
  if (!key || key.length < 2) return null;
  const fromAlias = ALIAS_TO_FOOD.get(key) ?? ALIAS_TO_FOOD.get(compact);
  if (fromAlias) return fromAlias;
  if (FOOD_KEYS.has(key)) {
    return FOOD_NAMES.find((n) => normalizePersian(n) === key) ?? key;
  }
  const fromCompact = FOOD_COMPACT.get(compact);
  if (fromCompact) return fromCompact;
  for (const food of FOOD_NAMES) {
    if (ingredientsLooselyMatch(raw, food)) return food;
  }
  return null;
}

export function isLikelyFoodIngredient(name: string): boolean {
  const n = normalizePersian(name);
  if (!n || n.length < 2) return false;
  if (isPantryStaple(name)) return true;
  return canonicalFoodName(name) !== null;
}

/** Custom chips that do not look like food (e.g. random voice words). */
export function isUnusualIngredient(ingredient: {
  name: string;
  category?: string;
}): boolean {
  if (ingredient.category && ingredient.category !== "سفارشی") return false;
  return !isLikelyFoodIngredient(ingredient.name);
}
