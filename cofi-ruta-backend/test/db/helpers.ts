import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const TABLES = [
  'User',
  'Account',
  'Session',
  'Verification',
  'MerchantStaff',
  'CoffeeShop',
  'OpeningHours',
  'SpecialHours',
  'Tag',
  'CoffeeShopTag',
  'Category',
  'MenuItem',
  'CoupleLink',
  'GroupRoom',
  'GroupMember',
  'PairingToken',
  'Visit',
  'VisitParticipant',
  'VisitItem',
  'DailyPin',
  'VerificationAttempt',
  'VerifiedVisit',
  'Review',
  'ReviewPhoto',
  'MatchSession',
  'MatchParticipant',
  'Swipe',
  'Match',
] as const;

export function createTestPrisma() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error('DATABASE_URL is required for DB tests');
  }

  const databaseName = new URL(url).pathname.replace(/^\//, '');
  if (!databaseName.endsWith('_test')) {
    throw new Error(
      `Refusing to run destructive DB tests against "${databaseName}". The database name must end with "_test".`,
    );
  }

  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  return { prisma, pool };
}

export async function truncateAll(prisma: PrismaClient): Promise<void> {
  const list = TABLES.map((table) => `"${table}"`).join(', ');
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE;`,
  );
}

let sequence = 0;

export function uniqueSuffix(): string {
  sequence += 1;
  return `${Date.now()}-${sequence}`;
}
