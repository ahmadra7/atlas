/**
 * Clean recipesData.json used by seed + mock client:
 * - drop instruction-like "ingredients" (prose dumped into name)
 * - move article "N - Item : …" lists from steps → ingredients
 * - normalize duplicated qty/unit («150» + «150 گرم»)
 * - drop empty / near-empty stubs
 * - keep one recipe per normalized Persian title (richest wins)
 *
 * Usage:
 *   node scripts/clean-recipe-catalog.mjs
 *   node scripts/clean-recipe-catalog.mjs --dry-run
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ROOT = resolve(import.meta.dirname, "..");
const CATALOG = resolve(
  ROOT,
  "packages/api-client/src/catalog/recipesData.json",
);
const DRY = process.argv.includes("--dry-run");

// Prefer built shared package; fall back to inline copy if not built.
let normalizeRecipeContent;
let normalizePersian;
try {
  const shared = require(resolve(ROOT, "packages/shared/dist/index.js"));
  normalizeRecipeContent = shared.normalizeRecipeContent;
  normalizePersian = shared.normalizePersian;
} catch {
  const BOILERPLATE_RE = /لذیذ و خانگی/;
  const INSTRUCTION_HINT_RE =
    /(بریزید|دم کنید|روش کار|می\s?توانید|جوشانده|تفت بدهید|مخلوط کنید|دقیقه آن را|برای استفاده از|نکت[هة]\s*:|فر را روشن|در قالب|روی شعله)/;
  const ARTICLE_SECTION_RE = /^\d+\s*[-–.]\s*.{2,90}\s*[:：]/;
  const TIP_LINE_RE = /^نکت[هة]\s*(?:\d+)?\s*:/;
  const LEADING_INDEX_RE = /^\d+\s*[-–.]\s*/;
  const ARTICLE_TITLE_RE = /\d+\s*نوع|انواع\s+|چند\s+نوع/;

  normalizePersian = (input) =>
    String(input ?? "")
      .trim()
      .replace(/\u200c/g, " ")
      .replace(/ي/g, "ی")
      .replace(/ك/g, "ک")
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/\s+/g, " ")
      .toLocaleLowerCase("fa");

  function isInstructionLikeIngredientName(name) {
    const s = String(name ?? "").trim();
    if (!s) return true;
    if (s.length >= 55) return true;
    if (s.length >= 35 && INSTRUCTION_HINT_RE.test(s)) return true;
    if (/^\d+\s*[-–.]/.test(s) && s.length > 25) return true;
    if ((s.match(/[.!?۔]/g) ?? []).length >= 2 && s.length > 40) return true;
    return false;
  }

  function sanitizeIngredientAmount(quantity, unit) {
    let q = String(quantity ?? "").trim();
    let u = String(unit ?? "").trim();
    if (q && u.startsWith(q)) u = u.slice(q.length).trim();
    return { quantity: q || null, unit: u || null };
  }

  function sanitizeIngredientLines(lines) {
    const out = [];
    for (const line of lines) {
      if (isInstructionLikeIngredientName(line.name)) continue;
      const amount = sanitizeIngredientAmount(line.quantity, line.unit);
      out.push({
        ...line,
        name: String(line.name ?? "").trim(),
        quantity: amount.quantity,
        unit: amount.unit,
      });
    }
    return out;
  }

  function isArticleListSteps(steps, title) {
    if (!steps || steps.length < 3) return false;
    const texts = steps
      .map((s) => String(s.instruction ?? "").trim())
      .filter(Boolean);
    if (texts.length < 3) return false;
    const sectionHeaders = texts.filter((t) => ARTICLE_SECTION_RE.test(t));
    const tipLines = texts.filter((t) => TIP_LINE_RE.test(t));
    const titleLooksArticle = ARTICLE_TITLE_RE.test(String(title ?? ""));
    if (sectionHeaders.length >= 3) return true;
    if (sectionHeaders.length >= 2 && tipLines.length >= 2) return true;
    if (titleLooksArticle && sectionHeaders.length >= 2) return true;
    return false;
  }

  normalizeRecipeContent = ({ title, ingredients, steps }) => {
    const cleaned = sanitizeIngredientLines(ingredients ?? []);
    const sorted = [...(steps ?? [])].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );
    if (!isArticleListSteps(sorted, title)) {
      return { ingredients: cleaned, steps: sorted };
    }
    const items = [...cleaned];
    for (const step of sorted) {
      const raw = String(step.instruction ?? "").trim();
      if (!raw) continue;
      if (TIP_LINE_RE.test(raw)) {
        if (items.length > 0) {
          const prev = items[items.length - 1];
          items[items.length - 1] = {
            ...prev,
            name: `${prev.name} — ${raw}`,
          };
        }
        continue;
      }
      const name = raw.replace(LEADING_INDEX_RE, "").trim();
      if (!name) continue;
      items.push({
        name,
        quantity: null,
        unit: null,
        optional: false,
        ingredientId: `article-${items.length + 1}`,
      });
    }
    return { ingredients: items, steps: [] };
  };
  void BOILERPLATE_RE;
}

