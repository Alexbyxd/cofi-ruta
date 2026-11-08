-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "MerchantRole" AS ENUM ('OWNER', 'MANAGER', 'STAFF');

-- CreateEnum
CREATE TYPE "RelationshipStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PairingType" AS ENUM ('DUO', 'GROUP');

-- CreateEnum
CREATE TYPE "CoffeeShopStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "GroupRoomStatus" AS ENUM ('OPEN', 'CLOSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "GroupMemberRole" AS ENUM ('HOST', 'MEMBER');

-- CreateEnum
CREATE TYPE "VisitContext" AS ENUM ('SOLO', 'DUO', 'GROUP');

-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "VisitParticipantRole" AS ENUM ('CREATOR', 'PARTNER', 'MEMBER');

-- CreateEnum
CREATE TYPE "VisitRejectionReason" AS ENUM ('WRONG_PIN', 'OUT_OF_RANGE', 'LOW_ACCURACY', 'PIN_EXPIRED', 'TOO_MANY_ATTEMPTS');

-- CreateEnum
CREATE TYPE "VerificationResult" AS ENUM ('SUCCESS', 'WRONG_PIN', 'OUT_OF_RANGE', 'LOW_ACCURACY', 'EXPIRED', 'RATE_LIMITED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PUBLISHED', 'HIDDEN', 'DELETED');

-- CreateEnum
CREATE TYPE "MatchContext" AS ENUM ('DUO', 'GROUP');

