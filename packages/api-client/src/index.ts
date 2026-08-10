import type {
  AnalyticsEvent,
  RecommendationFilters,
} from "@atlas/contracts";
import * as mock from "./mock-data";

export type AtlasClientMode = "mock" | "http";

export interface AtlasClientOptions {
  mode?: AtlasClientMode;
  baseUrl?: string;
}

/**
 * Client facade. Web MVP uses mock mode until Nest API is ready.
 * Ranking/matching must remain server-side in production HTTP mode.
 */
export function createAtlasClient(options: AtlasClientOptions = {}) {
  const mode = options.mode ?? "mock";
  if (mode !== "mock") {
    throw new Error(
      "HTTP mode is not wired yet. Use mode: 'mock' for the web vertical slice.",
    );
  }

  return {
    mode,
    searchIngredients: mock.searchIngredients,
    getInventory: mock.getInventory,
    addInventoryItem: mock.addInventoryItem,
    addIngredientByName: mock.addIngredientByName,
    removeInventoryItem: mock.removeInventoryItem,
    getRecommendations: (filters?: RecommendationFilters) =>
      mock.getRecommendations(filters),
    getRecipeBySlug: mock.getRecipeBySlug,
    startCookingSession: mock.startCookingSession,
    getCookingSession: mock.getCookingSession,
    completeStep: mock.completeStep,
    completeSession: mock.completeSession,
    abandonSession: mock.abandonSession,
    askAssistant: mock.askAssistant,
    sendSos: mock.sendSos,
    getFavorites: mock.getFavorites,
    toggleFavorite: mock.toggleFavorite,
    getHistory: mock.getHistory,
    getProfile: mock.getProfile,
    trackEvent: async (_event: AnalyticsEvent) => {
      // no-op in mock mode
    },
  };
}

export type AtlasClient = ReturnType<typeof createAtlasClient>;

export { MOCK_INGREDIENTS, MOCK_RECIPES } from "./mock-data";
