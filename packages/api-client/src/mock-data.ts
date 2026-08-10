import type {
  CookingSession,
  FavoriteItem,
  HistoryItem,
  Ingredient,
  InventoryItem,
  Recipe,
  RecommendationCard,
  RecommendationFilters,
  RecommendationResult,
  UserProfile,
} from "@atlas/contracts";
import { normalizePersian } from "@atlas/shared";

export const MOCK_INGREDIENTS: Ingredient[] = [
  {
    id: "ing-egg",
    name: "تخم‌مرغ",
    normalizedName: "تخم مرغ",
    aliases: ["تخم مرغ", "تخم‌مرغ", "egg"],
    category: "لبنیات و پروتئین",
    popularity: 98,
  },
  {
    id: "ing-onion",
    name: "پیاز",
    normalizedName: "پیاز",
    aliases: ["پیاز"],
    category: "سبزیجات",
    popularity: 95,
  },
  {
    id: "ing-tomato",
    name: "گوجه‌فرنگی",
    normalizedName: "گوجه فرنگی",
    aliases: ["گوجه", "گوجه فرنگی", "گوجه‌فرنگی"],
    category: "سبزیجات",
    popularity: 94,
  },
  {
    id: "ing-potato",
    name: "سیب‌زمینی",
    normalizedName: "سیب زمینی",
    aliases: ["سیب زمینی", "سیب‌زمینی"],
    category: "سبزیجات",
    popularity: 92,
  },
  {
    id: "ing-rice",
    name: "برنج",
    normalizedName: "برنج",
    aliases: ["برنج ایرانی", "برنج"],
    category: "غلات",
    popularity: 97,
  },
  {
    id: "ing-chicken",
    name: "مرغ",
    normalizedName: "مرغ",
    aliases: ["سینه مرغ", "ران مرغ", "مرغ"],
    category: "پروتئین",
    popularity: 90,
  },
  {
    id: "ing-oil",
    name: "روغن",
    normalizedName: "روغن",
    aliases: ["روغن مایع", "روغن"],
    category: "خشکبار و روغن",
    popularity: 88,
  },
  {
    id: "ing-salt",
    name: "نمک",
    normalizedName: "نمک",
    aliases: ["نمک"],
    category: "ادویه",
    popularity: 99,
  },
  {
    id: "ing-pepper",
    name: "فلفل سیاه",
    normalizedName: "فلفل سیاه",
    aliases: ["فلفل", "فلفل سیاه"],
    category: "ادویه",
    popularity: 85,
  },
  {
    id: "ing-garlic",
    name: "سیر",
    normalizedName: "سیر",
    aliases: ["سیر"],
    category: "سبزیجات",
    popularity: 86,
  },
  {
    id: "ing-yogurt",
    name: "ماست",
    normalizedName: "ماست",
    aliases: ["ماست"],
    category: "لبنیات",
    popularity: 84,
  },
  {
    id: "ing-lentil",
    name: "عدس",
    normalizedName: "عدس",
    aliases: ["عدس"],
    category: "حبوبات",
    popularity: 80,
  },
  {
    id: "ing-bread",
    name: "نان",
    normalizedName: "نان",
    aliases: ["نان لواش", "نان سنگک", "نان"],
    category: "نان",
    popularity: 89,
  },
  {
    id: "ing-butter",
    name: "کره",
    normalizedName: "کره",
    aliases: ["کره"],
    category: "لبنیات",
    popularity: 78,
  },
  {
    id: "ing-cucumber",
    name: "خیار",
    normalizedName: "خیار",
    aliases: ["خیار"],
    category: "سبزیجات",
    popularity: 82,
  },
];

const omeletteSteps = [
  {
    id: "step-om-1",
    order: 1,
    instruction: "تخم‌مرغ‌ها را در کاسه بشکنید و با نمک و فلفل هم بزنید.",
    tip: "هم زدن زیاد باعث پف بیشتر املت می‌شود.",
    timerSeconds: null,
    imageUrl: "/images/recipes/omelette.svg",
  },
  {
    id: "step-om-2",
    order: 2,
    instruction: "پیاز خردشده را در کمی روغن تفت دهید تا طلایی شود.",
    tip: "حرارت متوسط نگه دارید تا پیاز نسوزد.",
    timerSeconds: 180,
    imageUrl: "/images/recipes/omelette.svg",
  },
  {
    id: "step-om-3",
    order: 3,
    instruction: "مخلوط تخم‌مرغ را اضافه کنید و تا بسته شدن سطح، بپزید.",
    tip: "در صورت تمایل گوجه حلقه‌ای روی املت بگذارید.",
    timerSeconds: 240,
    imageUrl: "/images/recipes/omelette.svg",
  },
];

