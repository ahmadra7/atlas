import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const sqlPath = "c:/Users/ahmadra/Desktop/food.sql";
if (!fs.existsSync(sqlPath)) {
  console.error("SQL file not found at " + sqlPath);
  process.exit(1);
}

console.log("Reading food.sql...");
const sql = fs.readFileSync(sqlPath, "utf8");

function parseSqlInserts(sqlText, tableName) {
  const rows = [];
  const prefix = `INSERT INTO \`${tableName}\``;
  let pos = 0;
  while ((pos = sqlText.indexOf(prefix, pos)) !== -1) {
    const valuesPos = sqlText.indexOf("VALUES", pos);
    if (valuesPos === -1) break;
    let i = valuesPos + 6;
    while (i < sqlText.length && sqlText[i] !== "(") i++;

    while (i < sqlText.length) {
      if (sqlText[i] === ";") {
        pos = i + 1;
        break;
      }
      if (sqlText[i] === "(") {
        i++;
        const values = [];
        let curVal = "";
        let inString = false;
        let isEscaped = false;

        while (i < sqlText.length) {
          const char = sqlText[i];
          if (inString) {
            if (isEscaped) {
              if (char === "n") curVal += "\n";
              else if (char === "r") curVal += "\r";
              else if (char === "t") curVal += "\t";
              else if (char === "\\") curVal += "\\";
              else if (char === "'") curVal += "'";
              else if (char === '"') curVal += '"';
              else curVal += char;
              isEscaped = false;
            } else if (char === "\\") {
              isEscaped = true;
            } else if (char === "'") {
              if (sqlText[i + 1] === "'") {
                curVal += "'";
                i++;
              } else {
                inString = false;
              }
            } else {
              curVal += char;
            }
          } else {
            if (char === "'") {
              inString = true;
              curVal = "";
            } else if (char === "," || char === ")") {
              const trimmed = curVal.trim();
              if (trimmed === "NULL") values.push(null);
              else if (!isNaN(trimmed) && trimmed !== "") values.push(Number(trimmed));
              else values.push(curVal);
              curVal = "";
              if (char === ")") {
                rows.push(values);
                i++;
                while (i < sqlText.length && sqlText[i] !== "(" && sqlText[i] !== ";") i++;
                break;
              }
            } else {
              curVal += char;
            }
          }
          i++;
        }
      } else {
        i++;
      }
    }
  }
  return rows;
}

console.log("Parsing tables from SQL dump...");
const rawCategories = parseSqlInserts(sql, "categories");
const rawCountries = parseSqlInserts(sql, "countries");
const rawIngredients = parseSqlInserts(sql, "ingredients");
const rawRecipes = parseSqlInserts(sql, "recipes");
const rawRecipeIngredients = parseSqlInserts(sql, "recipe_ingredients");
const rawCook = parseSqlInserts(sql, "cook");

// Categories map
const catMap = new Map();
for (const c of rawCategories) {
  catMap.set(c[0], { id: c[0], name: (c[1] || "").trim(), parentId: c[3] });
}

// Countries map
const countryMap = new Map();
for (const c of rawCountries) {
  countryMap.set(c[1], (c[2] || "").trim());
}
countryMap.set("IR", "ایرانی");
countryMap.set("IT", "ایتالیایی");
countryMap.set("TR", "ترکی");
countryMap.set("FR", "فرانسوی");
countryMap.set("CN", "چینی");
countryMap.set("IN", "هندی");
countryMap.set("ES", "اسپانیایی");
countryMap.set("GR", "یونانی");
countryMap.set("LB", "لبنانی");
countryMap.set("MX", "مکزیکی");
countryMap.set("US", "آمریکایی");
countryMap.set("UZ", "ازبکستانی");
countryMap.set("AF", "افغانستانی");
countryMap.set("EG", "مصری");
countryMap.set("PT", "پرتغالی");
countryMap.set("JP", "ژاپنی");
countryMap.set("KR", "کره‌ای");
countryMap.set("KZ", "قزاقستانی");
countryMap.set("MA", "مراکشی");
countryMap.set("MY", "مالزیایی");
countryMap.set("PK", "پاکستانی");
countryMap.set("YE", "یمنی");

// Ingredients map: id -> name
const ingMap = new Map();
for (const ing of rawIngredients) {
  const cleanName = (ing[1] || "").trim().replace(/^برای تهیه[^:]*:\s*/, "");
  ingMap.set(ing[0], cleanName);
}

