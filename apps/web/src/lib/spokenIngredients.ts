import { FOOD_NAMES, isLikelyFoodIngredient, normalizePersian } from "@atlas/shared";

const COMPOUNDS = [...FOOD_NAMES]
  .filter((name) => /[\s\u200c]/.test(name))
  .sort((a, b) => b.length - a.length);

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
    const name = raw.trim();
    const key = normalizePersian(name);
    if (key.length < 2 || STOP.has(key) || seen.has(key) || /^\d+$/.test(key)) {
      return;
    }
    seen.add(key);
    names.push(name);
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
