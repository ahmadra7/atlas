import { PERSIAN_RECIPES } from "../../../../../../packages/api-client/src/catalog/persianRecipes";
import RecipeDetailClient from "./RecipeDetailClient";

export function generateStaticParams() {
  return PERSIAN_RECIPES.map((recipe) => ({ slug: recipe.slug }));
}

export default function RecipeDetailPage() {
  return <RecipeDetailClient />;
}
