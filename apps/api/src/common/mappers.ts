import type { Ingredient, Recipe, RecipeStep } from "@atlas/contracts";
import { normalizeRecipeContent } from "@atlas/shared";

export function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String);
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

type IngredientRow = {
  id: string;
  name: string;
  normalizedName: string;
  category: string;
  popularity: number;
  aliases?: { alias: string }[];
};

export function mapIngredient(row: IngredientRow): Ingredient {
  return {
    id: row.id,
    name: row.name,
    normalizedName: row.normalizedName,
    category: row.category,
    popularity: row.popularity,
    aliases: (row.aliases ?? []).map((a) => a.alias),
  };
}

type RecipeFull = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string | null;
  meal: Recipe["meal"];
  cuisine: string;
  region: string | null;
  difficulty: Recipe["difficulty"];
  prepMinutes: number;
  cookMinutes: number;
  totalMinutes: number;
  servings: number;
  imageUrl: string;
  caloriesPerServing?: number | null;
  cookingMethod?: string | null;
  dietaryTags: string[] | unknown;
  budgetFriendly: boolean;
  versions: Array<{
    id: string;
    isCurrent: boolean;
    ingredients: Array<{
      ingredientId: string;
      name: string;
      quantity: string | null;
      unit: string | null;
      optional: boolean;
      sortOrder: number;
    }>;
    steps: Array<{
      id: string;
      order: number;
      instruction: string;
      tip: string | null;
      timerSeconds: number | null;
      imageUrl: string | null;
    }>;
  }>;
};

export function mapRecipe(row: RecipeFull): Recipe {
  const version =
    row.versions.find((v) => v.isCurrent) ?? row.versions[0] ?? null;
  if (!version) {
    throw new Error(`Recipe ${row.id} has no versions`);
  }

  const rawSteps: RecipeStep[] = [...version.steps]
    .sort((a, b) => a.order - b.order)
    .map((s) => ({
      id: s.id,
      order: s.order,
      instruction: s.instruction,
      tip: s.tip,
      timerSeconds: s.timerSeconds,
      imageUrl: s.imageUrl,
    }));

  const rawIngredients = [...version.ingredients]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((i) => ({
      ingredientId: i.ingredientId,
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
      optional: i.optional,
    }));

  const { ingredients, steps } = normalizeRecipeContent({
    title: row.title,
    ingredients: rawIngredients,
    steps: rawSteps,
  });

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    subcategory: row.subcategory ?? null,
    meal: row.meal === "any" ? "lunch" : row.meal,
    cuisine: row.cuisine,
    region: row.region ?? undefined,
    difficulty: row.difficulty,
    prepMinutes: row.prepMinutes,
    cookMinutes: row.cookMinutes,
    totalMinutes: row.totalMinutes,
    servings: row.servings,
    imageUrl: row.imageUrl,
    caloriesPerServing: row.caloriesPerServing ?? null,
    cookingMethod: row.cookingMethod ?? null,
    dietaryTags: asStringArray(row.dietaryTags),
    budgetFriendly: row.budgetFriendly,
    ingredients,
    steps,
    versionId: version.id,
  };
}

export const recipeInclude = {
  versions: {
    where: { isCurrent: true },
    include: {
      ingredients: { orderBy: { sortOrder: "asc" as const } },
      steps: { orderBy: { order: "asc" as const } },
    },
  },
};
