import type { Recipe } from "@atlas/contracts";
import recipesData from "./recipesData.json";

export const PERSIAN_RECIPES: Recipe[] = recipesData as unknown as Recipe[];
