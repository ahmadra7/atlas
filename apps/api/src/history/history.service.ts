import { Injectable } from "@nestjs/common";
import type { HistoryItem } from "@atlas/contracts";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string): Promise<HistoryItem[]> {
    const rows = await this.prisma.cookingSession.findMany({
      where: { userId },
      include: { recipe: true },
      orderBy: { startedAt: "desc" },
      take: 100,
    });

    return rows.map((row) => ({
      sessionId: row.id,
      recipeId: row.recipeId,
      slug: row.recipe.slug,
      title: row.recipe.title,
      imageUrl: row.recipe.imageUrl,
      status: row.status,
      startedAt: row.startedAt.toISOString(),
      endedAt:
        row.completedAt?.toISOString() ??
        row.abandonedAt?.toISOString() ??
        null,
    }));
  }
}
