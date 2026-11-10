-- Close the remaining drift between the identity tables and schema.prisma.
-- `specialty` was added to the datamodel without a migration; the legacy
-- password/session columns are no longer read by Better Auth or the app.

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "specialty" TEXT;
ALTER TABLE "User" ALTER COLUMN "fullName" SET DEFAULT '';

-- Password hashes were copied to Account.password by 20261111.
ALTER TABLE "User" DROP COLUMN IF EXISTS "passwordHash";

ALTER TABLE "Session" DROP COLUMN IF EXISTS "lastUsedAt";
ALTER TABLE "Session" DROP COLUMN IF EXISTS "revokedAt";
