export function recipePath(slug: string): string {
  return `/recipes/view?slug=${encodeURIComponent(slug)}`;
}

export function recipeSlugFromPath(path: string, search = ""): string {
  const query = search.startsWith("?") ? search.slice(1) : search;
  const fromQuery = new URLSearchParams(query).get("slug")?.trim() ?? "";
  if (fromQuery) return fromQuery;
  const parts = path.split("/").filter(Boolean);
  const recipesAt = parts.indexOf("recipes");
  const next = recipesAt >= 0 ? parts[recipesAt + 1] : "";
  if (next && next !== "view") return decodeURIComponent(next);
  return "";
}