const BOILERPLATE_RE = /لذیذ و خانگی/;

function qualityScore(r) {
  const steps = Array.isArray(r.steps) ? r.steps.length : 0;
  const ings = Array.isArray(r.ingredients) ? r.ingredients.length : 0;
  const desc = String(r.description ?? "");
  const boilerplate = BOILERPLATE_RE.test(desc);
  let score = steps * 12 + ings * 4 + Math.min(desc.length, 240);
  if (!boilerplate) score += 50;
  if (steps >= 3) score += 25;
  if (ings >= 5) score += 12;
  if (r.verified) score += 8;
  return score;
}

function isUsable(r) {
  const steps = Array.isArray(r.steps) ? r.steps.length : 0;
  const ings = Array.isArray(r.ingredients) ? r.ingredients.length : 0;
  if (steps < 1 && ings < 2) return false;
  if (ings < 1 && steps < 3) return false;
  const desc = String(r.description ?? "");
  if (BOILERPLATE_RE.test(desc) && steps <= 1 && ings <= 3) return false;
  return true;
}

const raw = JSON.parse(readFileSync(CATALOG, "utf8"));
if (!Array.isArray(raw)) throw new Error("Catalog must be a JSON array");

const before = raw.length;
let movedArticleSteps = 0;
let droppedBadIngredients = 0;
const sanitized = raw.map((recipe) => {
  const beforeIng = (recipe.ingredients ?? []).length;
  const beforeSteps = (recipe.steps ?? []).length;
  const nextParts = normalizeRecipeContent({
    title: recipe.title,
    ingredients: recipe.ingredients ?? [],
    steps: recipe.steps ?? [],
  });
  droppedBadIngredients += Math.max(
    0,
    beforeIng - nextParts.ingredients.filter((i) => (i.name ?? "").length < 55)
      .length,
  );
  if (beforeSteps > 0 && nextParts.steps.length === 0) {
    movedArticleSteps += 1;
  }
  return { ...recipe, ...nextParts };
});

const usable = sanitized.filter(isUsable);
const droppedThin = sanitized.length - usable.length;

const bestByTitle = new Map();
for (const recipe of usable) {
  const key = normalizePersian(recipe.title);
  if (!key) continue;
  const prev = bestByTitle.get(key);
  if (!prev || qualityScore(recipe) > qualityScore(prev)) {
    bestByTitle.set(key, recipe);
  }
}

const winnerIds = new Set([...bestByTitle.values()].map((r) => r.id));
const cleaned = [];
const seenTitles = new Set();
for (const recipe of usable) {
  const key = normalizePersian(recipe.title);
  if (!winnerIds.has(recipe.id) || seenTitles.has(key)) continue;
  seenTitles.add(key);
  cleaned.push(recipe);
}

const droppedDupes = usable.length - cleaned.length;

console.log(
  JSON.stringify(
    {
      before,
      after: cleaned.length,
      movedArticleListsToIngredients: movedArticleSteps,
      droppedBadIngredientsApprox: droppedBadIngredients,
      droppedThin,
      droppedDupes,
      dryRun: DRY,
    },
    null,
    2,
  ),
);

if (!DRY) {
  writeFileSync(CATALOG, `${JSON.stringify(cleaned)}\n`, "utf8");
}
