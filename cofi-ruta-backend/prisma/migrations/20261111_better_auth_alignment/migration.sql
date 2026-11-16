-- Align identity tables with the contract Better Auth 1.7 actually reads/writes.
-- Display fields keep their names: auth config maps `name` -> "fullName" and
-- `image` -> "avatarUrl" so no data or app code is duplicated.

-- 1. Better Auth stores credential passwords on Account (providerId = 'credential').
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "password" TEXT;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "refreshTokenExpiresAt" TIMESTAMPTZ(3);

INSERT INTO "Account" (
  "id",
  "userId",
  "provider",
  "providerAccountId",
  "password",
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid()::text,
  u."id",
  'credential',
  u."id",
  u."password",
  u."createdAt",
  u."updatedAt"
FROM "User" u
WHERE u."password" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM "Account" a
    WHERE a."provider" = 'credential'
      AND a."providerAccountId" = u."id"
  );

-- 2. Canonical Better Auth column names.
ALTER TABLE "Account" RENAME COLUMN "provider" TO "providerId";
ALTER TABLE "Account" RENAME COLUMN "providerAccountId" TO "accountId";
ALTER TABLE "Account" RENAME COLUMN "expiresAt" TO "accessTokenExpiresAt";
ALTER INDEX "Account_provider_providerAccountId_key" RENAME TO "Account_providerId_accountId_key";

ALTER TABLE "Session" RENAME COLUMN "tokenHash" TO "token";
ALTER INDEX "Session_tokenHash_key" RENAME TO "Session_token_key";

-- 3. Remove duplicated/legacy columns: Better Auth never reads them, and
-- "User"."name" was NOT NULL without a default, breaking every auth insert.
ALTER TABLE "User" DROP COLUMN IF EXISTS "name";
ALTER TABLE "User" DROP COLUMN IF EXISTS "image";
ALTER TABLE "User" DROP COLUMN IF EXISTS "password";
