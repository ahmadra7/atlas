/** Shared API contracts for ATLAS clients. Ranking stays on the server. */

export type Difficulty = "easy" | "medium" | "hard";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "any";
export type DietMode = "any" | "diet" | "regular";
export type DishType =
  | "any"
  | "main"
  | "appetizer"
  | "soup"
  | "salad"
  | "dessert"
  | "sweet"
  | "drink"
  | "side"
  | "fast";
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
  subcategory?: string | null;
  meal: MealType;
  cuisine: string;
  region?: string;
  difficulty: Difficulty;
  prepMinutes: number;
  cookMinutes: number;
  totalMinutes: number;
  servings: number;
  imageUrl: string;
  caloriesPerServing?: number | null;
  cookingMethod?: string | null;
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
  dietMode?: DietMode;
  dishType?: DishType;
}

export type MatchTier = "exact" | "near" | "discovery";

export interface RecommendationCard {
  recipeId: string;
  slug: string;
  title: string;
  imageUrl: string;
  totalMinutes: number;
  servings: number;
  difficulty: Difficulty;
  meal: MealType;
  cuisine: string;
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

export type AuthProviderKind = "phone" | "google" | "password";

export interface UserProfile {
  id: string;
  displayName: string;
  /** Profile photo URL. When missing, UI shows the chef-hat fallback. */
  avatarUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  provider?: AuthProviderKind;
  dietaryPreferences: string[];
  defaultMaxMinutes?: number;
  locale: "fa";
}

export interface AuthSessionResponse {
  accessToken: string;
  user: UserProfile;
}

export interface RequestOtpResponse {
  sent: true;
  expiresInSec: number;
  resendInSec: number;
  /** Present only in mock/dev so the designer can complete the OTP flow without SMS. */
  debugCode?: string;
}

export interface GoogleAuthInput {
  accessToken?: string;
  idToken?: string;
  googleId?: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string | null;
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

/** Local catalog admin (header/detail CRUD). Not used by ranking. */
export interface AdminRecipeHeader {
  id: string;
  slug: string;
  title: string;
  category: string;
  subcategory?: string | null;
  meal: MealType;
  cuisine: string;
  difficulty: Difficulty;
  totalMinutes: number;
  servings: number;
  imageUrl: string;
  published: boolean;
  verified: boolean;
  deletedAt?: string | null;
  ingredientCount: number;
  stepCount: number;
  updatedAt: string;
}

export interface AdminRecipeIngredient {
  id?: string;
  ingredientId: string;
  name: string;
  quantity?: string | null;
  unit?: string | null;
  optional?: boolean;
}

export interface AdminRecipeDetail {
  id: string;
  slug: string;
  sourceExternalId?: string | null;
  title: string;
  description: string;
  category: string;
  subcategory?: string | null;
  meal: MealType;
  cuisine: string;
  region?: string | null;
  difficulty: Difficulty;
  prepMinutes: number;
  cookMinutes: number;
  totalMinutes: number;
  servings: number;
  imageUrl: string;
  caloriesPerServing?: number | null;
  cookingMethod?: string | null;
  dietaryTags: string[];
  budgetFriendly: boolean;
  verified: boolean;
  published: boolean;
  deletedAt?: string | null;
  versionId: string;
  versionNumber: number;
  ingredients: AdminRecipeIngredient[];
  steps: RecipeStep[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminRecipeList {
  items: AdminRecipeHeader[];
  total: number;
  page: number;
  limit: number;
}