// Recipe ingredients map: recipe_id -> array of { ingredientId, name, quantity, unit }
const recipeIngMap = new Map();
for (const ri of rawRecipeIngredients) {
  const rId = ri[1];
  const ingId = ri[2];
  const ingName = ingMap.get(ingId) || "";
  if (!ingName) continue;
  if (!recipeIngMap.has(rId)) recipeIngMap.set(rId, []);
  recipeIngMap.get(rId).push({
    ingredientId: ingId,
    name: ingName,
    quantity: ri[3] != null ? String(ri[3]).trim() : null,
    unit: ri[4] != null ? String(ri[4]).trim() : null,
  });
}

// Persian string helpers
function normalizePersian(input) {
  if (!input) return "";
  return String(input)
    .trim()
    .replace(/\u200c/g, " ")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("fa");
}

function ingredientIdFromName(name) {
  const n = normalizePersian(name);
  let hash = 5381;
  for (let i = 0; i < n.length; i += 1) {
    hash = (hash * 33) ^ n.charCodeAt(i);
  }
  return `ing-${(hash >>> 0).toString(16)}`;
}

// Thematic food photography
const THEME_IMAGES = {
  rice: "https://images.unsplash.com/photo-1516684669134-de6f7c473a2a?auto=format&fit=crop&w=800&q=60&fm=webp",
  stew: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=60&fm=webp",
  kebab: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=800&q=60&fm=webp",
  soup: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=60&fm=webp",
  salad: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=60&fm=webp",
  dessert: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=60&fm=webp",
  cake: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=60&fm=webp",
  omelette: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=60&fm=webp",
  pasta: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=60&fm=webp",
  pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=60&fm=webp",
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=60&fm=webp",
  seafood: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=60&fm=webp",
  chicken: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=60&fm=webp",
  meat: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=60&fm=webp",
  bread: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=60&fm=webp",
  drink: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=60&fm=webp",
  appetizer: "https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=800&q=60&fm=webp",
  default: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=60&fm=webp",
};

function pickImage(title, category) {
  const text = `${title} ${category}`.toLowerCase();
  if (/پلو|چلو|برنج|کته|ته دیگ|ته چین/.test(text)) return THEME_IMAGES.rice;
  if (/خورش|خورشت|قورمه|قیمه|فسنجان|آبگوشت|دیزی/.test(text)) return THEME_IMAGES.stew;
  if (/کباب|کوفته|جوجه/.test(text)) return THEME_IMAGES.kebab;
  if (/سوپ|آش|عدسی/.test(text)) return THEME_IMAGES.soup;
  if (/سالاد|تبوله/.test(text)) return THEME_IMAGES.salad;
  if (/کیک|مافین|کاپ کیک/.test(text)) return THEME_IMAGES.cake;
  if (/دسر|بستنی|حلوا|فرنی|ژله|پودینگ|شیرینی|کوکی|بیسکویت|کلوچه|تارت/.test(text)) return THEME_IMAGES.dessert;
  if (/پیتزا/.test(text)) return THEME_IMAGES.pizza;
  if (/برگر|ساندویچ|تست|اسنک|لقمه/.test(text)) return THEME_IMAGES.burger;
  if (/پاستا|ماکارونی|لازانیا|اسپاگتی|نودل/.test(text)) return THEME_IMAGES.pasta;
  if (/ماهی|میگو|تیلاپیا|سالمون|تن ماهی|دریایی|قزل/.test(text)) return THEME_IMAGES.seafood;
  if (/مرغ|جوجه|بال|بوقلمون/.test(text)) return THEME_IMAGES.chicken;
  if (/گوشت|استیک|راسته|فیله/.test(text)) return THEME_IMAGES.meat;
  if (/املت|نیمرو|خاگینه|تخم مرغ|کوکو|کتلت/.test(text)) return THEME_IMAGES.omelette;
  if (/نان|خمیر|پیراشکی|بورک/.test(text)) return THEME_IMAGES.bread;
  if (/شربت|اسموتی|چای|دمنوش|قهوه|آبمیوه|موهیتو|نوشیدنی/.test(text)) return THEME_IMAGES.drink;
  if (/فینگر فود|پیش غذا|بورانی|میرزا قاسمی|کشک بادمجان|دیپ/.test(text)) return THEME_IMAGES.appetizer;
  return THEME_IMAGES.default;
}

