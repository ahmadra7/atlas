import type {
  AnalyticsEvent,
  AuthSessionResponse,
  CookingSession,
  FavoriteItem,
  GoogleAuthInput,
  HistoryItem,
  Ingredient,
  InventoryItem,
  Recipe,
  RecommendationFilters,
  RecommendationResult,
  RequestOtpResponse,
  UserProfile,
} from "@atlas/contracts";
import * as mock from "./mock-data";

export type AtlasClientMode = "mock" | "http";

export interface AtlasClientOptions {
  mode?: AtlasClientMode;
  baseUrl?: string;
  /** Bearer token for authenticated HTTP calls */
  getAccessToken?: () => string | null | Promise<string | null>;
}

type HttpMethod = "GET" | "POST" | "DELETE";

async function httpRequest<T>(
  baseUrl: string,
  path: string,
  options: {
    method?: HttpMethod;
    body?: unknown;
    token?: string | null;
    query?: Record<string, string | number | boolean | undefined | null>;
  } = {},
): Promise<T> {
  const url = new URL(path.replace(/^\//, ""), baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const method = options.method ?? "GET";
  const res = await fetch(url, {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    // Catalog/recipe reads must reflect admin DB edits after a page refresh.
    cache: method === "GET" ? "no-store" : "default",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function createHttpClient(baseUrl: string, getAccessToken?: AtlasClientOptions["getAccessToken"]) {
  const token = async () => (getAccessToken ? await getAccessToken() : null);

  return {
    mode: "http" as const,
    searchIngredients: async (q: string) =>
      httpRequest<Ingredient[]>(baseUrl, "api/ingredients/search", {
        query: { q },
      }),
    getInventory: async () =>
      httpRequest<InventoryItem[]>(baseUrl, "api/inventory", {
        token: await token(),
      }),
    addInventoryItem: async (ingredientId: string) =>
      httpRequest<InventoryItem>(baseUrl, "api/inventory", {
        method: "POST",
        token: await token(),
        body: { ingredientId },
      }),
    addIngredientByName: async (name: string) =>
      httpRequest<InventoryItem>(baseUrl, "api/inventory", {
        method: "POST",
        token: await token(),
        body: { name },
      }),
    addIngredientsFromSpeech: async (transcript: string) =>
      httpRequest<InventoryItem[]>(baseUrl, "api/inventory/speech", {
        method: "POST",
        token: await token(),
        body: { transcript },
      }),
    resolveSpokenIngredients: async (transcript: string) =>
      httpRequest<string[]>(baseUrl, "api/inventory/speech/resolve", {
        method: "POST",
        token: await token(),
        body: { transcript },
      }),
    removeInventoryItem: async (id: string) =>
      httpRequest<void>(baseUrl, `api/inventory/${id}`, {
        method: "DELETE",
        token: await token(),
      }),
    getRecommendations: async (filters: RecommendationFilters = {}) =>
      httpRequest<RecommendationResult>(baseUrl, "api/recommendations", {
        token: await token(),
        query: {
          meal: filters.meal,
          maxMinutes: filters.maxMinutes,
          difficulty: filters.difficulty,
          budgetFriendly: filters.budgetFriendly ? "1" : undefined,
          cuisine: filters.cuisine,
          dietMode: filters.dietMode,
          dishType: filters.dishType,
          tags: filters.dietaryTags?.join(","),
        },
      }),
    searchRecipes: async (q: string, limit = 40) =>
      httpRequest<Recipe[]>(baseUrl, "api/recipes", {
        query: { q, limit },
      }),
    getRecipeBySlug: async (slug: string) =>
      httpRequest<Recipe | null>(baseUrl, `api/recipes/${slug}`),
    startCookingSession: async (recipeId: string) =>
      httpRequest<CookingSession>(baseUrl, "api/cooking/sessions", {
        method: "POST",
        token: await token(),
        body: { recipeId },
      }),
    getCookingSession: async (id: string) => {
      try {
        return await httpRequest<CookingSession>(
          baseUrl,
          `api/cooking/sessions/${id}`,
          { token: await token() },
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        // Missing/expired session after DB reset or refresh — treat as null.
        if (/\bAPI 404\b/.test(msg) || /\bSESSION_NOT_FOUND\b/.test(msg)) {
          return null;
        }
        throw err;
      }
    },
    completeStep: async (id: string, stepOrder: number) =>
      httpRequest<CookingSession>(
        baseUrl,
        `api/cooking/sessions/${id}/complete-step`,
        {
          method: "POST",
          token: await token(),
          body: { stepOrder },
        },
      ),
    completeSession: async (id: string) =>
      httpRequest<CookingSession>(
        baseUrl,
        `api/cooking/sessions/${id}/complete`,
        {
          method: "POST",
          token: await token(),
        },
      ),
    abandonSession: async (id: string) =>
      httpRequest<CookingSession>(
        baseUrl,
        `api/cooking/sessions/${id}/abandon`,
        {
          method: "POST",
          token: await token(),
        },
      ),
    askAssistant: async () => {
      throw new Error("ASSISTANT_NOT_IMPLEMENTED");
    },
    sendSos: async () => {
      throw new Error("SOS_NOT_IMPLEMENTED");
    },
    getFavorites: async () =>
      httpRequest<FavoriteItem[]>(baseUrl, "api/favorites", {
        token: await token(),
      }),
    toggleFavorite: async (recipeId: string) =>
      httpRequest<boolean>(baseUrl, "api/favorites/toggle", {
        method: "POST",
        token: await token(),
        body: { recipeId },
      }),
    getHistory: async () =>
      httpRequest<HistoryItem[]>(baseUrl, "api/history", {
        token: await token(),
      }),
    getProfile: async () =>
      httpRequest<UserProfile>(baseUrl, "api/profile", {
        token: await token(),
      }),
    trackEvent: async (_event: AnalyticsEvent) => {
      /* optional later */
    },
    login: async (email: string, password: string) =>
      httpRequest<AuthSessionResponse>(baseUrl, "api/auth/login", {
        method: "POST",
        body: { email, password },
      }),
    requestOtp: async (phone: string) =>
      httpRequest<RequestOtpResponse>(baseUrl, "api/auth/otp/request", {
        method: "POST",
        body: { phone },
      }),
    verifyOtp: async (phone: string, code: string) =>
      httpRequest<AuthSessionResponse>(baseUrl, "api/auth/otp/verify", {
        method: "POST",
        body: { phone, code },
      }),
    loginWithGoogle: async (input: GoogleAuthInput) =>
      httpRequest<AuthSessionResponse>(baseUrl, "api/auth/google", {
        method: "POST",
        body: input,
      }),
  };
}

/**
 * Client facade.
 * - mock: in-memory (legacy MVP)
 * - http: Nest API + PostgreSQL
 */
export function createAtlasClient(options: AtlasClientOptions = {}) {
  const mode = options.mode ?? "mock";
  if (mode === "http") {
    const baseUrl = options.baseUrl ?? "http://localhost:4000";
    return createHttpClient(baseUrl, options.getAccessToken);
  }

  return {
    mode: "mock" as const,
    searchIngredients: mock.searchIngredients,
    getInventory: mock.getInventory,
    addInventoryItem: mock.addInventoryItem,
    addIngredientByName: mock.addIngredientByName,
    addIngredientsFromSpeech: mock.addIngredientsFromSpeech,
    resolveSpokenIngredients: mock.resolveSpokenIngredients,
    removeInventoryItem: mock.removeInventoryItem,
    getRecommendations: (filters?: RecommendationFilters) =>
      mock.getRecommendations(filters),
    searchRecipes: async (q: string, limit = 40) => {
      const { normalizePersian } = await import("@atlas/shared");
      const needle = normalizePersian(q);
      const pool = needle
        ? mock.MOCK_RECIPES.filter((r) =>
            normalizePersian(`${r.title} ${r.description} ${r.category}`).includes(
              needle,
            ),
          )
        : [...mock.MOCK_RECIPES];
      return pool.slice(0, limit);
    },
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
    requestOtp: mock.requestOtp,
    verifyOtp: mock.verifyOtp,
    loginWithGoogle: mock.loginWithGoogle,
    trackEvent: async (_event: AnalyticsEvent) => {
      // no-op in mock mode
    },
  };
}

export type AtlasClient = ReturnType<typeof createAtlasClient>;

export { MOCK_INGREDIENTS, MOCK_RECIPES, applyAuthProfile, GUEST_PROFILE } from "./mock-data";
