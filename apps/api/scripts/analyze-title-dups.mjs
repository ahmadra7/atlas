import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.$queryRaw`
    SELECT title, COUNT(*)::int AS c
    FROM "Recipe"
    WHERE "deletedAt" IS NULL
    GROUP BY title
    HAVING COUNT(*) > 1
    ORDER BY c DESC
    LIMIT 25
  `;
  console.log("top_dup_titles", JSON.stringify(rows, null, 2));

  const totals = await prisma.$queryRaw`
    SELECT
      (SELECT COUNT(*)::int FROM "Recipe") AS all_rows,
      (SELECT COUNT(*)::int FROM "Recipe" WHERE "deletedAt" IS NULL) AS active,
      (SELECT COUNT(*)::int FROM (
        SELECT title FROM "Recipe" WHERE "deletedAt" IS NULL GROUP BY title HAVING COUNT(*) > 1
      ) t) AS dup_groups,
      (SELECT COALESCE(SUM(c - 1), 0)::int FROM (
        SELECT COUNT(*)::int AS c FROM "Recipe" WHERE "deletedAt" IS NULL GROUP BY title HAVING COUNT(*) > 1
      ) x) AS extra_rows
  `;
  console.log("totals", JSON.stringify(totals, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
