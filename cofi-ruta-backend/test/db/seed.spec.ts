import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
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

  it('creates an idempotent SUPERADMIN user with a working password', async () => {
    const previousEmail = process.env.SUPERADMIN_EMAIL;
    const previousPassword = process.env.SUPERADMIN_PASSWORD;
    process.env.SUPERADMIN_EMAIL = 'admin-seed@cofi.test';
    process.env.SUPERADMIN_PASSWORD = 'seed-password-123';

    try {
      const first = await seedDatabase(prisma);
      const second = await seedDatabase(prisma);

      expect(first.superAdminEmail).toBe('admin-seed@cofi.test');
      expect(second.superAdminEmail).toBe('admin-seed@cofi.test');

      const admins = await prisma.user.findMany({
        where: { role: 'SUPERADMIN' },
      });

      expect(admins).toHaveLength(1);
      expect(admins[0].isActive).toBe(true);

      const credential = await prisma.account.findUniqueOrThrow({
        where: {
          providerId_accountId: {
            providerId: 'credential',
            accountId: admins[0].id,
          },
        },
      });
      expect(
        await bcrypt.compare('seed-password-123', credential.password!),
      ).toBe(true);
    } finally {
      if (previousEmail === undefined) {
        delete process.env.SUPERADMIN_EMAIL;
      } else {
        process.env.SUPERADMIN_EMAIL = previousEmail;
      }
      if (previousPassword === undefined) {
        delete process.env.SUPERADMIN_PASSWORD;
      } else {
        process.env.SUPERADMIN_PASSWORD = previousPassword;
      }
    }
  });

  it('creates an idempotent merchant OWNER whose panel access resolves', async () => {
    const previous = {
      OWNER_EMAIL: process.env.OWNER_EMAIL,
      OWNER_PASSWORD: process.env.OWNER_PASSWORD,
      OWNER_CAFE_SLUG: process.env.OWNER_CAFE_SLUG,
    };
    process.env.OWNER_EMAIL = 'dueno-seed@cofi.test';
    process.env.OWNER_PASSWORD = 'owner-password-123';
    process.env.OWNER_CAFE_SLUG = 'perfecto-coffee-lounge';

    try {
      const first = await seedDatabase(prisma);
      const second = await seedDatabase(prisma);

      expect(first.merchantOwner).toEqual({
        email: 'dueno-seed@cofi.test',
        coffeeShopSlug: 'perfecto-coffee-lounge',
      });
      expect(second.merchantOwner).toEqual(first.merchantOwner);

      // La propiedad vive en MerchantStaff, no en User.role: el enum Role sólo
      // tiene USER y SUPERADMIN.
      const owner = await prisma.user.findUniqueOrThrow({
        where: { email: 'dueno-seed@cofi.test' },
        include: { merchantStaff: true },
      });
      expect(owner.role).toBe('USER');
      expect(owner.merchantStaff).toHaveLength(1);
      expect(owner.merchantStaff[0].role).toBe('OWNER');

      const shop = await prisma.coffeeShop.findUniqueOrThrow({
        where: { slug: 'perfecto-coffee-lounge' },
        select: { id: true },
      });
      expect(owner.merchantStaff[0].coffeeShopId).toBe(shop.id);

      // Una segunda corrida no duplica la pertenencia de este dueño. Se cuenta
      // por usuario: la base es compartida y otras corridas pueden dejar filas.
      expect(
        await prisma.merchantStaff.count({ where: { userId: owner.id } }),
      ).toBe(1);

      const credential = await prisma.account.findUniqueOrThrow({
        where: {
          providerId_accountId: {
            providerId: 'credential',
            accountId: owner.id,
          },
        },
      });
      expect(
        await bcrypt.compare('owner-password-123', credential.password!),
      ).toBe(true);

      // Reejecutar con otra contraseña no rota la credencial existente.
      process.env.OWNER_PASSWORD = 'otra-password-456';
      await seedDatabase(prisma);
      const sameCredential = await prisma.account.findUniqueOrThrow({
        where: {
          providerId_accountId: {
            providerId: 'credential',
            accountId: owner.id,
          },
        },
      });
      expect(
        await bcrypt.compare('owner-password-123', sameCredential.password!),
      ).toBe(true);
    } finally {
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }
    }
  });

  it('creates no owner at all outside development and test without a password', async () => {
    const previous = {
      NODE_ENV: process.env.NODE_ENV,
      OWNER_EMAIL: process.env.OWNER_EMAIL,
      OWNER_PASSWORD: process.env.OWNER_PASSWORD,
      OWNER_CAFE_SLUG: process.env.OWNER_CAFE_SLUG,
    };
    process.env.NODE_ENV = 'staging';
    process.env.OWNER_EMAIL = 'dueno-staging@cofi.test';
    delete process.env.OWNER_PASSWORD;
    process.env.OWNER_CAFE_SLUG = 'perfecto-coffee-lounge';

    try {
      const summary = await seedDatabase(prisma);

      expect(summary.merchantOwner).toBeNull();
      expect(
        await prisma.user.count({
          where: { email: 'dueno-staging@cofi.test' },
        }),
      ).toBe(0);
    } finally {
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }
    }
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
