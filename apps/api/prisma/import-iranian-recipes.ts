/**
 * Incremental Iranian recipe catalog importer.
 *
 * Usage:
 *   npx tsx prisma/import-iranian-recipes.ts
 *   RECIPES_JSON=path/to/file.json REPLACE_CATALOG=0 npx tsx prisma/import-iranian-recipes.ts
 *
 * REPLACE_CATALOG=1 (default): wipe recipes/ingredients then bulk insert
 * REPLACE_CATALOG=0: upsert by sourceExternalId (merge richer dumps later)
 */
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  PrismaClient,
  type Difficulty,
  type MealType,
  type Prisma,
} from "@prisma/client";
import { normalizePersian } from "@atlas/shared";
import {
  isGenericInstructionText,
  synthesizeSteps,
} from "./synthesize-steps";

const prisma = new PrismaClient();

type SourceIngredient = { name?: string; amount?: string | null };
type SourceStep = {
  step?: number;
  text?: string;
  tip?: string | null;
  timerSeconds?: number | null;
};
type SourceRecipe = {
  id: number | string;
  title?: string;
  province?: string | null;
  calories_per_serving?: number | null;
  image_url?: string | null;
  preparation_time_min?: number | null;
  cooking_time_min?: number | null;
  cooking_method?: string | null;
  skill_level?: string | null;
  meal_type?: string | null;
  servings?: number | null;
  category?: string | null;
  subcategory?: string | null;
  ingredients?: SourceIngredient[];
  instructions?: SourceStep[];
  is_verified?: boolean | number | null;
  source?: string | null;
  [key: string]: unknown;
};

const SKIP_CATEGORIES = new Set(["مقالات"]);

function mapMeal(raw: string | null | undefined): MealType {
  const t = normalizePersian(raw ?? "");
  if (t.includes("صبحانه")) return "breakfast";
  if (t.includes("شام")) return "dinner";
  if (t.includes("ناهار")) return "lunch";
  if (
    t.includes("عصرانه") ||
    t.includes("میان") ||
    t.includes("دسر") ||
    t.includes("پیش") ||
    t.includes("افطار") ||
    t.includes("سحر") ||
    t.includes("چاشنی")
  ) {
    return "snack";
  }
  return "any";
}

function mapDifficulty(raw: string | null | undefined): Difficulty {
  const t = normalizePersian(raw ?? "");
  if (t.includes("مبتدی") || t.includes("آسان")) return "easy";
  if (t.includes("پیشرفته") || t.includes("حرفه") || t.includes("سخت")) {
    return "hard";
  }
  return "medium";
}

function toInt(value: unknown, fallback = 0): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.round(n);
}

export function ingredientIdFromName(name: string): string {
  const normalized = normalizePersian(name);
  const hash = createHash("sha1").update(normalized).digest("hex").slice(0, 12);
  return `ing-${hash}`;
}

function loadRecipes(): SourceRecipe[] {
  const fromEnv = process.env.RECIPES_JSON?.trim();
  const candidates = [
    fromEnv,
    resolve(__dirname, "../data/iranian_recipes.json"),
    resolve(process.cwd(), "data/iranian_recipes.json"),
    "c:/Users/rasouli.ahmad/Downloads/iranian_recipes_full.json",
  ].filter(Boolean) as string[];

  const path = candidates.find((p) => existsSync(p));
  if (!path) {
    throw new Error(`Recipe JSON not found. Tried:\n${candidates.join("\n")}`);
  }
  // eslint-disable-next-line no-console
  console.log(`Loading recipes from ${path}`);
  const raw = JSON.parse(readFileSync(path, "utf8")) as SourceRecipe[];
  if (!Array.isArray(raw)) throw new Error("Recipe JSON must be an array");
  return raw;
}

async function wipeCatalog() {
  // eslint-disable-next-line no-console
  console.log("Wiping cooking sessions, favorites, recipes, ingredients...");
  await prisma.cookingSession.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.ingredientAlias.deleteMany();
  await prisma.ingredient.deleteMany();
}

