import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { importIranianRecipes } from "./import-iranian-recipes";

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

  // Fridge starts empty — user adds ingredients themselves
  await prisma.inventoryItem.deleteMany({ where: { userId: user.id } });

  // eslint-disable-next-line no-console
  console.log(
    `Seed OK — user=${email} password=${password} recipes=${catalog.imported} ingredients=${catalog.ingredients} inventory=empty`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
