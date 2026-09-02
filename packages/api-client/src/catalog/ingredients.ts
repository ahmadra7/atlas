import type { Ingredient } from "@atlas/contracts";
import { normalizePersian } from "@atlas/shared";
import { ingredientIdFromName } from "./ids";
import { PERSIAN_RECIPES } from "./persianRecipes";

const EXTRA_ALIASES: Record<string, string[]> = {
  "گوجه‌فرنگی": ["گوجه", "گوجه فرنگی"],
  "سیب‌زمینی": ["سیب زمینی", "سیبزمینی"],
  "تخم‌مرغ": ["تخم مرغ", "تخممرغ"],
  "مرغ": ["سینه مرغ", "ران مرغ"],
  "سینه مرغ": ["مرغ"],
  "گوشت خورشتی": ["گوشت", "گوشت گوسفند", "گوشت گوساله"],
  "گوشت چرخ‌کرده": ["گوشت چرخ کرده"],
  "گوشت با استخوان": ["گوشت"],
  "رب گوجه فرنگی": ["رب", "رب گوجه"],
  "نان": ["نان لواش", "نان سنگک", "نان بربری"],
  "نان سنگک": ["سنگک", "نان"],
  "سبزی قورمه": ["سبزی قرمه", "سبزی خورشتی"],
  "سبزی کوکو": ["سبزی کوکوسبزی"],
  "سبزی آش": ["سبزی آش رشته"],
  "فلفل سیاه": ["فلفل"],
  "جو پرک": ["جو"],
  "نخود فرنگی": ["نخودفرنگی"],
};

const EXTRA_NAMES = [
  "نان",
  "کره",
  "خیار",
  "ماست",
  "شیر",
  "آرد",
];

function makeIngredient(name: string, popularity: number): Ingredient {
  const aliases = EXTRA_ALIASES[name] ?? [name];
  return {
    id: ingredientIdFromName(name),
    name,
    normalizedName: normalizePersian(name),
    aliases: [...new Set([name, ...aliases])],
    category: "عمومی",
    popularity,
  };
}

export const PERSIAN_INGREDIENTS: Ingredient[] = (() => {
  const names = new Set<string>();
  for (const recipe of PERSIAN_RECIPES) {
    for (const item of recipe.ingredients) {
      names.add(item.name);
    }
  }
  for (const name of EXTRA_NAMES) names.add(name);

  return [...names]
    .sort((a, b) => a.localeCompare(b, "fa"))
    .map((name, index) => makeIngredient(name, Math.max(40, 99 - index)));
})();