function parseTimerSeconds(text) {
  const persianDigits = { "۰": 0, "۱": 1, "۲": 2, "۳": 3, "۴": 4, "۵": 5, "۶": 6, "۷": 7, "۸": 8, "۹": 9 };
  const latinized = text.replace(/[۰-۹]/g, (d) => persianDigits[d]);
  
  const hourMatch = latinized.match(/(\d+)\s*ساعت/);
  if (hourMatch) return parseInt(hourMatch[1], 10) * 3600;

  const minRangeMatch = latinized.match(/(\d+)\s*(?:تا|-)\s*(\d+)\s*دقیقه/);
  if (minRangeMatch) return parseInt(minRangeMatch[2], 10) * 60;

  const minMatch = latinized.match(/(\d+)\s*دقیقه/);
  if (minMatch) return parseInt(minMatch[1], 10) * 60;

  return null;
}

const measurePattern = /(?:(\d+(?:\/\d+)?(?:\.\d+)?)\s*)?(گرم|کیلوگرم|کیلو|پیمانه|قاشق(?: غذاخوری| سوپخوری| چایخوری| مرباخوری)?|لیوان|عدد|حبه|شاخه|ساقه|بسته|ورقه|میلی(?: لیتر)?)/;

function extractIngredientsFromLines(lines) {
  const extracted = [];
  const remainingLines = [];

  for (const line of lines) {
    if (line.length > 250) {
      remainingLines.push(line);
      continue;
    }
    const chunks = line.split(/\s*[\.·•]\s+|\s*،\s*|\s*,\s*/);
    let chunkMatches = 0;
    const lineIngs = [];

    for (const chunk of chunks) {
      const trimmed = chunk.trim();
      const m = trimmed.match(measurePattern);
      if (m) {
        const unit = m[0].trim();
        const cleanName = trimmed
          .replace(m[0], "")
          .replace(/به مقدار لازم|به میزان لازم|دلخواه|کافی|برای سرو|خرد شده|رنده شده/g, "")
          .trim();
        if (cleanName.length >= 2 && !/طرز|تهیه|فر را|قابلمه|سپس/.test(cleanName)) {
          lineIngs.push({
            name: cleanName,
            unit,
            quantity: m[1] || null,
          });
          chunkMatches++;
        }
      }
    }

    if (chunkMatches > 0 && chunkMatches >= chunks.length / 2) {
      extracted.push(...lineIngs);
    } else {
      remainingLines.push(line);
    }
  }

  return { extracted, remainingLines };
}

function parseInstructions(title, rawInstructions, needsIngExtraction = false) {
  if (!rawInstructions) {
    return {
      description: "",
      steps: [
        {
          order: 1,
          instruction: "طرز تهیه این دستور در دسترس نیست.",
          tip: undefined,
          timerSeconds: null,
        },
      ],
      extraIngredients: [],
    };
  }

  let lines = rawInstructions
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let extraIngredients = [];
  if (needsIngExtraction) {
    const res = extractIngredientsFromLines(lines);
    extraIngredients = res.extracted;
    lines = res.remainingLines;
  }

  // Check if there is "طرز تهیه:"
  let prepIdx = -1;
  for (let idx = 0; idx < lines.length; idx++) {
    if (lines[idx].includes("طرز تهیه:")) {
      prepIdx = idx;
      break;
    }
  }

  let descLines = [];
  let stepLines = [];

  if (prepIdx !== -1) {
    // Before prepIdx is description
    for (let i = 0; i < prepIdx; i++) {
      if (lines[i] !== title && !lines[i].startsWith(title + " ")) {
        descLines.push(lines[i]);
      }
    }
    // prepIdx line might contain the start of steps
    const prepLine = lines[prepIdx];
    const afterPrep = prepLine.replace(/^.*طرز تهیه:\s*/, "").trim();
    if (afterPrep) stepLines.push(afterPrep);
    // subsequent lines are steps
    for (let i = prepIdx + 1; i < lines.length; i++) {
      stepLines.push(lines[i]);
    }
  } else {
    // If first line is title, drop it
    let startIndex = 0;
    if (lines[0] === title || lines[0].startsWith(title + " ")) {
      startIndex = 1;
    }
    if (lines.length - startIndex > 2) {
      descLines.push(lines[startIndex]);
      startIndex++;
    }
    for (let i = startIndex; i < lines.length; i++) {
      stepLines.push(lines[i]);
    }
  }

  if (stepLines.length === 0) {
    stepLines = lines.filter((l) => l !== title);
  }
  if (stepLines.length === 0) {
    stepLines = ["مواد را طبق دستور آماده کرده و نوش جان کنید."];
  }

  const description = descLines.join(" ").slice(0, 300);

  const steps = stepLines.map((lineText, idx) => {
    let instruction = lineText;
    let tip = undefined;
    if (/^نکته\s*(?:\d+)?\s*:/.test(lineText)) {
      tip = lineText;
    }
    const timerSeconds = parseTimerSeconds(lineText);
    return {
      order: idx + 1,
      instruction,
      tip,
      timerSeconds,
    };
  });

  return { description, steps, extraIngredients };
}

