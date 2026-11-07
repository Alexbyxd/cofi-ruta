import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';
import {
  cafesSchema,
  categories,
  hoursPresets,
  menuTemplates,
  tags,
  type CafeSeed,
  type OpeningHourSeed,
} from './seed-data/catalog';

export interface SeedSummary {
  categories: number;
  tags: number;
  coffeeShops: number;
  openingHours: number;
  menuItems: number;
  coffeeShopTags: number;
}

const CAFES_FILE = join(__dirname, 'seed-data', 'cafes.json');

export function loadCafes(): CafeSeed[] {
  const raw: unknown = JSON.parse(readFileSync(CAFES_FILE, 'utf8'));
  return cafesSchema.parse(raw);
}

function timeToDate(time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(Date.UTC(1970, 0, 1, hours, minutes));
}

function resolveHours(cafe: CafeSeed): OpeningHourSeed[] {
  return typeof cafe.hours === 'string' ? hoursPresets[cafe.hours] : cafe.hours;
}

function required<T>(map: Map<string, T>, key: string, kind: string): T {
  const value = map.get(key);
  if (!value) {
    throw new Error(`Unknown ${kind} "${key}" referenced by the seed data.`);
  }
  return value;
}

export async function seedDatabase(prisma: PrismaClient): Promise<SeedSummary> {
  const cafes = loadCafes();

  const categoryIds = new Map<string, string>();
  for (const category of categories) {
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, sortOrder: category.sortOrder },
      create: {
        slug: category.slug,
        name: category.name,
        sortOrder: category.sortOrder,
      },
    });
    categoryIds.set(category.slug, row.id);
  }

  const tagIds = new Map<string, string>();
  for (const tag of tags) {
    const row = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name },
      create: { slug: tag.slug, name: tag.name },
    });
    tagIds.set(tag.slug, row.id);
  }

  for (const cafe of cafes) {
    const shopData = {
      name: cafe.name,
      description: cafe.description,
      address: cafe.address,
      neighborhood: cafe.neighborhood,
      latitude: cafe.latitude,
      longitude: cafe.longitude,
      phone: cafe.phone,
      instagram: cafe.instagram,
      status: 'ACTIVE' as const,
    };

    const shop = await prisma.coffeeShop.upsert({
      where: { slug: cafe.slug },
      update: shopData,
      create: { slug: cafe.slug, ...shopData },
    });

    await prisma.openingHours.deleteMany({ where: { coffeeShopId: shop.id } });
    await prisma.openingHours.createMany({
      data: resolveHours(cafe).map((hour) => ({
        coffeeShopId: shop.id,
        dayOfWeek: hour.dayOfWeek,
        openTime: timeToDate(hour.open),
        closeTime: timeToDate(hour.close),
      })),
    });

    const items = [...menuTemplates[cafe.menuTemplate], cafe.signature];
    let sortOrder = 0;
    for (const item of items) {
      const categoryId = required(categoryIds, item.category, 'category');
      const itemData = {
        categoryId,
        description: item.description,
        price: item.price,
        sortOrder,
        isAvailable: true,
      };
      sortOrder += 1;

      await prisma.menuItem.upsert({
        where: {
          coffeeShopId_name: { coffeeShopId: shop.id, name: item.name },
        },
        update: itemData,
        create: { coffeeShopId: shop.id, name: item.name, ...itemData },
      });
    }

    await prisma.coffeeShopTag.createMany({
      data: cafe.tags.map((tagSlug) => ({
        coffeeShopId: shop.id,
        tagId: required(tagIds, tagSlug, 'tag'),
      })),
      skipDuplicates: true,
    });
  }

  return {
    categories: await prisma.category.count(),
    tags: await prisma.tag.count(),
    coffeeShops: await prisma.coffeeShop.count(),
    openingHours: await prisma.openingHours.count(),
    menuItems: await prisma.menuItem.count(),
    coffeeShopTags: await prisma.coffeeShopTag.count(),
  };
}

function createClient(): { prisma: PrismaClient; pool: Pool } {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error('DATABASE_URL is required to run the seed.');
  }

  const pool = new Pool({ connectionString: url });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  return { prisma, pool };
}

async function main(): Promise<void> {
  dotenv.config({ path: join(__dirname, '..', '..', '.env'), quiet: true });
  dotenv.config({ path: join(__dirname, '..', '.env'), quiet: true });

  const { prisma, pool } = createClient();

  try {
    const summary = await seedDatabase(prisma);
    console.log(
      `Seed listo: ${summary.coffeeShops} cafeterías, ${summary.menuItems} ítems de menú, ` +
        `${summary.openingHours} horarios, ${summary.categories} categorías y ${summary.tags} tags.`,
    );
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

if (require.main === module) {
  void main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
