/** Shared API contracts for ATLAS clients. Ranking stays on the server. */

export type Difficulty = "easy" | "medium" | "hard";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "any";
export type CookingSessionStatus =
  | "active"
  | "completed"
  | "abandoned"
  | "paused";

export interface ApiSuccess<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  normalizedName: string;
  aliases: string[];
  category: string;
  popularity: number;
}

export interface InventoryItem {
  id: string;
  ingredientId: string;
  ingredient: Ingredient;
  quantity?: number | null;
  unit?: string | null;
  createdAt: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  name: string;
  quantity?: string | null;
  unit?: string | null;
  optional?: boolean;
}

export interface RecipeStep {
  id: string;
  order: number;
  instruction: string;
  tip?: string | null;
  timerSeconds?: number | null;
  imageUrl?: string | null;
}

export interface Recipe {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  meal: MealType;
  cuisine: string;
  region?: string;
  difficulty: Difficulty;
  prepMinutes: number;
  cookMinutes: number;
  totalMinutes: number;
  servings: number;
  imageUrl: string;
  dietaryTags: string[];
  budgetFriendly: boolean;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  versionId: string;
}

export interface RecommendationFilters {
  meal?: MealType;
  maxMinutes?: number;
  difficulty?: Difficulty | "any";
  dietaryTags?: string[];
  budgetFriendly?: boolean;
  cuisine?: string;
}

export type MatchTier = "exact" | "near" | "discovery";

export interface RecommendationCard {
  recipeId: string;
  slug: string;
  title: string;
  imageUrl: string;
  totalMinutes: number;
  difficulty: Difficulty;
  matchTier: MatchTier;
  matchScore: number;
  missingCount: number;
  missingIngredients: string[];
  matchedIngredients: string[];
  tags: string[];
  explanation: string;
}

export interface RecommendationResult {
  id: string;
  exact: RecommendationCard[];
  near: RecommendationCard[];
  discovery: RecommendationCard[];
  filters: RecommendationFilters;
}

export interface CookingSession {
  id: string;
  recipeId: string;
  recipeVersionId: string;
  recipeSlug: string;
  recipeTitle: string;
  status: CookingSessionStatus;
  currentStepOrder: number;
  totalSteps: number;
  steps: RecipeStep[];
  startedAt: string;
  completedAt?: string | null;
  abandonedAt?: string | null;
}

export interface FavoriteItem {
  recipeId: string;
  slug: string;
  title: string;
  imageUrl: string;
  totalMinutes: number;
  difficulty: Difficulty;
  savedAt: string;
}

export interface HistoryItem {
  sessionId: string;
  recipeId: string;
  slug: string;
  title: string;
  imageUrl: string;
  status: CookingSessionStatus;
  startedAt: string;
  endedAt?: string | null;
}

export interface UserProfile {
  id: string;
  displayName: string;
  dietaryPreferences: string[];
  defaultMaxMinutes?: number;
  locale: "fa";
}

export interface AssistantRequest {
  message: string;
  stepId?: string;
}

export interface AssistantResponse {
  reply: string;
  suggestions?: string[];
}

export interface SosRequest {
  issueCode: string;
  note?: string;
  stepId?: string;
}

export interface SosResponse {
  reply: string;
  issueCode: string;
}

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  occurredAt?: string;
}
