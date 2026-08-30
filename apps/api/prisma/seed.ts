import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { FOOD_NAMES, normalizePersian } from "@atlas/shared";
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
      select: { id: true },
    });
    if (existing) continue;
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
      created += 1;
    } catch {
      /* alias collision with a richer catalog row */
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
