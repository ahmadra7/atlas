/**
 * Food catalog importer for PostgreSQL / Prisma using the imported database.
 */
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { normalizePersian, normalizeRecipeContent } from "@atlas/shared";
import type { Recipe } from "@atlas/contracts";

function ingredientIdFromNormalized(normalizedName: string): string {
  const hash = createHash("sha1").update(normalizedName).digest("hex").slice(0, 12);
  return `ing-${hash}`;
}

const prisma = new PrismaClient();

const BOILERPLATE_RE = /لذیذ و خانگی/;

function recipeQualityScore(recipe: Recipe): number {
  const steps = recipe.steps?.length ?? 0;
  const ings = recipe.ingredients?.length ?? 0;
  const desc = recipe.description ?? "";
  const boilerplate = BOILERPLATE_RE.test(desc);
  let score = steps * 12 + ings * 4 + Math.min(desc.length, 240);
  if (!boilerplate) score += 50;
  if (steps >= 3) score += 25;
  if (ings >= 5) score += 12;
  return score;
}

function isUsableCatalogRecipe(recipe: Recipe): boolean {
  const steps = recipe.steps?.length ?? 0;
  const ings = recipe.ingredients?.length ?? 0;
  // Article lists may become ingredient-only (no cook steps).
  if (steps < 1 && ings < 2) return false;
  if (ings < 1 && steps < 3) return false;
  const desc = recipe.description ?? "";
  if (BOILERPLATE_RE.test(desc) && steps <= 1 && ings <= 3) return false;
  return true;
}

/** Drop thin stubs, reclassify article lists → ingredients, dedupe titles. */
export function cleanFoodCatalog(recipes: Recipe[]): Recipe[] {
  const sanitized = recipes.map((recipe) => {
    const { ingredients, steps } = normalizeRecipeContent({
      title: recipe.title,
      ingredients: recipe.ingredients ?? [],
      steps: recipe.steps ?? [],
    });
    return { ...recipe, ingredients, steps };
  });
  const usable = sanitized.filter(isUsableCatalogRecipe);
  const bestByTitle = new Map<string, Recipe>();
  for (const recipe of usable) {
    const key = normalizePersian(recipe.title);
    if (!key) continue;
    const prev = bestByTitle.get(key);
    if (!prev || recipeQualityScore(recipe) > recipeQualityScore(prev)) {
      bestByTitle.set(key, recipe);
    }
  }
  const winnerIds = new Set(
    [...bestByTitle.values()].map((recipe) => recipe.id),
  );
  const cleaned: Recipe[] = [];
  const seenTitles = new Set<string>();
  for (const recipe of usable) {
    const key = normalizePersian(recipe.title);
    if (!winnerIds.has(recipe.id) || seenTitles.has(key)) continue;
    seenTitles.add(key);
    cleaned.push(recipe);
  }
  return cleaned;
}

export function loadFoodCatalog(): Recipe[] {
  const candidates = [
    resolve(__dirname, "../data/food-catalog.json"),
    resolve(__dirname, "../../../packages/api-client/src/catalog/recipesData.json"),
    resolve(process.cwd(), "data/food-catalog.json"),
    resolve(process.cwd(), "apps/api/data/food-catalog.json"),
    resolve(process.cwd(), "packages/api-client/src/catalog/recipesData.json"),
    resolve(process.cwd(), "../packages/api-client/src/catalog/recipesData.json"),
  ];

  const found = candidates.find((p) => existsSync(p));
  if (!found) {
    throw new Error(`Catalog JSON not found. Checked:\n${candidates.join("\n")}`);
  }

  const raw = JSON.parse(readFileSync(found, "utf8")) as Recipe[];
  return cleanFoodCatalog(raw);
}

export async function wipeCatalog() {
  await prisma.cookingSession.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.ingredientAlias.deleteMany();
  await prisma.ingredient.deleteMany();
}

