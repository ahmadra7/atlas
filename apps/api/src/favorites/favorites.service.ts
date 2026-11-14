import { Injectable, NotFoundException } from "@nestjs/common";
import type { FavoriteItem } from "@atlas/contracts";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string): Promise<FavoriteItem[]> {
    const rows = await this.prisma.favorite.findMany({
      where: {
        userId,
        recipe: { deletedAt: null, published: true },
      },
      include: { recipe: true },
      orderBy: { savedAt: "desc" },
    });
    return rows.map((row) => ({
      recipeId: row.recipeId,
      slug: row.recipe.slug,
      title: row.recipe.title,
      imageUrl: row.recipe.imageUrl,
      totalMinutes: row.recipe.totalMinutes,
      difficulty: row.recipe.difficulty,
      savedAt: row.savedAt.toISOString(),
    }));
  }

  async toggle(userId: string, recipeId: string) {
    const recipe = await this.prisma.recipe.findFirst({
      where: { id: recipeId, deletedAt: null },
    });
    if (!recipe) throw new NotFoundException("RECIPE_NOT_FOUND");

    const existing = await this.prisma.favorite.findUnique({
      where: { userId_recipeId: { userId, recipeId } },
    });
    if (existing) {
      await this.prisma.favorite.delete({
        where: { userId_recipeId: { userId, recipeId } },
      });
      return { favorited: false };
    }
    await this.prisma.favorite.create({ data: { userId, recipeId } });
    return { favorited: true };
  }
}
