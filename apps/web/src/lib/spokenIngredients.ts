import {
  FOOD_NAMES,
  ingredientsLooselyMatch,
  isLikelyFoodIngredient,
  normalizePersian,
} from "@atlas/shared";

const COMPOUNDS = [...FOOD_NAMES]
  .filter((name) => /[\s\u200c]/.test(name))
  .sort((a, b) => b.length - a.length);

const FOOD_BY_KEY = new Map(
  FOOD_NAMES.map((name) => [normalizePersian(name), name] as const),
);

const STOP = new Set(
  [
    "من",
    "مواد",
    "ماده",
    "یخچال",
    "دارم",
    "هست",
    "هستم",
    "هم",
    "یک",
    "یه",
    "دو",
    "تا",
    "با",
    "و",
    "از",
    "که",
    "رو",
    "را",
    "برای",
    "گرم",
    "کیلو",
    "لیتر",
    "عدد",
    "بگو",
    "بده",
    "اضافه",
    "کن",
  ].map((w) => normalizePersian(w)),
);

function resolveFoodName(raw: string): string | null {
  const key = normalizePersian(raw);
  if (!key || key.length < 2 || STOP.has(key) || /^\d+$/.test(key)) return null;
  const exact = FOOD_BY_KEY.get(key);
  if (exact) return exact;
  for (const name of FOOD_NAMES) {
    if (ingredientsLooselyMatch(raw, name)) return name;
  }
  if (key.length < 3) return null;
  for (const name of FOOD_NAMES) {
    const food = normalizePersian(name);
    if (food.length < 3) continue;
    if (food.includes(key) || key.includes(food)) return name;
  }
  return null;
}

export function namesFromSpeech(transcript: string): string[] {
  let text = normalizePersian(transcript)
    .replace(/[?!.;:…]/g, " ")
    .replace(/[،,|]/g, " ")
    .replace(/\s+و\s+/g, " ")
    .replace(/\s+با\s+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return [];

  const names: string[] = [];
  const seen = new Set<string>();
  const take = (raw: string) => {
    const resolved = resolveFoodName(raw) ?? raw.trim();
    const key = normalizePersian(resolved);
    if (key.length < 2 || STOP.has(key) || seen.has(key) || /^\d+$/.test(key)) {
      return;
    }
    seen.add(key);
    names.push(resolved);
  };

  for (const phrase of COMPOUNDS) {
    const needle = normalizePersian(phrase);
    if (!needle || !text.includes(needle)) continue;
    take(phrase);
    text = text.split(needle).join(" ");
  }

  for (const part of text.split(/\s+/)) take(part);
  return names.slice(0, 12);
}

export function partitionSpokenNames(transcript: string): {
  valid: string[];
  invalid: string[];
} {
  const names = namesFromSpeech(transcript);
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const name of names) {
    if (isLikelyFoodIngredient(name)) valid.push(name);
    else invalid.push(name);
  }
  return { valid, invalid };
}