function buildDescription(r: SourceRecipe): string {
  const parts = [
    r.category,
    r.subcategory,
    r.cooking_method ? `روش: ${r.cooking_method}` : null,
    r.calories_per_serving
      ? `حدود ${r.calories_per_serving} کالری در هر وعده`
      : null,
    r.province ? `منطقه: ${r.province}` : null,
  ].filter(Boolean);
  return parts.join(" · ") || "دستور ایرانی";
}

function collectExtraMeta(r: SourceRecipe): Prisma.InputJsonValue | undefined {
  const knownKeys = new Set([
    "id",
    "title",
    "province",
    "calories_per_serving",
    "image_url",
    "preparation_time_min",
    "cooking_time_min",
    "cooking_method",
    "skill_level",
    "meal_type",
    "servings",
    "category",
    "subcategory",
    "ingredients",
    "instructions",
    "is_verified",
    "source",
  ]);
  const meta: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(r)) {
    if (!knownKeys.has(k) && v != null) meta[k] = v;
  }
  if (r.source) meta.source = r.source;
  return Object.keys(meta).length ? (meta as Prisma.InputJsonValue) : undefined;
}

function mapRecipeRow(r: SourceRecipe) {
  const external = String(r.id);
  const prep = toInt(r.preparation_time_min, 0);
  const cook = toInt(r.cooking_time_min, 0);
  return {
    id: `ir-${external}`,
    slug: `ir-${external}`,
    sourceExternalId: `ir:${external}`,
    title: (r.title ?? "").trim(),
    description: buildDescription(r),
    category: (r.category ?? "غذای اصلی").trim() || "غذای اصلی",
    subcategory: r.subcategory?.trim() || null,
    meal: mapMeal(r.meal_type),
    cuisine: "ایرانی",
    region: r.province?.trim() || null,
    difficulty: mapDifficulty(r.skill_level),
    prepMinutes: prep,
    cookMinutes: cook,
    totalMinutes: Math.max(prep + cook, 1),
    servings: Math.max(toInt(r.servings, 4), 1),
    imageUrl: (r.image_url ?? "").trim() || "/images/recipe-placeholder.svg",
    caloriesPerServing:
      r.calories_per_serving == null
        ? null
        : toInt(r.calories_per_serving, 0) || null,
    cookingMethod: r.cooking_method?.trim() || null,
    dietaryTags: [] as string[],
    budgetFriendly: false,
    verified: Boolean(r.is_verified),
    published: true,
    meta: collectExtraMeta(r),
    versionId: `ir-${external}-v1`,
    external,
    ingredients: r.ingredients ?? [],
    instructions: resolveInstructions(r),
  };
}

function resolveInstructions(r: SourceRecipe): SourceStep[] {
  const source = r.instructions ?? [];
  const texts = source.map((s) => (s.text ?? "").trim()).filter(Boolean);
  if (texts.length > 0 && !isGenericInstructionText(texts)) {
    return source;
  }
  return synthesizeSteps({
    title: (r.title ?? "").trim(),
    category: r.category,
    cookingMethod: r.cooking_method,
    cookMinutes: toInt(r.cooking_time_min, 0),
    ingredients: r.ingredients ?? [],
  }).map((s) => ({
    step: s.order,
    text: s.instruction,
    tip: s.tip ?? null,
    timerSeconds: s.timerSeconds ?? null,
  }));
}

