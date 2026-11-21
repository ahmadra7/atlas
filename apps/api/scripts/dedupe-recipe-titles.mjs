/**
 * Soft-delete duplicate recipe titles, keeping the richest active row per title.
 *
 * Usage:
 *   node scripts/dedupe-recipe-titles.mjs           # dry-run
 *   node scripts/dedupe-recipe-titles.mjs --apply   # soft-delete extras
 */
import { PrismaClient } from "@prisma/client";

const apply = process.argv.includes("--apply");
const prisma = new PrismaClient();

function score(row) {
  const version = row.versions[0];
  const ings = version?.ingredients?.length ?? 0;
  const steps = version?.steps?.length ?? 0;
  const verified = row.verified ? 5 : 0;
  const image = row.imageUrl && !row.imageUrl.includes("unsplash") ? 2 : 0;
  const desc = (row.description ?? "").length > 40 ? 1 : 0;
  return ings * 3 + steps * 4 + verified + image + desc + row.totalMinutes / 1000;
}

async function main() {
  const titles = await prisma.$queryRaw`
    SELECT title
    FROM "Recipe"
    WHERE "deletedAt" IS NULL
    GROUP BY title
    HAVING COUNT(*) > 1
    ORDER BY title ASC
  `;

  let groups = 0;
  let keep = 0;
  let drop = 0;
  const samples = [];

  for (const { title } of titles) {
    const rows = await prisma.recipe.findMany({
      where: { title, deletedAt: null },
      include: {
        versions: {
          where: { isCurrent: true },
          include: {
            ingredients: { select: { id: true } },
            steps: { select: { id: true } },
          },
        },
      },
    });
    if (rows.length < 2) continue;
    groups += 1;

    const ranked = [...rows].sort((a, b) => {
      const diff = score(b) - score(a);
      if (diff !== 0) return diff;
      return a.id.localeCompare(b.id);
    });
    const winner = ranked[0];
    const losers = ranked.slice(1);
    keep += 1;
    drop += losers.length;

    if (samples.length < 8) {
      samples.push({
        title,
        keep: winner.id,
        drop: losers.map((r) => r.id),
      });
    }

    if (apply) {
      await prisma.recipe.updateMany({
        where: { id: { in: losers.map((r) => r.id) } },
        data: { deletedAt: new Date(), published: false },
      });
    }
  }

  console.log(
    JSON.stringify(
      {
        mode: apply ? "apply" : "dry-run",
        groups,
        keep,
        drop,
        samples,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