export const MOCK_RECIPES: Recipe[] = [
  {
    id: "rec-omelette",
    slug: "persian-omelette",
    title: "املت گوجه‌فرنگی",
    description: "صبحانه سریع و آشنا با مواد رایج آشپزخانه ایرانی.",
    category: "صبحانه",
    meal: "breakfast",
    cuisine: "ایرانی",
    region: "عمومی",
    difficulty: "easy",
    prepMinutes: 5,
    cookMinutes: 10,
    totalMinutes: 15,
    servings: 2,
    imageUrl: "/images/recipes/omelette.svg",
    dietaryTags: ["گیاهی-اختیاری"],
    budgetFriendly: true,
    versionId: "rv-omelette-1",
    ingredients: [
      { ingredientId: "ing-egg", name: "تخم‌مرغ", quantity: "۳", unit: "عدد" },
      { ingredientId: "ing-tomato", name: "گوجه‌فرنگی", quantity: "۲", unit: "عدد" },
      { ingredientId: "ing-onion", name: "پیاز", quantity: "۱", unit: "عدد کوچک" },
      { ingredientId: "ing-oil", name: "روغن", quantity: "۱", unit: "قاشق" },
      { ingredientId: "ing-salt", name: "نمک", quantity: null, unit: null },
      { ingredientId: "ing-pepper", name: "فلفل سیاه", quantity: null, unit: null },
    ],
    steps: omeletteSteps,
  },
  {
    id: "rec-potato-eggs",
    slug: "potato-egg-skillet",
    title: "سیب‌زمینی و تخم‌مرغ تابه‌ای",
    description: "غذای سریع با مواد موجود؛ مناسب ناهار سبک.",
    category: "غذای سریع",
    meal: "lunch",
    cuisine: "ایرانی",
    difficulty: "easy",
    prepMinutes: 10,
    cookMinutes: 20,
    totalMinutes: 30,
    servings: 2,
    imageUrl: "/images/recipes/potato-egg.svg",
    dietaryTags: [],
    budgetFriendly: true,
    versionId: "rv-potato-1",
    ingredients: [
      { ingredientId: "ing-potato", name: "سیب‌زمینی", quantity: "۲", unit: "عدد" },
      { ingredientId: "ing-egg", name: "تخم‌مرغ", quantity: "۲", unit: "عدد" },
      { ingredientId: "ing-onion", name: "پیاز", quantity: "۱", unit: "عدد" },
      { ingredientId: "ing-oil", name: "روغن", quantity: "۲", unit: "قاشق" },
      { ingredientId: "ing-salt", name: "نمک", quantity: null, unit: null },
    ],
    steps: [
      {
        id: "step-pe-1",
        order: 1,
        instruction: "سیب‌زمینی‌ها را خلالی خرد کنید و کمی نمک بزنید.",
        tip: "خلال‌ها را یکدست کنید تا همزمان بپزند.",
        timerSeconds: null,
        imageUrl: "/images/recipes/potato-egg.svg",
      },
      {
        id: "step-pe-2",
        order: 2,
        instruction: "در تابه با روغن تفت دهید تا طلایی و نرم شوند.",
        tip: "در صورت نیاز کمی آب اضافه کنید و در تابه را بگذارید.",
        timerSeconds: 720,
        imageUrl: "/images/recipes/potato-egg.svg",
      },
      {
        id: "step-pe-3",
        order: 3,
        instruction: "تخم‌مرغ‌ها را روی سیب‌زمینی بشکنید و تا پخت کامل صبر کنید.",
        tip: "زرده را نیم‌پز یا کامل بپزید؛ هر دو قابل قبول است.",
        timerSeconds: 300,
        imageUrl: "/images/recipes/potato-egg.svg",
      },
    ],
  },
  {
    id: "rec-adasi",
    slug: "adasi",
    title: "عدسی",
    description: "عدسی مقوی برای صبحانه یا شام سبک.",
    category: "آش و عدسی",
    meal: "breakfast",
    cuisine: "ایرانی",
    difficulty: "easy",
    prepMinutes: 10,
    cookMinutes: 35,
    totalMinutes: 45,
    servings: 3,
    imageUrl: "/images/recipes/adasi.svg",
    dietaryTags: ["گیاهی"],
    budgetFriendly: true,
    versionId: "rv-adasi-1",
    ingredients: [
      { ingredientId: "ing-lentil", name: "عدس", quantity: "۱", unit: "لیوان" },
      { ingredientId: "ing-onion", name: "پیاز", quantity: "۱", unit: "عدد" },
      { ingredientId: "ing-potato", name: "سیب‌زمینی", quantity: "۱", unit: "عدد" },
      { ingredientId: "ing-oil", name: "روغن", quantity: "۱", unit: "قاشق" },
      { ingredientId: "ing-salt", name: "نمک", quantity: null, unit: null },
      { ingredientId: "ing-bread", name: "نان", quantity: null, unit: null, optional: true },
    ],
    steps: [
      {
        id: "step-ad-1",
        order: 1,
        instruction: "عدس را بشویید و با آب روی حرارت ملایم بپزید.",
        tip: "کف روی عدس را در ابتدا بگیرید.",
        timerSeconds: 1200,
        imageUrl: "/images/recipes/adasi.svg",
      },
      {
        id: "step-ad-2",
        order: 2,
        instruction: "پیاز و سیب‌زمینی خردشده را اضافه کنید.",
        tip: "نمک را نزدیک پایان پخت بریزید.",
        timerSeconds: 900,
        imageUrl: "/images/recipes/adasi.svg",
      },
      {
        id: "step-ad-3",
        order: 3,
        instruction: "با نان تازه سرو کنید.",
        tip: "در صورت تمایل کمی کره روی عدسی داغ بگذارید.",
        timerSeconds: null,
        imageUrl: "/images/recipes/adasi.svg",
      },
    ],
  },
  {
    id: "rec-chicken-rice",
    slug: "simple-chicken-rice",
    title: "مرغ و برنج ساده",
    description: "شام کامل با پخت مرحله‌به‌مرحله و زمان‌بندی واضح.",
    category: "غذای اصلی",
    meal: "dinner",
    cuisine: "ایرانی",
    difficulty: "medium",
    prepMinutes: 15,
    cookMinutes: 45,
    totalMinutes: 60,
    servings: 4,
    imageUrl: "/images/recipes/chicken-rice.svg",
    dietaryTags: [],
    budgetFriendly: false,
    versionId: "rv-chicken-1",
    ingredients: [
      { ingredientId: "ing-chicken", name: "مرغ", quantity: "۵۰۰", unit: "گرم" },
      { ingredientId: "ing-rice", name: "برنج", quantity: "۳", unit: "لیوان" },
      { ingredientId: "ing-onion", name: "پیاز", quantity: "۱", unit: "عدد" },
      { ingredientId: "ing-garlic", name: "سیر", quantity: "۲", unit: "حبه" },
      { ingredientId: "ing-oil", name: "روغن", quantity: "۲", unit: "قاشق" },
      { ingredientId: "ing-salt", name: "نمک", quantity: null, unit: null },
      { ingredientId: "ing-yogurt", name: "ماست", quantity: "۲", unit: "قاشق", optional: true },
    ],
    steps: [
      {
        id: "step-cr-1",
        order: 1,
        instruction: "مرغ را با پیاز، سیر، نمک و کمی روغن تفت دهید.",
        tip: "تا تغییر رنگ سطح مرغ ادامه دهید.",
        timerSeconds: 600,
        imageUrl: "/images/recipes/chicken-rice.svg",
      },
      {
        id: "step-cr-2",
        order: 2,
        instruction: "برنج را آبکش کنید و برای دم‌کردن آماده کنید.",
        tip: "آب برنج باید کمی شور باشد.",
        timerSeconds: 600,
        imageUrl: "/images/recipes/chicken-rice.svg",
      },
      {
        id: "step-cr-3",
        order: 3,
        instruction: "مرغ را کنار برنج بچینید و با حرارت ملایم دم کنید.",
        tip: "در پایان ۱۰ دقیقه حرارت را خیلی کم کنید.",
        timerSeconds: 1200,
        imageUrl: "/images/recipes/chicken-rice.svg",
      },
    ],
  },
];

