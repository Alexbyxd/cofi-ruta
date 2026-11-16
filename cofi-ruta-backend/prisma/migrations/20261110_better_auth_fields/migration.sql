-- Better Auth compatible fields migration
-- Handles transition from custom auth schema to Better Auth expected schema

-- 1. Add new columns as nullable first
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "image" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT; -- will copy from passwordHash

-- 2. Add new columns to Account
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "accessToken" TEXT;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "refreshToken" TEXT;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "scope" TEXT;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "idToken" TEXT;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMPTZ(3);
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT now();

-- 3. Add new columns to Session
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT now();

-- 4. Create Verification table (required by Better Auth)
CREATE TABLE IF NOT EXISTS "Verification" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT now(),
    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Verification_identifier_value_key" ON "Verification"("identifier", "value");
CREATE INDEX IF NOT EXISTS "Verification_expiresAt_idx" ON "Verification"("expiresAt");

-- 5. Migrate data: copy passwordHash -> password, fullName -> name, avatarUrl -> image
UPDATE "User" SET
    "password" = "passwordHash",
    "name" = "fullName",
    "image" = "avatarUrl"
WHERE "passwordHash" IS NOT NULL;

-- For users without password (OAuth only), set a default name
UPDATE "User" SET
    "name" = COALESCE("fullName", "email")
WHERE "name" IS NULL;

-- 6. Migrate Account updatedAt
UPDATE "Account" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;

-- 7. Make required columns NOT NULL (after data migration)
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "emailVerified" SET NOT NULL;

-- 8. Drop old columns (optional - keep for compatibility during transition)
-- ALTER TABLE "User" DROP COLUMN IF EXISTS "passwordHash";
-- ALTER TABLE "User" DROP COLUMN IF EXISTS "fullName";
-- ALTER TABLE "User" DROP COLUMN IF EXISTS "avatarUrl";
-- ALTER TABLE "Session" DROP COLUMN IF EXISTS "lastUsedAt";
-- ALTER TABLE "Session" DROP COLUMN IF EXISTS "revokedAt";

-- 9. Update indexes for Better Auth compatibility
-- User.email already unique
-- Account.provider_providerAccountId already unique
-- Session.tokenHash already unique