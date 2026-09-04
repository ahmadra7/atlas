import type {
  AuthSessionResponse,
  CookingSession,
  FavoriteItem,
  GoogleAuthInput,
  HistoryItem,
  Ingredient,
  InventoryItem,
  Recipe,
  RecommendationCard,
  RecommendationFilters,
  RecommendationResult,
  RequestOtpResponse,
  UserProfile,
} from "@atlas/contracts";
import {
  canonicalFoodName,
  compactPersian,
  ingredientsLooselyMatch,
  isLikelyFoodIngredient,
  isPantryStaple,
  normalizePersian,
} from "@atlas/shared";
import { PERSIAN_INGREDIENTS } from "./catalog/ingredients";
import { PERSIAN_RECIPES } from "./catalog/persianRecipes";

export const MOCK_INGREDIENTS: Ingredient[] = PERSIAN_INGREDIENTS;
export const MOCK_RECIPES: Recipe[] = PERSIAN_RECIPES;

export const MOCK_PROFILE: UserProfile = {
  id: "user-demo",
  displayName: "احمد رضایی",
  avatarUrl: "/avatars/user-photo.png",
  dietaryPreferences: [],
  defaultMaxMinutes: 45,
  locale: "fa",
};

export const GUEST_PROFILE: UserProfile = {
  id: "guest",
  displayName: "",
  avatarUrl: null,
  dietaryPreferences: [],
  locale: "fa",
};

let currentProfile: UserProfile | null = null;
const mockUsers = new Map<string, UserProfile>();
const otpByPhone = new Map<
  string,
  { code: string; expiresAt: number; attempts: number; sentAt: number }
>();

export function applyAuthProfile(profile: UserProfile | null) {
  currentProfile = profile;
}

function mockToken(userId: string) {
  return `mock.${userId}.${Date.now()}`;
}

function normalizeIranMobile(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, "");
  let n = digits;
  if (n.startsWith("0098")) n = n.slice(4);
  else if (n.startsWith("98")) n = n.slice(2);
  if (n.startsWith("0")) n = n.slice(1);
  if (n.length !== 10 || !n.startsWith("9")) return null;
  return `0${n}`;
}

let inventory: InventoryItem[] = [];

let favorites: FavoriteItem[] = [];
let history: HistoryItem[] = [];
const sessions = new Map<string, CookingSession>();
let recommendationSeq = 1;
const customIngredients: Ingredient[] = [];

