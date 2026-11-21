/**
 * Clean recipesData.json used by seed + mock client:
 * - drop empty / near-empty stubs
 * - keep one recipe per normalized Persian title (richest wins)
 * - rewrite stable sequential ids only when --reindex is passed
 *
 * Usage:
 *   node scripts/clean-recipe-catalog.mjs
 *   node scripts/clean-recipe-catalog.mjs --dry-run
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const CATALOG = resolve(
  ROOT,
  "packages/api-client/src/catalog/recipesData.json",
);
const DRY = process.argv.includes("--dry-run");
const BOILERPLATE_RE = /لذیذ و خانگی/;

function normalizePersian(input) {
  return String(input ?? "")
    .trim()
    .replace(/\u200c/g, " ")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("fa");
}

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
  if (steps < 1 || ings < 2) return false;
  const desc = String(r.description ?? "");
  // Generator filler with almost no cooking content
  if (BOILERPLATE_RE.test(desc) && steps <= 1 && ings <= 3) return false;
  return true;
}

const raw = JSON.parse(readFileSync(CATALOG, "utf8"));
if (!Array.isArray(raw)) throw new Error("Catalog must be a JSON array");

const before = raw.length;
const usable = raw.filter(isUsable);
const droppedThin = before - usable.length;

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
  if (!winnerIds.has(recipe.id)) continue;
  if (seenTitles.has(key)) continue;
  seenTitles.add(key);
  cleaned.push(recipe);
}

const droppedDupTitles = usable.length - cleaned.length;
const boilerplateLeft = cleaned.filter((r) =>
  BOILERPLATE_RE.test(String(r.description ?? "")),
).length;

const report = {
  before,
  after: cleaned.length,
  droppedThin,
  droppedDupTitles,
  uniqueTitles: cleaned.length,
  boilerplateLeft,
  boilerplatePct: Number(
    ((boilerplateLeft / Math.max(cleaned.length, 1)) * 100).toFixed(1),
  ),
};

console.log(JSON.stringify(report, null, 2));

if (!DRY) {
  writeFileSync(CATALOG, `${JSON.stringify(cleaned)}\n`, "utf8");
  console.log(`Wrote ${CATALOG}`);
}
