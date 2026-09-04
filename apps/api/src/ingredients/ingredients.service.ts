import { Injectable, BadRequestException } from "@nestjs/common";
import { createHash } from "node:crypto";
import {
  canonicalFoodName,
  ingredientsLooselyMatch,
  isLikelyFoodIngredient,
  normalizePersian,
} from "@atlas/shared";
import { PrismaService } from "../prisma/prisma.service";
import { mapIngredient } from "../common/mappers";

function ingredientIdFromName(name: string): string {
  const normalized = normalizePersian(name);
  const hash = createHash("sha1").update(normalized).digest("hex").slice(0, 12);
  return `ing-${hash}`;
}

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

  async findCatalogByName(name: string) {
    const query = normalizePersian(name);
    if (!query) throw new BadRequestException("EMPTY_NAME");
    const canonical = canonicalFoodName(name);
    const lookup = normalizePersian(canonical ?? name);

    const existing = await this.prisma.ingredient.findFirst({
      where: {
        OR: [
          { normalizedName: query },
          { normalizedName: lookup },
          { aliases: { some: { normalizedAlias: query } } },
          { aliases: { some: { normalizedAlias: lookup } } },
        ],
      },
      include: { aliases: true },
      orderBy: [{ isCustom: "asc" }, { popularity: "desc" }],
    });
    if (existing) return mapIngredient(existing);

    const candidates = await this.prisma.ingredient.findMany({
      where: {
        OR: [
          { normalizedName: { contains: query } },
          { aliases: { some: { normalizedAlias: { contains: query } } } },
        ],
      },
      include: { aliases: true },
      take: 20,
    });
    const loose = candidates.find((row) =>
      ingredientsLooselyMatch(name, row.name),
    );
    if (loose) return mapIngredient(loose);

    if (!isLikelyFoodIngredient(name)) {
      throw new BadRequestException("UNKNOWN_INGREDIENT");
    }

    const displayName = (canonical ?? name).trim();
    const id = ingredientIdFromName(displayName);
    try {
      const created = await this.prisma.ingredient.upsert({
        where: { id },
        create: {
          id,
          name: displayName,
          normalizedName: lookup,
          category: "عمومی",
          popularity: 1,
          isCustom: false,
          aliases: {
            create: [{ alias: displayName, normalizedAlias: lookup }],
          },
        },
        update: {},
        include: { aliases: true },
      });
      return mapIngredient(created);
    } catch {
      const again = await this.prisma.ingredient.findFirst({
        where: {
          OR: [
            { id },
            { normalizedName: query },
            { aliases: { some: { normalizedAlias: query } } },
          ],
        },
        include: { aliases: true },
      });
      if (again) return mapIngredient(again);
      throw new BadRequestException("UNKNOWN_INGREDIENT");
    }
  }

  async findOrCreateByName(name: string, _createdById?: string) {
    return this.findCatalogByName(name);
  }
}
