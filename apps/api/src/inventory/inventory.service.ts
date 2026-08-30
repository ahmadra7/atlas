import { Injectable, NotFoundException } from "@nestjs/common";
import { normalizePersian } from "@atlas/shared";
import type { InventoryItem } from "@atlas/contracts";
import { PrismaService } from "../prisma/prisma.service";
import { IngredientsService } from "../ingredients/ingredients.service";
import { mapIngredient } from "../common/mappers";

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ingredients: IngredientsService,
  ) {}

  async list(userId: string): Promise<InventoryItem[]> {
    const rows = await this.prisma.inventoryItem.findMany({
      where: { userId },
      include: { ingredient: { include: { aliases: true } } },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) => ({
      id: row.id,
      ingredientId: row.ingredientId,
      ingredient: mapIngredient(row.ingredient),
      quantity: row.quantity,
      unit: row.unit,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  async addByIngredientId(
    userId: string,
    ingredientId: string,
  ): Promise<InventoryItem> {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id: ingredientId },
      include: { aliases: true },
    });
    if (!ingredient) throw new NotFoundException("INGREDIENT_NOT_FOUND");

    const row = await this.prisma.inventoryItem.upsert({
      where: {
        userId_ingredientId: { userId, ingredientId },
      },
      create: { userId, ingredientId },
      update: {},
      include: { ingredient: { include: { aliases: true } } },
    });

    return {
      id: row.id,
      ingredientId: row.ingredientId,
      ingredient: mapIngredient(row.ingredient),
      quantity: row.quantity,
      unit: row.unit,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async addByName(userId: string, name: string): Promise<InventoryItem> {
    const ingredient = await this.ingredients.findOrCreateByName(name, userId);
    return this.addByIngredientId(userId, ingredient.id);
  }

  resolveSpokenNames(transcript: string): string[] {
    const compounds = ["گوجه فرنگی", "سیب زمینی", "تخم مرغ", "تخم‌مرغ"];
    let text = normalizePersian(transcript)
      .replace(/[?!.;:…،,|]/g, " ")
      .replace(/\s+و\s+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const names: string[] = [];
    const seen = new Set<string>();
    const take = (raw: string) => {
      const key = normalizePersian(raw);
      if (key.length < 2 || seen.has(key) || /^\d+$/.test(key)) return;
      seen.add(key);
      names.push(raw.trim());
    };
    for (const phrase of compounds.sort((a, b) => b.length - a.length)) {
      const needle = normalizePersian(phrase);
      if (!text.includes(needle)) continue;
      take(phrase);
      text = text.split(needle).join(" ");
    }
    for (const part of text.split(/\s+/)) take(part);
    return names;
  }

  async addFromSpeech(userId: string, transcript: string) {
    const names = this.resolveSpokenNames(transcript);
    const added: InventoryItem[] = [];
    for (const name of names) {
      try {
        added.push(await this.addByName(userId, name));
      } catch {
        /* skip non-catalog words */
      }
    }
    return added;
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.inventoryItem.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new NotFoundException("INVENTORY_ITEM_NOT_FOUND");
    await this.prisma.inventoryItem.delete({ where: { id } });
  }

  async ownedIngredientIds(userId: string): Promise<Set<string>> {
    const rows = await this.prisma.inventoryItem.findMany({
      where: { userId },
      include: {
        ingredient: { select: { id: true, normalizedName: true } },
      },
    });
    if (rows.length === 0) return new Set();

    // Expand to every catalog ingredient sharing the same normalized name
    // (covers custom duplicates that match real catalog items).
    const names = [
      ...new Set(
        rows
          .map((r) => r.ingredient.normalizedName)
          .filter((n) => Boolean(n)),
      ),
    ];
    const related = await this.prisma.ingredient.findMany({
      where: {
        OR: [
          { id: { in: rows.map((r) => r.ingredientId) } },
          { normalizedName: { in: names } },
        ],
      },
      select: { id: true },
    });
    return new Set(related.map((r) => r.id));
  }
}
