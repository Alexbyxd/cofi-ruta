import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { createTestPrisma, truncateAll } from './helpers';
import { seedDatabase } from '../../prisma/seed';

describe('Seed idempotente (Fase 0)', () => {
  let prisma: PrismaClient;
  let pool: Pool;

  beforeAll(() => {
    const test = createTestPrisma();
    prisma = test.prisma;
    pool = test.pool;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  beforeEach(async () => {
    await truncateAll(prisma);
  });

  it('seeds the Oruro catalog without duplicating on a second run', async () => {
    const first = await seedDatabase(prisma);
    const second = await seedDatabase(prisma);

    expect(first.coffeeShops).toBeGreaterThanOrEqual(15);
    expect(first.coffeeShops).toBeLessThanOrEqual(30);
    expect(second).toEqual(first);

    expect(await prisma.category.count()).toBe(6);
    expect(await prisma.tag.count()).toBe(5);
    expect(await prisma.coffeeShop.count()).toBe(first.coffeeShops);
    expect(await prisma.openingHours.count()).toBe(first.openingHours);
    expect(await prisma.menuItem.count()).toBe(first.menuItems);
    expect(await prisma.coffeeShopTag.count()).toBe(first.coffeeShopTags);
  });

  it('creates every cafe as ACTIVE with hours, coordinates and a menu', async () => {
    await seedDatabase(prisma);

    const shops = await prisma.coffeeShop.findMany({
      include: { openingHours: true, menuItems: true, tags: true },
      orderBy: { slug: 'asc' },
    });

    expect(shops.length).toBeGreaterThanOrEqual(15);

    for (const shop of shops) {
      expect(shop.status).toBe('ACTIVE');
      expect(shop.neighborhood).toBeTruthy();
      expect(Number(shop.latitude)).toBeGreaterThanOrEqual(-90);
      expect(Number(shop.latitude)).toBeLessThanOrEqual(90);
      expect(Number(shop.longitude)).toBeGreaterThanOrEqual(-180);
      expect(Number(shop.longitude)).toBeLessThanOrEqual(180);
      expect(shop.openingHours.length).toBeGreaterThan(0);
      expect(shop.menuItems.length).toBeGreaterThan(0);
      expect(shop.tags.length).toBeGreaterThan(0);
      expect(shop.menuItems.every((item) => Number(item.price) > 0)).toBe(true);
    }
  });
});
