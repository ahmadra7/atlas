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
    aliases: ["تخم مرغ", "تخم‌مرغ", "تخممرغ", "egg"],
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
    aliases: ["گوجه", "گوجه فرنگی", "گوجه‌فرنگی", "گوجهفرنگي", "گوجهفرنگى"],
    category: "سبزیجات",
    popularity: 94,
  },
  {
    id: "ing-potato",
    name: "سیب‌زمینی",
    normalizedName: "سیب زمینی",
    aliases: ["سیب زمینی", "سیب‌زمینی", "سیبزمینی", "سیب زمينى"],
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
    imageUrl:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=480&q=40&fm=webp",
  },
  {
    id: "step-om-2",
    order: 2,
    instruction: "پیاز خردشده را در کمی روغن تفت دهید تا طلایی شود.",
    tip: "حرارت متوسط نگه دارید تا پیاز نسوزد.",
    timerSeconds: 180,
    imageUrl:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=480&q=40&fm=webp",
  },
  {
    id: "step-om-3",
    order: 3,
    instruction: "مخلوط تخم‌مرغ را اضافه کنید و تا بسته شدن سطح، بپزید.",
    tip: "در صورت تمایل گوجه حلقه‌ای روی املت بگذارید.",
    timerSeconds: 240,
    imageUrl:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=480&q=40&fm=webp",
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
    imageUrl:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=480&q=40&fm=webp",
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
    imageUrl:
      "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=480&q=40&fm=webp",
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
        imageUrl:
          "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=480&q=40&fm=webp",
      },
      {
        id: "step-pe-2",
        order: 2,
        instruction: "در تابه با روغن تفت دهید تا طلایی و نرم شوند.",
        tip: "در صورت نیاز کمی آب اضافه کنید و در تابه را بگذارید.",
        timerSeconds: 720,
        imageUrl:
          "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=480&q=40&fm=webp",
      },
      {
        id: "step-pe-3",
        order: 3,
        instruction: "تخم‌مرغ‌ها را روی سیب‌زمینی بشکنید و تا پخت کامل صبر کنید.",
        tip: "زرده را نیم‌پز یا کامل بپزید؛ هر دو قابل قبول است.",
        timerSeconds: 300,
        imageUrl:
          "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=480&q=40&fm=webp",
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
    imageUrl:
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=480&q=40&fm=webp",
    dietaryTags: ["گیاهی", "رژیمی", "کم‌کالری"],
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
        imageUrl:
          "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=480&q=40&fm=webp",
      },
      {
        id: "step-ad-2",
        order: 2,
        instruction: "پیاز و سیب‌زمینی خردشده را اضافه کنید.",
        tip: "نمک را نزدیک پایان پخت بریزید.",
        timerSeconds: 900,
        imageUrl:
          "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=480&q=40&fm=webp",
      },
      {
        id: "step-ad-3",
        order: 3,
        instruction: "با نان تازه سرو کنید.",
        tip: "در صورت تمایل کمی کره روی عدسی داغ بگذارید.",
        timerSeconds: null,
        imageUrl:
          "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=480&q=40&fm=webp",
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
    imageUrl:
      "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=480&q=40&fm=webp",
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
        imageUrl:
          "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=480&q=40&fm=webp",
      },
      {
        id: "step-cr-2",
        order: 2,
        instruction: "برنج را آبکش کنید و برای دم‌کردن آماده کنید.",
        tip: "آب برنج باید کمی شور باشد.",
        timerSeconds: 600,
        imageUrl:
          "https://images.unsplash.com/photo-1516684669134-de6f7c473a2a?auto=format&fit=crop&w=480&q=40&fm=webp",
      },
      {
        id: "step-cr-3",
        order: 3,
        instruction: "مرغ را کنار برنج بچینید و با حرارت ملایم دم کنید.",
        tip: "در پایان ۱۰ دقیقه حرارت را خیلی کم کنید.",
        timerSeconds: 1200,
        imageUrl:
          "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=480&q=40&fm=webp",
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
      return haystack.includes(query);
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
  const query = normalizePersian(name);
  if (!query) throw new Error("EMPTY_NAME");

  const catalogMatch = [...MOCK_INGREDIENTS, ...customIngredients].find(
    (item) => {
      const haystack = normalizePersian(
        [item.name, item.normalizedName, ...item.aliases].join(" "),
      );
      return haystack === query || item.normalizedName === query;
    },
  );

  if (catalogMatch) {
    return addInventoryItem(catalogMatch.id);
  }

  const byNameInInventory = inventory.find(
    (i) => normalizePersian(i.ingredient.name) === query,
  );
  if (byNameInInventory) return byNameInInventory;

  const custom: Ingredient = {
    id: `ing-custom-${Date.now()}`,
    name: name.trim(),
    normalizedName: query,
    aliases: [name.trim()],
    category: "سفارشی",
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
      main: ["غذای اصلی"],
      appetizer: ["پیش‌غذا"],
      soup: ["سوپ و آش", "آش و عدسی"],
      salad: ["سالاد"],
      dessert: ["دسر"],
      sweet: ["شیرینی"],
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
  stepId: string,
): Promise<CookingSession> {
  await delay(0);
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
  return MOCK_PROFILE;
}