function mapMeal(categoryName, title) {
  const text = `${categoryName} ${title}`.toLowerCase();
  if (/صبحانه|املت|نیمرو|پن کیک|مربا|نان|تست|کرپ|خاگینه/.test(text)) return "breakfast";
  if (/دسر|کیک|شیرینی|نوشیدنی|حلوا|بستنی|تنقلات|سالاد|پیش غذا|فینگر فود|سوپ|آش|ترشی|سس|چاشنی/.test(text)) return "snack";
  if (/خورش|پلو|کباب|خوراک|گوشت|مرغ|ماکارونی|پاستا|کوفته|پیتزا|برگر|ساندویچ|لازانیا|ماهی|میگو|دلمه|کوکو|کتلت/.test(text)) return "dinner";
  return "any";
}

function mapDifficulty(totalMinutes) {
  if (totalMinutes <= 25) return "easy";
  if (totalMinutes > 60) return "hard";
  return "medium";
}

function isVegetarian(title, category, ingredients) {
  const meatKeywords = ["گوشت", "مرغ", "ماهی", "میگو", "سوسیس", "کالباس", "ژامبون", "بوقلمون", "فیله", "استیک", "راسته", "شیشلیک", "کباب"];
  const text = `${title} ${category}`.toLowerCase();
  for (const kw of meatKeywords) {
    if (text.includes(kw)) return false;
  }
  for (const ing of ingredients) {
    const ingName = ing.name.toLowerCase();
    for (const kw of meatKeywords) {
      if (ingName.includes(kw)) return false;
    }
  }
  return true;
}

console.log("Transforming recipes...");
const allRecipes = [];
const ingredientUsageCount = new Map();

for (const r of rawRecipes) {
  const id = Number(r[0]);
  const name = (r[1] || "").trim();
  const cookingTime = Number(r[3]) || 0;
  const prepTime = Number(r[4]) || 0;
  const servingSize = Number(r[5]) || 4;
  const rawInstructions = r[6] || "";
  const categoryId = Number(r[7]);
  const countryCode = (r[8] || "IR").trim();

  const categoryName = catMap.get(categoryId)?.name || "عمومی";
  const cuisine = countryMap.get(countryCode) || "ایرانی";

  const rawIngs = recipeIngMap.get(id) || [];
  const { description, steps, extraIngredients } = parseInstructions(
    name,
    rawInstructions,
    rawIngs.length === 0,
  );

  const combinedIngs = rawIngs.length > 0 ? rawIngs : extraIngredients;
  const ingredients = combinedIngs.map((ri) => {
    const ingId = ingredientIdFromName(ri.name);
    // count usage
    ingredientUsageCount.set(ri.name, (ingredientUsageCount.get(ri.name) || 0) + 1);
    return {
      ingredientId: ingId,
      name: ri.name,
      quantity: ri.quantity || null,
      unit: ri.unit || null,
      optional: false,
    };
  });

  const totalMinutes = (prepTime + cookingTime) || 30;
  const meal = mapMeal(categoryName, name);
  const difficulty = mapDifficulty(totalMinutes);
  const veg = isVegetarian(name, categoryName, ingredients);

  const dietaryTags = [];
  if (veg) dietaryTags.push("گیاهی");
  if (categoryName.includes("رژیمی") || categoryName.includes("کم کالری")) dietaryTags.push("رژیمی");

  const recipeId = `recipe-${id}`;
  const recipeVersionId = `v1-${recipeId}`;

  const formattedSteps = steps.map((s) => ({
    id: `step-${id}-${s.order}`,
    recipeVersionId,
    order: s.order,
    instruction: s.instruction,
    tip: s.tip,
    timerSeconds: s.timerSeconds,
  }));

  allRecipes.push({
    id: recipeId,
    slug: recipeId,
    title: name,
    description: description || `${name} لذیذ و خانگی با دستور پخت مرحله‌به‌مرحله.`,
    category: categoryName,
    meal,
    cuisine,
    difficulty,
    prepMinutes: prepTime,
    cookMinutes: cookingTime,
    totalMinutes,
    servings: servingSize || 4,
    imageUrl: pickImage(name, categoryName),
    dietaryTags,
    budgetFriendly: veg || totalMinutes <= 30,
    ingredients,
    steps: formattedSteps,
    versionId: recipeVersionId,
  });
}

