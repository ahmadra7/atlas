/**
 * Catalog hygiene: legacy food.sql rows often mis-file content —
 * prose tips in ingredient.name, and article "N - Item : …" lists in steps.
 */

const INSTRUCTION_HINT_RE =
  /(بریزید|دم کنید|روش کار|می\s?توانید|جوشانده|تفت بدهید|مخلوط کنید|دقیقه آن را|برای استفاده از|نکت[هة]\s*:|فر را روشن|در قالب|روی شعله)/;

/** Numbered article section: "1 - چای گل گلایل (… ) : …" */
const ARTICLE_SECTION_RE = /^\d+\s*[-–.]\s*.{2,90}\s*[:：]/;
const TIP_LINE_RE = /^نکت[هة]\s*(?:\d+)?\s*:/;
const LEADING_INDEX_RE = /^\d+\s*[-–.]\s*/;
const ARTICLE_TITLE_RE = /\d+\s*نوع|انواع\s+|چند\s+نوع/;

/** True when a "ingredient name" is clearly cooking/article prose (junk row). */
export function isInstructionLikeIngredientName(name: string): boolean {
  const s = String(name ?? "").trim();
  if (!s) return true;
  if (s.length >= 55) return true;
  if (s.length >= 35 && INSTRUCTION_HINT_RE.test(s)) return true;
  if (/^\d+\s*[-–.]/.test(s) && s.length > 25) return true;
  // Multi-sentence blobs
  if ((s.match(/[.!?۔]/g) ?? []).length >= 2 && s.length > 40) return true;
  return false;
}

export function sanitizeIngredientAmount(
  quantity?: string | null,
  unit?: string | null,
): { quantity: string | null; unit: string | null } {
  let q = String(quantity ?? "").trim();
  let u = String(unit ?? "").trim();
  if (q && u.startsWith(q)) {
    u = u.slice(q.length).trim();
  }
  return {
    quantity: q || null,
    unit: u || null,
  };
}

/** UI helper: avoid «150 150 گرم». */
export function formatIngredientAmount(
  quantity?: string | null,
  unit?: string | null,
): string {
  const { quantity: q, unit: u } = sanitizeIngredientAmount(quantity, unit);
  if (!q) return u ?? "";
  if (!u) return q;
  if (u.startsWith(q)) return u;
  return `${q} ${u}`;
}

export type IngredientLineLike = {
  name: string;
  quantity?: string | null;
  unit?: string | null;
  optional?: boolean;
  ingredientId?: string;
};

export type StepLineLike = {
  id?: string;
  order?: number;
  instruction: string;
  tip?: string | null;
  timerSeconds?: number | null;
  imageUrl?: string | null;
};

/** Drop instruction-like rows and normalize qty/unit. */
export function sanitizeIngredientLines<T extends IngredientLineLike>(
  lines: T[],
): T[] {
  const out: T[] = [];
  for (const line of lines) {
    if (isInstructionLikeIngredientName(line.name)) continue;
    const amount = sanitizeIngredientAmount(line.quantity, line.unit);
    out.push({
      ...line,
      name: line.name.trim(),
      quantity: amount.quantity,
      unit: amount.unit,
    });
  }
  return out;
}

/**
 * True when "steps" are really a catalog of items (e.g. 12 herbal teas),
 * not a sequential cook procedure — should show under مواد لازم.
 */
export function isArticleListSteps(
  steps: Array<{ instruction?: string | null }>,
  title?: string,
): boolean {
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

function stripLeadingIndex(text: string): string {
  return text.replace(LEADING_INDEX_RE, "").trim();
}

function articleIngredientId(index: number, name: string): string {
  const slug = name
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0600-\u06FF-]/g, "")
    .slice(0, 40);
  return `article-${index}-${slug || "item"}`;
}

/**
 * Move article-list "steps" into ingredients and clear steps.
 * Keeps real short ingredients; drops junk prose ingredients first.
 */
export function normalizeRecipeContent<
  TIng extends IngredientLineLike,
  TStep extends StepLineLike,
>(input: {
  title?: string;
  ingredients: TIng[];
  steps: TStep[];
}): { ingredients: TIng[]; steps: TStep[] } {
  const ingredients = sanitizeIngredientLines(input.ingredients ?? []);
  const steps = [...(input.steps ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  if (!isArticleListSteps(steps, input.title)) {
    return { ingredients, steps };
  }

  const items: TIng[] = [...ingredients];
  for (const step of steps) {
    const raw = String(step.instruction ?? "").trim();
    if (!raw) continue;
    const tip = String(step.tip ?? "").trim();

    if (TIP_LINE_RE.test(raw)) {
      if (items.length > 0) {
        const prev = items[items.length - 1]!;
        items[items.length - 1] = {
          ...prev,
          name: `${prev.name} — ${raw}`,
        };
      }
      continue;
    }

    const name = stripLeadingIndex(raw);
    if (!name) continue;
    const withTip = tip && !TIP_LINE_RE.test(raw) ? `${name} — ${tip}` : name;
    items.push({
      name: withTip,
      quantity: null,
      unit: null,
      optional: false,
      ingredientId: articleIngredientId(items.length + 1, withTip),
    } as TIng);
  }

  return { ingredients: items, steps: [] as TStep[] };
}
