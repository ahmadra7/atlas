import { Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { mapRecipe, recipeInclude } from "../common/mappers";

const recommendInclude = {
  versions: {
    where: { isCurrent: true },
    include: {
      ingredients: { orderBy: { sortOrder: "asc" as const } },
    },
  },
};

@Injectable()
export class RecipesService {
  constructor(private readonly prisma: PrismaService) {}

  async getBySlug(slug: string) {
    const row = await this.prisma.recipe.findFirst({
      where: { slug, published: true, deletedAt: null },
      include: recipeInclude,
    });
    return row ? mapRecipe(row) : null;
  }

  async getById(id: string) {
    const row = await this.prisma.recipe.findFirst({
      where: { id, published: true, deletedAt: null },
      include: recipeInclude,
    });
    if (!row) throw new NotFoundException("RECIPE_NOT_FOUND");
    return mapRecipe(row);
  }

  async search(query: string, limit = 40) {
    const q = query.trim();
    if (!q) return [];
    const rows = await this.prisma.recipe.findMany({
      where: {
        published: true,
        deletedAt: null,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
          { subcategory: { contains: q, mode: "insensitive" } },
        ],
      },
      include: recipeInclude,
      orderBy: { title: "asc" },
      take: Math.min(Math.max(limit, 1), 100),
    });
    return rows.map(mapRecipe);
  }

  /** Lightweight list for recommend scoring (no steps). */
  async listForRecommend(where: Prisma.RecipeWhereInput, take = 800) {
    const rows = await this.prisma.recipe.findMany({
      where: { published: true, deletedAt: null, ...where },
      include: recommendInclude,
      orderBy: { title: "asc" },
      take,
    });
    return rows.map((row) =>
      mapRecipe({
        ...row,
        versions: row.versions.map((v) => ({ ...v, steps: [] })),
      }),
    );
  }

  async listPublished() {
    return this.listForRecommend({}, 200);
  }
}
