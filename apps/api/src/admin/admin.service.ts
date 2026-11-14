import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import type { Prisma } from "@prisma/client";
import { normalizePersian } from "@atlas/shared";
import type {
  AdminRecipeDetail,
  AdminRecipeHeader,
  AdminRecipeList,
} from "@atlas/contracts";
import { PrismaService } from "../prisma/prisma.service";
import type { UpsertRecipeDto } from "./admin.dto";

const IMAGE_MIME_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const adminInclude = {
  versions: {
    where: { isCurrent: true },
    include: {
      ingredients: { orderBy: { sortOrder: "asc" as const } },
      steps: { orderBy: { order: "asc" as const } },
    },
  },
} satisfies Prisma.RecipeInclude;

function ingredientIdFromName(name: string): string {
  const normalized = normalizePersian(name);
  const hash = createHash("sha1").update(normalized).digest("hex").slice(0, 12);
  return `ing-${hash}`;
}

function slugify(title: string): string {
  const s = title
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return s.slice(0, 80) || `recipe-${Date.now()}`;
}

function currentVersion(
  row: Prisma.RecipeGetPayload<{ include: typeof adminInclude }>,
) {
  return row.versions[0] ?? null;
}

function toHeader(
  row: Prisma.RecipeGetPayload<{ include: typeof adminInclude }>,
): AdminRecipeHeader {
  const version = currentVersion(row);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    subcategory: row.subcategory,
    meal: row.meal,
    cuisine: row.cuisine,
    difficulty: row.difficulty,
    totalMinutes: row.totalMinutes,
    servings: row.servings,
    imageUrl: row.imageUrl,
    published: row.published,
    verified: row.verified,
    deletedAt: row.deletedAt?.toISOString() ?? null,
    ingredientCount: version?.ingredients.length ?? 0,
    stepCount: version?.steps.length ?? 0,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toDetail(
  row: Prisma.RecipeGetPayload<{ include: typeof adminInclude }>,
): AdminRecipeDetail {
  const version = currentVersion(row);
  if (!version) {
    throw new NotFoundException("RECIPE_VERSION_NOT_FOUND");
  }
  return {
    id: row.id,
    slug: row.slug,
    sourceExternalId: row.sourceExternalId,
    title: row.title,
    description: row.description,
    category: row.category,
    subcategory: row.subcategory,
    meal: row.meal,
    cuisine: row.cuisine,
    region: row.region,
    difficulty: row.difficulty,
    prepMinutes: row.prepMinutes,
    cookMinutes: row.cookMinutes,
    totalMinutes: row.totalMinutes,
    servings: row.servings,
    imageUrl: row.imageUrl,
    caloriesPerServing: row.caloriesPerServing,
    cookingMethod: row.cookingMethod,
    dietaryTags: row.dietaryTags,
    budgetFriendly: row.budgetFriendly,
    verified: row.verified,
    published: row.published,
    deletedAt: row.deletedAt?.toISOString() ?? null,
    versionId: version.id,
    versionNumber: version.versionNumber,
    ingredients: version.ingredients.map((line) => ({
      id: line.id,
      ingredientId: line.ingredientId,
      name: line.name,
      quantity: line.quantity,
      unit: line.unit,
      optional: line.optional,
    })),
    steps: version.steps.map((step) => ({
      id: step.id,
      order: step.order,
      instruction: step.instruction,
      tip: step.tip,
      timerSeconds: step.timerSeconds,
      imageUrl: step.imageUrl,
    })),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async uploadRecipeImage(file: Express.Multer.File) {
    if (!file?.buffer?.length) {
      throw new BadRequestException("فایل تصویر لازم است.");
    }
    const ext =
      IMAGE_MIME_EXT[file.mimetype] ??
      extname(file.originalname).toLowerCase();
    if (!Object.values(IMAGE_MIME_EXT).includes(ext)) {
      throw new BadRequestException(
        "فقط تصویرهای JPG، PNG، WEBP یا GIF مجاز است.",
      );
    }
    const uploadsDir = join(process.cwd(), "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const filename = `${randomUUID()}${ext}`;
    await writeFile(join(uploadsDir, filename), file.buffer);

    const port = Number(this.config.get("PORT") ?? 4000);
    const publicBase = (
      this.config.get<string>("PUBLIC_API_URL") ??
      `http://127.0.0.1:${port}`
    ).replace(/\/$/, "");

    return { url: `${publicBase}/uploads/${filename}` };
  }

  async listRecipes(params: {
    q?: string;
    page?: number;
    limit?: number;
    status?: "all" | "published" | "draft" | "deleted";
  }): Promise<AdminRecipeList> {
    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 40, 1), 100);
    const q = params.q?.trim() ?? "";
    const status = params.status ?? "all";

    const where: Prisma.RecipeWhereInput = {};
    if (status === "deleted") {
      where.deletedAt = { not: null };
    } else {
      where.deletedAt = null;
      if (status === "published") where.published = true;
      if (status === "draft") where.published = false;
    }
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
        { subcategory: { contains: q, mode: "insensitive" } },
        { cuisine: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.recipe.count({ where }),
      this.prisma.recipe.findMany({
        where,
        include: adminInclude,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      items: rows.map(toHeader),
      total,
      page,
      limit,
    };
  }

  async getRecipe(id: string): Promise<AdminRecipeDetail> {
    const row = await this.prisma.recipe.findUnique({
      where: { id },
      include: adminInclude,
    });
    if (!row) throw new NotFoundException("RECIPE_NOT_FOUND");
    return toDetail(row);
  }

  async createRecipe(dto: UpsertRecipeDto): Promise<AdminRecipeDetail> {
    const slug = await this.uniqueSlug(dto.slug?.trim() || slugify(dto.title));
    const id = `rcp-${randomUUID()}`;
    const versionId = `rv-${randomUUID()}`;
    const lines = await this.resolveIngredients(dto.ingredients);
    const totalMinutes = dto.prepMinutes + dto.cookMinutes;

    await this.prisma.recipe.create({
      data: {
        id,
        slug,
        title: dto.title.trim(),
        description: dto.description.trim(),
        category: dto.category.trim(),
        subcategory: dto.subcategory?.trim() || null,
        meal: dto.meal,
        cuisine: dto.cuisine.trim(),
        region: dto.region?.trim() || null,
        difficulty: dto.difficulty,
        prepMinutes: dto.prepMinutes,
        cookMinutes: dto.cookMinutes,
        totalMinutes,
        servings: dto.servings,
        imageUrl: dto.imageUrl.trim() || "/recipe-placeholder.svg",
        caloriesPerServing: dto.caloriesPerServing ?? null,
        cookingMethod: dto.cookingMethod?.trim() || null,
        dietaryTags: dto.dietaryTags.map((t) => t.trim()).filter(Boolean),
        budgetFriendly: dto.budgetFriendly,
        verified: dto.verified,
        published: dto.published,
        versions: {
          create: {
            id: versionId,
            versionNumber: 1,
            isCurrent: true,
            ingredients: {
              create: lines.map((line, index) => ({
                ingredientId: line.ingredientId,
                name: line.name,
                quantity: line.quantity,
                unit: line.unit,
                optional: line.optional,
                sortOrder: index,
              })),
            },
            steps: {
              create: dto.steps.map((step, index) => ({
                id: `${versionId}-s${index + 1}`,
                order: index + 1,
                instruction: step.instruction.trim(),
                tip: step.tip?.trim() || null,
                timerSeconds: step.timerSeconds ?? null,
                imageUrl: step.imageUrl?.trim() || null,
              })),
            },
          },
        },
      },
    });

    return this.getRecipe(id);
  }

  async updateRecipe(
    id: string,
    dto: UpsertRecipeDto,
  ): Promise<AdminRecipeDetail> {
    const existing = await this.prisma.recipe.findUnique({
      where: { id },
      include: {
        versions: { orderBy: { versionNumber: "desc" }, take: 1 },
      },
    });
    if (!existing) throw new NotFoundException("RECIPE_NOT_FOUND");

    const slug = await this.uniqueSlug(
      dto.slug?.trim() || existing.slug,
      id,
    );
    const lines = await this.resolveIngredients(dto.ingredients);
    const totalMinutes = dto.prepMinutes + dto.cookMinutes;
    const nextNumber = (existing.versions[0]?.versionNumber ?? 0) + 1;
    const versionId = `rv-${randomUUID()}`;

    await this.prisma.$transaction(async (tx) => {
      await tx.recipeVersion.updateMany({
        where: { recipeId: id, isCurrent: true },
        data: { isCurrent: false },
      });
      await tx.recipe.update({
        where: { id },
        data: {
          slug,
          title: dto.title.trim(),
          description: dto.description.trim(),
          category: dto.category.trim(),
          subcategory: dto.subcategory?.trim() || null,
          meal: dto.meal,
          cuisine: dto.cuisine.trim(),
          region: dto.region?.trim() || null,
          difficulty: dto.difficulty,
          prepMinutes: dto.prepMinutes,
          cookMinutes: dto.cookMinutes,
          totalMinutes,
          servings: dto.servings,
          imageUrl: dto.imageUrl.trim() || existing.imageUrl,
          caloriesPerServing: dto.caloriesPerServing ?? null,
          cookingMethod: dto.cookingMethod?.trim() || null,
          dietaryTags: dto.dietaryTags.map((t) => t.trim()).filter(Boolean),
          budgetFriendly: dto.budgetFriendly,
          verified: dto.verified,
          published: dto.published,
        },
      });
      await tx.recipeVersion.create({
        data: {
          id: versionId,
          recipeId: id,
          versionNumber: nextNumber,
          isCurrent: true,
          ingredients: {
            create: lines.map((line, index) => ({
              ingredientId: line.ingredientId,
              name: line.name,
              quantity: line.quantity,
              unit: line.unit,
              optional: line.optional,
              sortOrder: index,
            })),
          },
          steps: {
            create: dto.steps.map((step, index) => ({
              id: `${versionId}-s${index + 1}`,
              order: index + 1,
              instruction: step.instruction.trim(),
              tip: step.tip?.trim() || null,
              timerSeconds: step.timerSeconds ?? null,
              imageUrl: step.imageUrl?.trim() || null,
            })),
          },
        },
      });
    });

    return this.getRecipe(id);
  }

  async deleteRecipe(id: string): Promise<AdminRecipeDetail> {
    const existing = await this.prisma.recipe.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("RECIPE_NOT_FOUND");
    if (existing.deletedAt) return this.getRecipe(id);

    await this.prisma.recipe.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        published: false,
      },
    });
    return this.getRecipe(id);
  }

  async restoreRecipe(id: string): Promise<AdminRecipeDetail> {
    const existing = await this.prisma.recipe.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("RECIPE_NOT_FOUND");

    await this.prisma.recipe.update({
      where: { id },
      data: {
        deletedAt: null,
        published: true,
      },
    });
    return this.getRecipe(id);
  }

  async getTaxonomy() {
    const rows = await this.prisma.recipe.findMany({
      where: { deletedAt: null },
      select: { category: true, subcategory: true, cuisine: true },
      distinct: ["category", "subcategory", "cuisine"],
      orderBy: [
        { category: "asc" },
        { subcategory: "asc" },
        { cuisine: "asc" },
      ],
    });

    const categories = Array.from(
      new Set(rows.map((row) => row.category).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b, "fa"));

    const subcategoriesByCategory: Record<string, string[]> = {};
    for (const row of rows) {
      if (!row.category || !row.subcategory) continue;
      const list = subcategoriesByCategory[row.category] ?? [];
      if (!list.includes(row.subcategory)) list.push(row.subcategory);
      subcategoriesByCategory[row.category] = list;
    }
    for (const key of Object.keys(subcategoriesByCategory)) {
      subcategoriesByCategory[key] = subcategoriesByCategory[key].sort((a, b) =>
        a.localeCompare(b, "fa"),
      );
    }

    const defaultCuisines = [
      "ایرانی",
      "فرنگی",
      "عربی",
      "ترکی",
      "هندی",
      "چینی",
      "ایتالیایی",
      "مکزیکی",
      "آسیایی",
      "مدیترانه‌ای",
      "تلفیقی",
      "سایر",
    ];
    const cuisines = Array.from(
      new Set([
        ...defaultCuisines,
        ...rows.map((row) => row.cuisine).filter(Boolean),
      ]),
    ).sort((a, b) => a.localeCompare(b, "fa"));

    return { categories, subcategoriesByCategory, cuisines };
  }

  async searchIngredients(q: string, limit = 20) {
    const query = normalizePersian(q);
    if (!query) return [];
    const rows = await this.prisma.ingredient.findMany({
      where: {
        OR: [
          { normalizedName: { contains: query } },
          { name: { contains: q.trim() } },
        ],
      },
      orderBy: { popularity: "desc" },
      take: Math.min(Math.max(limit, 1), 40),
    });
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
    }));
  }

  private async uniqueSlug(base: string, excludeId?: string): Promise<string> {
    let slug = slugify(base);
    for (let i = 0; i < 50; i += 1) {
      const candidate = i === 0 ? slug : `${slug}-${i + 1}`;
      const found = await this.prisma.recipe.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });
      if (!found || found.id === excludeId) return candidate;
    }
    return `${slug}-${Date.now()}`;
  }

  private async resolveIngredients(lines: UpsertRecipeDto["ingredients"]) {
    const resolved: Array<{
      ingredientId: string;
      name: string;
      quantity: string | null;
      unit: string | null;
      optional: boolean;
    }> = [];

    for (const line of lines) {
      const name = line.name.trim();
      if (!name) {
        throw new BadRequestException("INGREDIENT_NAME_REQUIRED");
      }
      let ingredientId = line.ingredientId?.trim() || "";
      if (ingredientId) {
        const byId = await this.prisma.ingredient.findUnique({
          where: { id: ingredientId },
        });
        if (!byId) ingredientId = "";
        else {
          resolved.push({
            ingredientId: byId.id,
            name,
            quantity: line.quantity?.trim() || null,
            unit: line.unit?.trim() || null,
            optional: Boolean(line.optional),
          });
          continue;
        }
      }
      const created = await this.ensureIngredient(name);
      resolved.push({
        ingredientId: created.id,
        name,
        quantity: line.quantity?.trim() || null,
        unit: line.unit?.trim() || null,
        optional: Boolean(line.optional),
      });
    }
    return resolved;
  }

  private async ensureIngredient(name: string) {
    const normalized = normalizePersian(name);
    const existing = await this.prisma.ingredient.findFirst({
      where: {
        OR: [
          { normalizedName: normalized },
          { aliases: { some: { normalizedAlias: normalized } } },
        ],
      },
    });
    if (existing) return existing;

    const id = ingredientIdFromName(name);
    return this.prisma.ingredient.upsert({
      where: { id },
      create: {
        id,
        name: name.trim(),
        normalizedName: normalized,
        category: "عمومی",
        popularity: 1,
        isCustom: true,
        aliases: {
          create: [{ alias: name.trim(), normalizedAlias: normalized }],
        },
      },
      update: {},
    });
  }
}
