import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import {
  ingredientsLooselyMatch,
  isPantryStaple,
  normalizePersian,
} from "@atlas/shared";
import type {
  RecommendationCard,
  RecommendationFilters,
  RecommendationResult,
} from "@atlas/contracts";
import { PrismaService } from "../prisma/prisma.service";

type ScoredRow = {
  id: string;
  slug: string;
  title: string;
  imageUrl: string;
  totalMinutes: number;
  servings: number;
  difficulty: RecommendationCard["difficulty"];
  meal: RecommendationCard["meal"];
  cuisine: string;
  dietaryTags: string[] | null;
  budgetFriendly: boolean;
  requiredCount: number;
  matchedCount: number;
  missingCount: number;
  missingNames: string[] | null;
  matchedNames: string[] | null;
};

@Injectable()
export class RecommendationsService {
  constructor(private readonly prisma: PrismaService) {}

  private filtersSql(filters: RecommendationFilters): Prisma.Sql {
    const parts: Prisma.Sql[] = [
      Prisma.sql`r.published = true`,
      Prisma.sql`r."deletedAt" IS NULL`,
    ];

    if (filters.meal && filters.meal !== "any") {
      parts.push(Prisma.sql`r.meal = ${filters.meal}::"MealType"`);
    }
    if (filters.maxMinutes && filters.maxMinutes > 0) {
      parts.push(Prisma.sql`r."totalMinutes" <= ${filters.maxMinutes}`);
    }
    if (filters.difficulty && filters.difficulty !== "any") {
      parts.push(
        Prisma.sql`r.difficulty = ${filters.difficulty}::"Difficulty"`,
      );
    }
    if (filters.budgetFriendly) {
      parts.push(Prisma.sql`r."budgetFriendly" = true`);
    }
    if (filters.cuisine && filters.cuisine !== "any") {
      parts.push(Prisma.sql`r.cuisine ILIKE ${"%" + filters.cuisine + "%"}`);
    }
    if (filters.dishType && filters.dishType !== "any") {
      const dishMap: Record<string, string[]> = {
        main: ["غذای اصلی"],
        appetizer: ["پیش غذا", "پیش‌غذا"],
        soup: ["سوپ", "آش"],
        salad: ["سالاد"],
        dessert: ["دسر"],
        sweet: ["شیرینی", "کیک"],
        drink: ["نوشیدنی"],
        side: ["مخلفات", "چاشنی"],
        fast: ["ساندویچ", "پیتزا", "ماکارونی", "پاستا"],
      };
      const labels = dishMap[filters.dishType] ?? [];
      if (labels.length) {
        const likes = labels.map(
          (label) => Prisma.sql`r.category ILIKE ${"%" + label + "%"}`,
        );
        parts.push(Prisma.sql`(${Prisma.join(likes, " OR ")})`);
      }
    }

    return Prisma.join(parts, " AND ");
  }

