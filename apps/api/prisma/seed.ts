import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { FOOD_ALIASES, FOOD_NAMES, compactPersian, normalizePersian } from "@atlas/shared";
import {
  importIranianRecipes,
  ingredientIdFromName,
} from "./import-iranian-recipes";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.DEMO_USER_EMAIL ?? "ahmad@atlas.local";
  const password = process.env.DEMO_USER_PASSWORD ?? "atlas-demo";
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      displayName: "احمد",
      dietaryPreferences: [],
      defaultMaxMinutes: 45,
      locale: "fa",
    },
    update: {
      passwordHash,
      displayName: "احمد",
    },
  });

  const catalog = await importIranianRecipes({ replaceCatalog: true });
  const extraIngredients = await ensureFoodCatalog(prisma);

  // Fridge starts empty — user adds ingredients themselves
  await prisma.inventoryItem.deleteMany({ where: { userId: user.id } });

  // eslint-disable-next-line no-console
  console.log(
    `Seed OK — user=${email} password=${password} recipes=${catalog.imported} ingredients=${catalog.ingredients}+${extraIngredients} inventory=empty`,
  );
}

async function ensureFoodCatalog(prisma: PrismaClient) {
  const unique = [
    ...new Set(
      FOOD_NAMES.map((name) => name.trim()).filter((name) => name.length >= 2),
    ),
  ];
  let created = 0;
  const byNormalized = new Map<string, string>();

  for (const name of unique) {
    const normalizedName = normalizePersian(name);
    if (normalizedName.length < 2) continue;
    const existing = await prisma.ingredient.findFirst({
      where: {
        OR: [
          { normalizedName },
          { aliases: { some: { normalizedAlias: normalizedName } } },
        ],
      },
      select: { id: true, normalizedName: true },
    });
    if (existing) {
      byNormalized.set(normalizedName, existing.id);
      byNormalized.set(existing.normalizedName, existing.id);
      continue;
    }
    const id = ingredientIdFromName(name);
    try {
      await prisma.ingredient.create({
        data: {
          id,
          name,
          normalizedName,
          category: "عمومی",
          popularity: 1,
          isCustom: false,
          aliases: {
            create: [{ alias: name, normalizedAlias: normalizedName }],
          },
        },
      });
      byNormalized.set(normalizedName, id);
      created += 1;
    } catch {
      /* alias collision with a richer catalog row */
    }
  }

  for (const [canonical, aliases] of Object.entries(FOOD_ALIASES)) {
    const canonKey = normalizePersian(canonical);
    let parentId = byNormalized.get(canonKey);
    if (!parentId) {
      const row = await prisma.ingredient.findFirst({
        where: {
          OR: [
            { normalizedName: canonKey },
            { name: canonical },
            { aliases: { some: { normalizedAlias: canonKey } } },
          ],
        },
        select: { id: true },
      });
      parentId = row?.id;
    }
    if (!parentId) continue;

    for (const alias of aliases) {
      const normalizedAlias = normalizePersian(alias);
      const compactAlias = compactPersian(alias);
      if (normalizedAlias.length < 2) continue;
      const forms = [...new Set([normalizedAlias, compactAlias])];
      for (const form of forms) {
        const clash = await prisma.ingredientAlias.findUnique({
          where: { normalizedAlias: form },
          select: { id: true },
        });
        if (clash) continue;
        try {
          await prisma.ingredientAlias.create({
            data: {
              ingredientId: parentId,
              alias,
              normalizedAlias: form,
            },
          });
        } catch {
          /* unique clash */
        }
      }
    }
  }

  return created;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
