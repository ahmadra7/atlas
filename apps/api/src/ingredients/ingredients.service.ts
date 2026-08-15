import { Injectable } from "@nestjs/common";
import { normalizePersian } from "@atlas/shared";
import { PrismaService } from "../prisma/prisma.service";
import { mapIngredient } from "../common/mappers";

@Injectable()
export class IngredientsService {
  constructor(private readonly prisma: PrismaService) {}

  async search(q: string, limit = 20) {
    const query = normalizePersian(q);
    if (!query) return [];

    const rows = await this.prisma.ingredient.findMany({
      where: {
        OR: [
          { normalizedName: { contains: query } },
          { name: { contains: q.trim() } },
          { aliases: { some: { normalizedAlias: { contains: query } } } },
        ],
      },
      include: { aliases: true },
      orderBy: { popularity: "desc" },
      take: Math.min(Math.max(limit, 1), 50),
    });

    return rows.map(mapIngredient);
  }

  async findById(id: string) {
    const row = await this.prisma.ingredient.findUnique({
      where: { id },
      include: { aliases: true },
    });
    return row ? mapIngredient(row) : null;
  }

  async findOrCreateByName(name: string, createdById?: string) {
    const query = normalizePersian(name);
    if (!query) throw new Error("EMPTY_NAME");

    const existing = await this.prisma.ingredient.findFirst({
      where: {
        OR: [
          { normalizedName: query },
          { aliases: { some: { normalizedAlias: query } } },
        ],
      },
      include: { aliases: true },
      orderBy: [{ isCustom: "asc" }, { popularity: "desc" }],
    });
    if (existing) return mapIngredient(existing);

    const id = `ing-custom-${Date.now()}`;
    const created = await this.prisma.ingredient.create({
      data: {
        id,
        name: name.trim(),
        normalizedName: query,
        category: "سفارشی",
        popularity: 1,
        isCustom: true,
        createdById,
        aliases: {
          create: [{ alias: name.trim(), normalizedAlias: query }],
        },
      },
      include: { aliases: true },
    });
    return mapIngredient(created);
  }
}
