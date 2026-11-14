-- Soft-delete flag for recipes (hide from app, keep data)
ALTER TABLE "Recipe" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Recipe_deletedAt_idx" ON "Recipe"("deletedAt");
