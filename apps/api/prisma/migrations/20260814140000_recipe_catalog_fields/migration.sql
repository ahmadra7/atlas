-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN IF NOT EXISTS "sourceExternalId" TEXT;
ALTER TABLE "Recipe" ADD COLUMN IF NOT EXISTS "subcategory" TEXT;
ALTER TABLE "Recipe" ADD COLUMN IF NOT EXISTS "caloriesPerServing" INTEGER;
ALTER TABLE "Recipe" ADD COLUMN IF NOT EXISTS "cookingMethod" TEXT;
ALTER TABLE "Recipe" ADD COLUMN IF NOT EXISTS "verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Recipe" ADD COLUMN IF NOT EXISTS "meta" JSONB;

CREATE UNIQUE INDEX IF NOT EXISTS "Recipe_sourceExternalId_key" ON "Recipe"("sourceExternalId");
CREATE INDEX IF NOT EXISTS "Recipe_category_idx" ON "Recipe"("category");
CREATE INDEX IF NOT EXISTS "Recipe_title_idx" ON "Recipe"("title");