// Add extra recipes from cook table (IDs 2336 to 2419)
const existingRecipeIds = new Set(rawRecipes.map((r) => Number(r[0])));
for (const c of rawCook) {
  const id = Number(c[0]);
  if (existingRecipeIds.has(id)) continue;

  const title = (c[1] || "").trim();
  const mavad = (c[2] || "").trim();
  const rawInstruction = c[3] || "";
  const cat = (c[4] || "").trim();
  const subCat = (c[5] || "").trim();
  const prepTimeStr = c[6] || "";
  const cookTimeStr = c[7] || "";
  const nafarStr = c[8] || "";
  const desc = (c[9] || "").trim();
  const countryCode = (c[10] || "IR").trim();

  const prepTime = parseTimerSeconds(prepTimeStr) ? Math.round(parseTimerSeconds(prepTimeStr) / 60) : 15;
  const cookTime = parseTimerSeconds(cookTimeStr) ? Math.round(parseTimerSeconds(cookTimeStr) / 60) : 30;
  const nafarMatch = nafarStr.match(/(\d+|[۰-۹]+)/);
  const servings = nafarMatch ? parseInt(nafarMatch[1], 10) : 4;

  const categoryName = subCat || cat || "عمومی";
  const cuisine = countryMap.get(countryCode) || "بین‌المللی";

  const { description, steps } = parseInstructions(title, rawInstruction);

  // Parse mavad into ingredients
  const mavadParts = mavad.split(/[،,\n\r]+/).map((p) => p.trim()).filter((p) => p.length > 0);
  const ingredients = mavadParts.map((item) => {
    const cleanName = item.replace(/\d+.*$/, "").trim() || item;
    const ingId = ingredientIdFromName(cleanName);
    ingredientUsageCount.set(cleanName, (ingredientUsageCount.get(cleanName) || 0) + 1);
    return {
      ingredientId: ingId,
      name: cleanName,
      quantity: null,
      unit: null,
      optional: false,
    };
  });

  const totalMinutes = prepTime + cookTime || 30;
  const meal = mapMeal(categoryName, title);
  const difficulty = mapDifficulty(totalMinutes);
  const veg = isVegetarian(title, categoryName, ingredients);

  const dietaryTags = [];
  if (veg) dietaryTags.push("گیاهی");

  const recipeId = `recipe-${id}`;
  const recipeVersionId = `v1-${recipeId}`;

  const formattedSteps = steps.map((s) => ({
    id: `step-${id}-${s.order}`,
    recipeVersionId,
    order: s.order,
    instruction: s.instruction,
    tip: s.tip,
    timerSeconds: s.timerSeconds,
  }));

  allRecipes.push({
    id: recipeId,
    slug: recipeId,
    title,
    description: desc || description || `${title} لذیذ و خانگی.`,
    category: categoryName,
    meal,
    cuisine,
    difficulty,
    prepMinutes: prepTime,
    cookMinutes: cookTime,
    totalMinutes,
    servings: servings || 4,
    imageUrl: pickImage(title, categoryName),
    dietaryTags,
    budgetFriendly: veg,
    ingredients,
    steps: formattedSteps,
    versionId: recipeVersionId,
  });
}

console.log(`Total transformed recipes: ${allRecipes.length}`);

// Generate ingredients catalog
const allIngredientNames = new Set([
  ...ingMap.values(),
  ...ingredientUsageCount.keys(),
]);

