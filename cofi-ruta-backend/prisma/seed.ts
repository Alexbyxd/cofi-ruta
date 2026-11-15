import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
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
  superAdminEmail: string | null;
  merchantOwner: { email: string; coffeeShopSlug: string } | null;
}

const CAFES_FILE = join(__dirname, 'seed-data', 'cafes.json');

const DEFAULT_SUPERADMIN_EMAIL = 'superadmin@cofirutas.bo';
const DEFAULT_DEV_SUPERADMIN_PASSWORD = 'CofiRutas2026!';

const DEFAULT_OWNER_EMAIL = 'owner@cofirutas.bo';
const DEFAULT_DEV_OWNER_PASSWORD = 'CofiRutas2026!';

// Better Auth is configured with bcrypt cost 12 (see src/auth/better-auth/config.ts).
const BCRYPT_ROUNDS = 12;

/**
 * Crea (o reafirma) el usuario global `SUPERADMIN` usado para probar los
 * flujos de administración. Es idempotente: reejecutar el seed no duplica.
 *
 * - `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` permiten configurarlo.
 * - En producción no se crea una contraseña conocida si no se configuró una.
 */
export async function seedSuperAdmin(
  prisma: PrismaClient,
): Promise<{ email: string } | null> {
  const email = (process.env.SUPERADMIN_EMAIL ?? DEFAULT_SUPERADMIN_EMAIL)
    .toLowerCase()
    .trim();

  const configuredPassword = process.env.SUPERADMIN_PASSWORD;
  if (!configuredPassword && process.env.NODE_ENV === 'production') {
    return null;
  }

  const password = configuredPassword ?? DEFAULT_DEV_SUPERADMIN_PASSWORD;
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'SUPERADMIN',
      isActive: true,
    },
    create: {
      email,
      fullName: 'Super Administrador CofiRutas',
      role: 'SUPERADMIN',
    },
    select: { id: true, email: true },
  });

  // Better Auth stores credential passwords on Account, not on User.
  await prisma.account.upsert({
    where: {
      providerId_accountId: { providerId: 'credential', accountId: user.id },
    },
    update: { password: passwordHash },
    create: {
      userId: user.id,
      providerId: 'credential',
      accountId: user.id,
      password: passwordHash,
    },
  });

  return { email: user.email };
}

/**
 * Crea (o reafirma) un dueño de cafetería, la tercera identidad del sistema.
 *
 * `User.role` sólo puede ser `USER` o `SUPERADMIN`; la propiedad vive en
 * `MerchantStaff.role = OWNER`. Sin esta fila el panel administrativo no puede
 * resolver a un dueño y lo trata como usuario normal.
 *
 * - `OWNER_EMAIL` / `OWNER_PASSWORD` configuran la credencial.
 * - `OWNER_CAFE_SLUG` elige la cafetería; por defecto, la primera del seed.
 * - En producción no se crea una contraseña conocida si no se configuró una.
 */
export async function seedMerchantOwner(
  prisma: PrismaClient,
  coffeeShopSlug: string | null,
): Promise<{ email: string; coffeeShopSlug: string } | null> {
  if (!coffeeShopSlug) {
    return null;
  }

  const configuredPassword = process.env.OWNER_PASSWORD;
  // La contraseña de desarrollo sólo se usa cuando el entorno la declara como
  // tal: un despliegue con NODE_ENV sin definir o distinto de development/test
  // no puede terminar con una credencial conocida.
  const allowsDevCredentials =
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
  if (!configuredPassword && !allowsDevCredentials) {
    return null;
  }

  const slug = (process.env.OWNER_CAFE_SLUG ?? coffeeShopSlug).trim();
  const shop = await prisma.coffeeShop.findUnique({
    where: { slug },
    select: { id: true, slug: true },
  });
  if (!shop) {
    // Saltar en silencio dejaría el panel sin dueño sin que nadie se entere.
    throw new Error(
      `seedMerchantOwner: la cafetería "${slug}" no existe. Corregí OWNER_CAFE_SLUG o sembrá el catálogo primero.`,
    );
  }

  const email = (process.env.OWNER_EMAIL ?? DEFAULT_OWNER_EMAIL)
    .toLowerCase()
    .trim();
  const password = configuredPassword ?? DEFAULT_DEV_OWNER_PASSWORD;

  // El rol de cuenta no se toca: un SUPERADMIN que también sea dueño no debe
  // perder su rol por correr el seed.
  const user = await prisma.user.upsert({
    where: { email },
    update: { isActive: true },
    create: {
      email,
      fullName: 'Dueño de Cafetería CofiRutas',
    },
    select: { id: true, email: true },
  });

  // La credencial existente no se toca: el seed afirma, no rota. Si
  // OWNER_EMAIL apunta a una cuenta real, reescribirle la contraseña sería un
  // secuestro de cuenta, no un seed.
  const accountWhere = {
    providerId_accountId: { providerId: 'credential', accountId: user.id },
  };
  const existingCredential = await prisma.account.findUnique({
    where: accountWhere,
    select: { id: true },
  });
  if (!existingCredential) {
    await prisma.account.create({
      data: {
        userId: user.id,
        providerId: 'credential',
        accountId: user.id,
        password: await bcrypt.hash(password, BCRYPT_ROUNDS),
      },
    });
  }

  await prisma.merchantStaff.upsert({
    where: {
      userId_coffeeShopId: { userId: user.id, coffeeShopId: shop.id },
    },
    update: { role: 'OWNER' },
    create: { userId: user.id, coffeeShopId: shop.id, role: 'OWNER' },
  });

  return { email: user.email, coffeeShopSlug: shop.slug };
}

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
  const superAdmin = await seedSuperAdmin(prisma);
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

  // El dueño necesita que su cafetería ya exista.
  const merchantOwner = await seedMerchantOwner(prisma, cafes[0]?.slug ?? null);

  return {
    categories: await prisma.category.count(),
    tags: await prisma.tag.count(),
    coffeeShops: await prisma.coffeeShop.count(),
    openingHours: await prisma.openingHours.count(),
    menuItems: await prisma.menuItem.count(),
    coffeeShopTags: await prisma.coffeeShopTag.count(),
    superAdminEmail: superAdmin?.email ?? null,
    merchantOwner,
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
    if (summary.superAdminEmail) {
      console.log(`SuperAdmin listo: ${summary.superAdminEmail}`);
    }
    if (summary.merchantOwner) {
      console.log(
        `Dueño listo: ${summary.merchantOwner.email} → ${summary.merchantOwner.coffeeShopSlug} (OWNER)`,
      );
    }
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