async function bulkInsert(source: SourceRecipe[]) {
  const mapped = source.map(mapRecipeRow);

  const nameStats = new Map<string, { name: string; popularity: number }>();
  for (const recipe of mapped) {
    for (const ing of recipe.ingredients) {
      const name = (ing.name ?? "").trim();
      if (!name) continue;
      const key = normalizePersian(name);
      if (!key) continue;
      const prev = nameStats.get(key);
      if (prev) prev.popularity += 1;
      else nameStats.set(key, { name, popularity: 1 });
    }
  }

  const ingredientRows = [...nameStats.entries()].map(
    ([normalizedName, meta]) => ({
      id: ingredientIdFromName(meta.name),
      name: meta.name,
      normalizedName,
      category: "عمومی",
      popularity: meta.popularity,
      isCustom: false,
    }),
  );

  // eslint-disable-next-line no-console
  console.log(
    `Bulk insert recipes=${mapped.length} ingredients=${ingredientRows.length}`,
  );

  for (let i = 0; i < ingredientRows.length; i += 1000) {
    await prisma.ingredient.createMany({
      data: ingredientRows.slice(i, i + 1000),
      skipDuplicates: true,
    });
  }
  for (let i = 0; i < ingredientRows.length; i += 1000) {
    const slice = ingredientRows.slice(i, i + 1000);
    await prisma.ingredientAlias.createMany({
      data: slice.map((row) => ({
        ingredientId: row.id,
        alias: row.name,
        normalizedAlias: row.normalizedName,
      })),
      skipDuplicates: true,
    });
  }
  // eslint-disable-next-line no-console
  console.log("Ingredients done");

  for (let i = 0; i < mapped.length; i += 500) {
    const slice = mapped.slice(i, i + 500);
    await prisma.recipe.createMany({
      data: slice.map(
        ({
          versionId: _v,
          external: _e,
          ingredients: _i,
          instructions: _s,
          ...recipe
        }) => recipe,
      ),
    });
    await prisma.recipeVersion.createMany({
      data: slice.map((r) => ({
        id: r.versionId,
        recipeId: r.id,
        versionNumber: 1,
        isCurrent: true,
      })),
    });
    // eslint-disable-next-line no-console
    console.log(`Recipes ${Math.min(i + 500, mapped.length)}/${mapped.length}`);
  }

  const allIngredients: Prisma.RecipeIngredientCreateManyInput[] = [];
  const allSteps: Prisma.RecipeStepCreateManyInput[] = [];

  for (const r of mapped) {
    r.ingredients.forEach((ing, index) => {
      const name = (ing.name ?? "").trim();
      if (!name) return;
      allIngredients.push({
        recipeVersionId: r.versionId,
        ingredientId: ingredientIdFromName(name),
        name,
        quantity: (ing.amount ?? "").trim() || null,
        unit: null,
        optional: false,
        sortOrder: index,
      });
    });
    r.instructions.forEach((s, index) => {
      const text = (s.text ?? "").trim();
      if (!text) return;
      const order = toInt(s.step, index + 1) || index + 1;
      allSteps.push({
        id: `ir-${r.external}-s${order}`,
        recipeVersionId: r.versionId,
        order,
        instruction: text,
        tip: s.tip ?? null,
        timerSeconds: s.timerSeconds ?? null,
        imageUrl: null,
      });
    });
  }

  for (let i = 0; i < allIngredients.length; i += 2000) {
    await prisma.recipeIngredient.createMany({
      data: allIngredients.slice(i, i + 2000),
    });
    // eslint-disable-next-line no-console
    console.log(
      `RecipeIngredients ${Math.min(i + 2000, allIngredients.length)}/${allIngredients.length}`,
    );
  }

  // Step ids may collide if duplicate order numbers; dedupe by id
  const stepById = new Map<string, Prisma.RecipeStepCreateManyInput>();
  for (const step of allSteps) {
    stepById.set(String(step.id), step);
  }
  const uniqueSteps = [...stepById.values()];
  for (let i = 0; i < uniqueSteps.length; i += 2000) {
    await prisma.recipeStep.createMany({
      data: uniqueSteps.slice(i, i + 2000),
      skipDuplicates: true,
    });
    // eslint-disable-next-line no-console
    console.log(
      `RecipeSteps ${Math.min(i + 2000, uniqueSteps.length)}/${uniqueSteps.length}`,
    );
  }

  return { imported: mapped.length, ingredients: ingredientRows.length };
}

