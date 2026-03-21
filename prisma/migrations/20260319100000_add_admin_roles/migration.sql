-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'EDITOR');

-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN "role" "AdminRole";

-- Backfill existing admins so current access is preserved
UPDATE "AdminUser"
SET "role" = 'SUPER_ADMIN'
WHERE "role" IS NULL;

-- Enforce defaults for future records
ALTER TABLE "AdminUser"
ALTER COLUMN "role" SET DEFAULT 'EDITOR';

ALTER TABLE "AdminUser"
ALTER COLUMN "role" SET NOT NULL;