export const MOCK_PROFILE: UserProfile = {
  id: "user-demo",
  displayName: "کاربر آزمایشی",
  dietaryPreferences: [],
  defaultMaxMinutes: 45,
  locale: "fa",
};

let inventory: InventoryItem[] = [
  {
    id: "inv-1",
    ingredientId: "ing-egg",
    ingredient: MOCK_INGREDIENTS[0],
    quantity: 4,
    unit: "عدد",
    createdAt: new Date().toISOString(),
  },
  {
    id: "inv-2",
    ingredientId: "ing-onion",
    ingredient: MOCK_INGREDIENTS[1],
    quantity: 2,
    unit: "عدد",
    createdAt: new Date().toISOString(),
  },
  {
    id: "inv-3",
    ingredientId: "ing-tomato",
    ingredient: MOCK_INGREDIENTS[2],
    quantity: 3,
    unit: "عدد",
    createdAt: new Date().toISOString(),
  },
  {
    id: "inv-4",
    ingredientId: "ing-oil",
    ingredient: MOCK_INGREDIENTS[6],
    quantity: 1,
    unit: "بطری",
    createdAt: new Date().toISOString(),
  },
  {
    id: "inv-5",
    ingredientId: "ing-salt",
    ingredient: MOCK_INGREDIENTS[7],
    quantity: 1,
    unit: null,
    createdAt: new Date().toISOString(),
  },
];

