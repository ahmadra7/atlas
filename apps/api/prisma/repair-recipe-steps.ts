/**
 * Replace generic template cooking steps with per-recipe steps
 * derived from title, method, and ingredients. Real verified instructions stay.
 */
import { PrismaClient } from "@prisma/client";
import {
  isGenericInstructionText,
  synthesizeSteps,
} from "./synthesize-steps";

const prisma = new PrismaClient();

async function main() {
  const versions = await prisma.recipeVersion.findMany({
    where: { isCurrent: true },
    select: {
      id: true,
      recipe: {
        select: {
          title: true,
          category: true,
          cookingMethod: true,
          cookMinutes: true,
        },
      },
      ingredients: { select: { name: true }, orderBy: { sortOrder: "asc" } },
      steps: { select: { instruction: true }, orderBy: { order: "asc" } },
    },
  });

  let repaired = 0;
  let kept = 0;

  for (const version of versions) {
    const texts = version.steps.map((s) => s.instruction);
    if (texts.length > 0 && !isGenericInstructionText(texts)) {
      kept += 1;
      continue;
    }

    const drafts = synthesizeSteps({
      title: version.recipe.title,
      category: version.recipe.category,
      cookingMethod: version.recipe.cookingMethod,
      cookMinutes: version.recipe.cookMinutes,
      ingredients: version.ingredients,
    });

    await prisma.recipeStep.deleteMany({
      where: { recipeVersionId: version.id },
    });
    await prisma.recipeStep.createMany({
      data: drafts.map((s) => ({
        id: `${version.id}-s${s.order}`,
        recipeVersionId: version.id,
        order: s.order,
        instruction: s.instruction,
        tip: s.tip ?? null,
        timerSeconds: s.timerSeconds ?? null,
      })),
    });
    repaired += 1;
    if (repaired % 200 === 0) {
      // eslint-disable-next-line no-console
      console.log(`Repaired ${repaired} recipes…`);
    }
  }

  // eslint-disable-next-line no-console
  console.log(`Done — repaired=${repaired} kept-real=${kept}`);
}

void main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
