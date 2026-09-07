import {
  FOOD_NAMES,
  canonicalFoodName,
  compactPersian,
  ingredientsLooselyMatch,
  isLikelyFoodIngredient,
  normalizePersian,
} from "@atlas/shared";

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

function rewriteSpeech(raw: string): string {
  let text = normalizePersian(raw)
    .replace(/[?!.;:…]/g, " ")
    .replace(/[،,|]/g, " ");
  text = text.replace(/tuna\s*fish/g, "تن ماهی");
  text = text.replace(/\btuna\b/g, "تن ماهی");
  text = text.replace(/تون\s*ماهی/g, "تن ماهی");
  text = text.replace(/تنماهی/g, "تن ماهی");
  text = text.replace(/ماهی\s*تن/g, "تن ماهی");
  text = text.replace(/کنسرو\s*تن(?:\s*ماهی)?/g, "تن ماهی");
  text = text.replace(/\s+و\s+/g, " ");
  text = text.replace(/\s+با\s+/g, " ");
  return text.replace(/\s+/g, " ").trim();
}

/** Drop engine duplicates: «گوجه گوجه» → «گوجه», keep the longer form if loosely the same. */
export function collapseRepeatedSpeech(transcript: string): string {
  const parts = rewriteSpeech(transcript).split(/\s+/).filter(Boolean);
  const out: string[] = [];
  for (const part of parts) {
    const prev = out[out.length - 1];
    if (
      prev &&
      (normalizePersian(prev) === normalizePersian(part) ||
        ingredientsLooselyMatch(prev, part))
    ) {
      if (normalizePersian(part).length > normalizePersian(prev).length) {
        out[out.length - 1] = part;
      }
      continue;
    }
    out.push(part);
  }
  return out.join(" ");
}

/** Merge a new speech chunk without repeating text the engine already sent. */
export function mergeSpeechSegment(previous: string, next: string): string {
  const a = collapseRepeatedSpeech(previous);
  const b = collapseRepeatedSpeech(next);
  if (!a) return b;
  if (!b) return a;
  const na = normalizePersian(a);
  const nb = normalizePersian(b);
  if (na === nb || na.endsWith(nb) || na.includes(` ${nb}`)) return a;
  if (nb.startsWith(na) || nb.endsWith(na) || nb.includes(` ${na} `)) return b;
  return collapseRepeatedSpeech(`${a} ${b}`);
}

function resolveFoodName(raw: string): string | null {
  const key = normalizePersian(raw);
  if (!key || key.length < 2 || STOP.has(key) || /^\d+$/.test(key)) return null;
  return canonicalFoodName(raw);
}

export function namesFromSpeech(transcript: string): string[] {
  let text = collapseRepeatedSpeech(transcript);
  if (!text) return [];

  const names: string[] = [];
  const seen = new Set<string>();
  const take = (raw: string) => {
    const resolved = resolveFoodName(raw);
    if (!resolved) return;
    const key = normalizePersian(resolved);
    if (key.length < 2 || STOP.has(key) || seen.has(key) || /^\d+$/.test(key)) {
      return;
    }
    for (const prev of seen) {
      if (ingredientsLooselyMatch(resolved, prev)) return;
    }
    seen.add(key);
    names.push(resolved);
  };

  const compactText = compactPersian(text);
  for (const phrase of COMPOUNDS) {
    const needle = normalizePersian(phrase);
    const compactNeedle = compactPersian(phrase);
    if (!needle) continue;
    if (text.includes(needle) || (compactNeedle.length >= 4 && compactText.includes(compactNeedle))) {
      take(phrase);
      text = text.split(needle).join(" ");
    }
  }

  const parts = text.split(/\s+/).filter(Boolean);
  for (let i = 0; i < parts.length; i += 1) {
    const pair = i + 1 < parts.length ? `${parts[i]} ${parts[i + 1]}` : "";
    if (pair && resolveFoodName(pair)) {
      take(pair);
      i += 1;
      continue;
    }
    take(parts[i] ?? "");
  }
  return names.slice(0, 40);
}

/** Spoken tokens that are not catalog foods (e.g. ماشین، موبایل). */
export function unrecognizedSpeechTokens(transcript: string): string[] {
  let text = collapseRepeatedSpeech(transcript);
  if (!text) return [];

  const compactText = compactPersian(text);
  for (const phrase of COMPOUNDS) {
    const needle = normalizePersian(phrase);
    const compactNeedle = compactPersian(phrase);
    if (!needle) continue;
    if (
      text.includes(needle) ||
      (compactNeedle.length >= 4 && compactText.includes(compactNeedle))
    ) {
      text = text.split(needle).join(" ");
    }
  }

  const leftover: string[] = [];
  const seen = new Set<string>();
  const parts = text.split(/\s+/).filter(Boolean);
  for (let i = 0; i < parts.length; i += 1) {
    const pair = i + 1 < parts.length ? `${parts[i]} ${parts[i + 1]}` : "";
    if (pair && resolveFoodName(pair)) {
      i += 1;
      continue;
    }
    const token = parts[i] ?? "";
    if (resolveFoodName(token)) continue;
    const key = normalizePersian(token);
    if (!key || key.length < 3 || STOP.has(key) || /^\d+$/.test(key) || seen.has(key)) {
      continue;
    }
    seen.add(key);
    leftover.push(token);
  }
  return leftover;
}

/** Hold the last food while the last spoken token may still become a compound (سیب → سیب زمینی). */
export function shouldHoldTrailingFood(transcript: string): boolean {
  const lastToken = normalizePersian(transcript).split(/\s+/).filter(Boolean).pop() ?? "";
  if (lastToken.length < 2) return lastToken.length > 0;
  return COMPOUNDS.some((c) => {
    const n = normalizePersian(c);
    return n.startsWith(`${lastToken} `);
  });
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