  /**
   * Map each inventory row to equivalent catalog ingredient ids
   * so «گوجه فرنگی» also matches recipe lines named «گوجه».
   */
  private async buildOwnedMap(userId: string): Promise<{
    userItemCount: number;
    pairs: Array<{ invKey: string; ingredientId: string }>;
  }> {
    const rows = await this.prisma.inventoryItem.findMany({
      where: { userId },
      include: {
        ingredient: { select: { id: true, name: true, normalizedName: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    if (rows.length === 0) return { userItemCount: 0, pairs: [] };

    const pairs: Array<{ invKey: string; ingredientId: string }> = [];

    for (const row of rows) {
      const invKey = row.id;
      const userName = row.ingredient.name || row.ingredient.normalizedName;
      const norm = normalizePersian(userName);
      const firstToken = norm.split(" ")[0] ?? norm;

      const candidates = await this.prisma.ingredient.findMany({
        where: {
          OR: [
            { id: row.ingredientId },
            { normalizedName: norm },
            { normalizedName: { startsWith: `${norm} ` } },
            ...(firstToken.length >= 3
              ? [
                  { normalizedName: firstToken },
                  { normalizedName: { startsWith: `${firstToken} ` } },
                ]
              : []),
          ],
        },
        select: { id: true, name: true, normalizedName: true },
        take: 40,
      });

      const matched = candidates.filter(
        (c) =>
          c.id === row.ingredientId ||
          ingredientsLooselyMatch(userName, c.name) ||
          ingredientsLooselyMatch(userName, c.normalizedName),
      );

      const ids = new Set<string>([row.ingredientId]);
      for (const c of matched) ids.add(c.id);
      for (const id of ids) pairs.push({ invKey, ingredientId: id });
    }

    return { userItemCount: rows.length, pairs };
  }

  /**
   * Rank cookable-from-pantry recipes:
   * 1) exact — all non-staple required ingredients owned (salt/pepper/spices ignored)
   * 2) near — missing exactly 1 real ingredient
   * 3) discovery — missing 2, then 3, …
   * Extra pantry items never disqualify a recipe.
   */
  private toCard(row: ScoredRow): RecommendationCard | null {
    const missingIngredients = (row.missingNames ?? []).filter(
      (n) => !isPantryStaple(n),
    );
    const matchedIngredients = (row.matchedNames ?? []).filter(
      (n) => !isPantryStaple(n),
    );
    if (matchedIngredients.length === 0) return null;

    const missingCount = missingIngredients.length;
    const requiredNonStaple = matchedIngredients.length + missingCount;
    const matchTier =
      missingCount === 0 ? "exact" : missingCount === 1 ? "near" : "discovery";
    const matchScore = Math.round(
      (matchedIngredients.length / Math.max(requiredNonStaple, 1)) * 100,
    );
    const tags = [
      ...(row.dietaryTags ?? []),
      row.budgetFriendly ? "اقتصادی" : "",
    ].filter(Boolean);

    return {
      recipeId: row.id,
      slug: row.slug,
      title: row.title,
      imageUrl: row.imageUrl,
      totalMinutes: row.totalMinutes,
      servings: row.servings,
      difficulty: row.difficulty,
      meal: row.meal === "any" ? "lunch" : row.meal,
      cuisine: row.cuisine,
      matchTier,
      matchScore,
      missingCount,
      missingIngredients,
      matchedIngredients,
      tags,
      explanation:
        missingCount === 0
          ? "با همین مواد می‌تونی درست کنی."
          : missingCount === 1
            ? `فقط «${missingIngredients[0] ?? "یک ماده"}» کم است.`
            : `${missingCount} ماده کم داری.`,
    };
  }

  async recommend(
    userId: string,
    filters: RecommendationFilters = {},
  ): Promise<RecommendationResult> {
    const { userItemCount, pairs } = await this.buildOwnedMap(userId);
    if (userItemCount === 0 || pairs.length === 0) {
      return {
        id: `rec-${Date.now()}`,
        exact: [],
        near: [],
        discovery: [],
        filters,
      };
    }

    const whereSql = this.filtersSql(filters);
    const valueRows = pairs.map(
      (p) => Prisma.sql`(${p.invKey}::text, ${p.ingredientId}::text)`,
    );

    // Score every published recipe that shares ≥1 owned ingredient.
    // Do NOT require the recipe to use every pantry item — that inverted ranking.
    // Staples (نمک/فلفل/ادویه) stay in SQL rows then get stripped in toCard so
    // ORDER BY / LIMIT are approximate; we fetch a wide window and re-sort in TS.
    const rows = await this.prisma.$queryRaw<ScoredRow[]>`
      WITH owned_map(inv_key, ingredient_id) AS (
        VALUES ${Prisma.join(valueRows)}
      ),
      recipe_req AS (
        SELECT
          rv."recipeId" AS recipe_id,
          ri."ingredientId" AS ingredient_id,
          ri.name AS ingredient_name
        FROM "RecipeVersion" rv
        INNER JOIN "RecipeIngredient" ri ON ri."recipeVersionId" = rv.id
        WHERE rv."isCurrent" = true
          AND ri.optional = false
      ),
      scored AS (
        SELECT
          r.id,
          r.slug,
          r.title,
          r."imageUrl" AS "imageUrl",
          r."totalMinutes" AS "totalMinutes",
          r.servings,
          r.difficulty::text AS difficulty,
          r.meal::text AS meal,
          r.cuisine,
          r."dietaryTags" AS "dietaryTags",
          r."budgetFriendly" AS "budgetFriendly",
          COUNT(DISTINCT rr.ingredient_id)::int AS "requiredCount",
          COUNT(DISTINCT rr.ingredient_id) FILTER (
            WHERE EXISTS (
              SELECT 1 FROM owned_map o WHERE o.ingredient_id = rr.ingredient_id
            )
          )::int AS "matchedCount",
          COALESCE(
            array_agg(DISTINCT rr.ingredient_name) FILTER (
              WHERE NOT EXISTS (
                SELECT 1 FROM owned_map o WHERE o.ingredient_id = rr.ingredient_id
              )
            ),
            ARRAY[]::text[]
          ) AS "missingNames",
          COALESCE(
            array_agg(DISTINCT rr.ingredient_name) FILTER (
              WHERE EXISTS (
                SELECT 1 FROM owned_map o WHERE o.ingredient_id = rr.ingredient_id
              )
            ),
            ARRAY[]::text[]
          ) AS "matchedNames"
        FROM "Recipe" r
        INNER JOIN recipe_req rr ON rr.recipe_id = r.id
        WHERE ${whereSql}
        GROUP BY
          r.id, r.slug, r.title, r."imageUrl", r."totalMinutes", r.servings,
          r.difficulty, r.meal, r.cuisine, r."dietaryTags", r."budgetFriendly"
        HAVING COUNT(DISTINCT rr.ingredient_id) FILTER (
          WHERE EXISTS (
            SELECT 1 FROM owned_map o WHERE o.ingredient_id = rr.ingredient_id
          )
        ) >= 1
      )
      SELECT
        s.*,
        (s."requiredCount" - s."matchedCount")::int AS "missingCount"
      FROM scored s
      ORDER BY
        (s."requiredCount" - s."matchedCount") ASC,
        s."matchedCount" DESC,
        s."requiredCount" ASC,
        s.title ASC
      LIMIT 800
    `;

    let cards = rows
      .map((row) => this.toCard(row))
      .filter((card): card is RecommendationCard => card !== null);

    cards.sort(
      (a, b) =>
        a.missingCount - b.missingCount ||
        b.matchedIngredients.length - a.matchedIngredients.length ||
        b.matchScore - a.matchScore ||
        a.title.localeCompare(b.title, "fa"),
    );

    if (filters.dietMode && filters.dietMode !== "any") {
      const dietHints = ["رژیمی", "کم‌کالری", "گیاهی", "وگان", "بدون گلوتن"];
      cards = cards.filter((c) => {
        const isDiet = c.tags.some((tag) =>
          dietHints.some((hint) => tag.includes(hint)),
        );
        return filters.dietMode === "diet" ? isDiet : !isDiet;
      });
    }
    if (filters.dietaryTags?.length) {
      cards = cards.filter((c) =>
        filters.dietaryTags!.every((wanted) =>
          c.tags.some((tag) => tag.includes(wanted)),
        ),
      );
    }

    return {
      id: `rec-${Date.now()}`,
      exact: cards.filter((c) => c.missingCount === 0),
      near: cards.filter((c) => c.missingCount === 1),
      discovery: cards.filter((c) => c.missingCount >= 2),
      filters,
    };
  }
}