export async function importFoodCatalog(
  options: { replaceCatalog?: boolean } = { replaceCatalog: true },
): Promise<{ imported: number; ingredients: number }> {
  const recipes = loadFoodCatalog();

  if (options.replaceCatalog) {
    await wipeCatalog();
  }

  // 1. Collect unique ingredients and calculate popularity
  const ingMap = new Map<string, { name: string; popularity: number }>();
  for (const recipe of recipes) {
    for (const ing of recipe.ingredients) {
      const name = ing.name.trim();
      if (!name) continue;
      const key = normalizePersian(name);
      if (!key) continue;
      const prev = ingMap.get(key);
      if (prev) prev.popularity += 1;
      else ingMap.set(key, { name, popularity: 1 });
    }
  }

  const ingredientIdByNormalized = new Map<string, string>();
  const ingredientRows = [...ingMap.entries()].map(([normalizedName, data]) => {
    const id = ingredientIdFromNormalized(normalizedName);
    ingredientIdByNormalized.set(normalizedName, id);
    return {
      id,
      name: data.name,
      normalizedName,
      category: "عمومی",
      popularity: Math.min(99, Math.max(1, data.popularity)),
      isCustom: false,
    };
  });

  // Chunked insert ingredients
  for (let i = 0; i < ingredientRows.length; i += 1000) {
    await prisma.ingredient.createMany({
      data: ingredientRows.slice(i, i + 1000),
      skipDuplicates: true,
    });
  }

  // Insert aliases
  for (let i = 0; i < ingredientRows.length; i += 1000) {
    const chunk = ingredientRows.slice(i, i + 1000);
    const aliases = chunk.map((r) => ({
      ingredientId: r.id,
      alias: r.name,
      normalizedAlias: r.normalizedName,
    }));
    await prisma.ingredientAlias.createMany({
      data: aliases,
      skipDuplicates: true,
    });
  }

  // 2. Insert Recipes
  for (let i = 0; i < recipes.length; i += 500) {
    const chunk = recipes.slice(i, i + 500);
    await prisma.recipe.createMany({
      data: chunk.map((r) => ({
        id: r.id,
        slug: r.slug,
        sourceExternalId: r.id,
        title: r.title,
        description: r.description,
        category: r.category,
        meal: r.meal,
        cuisine: r.cuisine,
        difficulty: r.difficulty,
        prepMinutes: r.prepMinutes,
        cookMinutes: r.cookMinutes,
        totalMinutes: r.totalMinutes,
        servings: r.servings,
        imageUrl: r.imageUrl,
        dietaryTags: r.dietaryTags,
        budgetFriendly: r.budgetFriendly,
        verified: true,
        published: true,
      })),
      skipDuplicates: true,
    });
  }

  // 3. Insert Versions
  const versions = recipes.map((r) => ({
    id: r.versionId,
    recipeId: r.id,
    versionNumber: 1,
    isCurrent: true,
  }));
  for (let i = 0; i < versions.length; i += 1000) {
    await prisma.recipeVersion.createMany({
      data: versions.slice(i, i + 1000),
      skipDuplicates: true,
    });
  }

  // 4. Insert Recipe Ingredients
  const recipeIngRows: Array<{
    recipeVersionId: string;
    ingredientId: string;
    name: string;
    quantity: string | null;
    unit: string | null;
    optional: boolean;
    sortOrder: number;
  }> = [];

  for (const r of recipes) {
    let order = 1;
    for (const ing of r.ingredients) {
      const name = ing.name.trim();
      if (!name) continue;
      const ingredientId = ingredientIdByNormalized.get(normalizePersian(name));
      if (!ingredientId) continue;
      recipeIngRows.push({
        recipeVersionId: r.versionId,
        ingredientId,
        name,
        quantity: ing.quantity ?? null,
        unit: ing.unit ?? null,
        optional: ing.optional ?? false,
        sortOrder: order++,
      });
    }
  }

  for (let i = 0; i < recipeIngRows.length; i += 1000) {
    await prisma.recipeIngredient.createMany({
      data: recipeIngRows.slice(i, i + 1000),
      skipDuplicates: true,
    });
  }

  // 5. Insert Steps
  const stepRows: Array<{
    id: string;
    recipeVersionId: string;
    order: number;
    instruction: string;
    tip: string | null;
    timerSeconds: number | null;
    imageUrl: string | null;
  }> = [];

  for (const r of recipes) {
    for (const s of r.steps) {
      stepRows.push({
        id: s.id,
        recipeVersionId: r.versionId,
        order: s.order,
        instruction: s.instruction,
        tip: s.tip ?? null,
        timerSeconds: s.timerSeconds ?? null,
        imageUrl: s.imageUrl ?? null,
      });
    }
  }

  for (let i = 0; i < stepRows.length; i += 1000) {
    await prisma.recipeStep.createMany({
      data: stepRows.slice(i, i + 1000),
      skipDuplicates: true,
    });
  }

  return { imported: recipes.length, ingredients: ingredientRows.length };
}
