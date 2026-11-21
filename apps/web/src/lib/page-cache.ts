import type {
  FavoriteItem,
  InventoryItem,
  Recipe,
  RecommendationCard,
  RecommendationFilters,
  RecommendationResult,
  UserProfile,
} from "@atlas/contracts";

/** In-memory cache so tab switches feel instant on revisit. */
export const pageCache = {
  inventory: null as InventoryItem[] | null,
  popular: null as RecommendationCard[] | null,
  favorites: null as FavoriteItem[] | null,
  profile: null as UserProfile | null,
  recommendations: null as RecommendationResult | null,
  recommendationKey: "" as string,
  recipes: {} as Record<string, Recipe>,
};

/** Drop warm SPA cache so the next load hits the server. */
export function clearPageCache() {
  pageCache.inventory = null;
  pageCache.popular = null;
  pageCache.favorites = null;
  pageCache.profile = null;
  pageCache.recommendations = null;
  pageCache.recommendationKey = "";
  pageCache.recipes = {};
}

function navigationType(): string {
  if (typeof performance === "undefined") return "";
  const entry = performance.getEntriesByType?.(
    "navigation",
  )?.[0] as PerformanceNavigationTiming | undefined;
  return entry?.type ?? "";
}

/** Hard refresh / back-forward cache restore → force fresh server data. */
export function clearPageCacheIfHardNav() {
  const type = navigationType();
  if (type === "reload" || type === "back_forward") {
    clearPageCache();
  }
}

export function recommendationCacheKey(filters: RecommendationFilters): string {
  const inventorySig = (pageCache.inventory ?? [])
    .map((item) => item.ingredientId)
    .sort()
    .join(",");
  return JSON.stringify({
    meal: filters.meal,
    maxMinutes: filters.maxMinutes,
    dietMode: filters.dietMode,
    dishType: filters.dishType,
    difficulty: filters.difficulty,
    cuisine: filters.cuisine ?? "",
    budgetFriendly: Boolean(filters.budgetFriendly),
    dietaryTags: filters.dietaryTags ?? [],
    inventory: inventorySig,
  });
}

export function invalidateRecommendationCache() {
  pageCache.recommendations = null;
  pageCache.recommendationKey = "";
}

export function hasWarmPageCache(path: string): boolean {
  if (path.startsWith("/home")) return pageCache.inventory !== null;
  if (path.startsWith("/favorites")) return pageCache.favorites !== null;
  if (path.startsWith("/profile")) return pageCache.profile !== null;
  if (path.startsWith("/recommendations")) {
    return pageCache.recommendations !== null;
  }
  if (path.startsWith("/recipes")) {
    const slug =
      new URLSearchParams(path.split("?")[1] ?? "").get("slug") ?? "";
    return Boolean(slug && pageCache.recipes[slug]);
  }
  return false;
}
