/**
 * Food catalog importer for PostgreSQL / Prisma using the imported database.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { normalizePersian } from "@atlas/shared";
import type { Recipe } from "@atlas/contracts";

const prisma = new PrismaClient();

export function loadFoodCatalog(): Recipe[] {
  const candidates = [
    resolve(__dirname, "../data/food-catalog.json"),
    resolve(process.cwd(), "apps/api/data/food-catalog.json"),
    resolve(process.cwd(), "packages/api-client/src/catalog/recipesData.json"),
  ];

  const found = candidates.find((p) => existsSync(p));
  if (!found) {
    throw new Error(`Catalog JSON not found. Checked:\n${candidates.join("\n")}`);
  }

  return JSON.parse(readFileSync(found, "utf8")) as Recipe[];
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

  const ingredientRows = [...ingMap.entries()].map(([normalizedName, data]) => ({
    id: data.name,
    name: data.name,
    normalizedName,
    category: "عمومی",
    popularity: Math.min(99, Math.max(1, data.popularity)),
    isCustom: false,
  }));

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
      recipeIngRows.push({
        recipeVersionId: r.versionId,
        ingredientId: ing.name, // matched with id in ingredient table
        name: ing.name,
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