const sortedIngredients = [...allIngredientNames]
  .filter((n) => n && n.trim().length >= 2)
  .sort((a, b) => {
    const countA = ingredientUsageCount.get(a) || 0;
    const countB = ingredientUsageCount.get(b) || 0;
    return countB - countA;
  });

console.log(`Total unique ingredients: ${sortedIngredients.length}`);

// Build ingredients objects with popularity
const maxUsage = Math.max(1, ...ingredientUsageCount.values());
const catalogIngredients = sortedIngredients.map((name, index) => {
  const usage = ingredientUsageCount.get(name) || 0;
  // Scale popularity from 1 to 99 based on usage and rank
  const popularity = usage > 0 
    ? Math.min(99, Math.max(10, Math.round((usage / maxUsage) * 99)))
    : Math.max(1, 10 - Math.floor(index / 100));

  return {
    id: ingredientIdFromName(name),
    name,
    normalizedName: normalizePersian(name),
    category: "عمومی",
    popularity,
    aliases: [name],
  };
});

// Paths to write
const apiCatalogDir = path.resolve(rootDir, "packages/api-client/src/catalog");
const recipesJsonPath = path.resolve(apiCatalogDir, "recipesData.json");
const persianRecipesTsPath = path.resolve(apiCatalogDir, "persianRecipes.ts");
const ingredientsTsPath = path.resolve(apiCatalogDir, "ingredients.ts");
const sharedFoodNamesPath = path.resolve(rootDir, "packages/shared/src/foodIngredients.ts");

console.log("Writing recipesData.json...");
fs.writeFileSync(recipesJsonPath, JSON.stringify(allRecipes), "utf8");

console.log("Writing persianRecipes.ts...");
const persianRecipesContent = `import type { Recipe } from "@atlas/contracts";
import recipesData from "./recipesData.json";

export const PERSIAN_RECIPES: Recipe[] = recipesData as unknown as Recipe[];
`;
fs.writeFileSync(persianRecipesTsPath, persianRecipesContent, "utf8");

console.log("Writing ingredients.ts...");
const ingredientsTsContent = `import type { Ingredient } from "@atlas/contracts";
import { normalizePersian } from "@atlas/shared";
import { ingredientIdFromName } from "./ids";
import { PERSIAN_RECIPES } from "./persianRecipes";

const EXTRA_ALIASES: Record<string, string[]> = {
  "گوجه‌فرنگی": ["گوجه", "گوجه فرنگی"],
  "سیب‌زمینی": ["سیب زمینی", "سیبزمینی"],
  "تخم‌مرغ": ["تخم مرغ", "تخممرغ"],
  "مرغ": ["سینه مرغ", "ران مرغ"],
  "سینه مرغ": ["مرغ"],
  "گوشت خورشتی": ["گوشت", "گوشت گوسفند", "گوشت گوساله"],
  "گوشت چرخ‌کرده": ["گوشت چرخ کرده", "گوشت چرخکرده"],
  "گوشت چرخکرده": ["گوشت چرخ کرده", "گوشت"],
  "گوشت با استخوان": ["گوشت"],
  "رب گوجه فرنگی": ["رب گوجه"],
  "نان": ["نان لواش", "نان سنگک", "نان بربری"],
  "نان سنگک": ["سنگک", "نان"],
  "سبزی قورمه": ["سبزی قرمه", "سبزی خورشتی"],
  "سبزی کوکو": ["سبزی کوکوسبزی"],
  "سبزی آش": ["سبزی آش رشته"],
  "فلفل سیاه": ["فلفل"],
  "جو پرک": ["جو"],
  "نخود فرنگی": ["نخودفرنگی"],
  "تن ماهی": [
    "تن",
    "تنماهی",
    "تون ماهی",
    "تونا",
    "تون",
    "tuna",
    "ماهی تن",
    "کنسرو تن",
    "کنسرو تن ماهی",
    "کنسرو ماهی",
  ],
};

// Raw list of ingredients from food database with usage-based popularity
const RAW_INGREDIENTS = ${JSON.stringify(catalogIngredients, null, 2)};

export const PERSIAN_INGREDIENTS: Ingredient[] = RAW_INGREDIENTS.map((item) => {
  const extra = EXTRA_ALIASES[item.name] ?? [];
  return {
    ...item,
    aliases: [...new Set([item.name, item.normalizedName, ...extra])],
  };
});
`;
fs.writeFileSync(ingredientsTsPath, ingredientsTsContent, "utf8");