-- CreateEnum
CREATE TYPE "MatchSessionStatus" AS ENUM ('WAITING', 'ACTIVE', 'MATCHED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "fullName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "revokedAt" TIMESTAMPTZ(3),
    "lastUsedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchantStaff" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "coffeeShopId" TEXT NOT NULL,
    "role" "MerchantRole" NOT NULL DEFAULT 'STAFF',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "MerchantStaff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoffeeShop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "neighborhood" TEXT,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "phone" TEXT,
    "whatsapp" TEXT,
    "instagram" TEXT,
    "coverUrl" TEXT,
    "coverPublicId" TEXT,
    "status" "CoffeeShopStatus" NOT NULL DEFAULT 'DRAFT',
    "averageRating" DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "verifiedReviewCount" INTEGER NOT NULL DEFAULT 0,
    "rating1Count" INTEGER NOT NULL DEFAULT 0,
    "rating2Count" INTEGER NOT NULL DEFAULT 0,
    "rating3Count" INTEGER NOT NULL DEFAULT 0,
    "rating4Count" INTEGER NOT NULL DEFAULT 0,
    "rating5Count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "CoffeeShop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpeningHours" (
    "id" TEXT NOT NULL,
    "coffeeShopId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "openTime" TIME(0) NOT NULL,
    "closeTime" TIME(0) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpeningHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialHours" (
    "id" TEXT NOT NULL,
    "coffeeShopId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "openTime" TIME(0),
    "closeTime" TIME(0),
    "note" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpecialHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoffeeShopTag" (
    "coffeeShopId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoffeeShopTag_pkey" PRIMARY KEY ("coffeeShopId","tagId")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "icon" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "coffeeShopId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "imageUrl" TEXT,
    "imagePublicId" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "archivedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoupleLink" (
    "id" TEXT NOT NULL,
    "userAId" TEXT NOT NULL,
    "userBId" TEXT NOT NULL,
    "status" "RelationshipStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMPTZ(3),

    CONSTRAINT "CoupleLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupRoom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "status" "GroupRoomStatus" NOT NULL DEFAULT 'OPEN',
    "maxMembers" INTEGER NOT NULL DEFAULT 12,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "closedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "GroupMemberRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMPTZ(3),

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PairingToken" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "tokenPrefix" TEXT NOT NULL,
    "type" "PairingType" NOT NULL DEFAULT 'DUO',
    "groupId" TEXT,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "consumedById" TEXT,
    "consumedAt" TIMESTAMPTZ(3),
    "revokedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PairingToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "coffeeShopId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "coupleLinkId" TEXT,
    "groupId" TEXT,
    "context" "VisitContext" NOT NULL,
    "status" "VisitStatus" NOT NULL DEFAULT 'PENDING',
    "visitDate" DATE NOT NULL,
    "totalSpent" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "notes" TEXT,
    "photoUrl" TEXT,
    "photoPublicId" TEXT,
    "checkInLatitude" DECIMAL(9,6),
    "checkInLongitude" DECIMAL(9,6),
    "distanceMeters" INTEGER,
    "gpsAccuracyMeters" INTEGER,
    "verifiedAt" TIMESTAMPTZ(3),
    "rejectedAt" TIMESTAMPTZ(3),
    "rejectionReason" "VisitRejectionReason",
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitParticipant" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "VisitParticipantRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitItem" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "VisitItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyPin" (
    "id" TEXT NOT NULL,
    "coffeeShopId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "pinCode" VARCHAR(4) NOT NULL,
    "generatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "DailyPin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationAttempt" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pinHash" TEXT NOT NULL,
    "distanceMeters" INTEGER,
    "gpsAccuracyMeters" INTEGER,
    "result" "VerificationResult" NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerifiedVisit" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "coffeeShopId" TEXT NOT NULL,
    "visitDate" DATE NOT NULL,
    "verifiedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerifiedVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "coffeeShopId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "coupleLinkId" TEXT,
    "visitId" TEXT,
    "rating" DECIMAL(2,1) NOT NULL,
    "comment" VARCHAR(500),
    "status" "ReviewStatus" NOT NULL DEFAULT 'PUBLISHED',
    "moderatedById" TEXT,
    "moderatedAt" TIMESTAMPTZ(3),
    "moderationReason" TEXT,
    "deletedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewPhoto" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchSession" (
    "id" TEXT NOT NULL,
    "context" "MatchContext" NOT NULL,
    "coupleLinkId" TEXT,
    "groupId" TEXT,
    "status" "MatchSessionStatus" NOT NULL DEFAULT 'WAITING',
    "deckSeed" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "startedAt" TIMESTAMPTZ(3),
    "completedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchParticipant" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMPTZ(3),

    CONSTRAINT "MatchParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Swipe" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "coffeeShopId" TEXT NOT NULL,
    "liked" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Swipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "coffeeShopId" TEXT NOT NULL,
    "likesCount" INTEGER NOT NULL,
    "participantsCount" INTEGER NOT NULL,
    "matchedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "MerchantStaff_coffeeShopId_idx" ON "MerchantStaff"("coffeeShopId");

-- CreateIndex
CREATE UNIQUE INDEX "MerchantStaff_userId_coffeeShopId_key" ON "MerchantStaff"("userId", "coffeeShopId");

-- CreateIndex
CREATE UNIQUE INDEX "CoffeeShop_slug_key" ON "CoffeeShop"("slug");

-- CreateIndex
CREATE INDEX "CoffeeShop_neighborhood_idx" ON "CoffeeShop"("neighborhood");

-- CreateIndex
CREATE INDEX "CoffeeShop_status_idx" ON "CoffeeShop"("status");

-- CreateIndex
CREATE INDEX "CoffeeShop_averageRating_idx" ON "CoffeeShop"("averageRating");

-- CreateIndex
CREATE INDEX "OpeningHours_coffeeShopId_idx" ON "OpeningHours"("coffeeShopId");

-- CreateIndex
CREATE UNIQUE INDEX "OpeningHours_coffeeShopId_dayOfWeek_openTime_key" ON "OpeningHours"("coffeeShopId", "dayOfWeek", "openTime");

-- CreateIndex
CREATE INDEX "SpecialHours_coffeeShopId_idx" ON "SpecialHours"("coffeeShopId");

-- CreateIndex
CREATE UNIQUE INDEX "SpecialHours_coffeeShopId_date_key" ON "SpecialHours"("coffeeShopId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "CoffeeShopTag_tagId_idx" ON "CoffeeShopTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "MenuItem_coffeeShopId_idx" ON "MenuItem"("coffeeShopId");

-- CreateIndex
CREATE INDEX "MenuItem_categoryId_idx" ON "MenuItem"("categoryId");

-- CreateIndex
CREATE INDEX "MenuItem_isAvailable_idx" ON "MenuItem"("isAvailable");

-- CreateIndex
CREATE INDEX "MenuItem_isFeatured_idx" ON "MenuItem"("isFeatured");

-- CreateIndex
CREATE UNIQUE INDEX "MenuItem_coffeeShopId_name_key" ON "MenuItem"("coffeeShopId", "name");

-- CreateIndex
CREATE INDEX "CoupleLink_userAId_idx" ON "CoupleLink"("userAId");

-- CreateIndex
CREATE INDEX "CoupleLink_userBId_idx" ON "CoupleLink"("userBId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupRoom_code_key" ON "GroupRoom"("code");

-- CreateIndex
CREATE INDEX "GroupRoom_hostId_idx" ON "GroupRoom"("hostId");

-- CreateIndex
CREATE INDEX "GroupRoom_status_idx" ON "GroupRoom"("status");

-- CreateIndex
CREATE INDEX "GroupMember_userId_idx" ON "GroupMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupMember_groupId_userId_key" ON "GroupMember"("groupId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PairingToken_tokenHash_key" ON "PairingToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PairingToken_creatorId_idx" ON "PairingToken"("creatorId");

-- CreateIndex
CREATE INDEX "PairingToken_groupId_idx" ON "PairingToken"("groupId");

-- CreateIndex
CREATE INDEX "PairingToken_tokenPrefix_idx" ON "PairingToken"("tokenPrefix");

-- CreateIndex
CREATE INDEX "Visit_coffeeShopId_visitDate_idx" ON "Visit"("coffeeShopId", "visitDate");

-- CreateIndex
CREATE INDEX "Visit_createdById_idx" ON "Visit"("createdById");

-- CreateIndex
CREATE INDEX "Visit_coupleLinkId_idx" ON "Visit"("coupleLinkId");

-- CreateIndex
CREATE INDEX "Visit_groupId_idx" ON "Visit"("groupId");

-- CreateIndex
CREATE INDEX "Visit_status_idx" ON "Visit"("status");

-- CreateIndex
CREATE INDEX "VisitParticipant_userId_idx" ON "VisitParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VisitParticipant_visitId_userId_key" ON "VisitParticipant"("visitId", "userId");

-- CreateIndex
CREATE INDEX "VisitItem_menuItemId_idx" ON "VisitItem"("menuItemId");

-- CreateIndex
CREATE UNIQUE INDEX "VisitItem_visitId_menuItemId_key" ON "VisitItem"("visitId", "menuItemId");

-- CreateIndex
CREATE INDEX "DailyPin_coffeeShopId_idx" ON "DailyPin"("coffeeShopId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyPin_coffeeShopId_date_key" ON "DailyPin"("coffeeShopId", "date");

-- CreateIndex
CREATE INDEX "VerificationAttempt_visitId_createdAt_idx" ON "VerificationAttempt"("visitId", "createdAt");

-- CreateIndex
CREATE INDEX "VerificationAttempt_userId_createdAt_idx" ON "VerificationAttempt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "VerifiedVisit_visitId_idx" ON "VerifiedVisit"("visitId");

-- CreateIndex
CREATE INDEX "VerifiedVisit_coffeeShopId_visitDate_idx" ON "VerifiedVisit"("coffeeShopId", "visitDate");

-- CreateIndex
CREATE UNIQUE INDEX "VerifiedVisit_userId_coffeeShopId_visitDate_key" ON "VerifiedVisit"("userId", "coffeeShopId", "visitDate");

-- CreateIndex
CREATE UNIQUE INDEX "Review_visitId_key" ON "Review"("visitId");

-- CreateIndex
CREATE INDEX "Review_coffeeShopId_status_idx" ON "Review"("coffeeShopId", "status");

-- CreateIndex
CREATE INDEX "Review_coupleLinkId_idx" ON "Review"("coupleLinkId");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "Review_authorId_coffeeShopId_key" ON "Review"("authorId", "coffeeShopId");

-- CreateIndex
CREATE INDEX "ReviewPhoto_reviewId_idx" ON "ReviewPhoto"("reviewId");

-- CreateIndex
CREATE INDEX "MatchSession_coupleLinkId_idx" ON "MatchSession"("coupleLinkId");

-- CreateIndex
CREATE INDEX "MatchSession_groupId_idx" ON "MatchSession"("groupId");

-- CreateIndex
CREATE INDEX "MatchSession_status_idx" ON "MatchSession"("status");

-- CreateIndex
CREATE INDEX "MatchParticipant_userId_idx" ON "MatchParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchParticipant_sessionId_userId_key" ON "MatchParticipant"("sessionId", "userId");

-- CreateIndex
CREATE INDEX "Swipe_sessionId_coffeeShopId_idx" ON "Swipe"("sessionId", "coffeeShopId");

-- CreateIndex
CREATE INDEX "Swipe_userId_idx" ON "Swipe"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Swipe_sessionId_userId_coffeeShopId_key" ON "Swipe"("sessionId", "userId", "coffeeShopId");

-- CreateIndex
CREATE UNIQUE INDEX "Match_sessionId_key" ON "Match"("sessionId");

-- CreateIndex
CREATE INDEX "Match_coffeeShopId_idx" ON "Match"("coffeeShopId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantStaff" ADD CONSTRAINT "MerchantStaff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantStaff" ADD CONSTRAINT "MerchantStaff_coffeeShopId_fkey" FOREIGN KEY ("coffeeShopId") REFERENCES "CoffeeShop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningHours" ADD CONSTRAINT "OpeningHours_coffeeShopId_fkey" FOREIGN KEY ("coffeeShopId") REFERENCES "CoffeeShop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialHours" ADD CONSTRAINT "SpecialHours_coffeeShopId_fkey" FOREIGN KEY ("coffeeShopId") REFERENCES "CoffeeShop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoffeeShopTag" ADD CONSTRAINT "CoffeeShopTag_coffeeShopId_fkey" FOREIGN KEY ("coffeeShopId") REFERENCES "CoffeeShop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoffeeShopTag" ADD CONSTRAINT "CoffeeShopTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_coffeeShopId_fkey" FOREIGN KEY ("coffeeShopId") REFERENCES "CoffeeShop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoupleLink" ADD CONSTRAINT "CoupleLink_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoupleLink" ADD CONSTRAINT "CoupleLink_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupRoom" ADD CONSTRAINT "GroupRoom_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "GroupRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PairingToken" ADD CONSTRAINT "PairingToken_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PairingToken" ADD CONSTRAINT "PairingToken_consumedById_fkey" FOREIGN KEY ("consumedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PairingToken" ADD CONSTRAINT "PairingToken_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "GroupRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_coffeeShopId_fkey" FOREIGN KEY ("coffeeShopId") REFERENCES "CoffeeShop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_coupleLinkId_fkey" FOREIGN KEY ("coupleLinkId") REFERENCES "CoupleLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "GroupRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitParticipant" ADD CONSTRAINT "VisitParticipant_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitParticipant" ADD CONSTRAINT "VisitParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitItem" ADD CONSTRAINT "VisitItem_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitItem" ADD CONSTRAINT "VisitItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPin" ADD CONSTRAINT "DailyPin_coffeeShopId_fkey" FOREIGN KEY ("coffeeShopId") REFERENCES "CoffeeShop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationAttempt" ADD CONSTRAINT "VerificationAttempt_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationAttempt" ADD CONSTRAINT "VerificationAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerifiedVisit" ADD CONSTRAINT "VerifiedVisit_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerifiedVisit" ADD CONSTRAINT "VerifiedVisit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerifiedVisit" ADD CONSTRAINT "VerifiedVisit_coffeeShopId_fkey" FOREIGN KEY ("coffeeShopId") REFERENCES "CoffeeShop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_coffeeShopId_fkey" FOREIGN KEY ("coffeeShopId") REFERENCES "CoffeeShop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_coupleLinkId_fkey" FOREIGN KEY ("coupleLinkId") REFERENCES "CoupleLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_moderatedById_fkey" FOREIGN KEY ("moderatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewPhoto" ADD CONSTRAINT "ReviewPhoto_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchSession" ADD CONSTRAINT "MatchSession_coupleLinkId_fkey" FOREIGN KEY ("coupleLinkId") REFERENCES "CoupleLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchSession" ADD CONSTRAINT "MatchSession_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "GroupRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchParticipant" ADD CONSTRAINT "MatchParticipant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "MatchSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchParticipant" ADD CONSTRAINT "MatchParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Swipe" ADD CONSTRAINT "Swipe_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "MatchSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Swipe" ADD CONSTRAINT "Swipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Swipe" ADD CONSTRAINT "Swipe_coffeeShopId_fkey" FOREIGN KEY ("coffeeShopId") REFERENCES "CoffeeShop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "MatchSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_coffeeShopId_fkey" FOREIGN KEY ("coffeeShopId") REFERENCES "CoffeeShop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─────────────────────────────────────────────────────────────
-- Fase 0: extensiones, invariantes y búsqueda
-- SQL crudo que Prisma no expresa en el schema.
-- ─────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION cofi_unaccent(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
STRICT
AS $$
  SELECT public.unaccent('public.unaccent'::regdictionary, value);
$$;

-- Coordenadas
ALTER TABLE "CoffeeShop"
  ADD CONSTRAINT "coffeeshop_latitude_range" CHECK ("latitude" BETWEEN -90 AND 90),
  ADD CONSTRAINT "coffeeshop_longitude_range" CHECK ("longitude" BETWEEN -180 AND 180);

ALTER TABLE "Visit"
  ADD CONSTRAINT "visit_check_in_latitude_range" CHECK ("checkInLatitude" IS NULL OR "checkInLatitude" BETWEEN -90 AND 90),
  ADD CONSTRAINT "visit_check_in_longitude_range" CHECK ("checkInLongitude" IS NULL OR "checkInLongitude" BETWEEN -180 AND 180);

-- Reputación
ALTER TABLE "Review"
  ADD CONSTRAINT "review_rating_range" CHECK ("rating" BETWEEN 1.0 AND 5.0),
  ADD CONSTRAINT "review_rating_half_step" CHECK (("rating" * 2) = floor("rating" * 2));

ALTER TABLE "CoffeeShop"
  ADD CONSTRAINT "coffeeshop_average_rating_range" CHECK ("averageRating" BETWEEN 0 AND 5),
  ADD CONSTRAINT "coffeeshop_review_counts_nonnegative" CHECK (
    "reviewCount" >= 0 AND "verifiedReviewCount" >= 0 AND
    "rating1Count" >= 0 AND "rating2Count" >= 0 AND "rating3Count" >= 0 AND
    "rating4Count" >= 0 AND "rating5Count" >= 0
  );

-- Visitas
ALTER TABLE "VisitItem"
  ADD CONSTRAINT "visit_item_quantity_positive" CHECK ("quantity" > 0),
  ADD CONSTRAINT "visit_item_unit_price_nonnegative" CHECK ("unitPrice" >= 0);

ALTER TABLE "Visit"
  ADD CONSTRAINT "visit_total_spent_nonnegative" CHECK ("totalSpent" >= 0);

ALTER TABLE "Visit"
  ADD CONSTRAINT "visit_context_matches_links" CHECK (
    ("context" = 'SOLO'  AND "coupleLinkId" IS NULL AND "groupId" IS NULL) OR
    ("context" = 'DUO'   AND "coupleLinkId" IS NOT NULL AND "groupId" IS NULL) OR
    ("context" = 'GROUP' AND "groupId" IS NOT NULL AND "coupleLinkId" IS NULL)
  );

-- PIN
ALTER TABLE "DailyPin"
  ADD CONSTRAINT "daily_pin_code_format" CHECK ("pinCode" ~ '^[0-9]{4}$');

-- Orden canónico dúo
ALTER TABLE "CoupleLink"
  ADD CONSTRAINT "couple_link_canonical_order" CHECK ("userAId" < "userBId");

-- Un solo vínculo activo por usuario
CREATE UNIQUE INDEX "couple_link_active_user_a_key"
  ON "CoupleLink" ("userAId") WHERE "status" = 'ACTIVE';
CREATE UNIQUE INDEX "couple_link_active_user_b_key"
  ON "CoupleLink" ("userBId") WHERE "status" = 'ACTIVE';

-- Una reseña de pareja no borrada por local
CREATE UNIQUE INDEX "review_couple_unique_key"
  ON "Review" ("coupleLinkId", "coffeeShopId")
  WHERE "coupleLinkId" IS NOT NULL AND "status" <> 'DELETED';

-- Una sesión de matcher activa por vínculo/sala
CREATE UNIQUE INDEX "match_session_active_couple_key"
  ON "MatchSession" ("coupleLinkId")
  WHERE "status" IN ('WAITING', 'ACTIVE') AND "coupleLinkId" IS NOT NULL;
CREATE UNIQUE INDEX "match_session_active_group_key"
  ON "MatchSession" ("groupId")
  WHERE "status" IN ('WAITING', 'ACTIVE') AND "groupId" IS NOT NULL;

-- Búsqueda FTS en español + trigram
CREATE INDEX "menu_item_fts_spanish_idx"
  ON "MenuItem"
  USING GIN (to_tsvector('spanish', cofi_unaccent("name" || ' ' || coalesce("description", ''))));

CREATE INDEX "menu_item_name_trgm_idx"
  ON "MenuItem" USING GIN ("name" gin_trgm_ops);

CREATE INDEX "coffee_shop_name_trgm_idx"
  ON "CoffeeShop" USING GIN ("name" gin_trgm_ops);
