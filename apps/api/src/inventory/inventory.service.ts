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
    // Lightweight tokenizer; catalog matching happens per name in add flow.
    return transcript
      .split(/[،, و\n]+/g)
      .map((t) => t.trim())
      .filter((t) => normalizePersian(t).length >= 2);
  }

  async addFromSpeech(userId: string, transcript: string) {
    const names = this.resolveSpokenNames(transcript);
    const added: InventoryItem[] = [];
    for (const name of names) {
      added.push(await this.addByName(userId, name));
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