console.log("Updating packages/shared/src/foodIngredients.ts...");
// Read existing aliases from foodIngredients.ts to keep them
let existingFoodAliases = {};
try {
  const currentShared = fs.readFileSync(sharedFoodNamesPath, "utf8");
  const aliasesMatch = currentShared.match(/export const FOOD_ALIASES[^{]*({[\s\S]*?});/);
  if (aliasesMatch) {
    // preserve aliases definition
  }
} catch {}

const uniqueFoodNames = [...new Set([
  ...sortedIngredients,
])].filter((n) => n.length >= 2);

const foodIngredientsFileContent = `/**
 * Persian kitchen ingredients imported from food database.
 * Used for speech recognition, chip matching, and pincer auto-detection.
 */
export const FOOD_NAMES = ${JSON.stringify(uniqueFoodNames, null, 2)};

export const FOOD_ALIASES: Record<string, string[]> = {
  "گوجه‌فرنگی": [
    "گوجه",
    "گوجه فرنگی",
    "گوجه‌فرنگی",
    "گوجه پخته",
    "گوجه رنده‌شده",
  ],
  "سیب‌زمینی": ["سیب زمینی", "سیبزمینی", "سیب‌زمینی", "سیب زمینی پخته"],
  "تخم‌مرغ": ["تخم مرغ", "تخممرغ", "تخم‌مرغ", "تخم"],
  "پیاز": ["پیاز داغ", "پیازداغ", "پیاز خرد شده", "پیاز سرخ‌شده"],
  "سیر": ["سیر داغ", "سیرداغ", "حبه سیر", "سیر تازه"],
  "مرغ": ["سینه مرغ", "ران مرغ", "فیله مرغ", "گوشت مرغ"],
  "سینه مرغ": ["مرغ", "فیله مرغ"],
  "ران مرغ": ["مرغ"],
  "گوشت خورشتی": [
    "گوشت",
    "گوشت قرمز",
    "گوشت گوسفندی",
    "گوشت گوساله",
    "گوشت تکه‌ای",
  ],
  "گوشت چرخ‌کرده": [
    "گوشت چرخ کرده",
    "گوشت چرخکرده",
    "چرخ‌کرده",
    "چرخی",
    "گوشت چرخ",
  ],
  "رب گوجه فرنگی": ["رب گوجه", "رب", "ربگوجه"],
  "لوبیا قرمز": ["لوبیا", "کنسرو لوبیا قرمز"],
  "لوبیا چیتی": ["لوبیا", "کنسرو لوبیا چیتی"],
  "عدس": ["عدس پخته", "کنسرو عدس"],
  "نخود": ["نخود آبگوشتی", "کنسرو نخود"],
  "لپه": ["لپه باقلا", "لپه پخته"],
  "روغن مایع": ["روغن", "روغن سرخ‌کردنی", "روغن خوراکی"],
  "روغن زیتون": ["روغن زیتون فرابکر"],
  "فلفل سیاه": ["فلفل", "پودر فلفل سیاه"],
  "فلفل قرمز": ["فلفل تند", "پودر فلفل قرمز"],
  "سبزی قورمه": ["سبزی قرمه", "سبزی خورشتی", "سبزی سرخ‌کرده"],
  "سبزی کوکو": ["سبزی کوکوسبزی", "سبزی کوکو سبزی"],
  "سبزی آش": ["سبزی آش رشته"],
  "کشک": ["کشک پاستوریزه", "کشک مایع"],
  "رشته آشی": ["رشته آش", "رشته"],
  "تن ماهی": [
    "تن",
    "تنماهی",
    "تون ماهی",
    "تونا",
    "تون",
    "tuna",
    "ماهی تن",
    "کنسرو تن",
    "کنسرو تن ماهی",
    "کنسرو ماهی",
  ],
};
`;
fs.writeFileSync(sharedFoodNamesPath, foodIngredientsFileContent, "utf8");

// Also create apps/api/data/food-catalog.json for backend
const apiDataDir = path.resolve(rootDir, "apps/api/data");
if (!fs.existsSync(apiDataDir)) fs.mkdirSync(apiDataDir, { recursive: true });
fs.writeFileSync(path.resolve(apiDataDir, "food-catalog.json"), JSON.stringify(allRecipes), "utf8");

console.log("SUCCESS! All catalogs generated from food.sql.");
