import { Injectable, NotFoundException } from "@nestjs/common";
import type { CookingSession } from "@atlas/contracts";
import { PrismaService } from "../prisma/prisma.service";
import { RecipesService } from "../recipes/recipes.service";

@Injectable()
export class CookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly recipes: RecipesService,
  ) {}

  private async toSession(id: string): Promise<CookingSession> {
    const row = await this.prisma.cookingSession.findUnique({
      where: { id },
      include: {
        recipe: true,
        recipeVersion: {
          include: { steps: { orderBy: { order: "asc" } } },
        },
      },
    });
    if (!row) throw new NotFoundException("SESSION_NOT_FOUND");

    return {
      id: row.id,
      recipeId: row.recipeId,
      recipeVersionId: row.recipeVersionId,
      recipeSlug: row.recipe.slug,
      recipeTitle: row.recipe.title,
      status: row.status,
      currentStepOrder: row.currentStepOrder,
      totalSteps: row.recipeVersion.steps.length,
      steps: row.recipeVersion.steps.map((s) => ({
        id: s.id,
        order: s.order,
        instruction: s.instruction,
        tip: s.tip,
        timerSeconds: s.timerSeconds,
        imageUrl: s.imageUrl,
      })),
      startedAt: row.startedAt.toISOString(),
      completedAt: row.completedAt?.toISOString() ?? null,
      abandonedAt: row.abandonedAt?.toISOString() ?? null,
    };
  }

  async start(userId: string, recipeId: string) {
    const recipe = await this.recipes.getById(recipeId);
    const session = await this.prisma.cookingSession.create({
      data: {
        userId,
        recipeId: recipe.id,
        recipeVersionId: recipe.versionId,
        status: "active",
        currentStepOrder: 1,
      },
    });
    return this.toSession(session.id);
  }

  async get(userId: string, id: string) {
    const row = await this.prisma.cookingSession.findFirst({
      where: { id, userId },
    });
    if (!row) throw new NotFoundException("SESSION_NOT_FOUND");
    return this.toSession(id);
  }

  async completeStep(userId: string, id: string, stepOrder: number) {
    const row = await this.prisma.cookingSession.findFirst({
      where: { id, userId },
      include: { recipeVersion: { include: { steps: true } } },
    });
    if (!row) throw new NotFoundException("SESSION_NOT_FOUND");

    const next = Math.min(stepOrder + 1, row.recipeVersion.steps.length);
    await this.prisma.cookingSession.update({
      where: { id },
      data: { currentStepOrder: next },
    });
    return this.toSession(id);
  }

  async complete(userId: string, id: string) {
    const row = await this.prisma.cookingSession.findFirst({
      where: { id, userId },
    });
    if (!row) throw new NotFoundException("SESSION_NOT_FOUND");
    await this.prisma.cookingSession.update({
      where: { id },
      data: { status: "completed", completedAt: new Date() },
    });
    return this.toSession(id);
  }

  async abandon(userId: string, id: string) {
    const row = await this.prisma.cookingSession.findFirst({
      where: { id, userId },
    });
    if (!row) throw new NotFoundException("SESSION_NOT_FOUND");
    await this.prisma.cookingSession.update({
      where: { id },
      data: { status: "abandoned", abandonedAt: new Date() },
    });
    return this.toSession(id);
  }
}