async function upsertIncremental(source: SourceRecipe[]) {
  let imported = 0;
  for (const raw of source) {
    const r = mapRecipeRow(raw);
    const {
      versionId,
      external,
      ingredients,
      instructions,
      ...recipeData
    } = r;

    // Ensure ingredients exist
    for (const ing of ingredients) {
      const name = (ing.name ?? "").trim();
      if (!name) continue;
      const id = ingredientIdFromName(name);
      const normalizedName = normalizePersian(name);
      await prisma.ingredient.upsert({
        where: { id },
        create: {
          id,
          name,
          normalizedName,
          category: "عمومی",
          popularity: 1,
          isCustom: false,
        },
        update: { name },
      });
      await prisma.ingredientAlias.upsert({
        where: { normalizedAlias: normalizedName },
        create: {
          ingredientId: id,
          alias: name,
          normalizedAlias: normalizedName,
        },
        update: {},
      });
    }

    await prisma.recipe.upsert({
      where: { sourceExternalId: recipeData.sourceExternalId },
      create: recipeData,
      update: recipeData,
    });

    await prisma.recipeVersion.updateMany({
      where: { recipeId: recipeData.id },
      data: { isCurrent: false },
    });
    await prisma.recipeVersion.upsert({
      where: { id: versionId },
      create: {
        id: versionId,
        recipeId: recipeData.id,
        versionNumber: 1,
        isCurrent: true,
      },
      update: { isCurrent: true },
    });

    await prisma.recipeIngredient.deleteMany({
      where: { recipeVersionId: versionId },
    });
    await prisma.recipeStep.deleteMany({
      where: { recipeVersionId: versionId },
    });

    const ingredientRows = ingredients
      .map((ing, index) => {
        const name = (ing.name ?? "").trim();
        if (!name) return null;
        return {
          recipeVersionId: versionId,
          ingredientId: ingredientIdFromName(name),
          name,
          quantity: (ing.amount ?? "").trim() || null,
          unit: null as string | null,
          optional: false,
          sortOrder: index,
        };
      })
      .filter(Boolean) as Prisma.RecipeIngredientCreateManyInput[];
    if (ingredientRows.length) {
      await prisma.recipeIngredient.createMany({ data: ingredientRows });
    }

    const steps = instructions
      .map((s, index) => {
        const text = (s.text ?? "").trim();
        if (!text) return null;
        const order = toInt(s.step, index + 1) || index + 1;
        return {
          id: `ir-${external}-s${order}`,
          recipeVersionId: versionId,
          order,
          instruction: text,
          tip: s.tip ?? null,
          timerSeconds: s.timerSeconds ?? null,
        };
      })
      .filter(Boolean) as Prisma.RecipeStepCreateManyInput[];
    if (steps.length) {
      await prisma.recipeStep.createMany({
        data: steps,
        skipDuplicates: true,
      });
    }

    imported += 1;
    if (imported % 100 === 0) {
      // eslint-disable-next-line no-console
      console.log(`Upserted ${imported}/${source.length}`);
    }
  }
  return { imported, ingredients: 0 };
}

export async function importIranianRecipes(options?: {
  replaceCatalog?: boolean;
}) {
  const replace =
    options?.replaceCatalog ??
    (process.env.REPLACE_CATALOG ?? "1") !== "0";

  const source = loadRecipes().filter((r) => {
    const title = (r.title ?? "").trim();
    if (!title) return false;
    if (SKIP_CATEGORIES.has((r.category ?? "").trim())) return false;
    return true;
  });

  if (replace) {
    await wipeCatalog();
    return bulkInsert(source);
  }
  return upsertIncremental(source);
}

async function main() {
  const result = await importIranianRecipes();
  // eslint-disable-next-line no-console
  console.log(
    `Import OK — recipes=${result.imported} ingredients=${result.ingredients}`,
  );
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
