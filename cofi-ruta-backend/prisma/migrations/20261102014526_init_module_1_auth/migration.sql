-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'MERCHANT', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "RelationshipStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PairingType" AS ENUM ('DUO', 'GROUP');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "fullName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PairingToken" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" "PairingType" NOT NULL DEFAULT 'DUO',
    "groupId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PairingToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoupleLink" (
    "id" TEXT NOT NULL,
    "userAId" TEXT NOT NULL,
    "userBId" TEXT NOT NULL,
    "status" "RelationshipStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "CoupleLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupRoom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PairingToken_token_key" ON "PairingToken"("token");

-- CreateIndex
CREATE INDEX "PairingToken_token_idx" ON "PairingToken"("token");

-- CreateIndex
CREATE INDEX "PairingToken_creatorId_idx" ON "PairingToken"("creatorId");

-- CreateIndex
CREATE INDEX "CoupleLink_userAId_idx" ON "CoupleLink"("userAId");

-- CreateIndex
CREATE INDEX "CoupleLink_userBId_idx" ON "CoupleLink"("userBId");

-- CreateIndex
CREATE UNIQUE INDEX "CoupleLink_userAId_userBId_key" ON "CoupleLink"("userAId", "userBId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupRoom_code_key" ON "GroupRoom"("code");

-- CreateIndex
CREATE UNIQUE INDEX "GroupMember_groupId_userId_key" ON "GroupMember"("groupId", "userId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PairingToken" ADD CONSTRAINT "PairingToken_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoupleLink" ADD CONSTRAINT "CoupleLink_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoupleLink" ADD CONSTRAINT "CoupleLink_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "GroupRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