function delay(ms = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function searchIngredients(q: string): Promise<Ingredient[]> {
  await delay(0);
  const query = normalizePersian(q);
  const pool = [...MOCK_INGREDIENTS, ...customIngredients];
  if (!query) {
    return [...pool].sort((a, b) => b.popularity - a.popularity).slice(0, 8);
  }
  return pool
    .filter((item) => {
      const haystack = normalizePersian(
        [item.name, item.normalizedName, ...item.aliases].join(" "),
      );
      const compactHay = compactPersian(haystack);
      const compactQuery = compactPersian(query);
      return (
        haystack.includes(query) ||
        compactHay.includes(compactQuery) ||
        item.aliases.some(
          (alias) =>
            normalizePersian(alias) === query ||
            compactPersian(alias) === compactQuery,
        )
      );
    })
    .slice(0, 10);
}

export async function getInventory(): Promise<InventoryItem[]> {
  await delay(0);
  return [...inventory];
}

export async function addInventoryItem(
  ingredientId: string,
): Promise<InventoryItem> {
  await delay(0);
  const existing = inventory.find((i) => i.ingredientId === ingredientId);
  if (existing) return existing;
  const ingredient =
    MOCK_INGREDIENTS.find((i) => i.id === ingredientId) ??
    customIngredients.find((i) => i.id === ingredientId);
  if (!ingredient) {
    throw new Error("INGREDIENT_NOT_FOUND");
  }
  const item: InventoryItem = {
    id: `inv-${Date.now()}`,
    ingredientId,
    ingredient,
    quantity: null,
    unit: null,
    createdAt: new Date().toISOString(),
  };
  inventory = [item, ...inventory];
  return item;
}

const SPEECH_STOPWORDS = new Set(
  [
    "من",
    "مواد",
    "ماده",
    "اولیه",
    "یخچال",
    "دارم",
    "هست",
    "هستم",
    "هستش",
    "هستن",
    "هستند",
    "هم",
    "یک",
    "یه",
    "دو",
    "سه",
    "چهار",
    "پنج",
    "چند",
    "عدد",
    "کیلو",
    "گرم",
    "لیوان",
    "قاشق",
    "و",
    "با",
    "از",
    "تا",
    "رو",
    "را",
    "که",
    "برای",
    "بزن",
    "اضافه",
    "کن",
    "کنید",
    "میخوام",
    "میخواهم",
    "تو",
    "داخل",
    "لطفا",
    "خواهش",
    "میکنم",
    "اینا",
    "اینها",
    "چی",
    "چیز",
    "چیزی",
    "دارای",
    "موجود",
    "لیست",
    "بگو",
    "بگم",
  ].map((w) => normalizePersian(w)),
);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Extract ingredient names from a spoken Persian phrase (catalog-first). */
export function resolveSpokenIngredients(transcript: string): string[] {
  const raw = normalizePersian(transcript)
    .replace(/[?!.;:…]/g, " ")
    .replace(/[،,]/g, " ")
    .replace(/\s+و\s+/g, " | ")
    .replace(/\s+با\s+/g, " | ")
    .replace(/\s+/g, " ")
    .trim();
  if (!raw) return [];

  const pool = [...MOCK_INGREDIENTS, ...customIngredients];
  const terms = pool
    .flatMap((ingredient) => {
      const labels = [
        ingredient.name,
        ingredient.normalizedName,
        ...ingredient.aliases,
      ];
      return labels.map((label) => ({
        term: normalizePersian(label),
        ingredient,
      }));
    })
    .filter((row) => row.term.length >= 2)
    .sort(
      (a, b) =>
        b.term.length - a.term.length ||
        b.ingredient.popularity - a.ingredient.popularity,
    );

  let haystack = ` ${raw.replace(/\|/g, " | ")} `;
  const found: Ingredient[] = [];
  const seenIds = new Set<string>();

  for (const { term, ingredient } of terms) {
    const re = new RegExp(
      `(^|[\\s|])${escapeRegExp(term)}(?=$|[\\s|])`,
      "g",
    );
    if (!re.test(haystack)) continue;
    if (!seenIds.has(ingredient.id)) {
      seenIds.add(ingredient.id);
      found.push(ingredient);
    }
    haystack = haystack.replace(re, " | ");
  }

  const leftovers = haystack
    .split(/[\s|]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => !SPEECH_STOPWORDS.has(t))
    .filter((t) => !/^\d+$/.test(t))
    .filter((t) => t.length >= 2);

  const names: string[] = found.map((i) => i.name);
  const seenNames = new Set(found.map((i) => normalizePersian(i.name)));

  for (const token of leftovers) {
    if (seenNames.has(token)) continue;
    seenNames.add(token);
    names.push(token);
  }

  return names;
}

/** Add many ingredients from speech; skips duplicates already in inventory. */
export async function addIngredientsFromSpeech(
  transcript: string,
): Promise<InventoryItem[]> {
  await delay(0);
  const names = resolveSpokenIngredients(transcript);
  const added: InventoryItem[] = [];
  for (const name of names) {
    const item = await addIngredientByName(name);
    added.push(item);
  }
  return added;
}

/** Add by free-text name: reuse catalog match or create custom ingredient. */
export async function addIngredientByName(name: string): Promise<InventoryItem> {
  await delay(0);
  const resolved = canonicalFoodName(name) ?? name;
  const query = normalizePersian(resolved);
  if (!query) throw new Error("EMPTY_NAME");

  const catalogMatch = [...MOCK_INGREDIENTS, ...customIngredients].find(
    (item) => {
      const haystack = normalizePersian(
        [item.name, item.normalizedName, ...item.aliases].join(" "),
      );
      const compactHay = compactPersian(haystack);
      const compactQuery = compactPersian(query);
      return (
        haystack === query ||
        item.normalizedName === query ||
        compactHay === compactQuery ||
        item.aliases.some(
          (alias) =>
            normalizePersian(alias) === query ||
            compactPersian(alias) === compactQuery,
        )
      );
    },
  );

  if (catalogMatch) {
    return addInventoryItem(catalogMatch.id);
  }

  const loose = [...MOCK_INGREDIENTS, ...customIngredients].find((item) =>
    ingredientsLooselyMatch(name, item.name),
  );
  if (loose) return addInventoryItem(loose.id);

  const byNameInInventory = inventory.find(
    (i) => normalizePersian(i.ingredient.name) === query,
  );
  if (byNameInInventory) return byNameInInventory;

  if (!isLikelyFoodIngredient(resolved)) {
    throw new Error("UNKNOWN_INGREDIENT");
  }

  const custom: Ingredient = {
    id: `ing-custom-${Date.now()}`,
    name: resolved.trim(),
    normalizedName: query,
    aliases: [resolved.trim()],
    category: "عمومی",
    popularity: 1,
  };
  customIngredients.push(custom);
  return addInventoryItem(custom.id);
}

export async function removeInventoryItem(id: string): Promise<void> {
  await delay(0);
  inventory = inventory.filter((item) => item.id !== id);
}

function buildCard(
  recipe: Recipe,
  ownedIds: Set<string>,
): RecommendationCard {
  const required = recipe.ingredients.filter(
    (i) => !i.optional && !isPantryStaple(i.name),
  );
  const missing = required.filter((i) => !ownedIds.has(i.ingredientId));
  const matched = required.filter((i) => ownedIds.has(i.ingredientId));
  const missingCount = missing.length;
  const matchTier =
    missingCount === 0 ? "exact" : missingCount === 1 ? "near" : "discovery";
  const matchScore = Math.round(
    ((required.length - missingCount) / Math.max(required.length, 1)) * 100,
  );

  return {
    recipeId: recipe.id,
    slug: recipe.slug,
    title: recipe.title,
    imageUrl: recipe.imageUrl,
    totalMinutes: recipe.totalMinutes,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    meal: recipe.meal,
    cuisine: recipe.cuisine,
    matchTier,
    matchScore,
    missingCount,
    missingIngredients: missing.map((m) => m.name),
    matchedIngredients: matched.map((m) => m.name),
    tags: [
      ...recipe.dietaryTags,
      recipe.budgetFriendly ? "اقتصادی" : "",
    ].filter(Boolean),
    explanation:
      missingCount === 0
        ? "همه مواد لازم را دارید."
        : missingCount === 1
          ? `فقط «${missing[0]?.name}» کم است.`
          : `${missingCount} ماده کم دارید.`,
  };
}

export async function getRecommendations(
  filters: RecommendationFilters = {},
): Promise<RecommendationResult> {
  await delay(0);
  const ownedIds = new Set(inventory.map((i) => i.ingredientId));
  let cards = MOCK_RECIPES.map((recipe) => buildCard(recipe, ownedIds));

  if (filters.meal && filters.meal !== "any") {
    cards = cards.filter((card) => {
      const recipe = MOCK_RECIPES.find((r) => r.id === card.recipeId);
      return recipe?.meal === filters.meal;
    });
  }
  if (filters.maxMinutes) {
    cards = cards.filter((card) => card.totalMinutes <= filters.maxMinutes!);
  }
  if (filters.difficulty && filters.difficulty !== "any") {
    cards = cards.filter((card) => card.difficulty === filters.difficulty);
  }
  if (filters.budgetFriendly) {
    cards = cards.filter((card) => {
      const recipe = MOCK_RECIPES.find((r) => r.id === card.recipeId);
      return recipe?.budgetFriendly;
    });
  }
  if (filters.cuisine && filters.cuisine !== "any") {
    cards = cards.filter((card) => {
      const recipe = MOCK_RECIPES.find((r) => r.id === card.recipeId);
      return recipe?.cuisine === filters.cuisine;
    });
  }
  if (filters.dietMode && filters.dietMode !== "any") {
    const dietHints = ["رژیمی", "کم‌کالری", "گیاهی", "وگان", "بدون گلوتن"];
    cards = cards.filter((card) => {
      const recipe = MOCK_RECIPES.find((r) => r.id === card.recipeId);
      const tags = recipe?.dietaryTags ?? [];
      const isDiet = tags.some((tag) =>
        dietHints.some((hint) => tag.includes(hint)),
      );
      return filters.dietMode === "diet" ? isDiet : !isDiet;
    });
  }
  if (filters.dishType && filters.dishType !== "any") {
    const dishMap: Record<string, string[]> = {
      main: [
        "غذای اصلی",
        "خورشت",
        "پلو",
        "کباب",
        "خوراک",
        "کوکو",
        "غذای شمالی",
        "آبگوشت",
      ],
      appetizer: ["پیش‌غذا"],
      soup: ["سوپ", "آش", "آش و عدسی", "آبگوشت"],
      salad: ["سالاد"],
      dessert: ["دسر"],
      sweet: ["دسر"],
      drink: ["نوشیدنی"],
      side: ["مخلفات", "صبحانه"],
      fast: ["فست‌فود", "غذای سریع"],
    };
    const allowed = dishMap[filters.dishType] ?? [];
    cards = cards.filter((card) => {
      const recipe = MOCK_RECIPES.find((r) => r.id === card.recipeId);
      if (!recipe) return false;
      return allowed.some(
        (label) =>
          recipe.category === label || recipe.category.includes(label),
      );
    });
  }
  if (filters.dietaryTags && filters.dietaryTags.length > 0) {
    cards = cards.filter((card) => {
      const recipe = MOCK_RECIPES.find((r) => r.id === card.recipeId);
      const tags = recipe?.dietaryTags ?? [];
      return filters.dietaryTags!.every((wanted) =>
        tags.some((tag) => tag.includes(wanted)),
      );
    });
  }

  const exact = cards
    .filter((c) => c.matchTier === "exact")
    .sort((a, b) => b.matchScore - a.matchScore);
  const near = cards
    .filter((c) => c.matchTier === "near")
    .sort((a, b) => b.matchScore - a.matchScore);
  const discovery = cards
    .filter((c) => c.matchTier === "discovery")
    .sort((a, b) => a.missingCount - b.missingCount || b.matchScore - a.matchScore);

  return {
    id: `rec-${recommendationSeq++}`,
    exact,
    near,
    discovery,
    filters,
  };
}

export async function getRecipeBySlug(slug: string): Promise<Recipe | null> {
  await delay(0);
  return MOCK_RECIPES.find((r) => r.slug === slug) ?? null;
}

export async function startCookingSession(
  recipeId: string,
): Promise<CookingSession> {
  await delay(0);
  const recipe = MOCK_RECIPES.find((r) => r.id === recipeId);
  if (!recipe) throw new Error("RECIPE_NOT_FOUND");
  const session: CookingSession = {
    id: `cook-${Date.now()}`,
    recipeId: recipe.id,
    recipeVersionId: recipe.versionId,
    recipeSlug: recipe.slug,
    recipeTitle: recipe.title,
    status: "active",
    currentStepOrder: 1,
    totalSteps: recipe.steps.length,
    steps: recipe.steps,
    startedAt: new Date().toISOString(),
  };
  sessions.set(session.id, session);
  history = [
    {
      sessionId: session.id,
      recipeId: recipe.id,
      slug: recipe.slug,
      title: recipe.title,
      imageUrl: recipe.imageUrl,
      status: "active",
      startedAt: session.startedAt,
    },
    ...history,
  ];
  return session;
}

export async function getCookingSession(
  sessionId: string,
): Promise<CookingSession | null> {
  await delay(0);
  return sessions.get(sessionId) ?? null;
}

export async function completeStep(
  sessionId: string,
  stepOrder: number,
): Promise<CookingSession> {
  await delay(0);
  const session = sessions.get(sessionId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  const step =
    session.steps.find((s) => s.order === stepOrder) ??
    session.steps.find((s) => s.id === String(stepOrder));
  if (!step) throw new Error("STEP_NOT_FOUND");
  const nextOrder = Math.min(step.order + 1, session.totalSteps);
  const updated: CookingSession = {
    ...session,
    currentStepOrder: nextOrder,
  };
  sessions.set(sessionId, updated);
  return updated;
}

export async function completeSession(
  sessionId: string,
): Promise<CookingSession> {
  await delay(0);
  const session = sessions.get(sessionId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  const updated: CookingSession = {
    ...session,
    status: "completed",
    completedAt: new Date().toISOString(),
  };
  sessions.set(sessionId, updated);
  history = history.map((h) =>
    h.sessionId === sessionId
      ? { ...h, status: "completed", endedAt: updated.completedAt }
      : h,
  );
  return updated;
}

export async function abandonSession(
  sessionId: string,
  _reason?: string,
): Promise<CookingSession> {
  await delay(0);
  const session = sessions.get(sessionId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  const updated: CookingSession = {
    ...session,
    status: "abandoned",
    abandonedAt: new Date().toISOString(),
  };
  sessions.set(sessionId, updated);
  history = history.map((h) =>
    h.sessionId === sessionId
      ? { ...h, status: "abandoned", endedAt: updated.abandonedAt }
      : h,
  );
  return updated;
}

export async function askAssistant(
  _sessionId: string,
  message: string,
): Promise<{ reply: string; suggestions: string[] }> {
  await delay(0);
  return {
    reply: `راهنمایی کوتاه: روی همین مرحله تمرکز کنید. «${message}» را با حرارت ملایم‌تر و صبر بیشتر امتحان کنید. اگر نتیجه مطلوب نبود، از دکمه کمک فوری استفاده کنید.`,
    suggestions: ["حرارت را کم کنم؟", "چقدر صبر کنم؟", "جایگزین ماده چیست؟"],
  };
}

export async function sendSos(
  _sessionId: string,
  issueCode: string,
): Promise<{ reply: string; issueCode: string }> {
  await delay(0);
  const answers: Record<string, string> = {
    burning: "حرارت را کم کنید، کمی آب یا روغن اضافه کنید و هم بزنید.",
    too_salty: "کمی ماده اصلی بدون نمک یا آب جوشیده اضافه کنید تا تعادل برقرار شود.",
    undercooked: "در ظرف را بگذارید و ۵ تا ۱۰ دقیقه با حرارت ملایم ادامه دهید.",
    missing_tool: "با ابزار جایگزین ساده (قاشق چوبی، در قابلمه، کاسه) ادامه دهید.",
    other: "یک لحظه مکث کنید، مواد را بررسی کنید و از مرحله فعلی دوباره شروع کنید.",
  };
  return {
    issueCode,
    reply: answers[issueCode] ?? answers.other,
  };
}

export async function getFavorites(): Promise<FavoriteItem[]> {
  await delay(0);
  return [...favorites];
}

export async function toggleFavorite(recipeId: string): Promise<boolean> {
  await delay(0);
  const exists = favorites.some((f) => f.recipeId === recipeId);
  if (exists) {
    favorites = favorites.filter((f) => f.recipeId !== recipeId);
    return false;
  }
  const recipe = MOCK_RECIPES.find((r) => r.id === recipeId);
  if (!recipe) throw new Error("RECIPE_NOT_FOUND");
  favorites = [
    {
      recipeId: recipe.id,
      slug: recipe.slug,
      title: recipe.title,
      imageUrl: recipe.imageUrl,
      totalMinutes: recipe.totalMinutes,
      difficulty: recipe.difficulty,
      savedAt: new Date().toISOString(),
    },
    ...favorites,
  ];
  return true;
}

export async function getHistory(): Promise<HistoryItem[]> {
  await delay(0);
  return [...history];
}

export async function getProfile(): Promise<UserProfile> {
  await delay(0);
  return currentProfile ?? GUEST_PROFILE;
}

export async function requestOtp(phone: string): Promise<RequestOtpResponse> {
  await delay(420);
  const normalized = normalizeIranMobile(phone);
  if (!normalized) throw new Error("INVALID_PHONE");
  const prev = otpByPhone.get(normalized);
  const now = Date.now();
  if (prev && now - prev.sentAt < 60_000) {
    throw new Error("OTP_RATE_LIMIT");
  }
  const code = String(10000 + Math.floor(Math.random() * 90000));
  otpByPhone.set(normalized, {
    code,
    expiresAt: now + 5 * 60_000,
    attempts: 0,
    sentAt: now,
  });
  return {
    sent: true,
    expiresInSec: 300,
    resendInSec: 90,
    debugCode: code,
  };
}

export async function verifyOtp(
  phone: string,
  code: string,
): Promise<AuthSessionResponse> {
  await delay(280);
  const normalized = normalizeIranMobile(phone);
  if (!normalized) throw new Error("INVALID_PHONE");
  const entry = otpByPhone.get(normalized);
  if (!entry) throw new Error("OTP_NOT_FOUND");
  if (Date.now() > entry.expiresAt) {
    otpByPhone.delete(normalized);
    throw new Error("OTP_EXPIRED");
  }
  entry.attempts += 1;
  if (entry.attempts > 5) {
    otpByPhone.delete(normalized);
    throw new Error("OTP_LOCKED");
  }
  if (entry.code !== code.trim()) throw new Error("OTP_INVALID");
  otpByPhone.delete(normalized);

  const key = `phone:${normalized}`;
  const existing = mockUsers.get(key);
  const user: UserProfile = existing ?? {
    id: `user-${normalized}`,
    displayName: "",
    avatarUrl: null,
    phone: normalized,
    email: null,
    provider: "phone",
    dietaryPreferences: [],
    locale: "fa",
  };
  mockUsers.set(key, user);
  currentProfile = user;
  return { accessToken: mockToken(user.id), user };
}

export async function loginWithGoogle(
  input: GoogleAuthInput,
): Promise<AuthSessionResponse> {
  await delay(240);
  let googleId = input.googleId?.trim();
  let email = input.email?.trim().toLowerCase();
  let displayName = input.displayName?.trim() || "";
  let avatarUrl = input.avatarUrl ?? null;

  if (input.accessToken) {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${input.accessToken}` },
    });
    if (res.ok) {
      const info = (await res.json()) as {
        sub?: string;
        email?: string;
        name?: string;
        given_name?: string;
        picture?: string;
      };
      googleId = info.sub?.trim() || googleId;
      email = info.email?.trim().toLowerCase() || email;
      displayName = info.name?.trim() || info.given_name?.trim() || displayName;
      avatarUrl = info.picture?.trim() || avatarUrl;
    }
  }

  if (!googleId && !email) throw new Error("GOOGLE_PROFILE_MISSING");
  const key = `google:${googleId ?? email}`;
  const existing = mockUsers.get(key);
  const user: UserProfile = {
    id: existing?.id ?? `user-google-${googleId ?? email}`,
    displayName: displayName || existing?.displayName || "",
    avatarUrl: avatarUrl ?? existing?.avatarUrl ?? null,
    email: email ?? existing?.email ?? null,
    phone: existing?.phone ?? null,
    provider: "google",
    dietaryPreferences: existing?.dietaryPreferences ?? [],
    defaultMaxMinutes: existing?.defaultMaxMinutes,
    locale: "fa",
  };
  mockUsers.set(key, user);
  currentProfile = user;
  return { accessToken: mockToken(user.id), user };
}