let favorites: FavoriteItem[] = [];
let history: HistoryItem[] = [];
const sessions = new Map<string, CookingSession>();
let recommendationSeq = 1;

function delay(ms = 280): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function searchIngredients(q: string): Promise<Ingredient[]> {
  await delay();
  const query = normalizePersian(q);
  if (!query) {
    return [...MOCK_INGREDIENTS]
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 8);
  }
  return MOCK_INGREDIENTS.filter((item) => {
    const haystack = normalizePersian(
      [item.name, item.normalizedName, ...item.aliases].join(" "),
    );
    return haystack.includes(query);
  }).slice(0, 10);
}

export async function getInventory(): Promise<InventoryItem[]> {
  await delay(180);
  return [...inventory];
}

export async function addInventoryItem(
  ingredientId: string,
): Promise<InventoryItem> {
  await delay(180);
  const existing = inventory.find((i) => i.ingredientId === ingredientId);
  if (existing) return existing;
  const ingredient = MOCK_INGREDIENTS.find((i) => i.id === ingredientId);
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

export async function removeInventoryItem(id: string): Promise<void> {
  await delay(120);
  inventory = inventory.filter((item) => item.id !== id);
}

function buildCard(
  recipe: Recipe,
  ownedIds: Set<string>,
): RecommendationCard {
  const required = recipe.ingredients.filter((i) => !i.optional);
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
    difficulty: recipe.difficulty,
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
  await delay(420);
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
  await delay(220);
  return MOCK_RECIPES.find((r) => r.slug === slug) ?? null;
}

export async function startCookingSession(
  recipeId: string,
): Promise<CookingSession> {
  await delay(250);
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
  await delay(160);
  return sessions.get(sessionId) ?? null;
}

export async function completeStep(
  sessionId: string,
  stepId: string,
): Promise<CookingSession> {
  await delay(120);
  const session = sessions.get(sessionId);
  if (!session) throw new Error("SESSION_NOT_FOUND");
  const step = session.steps.find((s) => s.id === stepId);
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
  await delay(160);
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
  await delay(160);
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
  await delay(350);
  return {
    reply: `راهنمایی کوتاه: روی همین مرحله تمرکز کنید. «${message}» را با حرارت ملایم‌تر و صبر بیشتر امتحان کنید. اگر نتیجه مطلوب نبود، از دکمه کمک فوری استفاده کنید.`,
    suggestions: ["حرارت را کم کنم؟", "چقدر صبر کنم؟", "جایگزین ماده چیست؟"],
  };
}

export async function sendSos(
  _sessionId: string,
  issueCode: string,
): Promise<{ reply: string; issueCode: string }> {
  await delay(300);
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
  await delay(160);
  return [...favorites];
}

export async function toggleFavorite(recipeId: string): Promise<boolean> {
  await delay(140);
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
  await delay(160);
  return [...history];
}

export async function getProfile(): Promise<UserProfile> {
  await delay(120);
  return MOCK_PROFILE;
}
