-- AlterTable
ALTER TABLE "ideas" ADD COLUMN IF NOT EXISTS "uiPreferences" JSONB;
