import type { Recipe } from "@atlas/contracts";
import { normalizeRecipeContent } from "@atlas/shared";
import recipesData from "./recipesData.json";

export const PERSIAN_RECIPES: Recipe[] = (
  recipesData as unknown as Recipe[]
).map((recipe) => {
  const { ingredients, steps } = normalizeRecipeContent({
    title: recipe.title,
    ingredients: recipe.ingredients ?? [],
    steps: recipe.steps ?? [],
  });
  return { ...recipe, ingredients, steps };
});
