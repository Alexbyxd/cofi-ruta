import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { DomainException } from '../../src/common/errors/domain.exception';
import { MerchantsService } from '../../src/merchants/merchants.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createTestPrisma, truncateAll, uniqueSuffix } from './helpers';

interface DomainErrorBody {
  statusCode: number;
  code: string;
  message: string;
}

async function errorOf(promise: Promise<unknown>): Promise<DomainException> {
  try {
    await promise;
  } catch (error) {
    expect(error).toBeInstanceOf(DomainException);
    return error as DomainException;
  }

  throw new Error('se esperaba un error de dominio');
}

function bodyOf(error: DomainException): DomainErrorBody {
  return error.getResponse() as DomainErrorBody;
}

/**
 * Barrera de partes: cada `await arrival()` espera a que las N transacciones
 * hayan entrado. Se coloca como primera sentencia del callback, antes de
 * cualquier lock, así nunca puede producir un abrazo mortal con la corrección:
 * un lock tomado adentro impediría que el otro llegue y la prueba colgaría en
 * lugar de medir la carrera.
 */
function createBarrier(parties: number): () => Promise<void> {
  let arrived = 0;
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });

  return async () => {
    arrived += 1;

    if (arrived >= parties) {
      release();
    }

    await gate;
  };
}

describe('Personal del comercio (S2)', () => {
  let prisma: PrismaClient;
  let pool: Pool;
  let service: MerchantsService;

  beforeAll(() => {
    const test = createTestPrisma();
    prisma = test.prisma;
    pool = test.pool;
    service = new MerchantsService(prisma as unknown as PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  beforeEach(async () => {
    await truncateAll(prisma);
  });

  async function createShop(): Promise<{ id: string; name: string }> {
    const suffix = uniqueSuffix();

    return prisma.coffeeShop.create({
      data: {
        name: `Café ${suffix}`,
        slug: `cafe-${suffix}`,
        address: 'Calle de prueba 123',
        latitude: '-17.960000',
        longitude: '-67.110000',
        status: 'ACTIVE',
      },
      select: { id: true, name: true },
    });
  }

  async function createUser(name = 'Personal') {
    const suffix = uniqueSuffix();

    return prisma.user.create({
      data: {
        email: `${name.toLowerCase()}-${suffix}@cofi.test`,
        fullName: `${name} de prueba`,
      },
    });
  }

  async function createStaff(
    coffeeShopId: string,
    userId: string,
    role: 'OWNER' | 'MANAGER' | 'STAFF',
  ) {
    return prisma.merchantStaff.create({
      data: { coffeeShopId, userId, role },
    });
  }

  async function ownerCountOf(coffeeShopId: string): Promise<number> {
    return prisma.merchantStaff.count({
      where: { coffeeShopId, role: 'OWNER' },
    });
  }

  it('lists the staff of one coffee shop with the account data', async () => {
    const shop = await createShop();
    const otherShop = await createShop();
    const owner = await createUser('Owner');
    const barista = await createUser('Barista');
    const foreigner = await createUser('Ajeno');

    await createStaff(shop.id, owner.id, 'OWNER');
    await createStaff(shop.id, barista.id, 'STAFF');
    await createStaff(otherShop.id, foreigner.id, 'OWNER');

    const staff = await service.listStaff(shop.id);

    expect(staff).toHaveLength(2);
    expect(staff.map((member) => member.user.email).sort()).toEqual(
      [owner.email, barista.email].sort(),
    );
    expect(
      staff.find((member) => member.user.email === owner.email)?.role,
    ).toBe('OWNER');
    expect(
      staff.find((member) => member.user.email === barista.email)?.role,
    ).toBe('STAFF');
  });

  it('adds a MANAGER membership by email', async () => {
    const shop = await createShop();
    const owner = await createUser('Owner');
    const manager = await createUser('Manager');
    await createStaff(shop.id, owner.id, 'OWNER');

    const created = await service.addStaff(shop.id, {
      email: manager.email,
      role: 'MANAGER',
    });

    expect(created.role).toBe('MANAGER');
    expect(created.user.email).toBe(manager.email);

    const rows = await prisma.merchantStaff.findMany({
      where: { coffeeShopId: shop.id },
    });
    expect(rows).toHaveLength(2);
    expect(rows.some((row) => row.userId === manager.id)).toBe(true);
  });

  it('never assigns OWNER through the invite route', async () => {
    const shop = await createShop();
    const owner = await createUser('Owner');
    const candidate = await createUser('Candidato');
    await createStaff(shop.id, owner.id, 'OWNER');

    const error = await errorOf(
      service.addStaff(shop.id, { email: candidate.email, role: 'OWNER' }),
    );

    expect(error.getStatus()).toBe(400);
    expect(bodyOf(error).code).toBe('MERCHANT_ROLE_NOT_ASSIGNABLE');

    const rows = await prisma.merchantStaff.findMany({
      where: { coffeeShopId: shop.id },
    });
    expect(rows).toHaveLength(1);
    await expect(ownerCountOf(shop.id)).resolves.toBe(1);
  });

  it('never promotes to OWNER through the role update', async () => {
    const shop = await createShop();
    const owner = await createUser('Owner');
    const manager = await createUser('Manager');
    await createStaff(shop.id, owner.id, 'OWNER');
    await createStaff(shop.id, manager.id, 'MANAGER');

    const error = await errorOf(
      service.updateStaffRole(shop.id, manager.id, { role: 'OWNER' }),
    );

    expect(error.getStatus()).toBe(400);
    expect(bodyOf(error).code).toBe('MERCHANT_ROLE_NOT_ASSIGNABLE');

    const row = await prisma.merchantStaff.findUnique({
      where: {
        userId_coffeeShopId: { userId: manager.id, coffeeShopId: shop.id },
      },
    });
    expect(row?.role).toBe('MANAGER');
    await expect(ownerCountOf(shop.id)).resolves.toBe(1);
  });

  it('refuses to demote the last real owner', async () => {
    const shop = await createShop();
    const owner = await createUser('Único dueño');
    const staff = await createUser('Empleado');
    await createStaff(shop.id, owner.id, 'OWNER');
    await createStaff(shop.id, staff.id, 'STAFF');

    const error = await errorOf(
      service.updateStaffRole(shop.id, owner.id, { role: 'STAFF' }),
    );

    expect(error.getStatus()).toBe(409);
    expect(bodyOf(error).code).toBe('LAST_OWNER_PROTECTED');

    const row = await prisma.merchantStaff.findUnique({
      where: {
        userId_coffeeShopId: { userId: owner.id, coffeeShopId: shop.id },
      },
    });
    expect(row?.role).toBe('OWNER');
    await expect(ownerCountOf(shop.id)).resolves.toBe(1);
  });

  it('refuses to remove the last real owner', async () => {
    const shop = await createShop();
    const owner = await createUser('Único dueño');
    const manager = await createUser('Manager');
    await createStaff(shop.id, owner.id, 'OWNER');
    await createStaff(shop.id, manager.id, 'MANAGER');

    const error = await errorOf(service.removeStaff(shop.id, owner.id));

    expect(error.getStatus()).toBe(409);
    expect(bodyOf(error).code).toBe('LAST_OWNER_PROTECTED');

    const rows = await prisma.merchantStaff.findMany({
      where: { coffeeShopId: shop.id },
    });
    expect(rows).toHaveLength(2);
    await expect(ownerCountOf(shop.id)).resolves.toBe(1);
  });

  it('demotes an owner while another owner remains', async () => {
    const shop = await createShop();
    const firstOwner = await createUser('Primer dueño');
    const secondOwner = await createUser('Segundo dueño');
    await createStaff(shop.id, firstOwner.id, 'OWNER');
    await createStaff(shop.id, secondOwner.id, 'OWNER');

    const demoted = await service.updateStaffRole(shop.id, firstOwner.id, {
      role: 'MANAGER',
    });

    expect(demoted.role).toBe('MANAGER');
    await expect(ownerCountOf(shop.id)).resolves.toBe(1);

    const remaining = await prisma.merchantStaff.findUnique({
      where: {
        userId_coffeeShopId: { userId: secondOwner.id, coffeeShopId: shop.id },
      },
    });
    expect(remaining?.role).toBe('OWNER');
  });

  it('removes an owner while another owner remains', async () => {
    const shop = await createShop();
    const firstOwner = await createUser('Primer dueño');
    const secondOwner = await createUser('Segundo dueño');
    await createStaff(shop.id, firstOwner.id, 'OWNER');
    await createStaff(shop.id, secondOwner.id, 'OWNER');

    const removed = await service.removeStaff(shop.id, firstOwner.id);

    expect(removed.userId).toBe(firstOwner.id);
    await expect(ownerCountOf(shop.id)).resolves.toBe(1);

    const rows = await prisma.merchantStaff.findMany({
      where: { coffeeShopId: shop.id },
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].userId).toBe(secondOwner.id);
  });

  it('refuses a membership that already exists', async () => {
    const shop = await createShop();
    const owner = await createUser('Owner');
    const barista = await createUser('Barista');
    await createStaff(shop.id, owner.id, 'OWNER');
    await createStaff(shop.id, barista.id, 'STAFF');

    const error = await errorOf(
      service.addStaff(shop.id, { email: barista.email, role: 'MANAGER' }),
    );

    expect(error.getStatus()).toBe(409);
    expect(bodyOf(error).code).toBe('MERCHANT_STAFF_ALREADY_EXISTS');

    const row = await prisma.merchantStaff.findUnique({
      where: {
        userId_coffeeShopId: { userId: barista.id, coffeeShopId: shop.id },
      },
    });
    expect(row?.role).toBe('STAFF');
  });

  it('refuses an email without a registered user', async () => {
    const shop = await createShop();
    const owner = await createUser('Owner');
    await createStaff(shop.id, owner.id, 'OWNER');

    const error = await errorOf(
      service.addStaff(shop.id, {
        email: `fantasma-${uniqueSuffix()}@cofi.test`,
        role: 'STAFF',
      }),
    );

    expect(error.getStatus()).toBe(404);
    expect(bodyOf(error).code).toBe('USER_NOT_FOUND');

    const rows = await prisma.merchantStaff.findMany({
      where: { coffeeShopId: shop.id },
    });
    expect(rows).toHaveLength(1);
  });

  it('refuses a role change for a user outside the merchant staff', async () => {
    const shop = await createShop();
    const owner = await createUser('Owner');
    const stranger = await createUser('Ajeno');
    await createStaff(shop.id, owner.id, 'OWNER');

    const error = await errorOf(
      service.updateStaffRole(shop.id, stranger.id, { role: 'STAFF' }),
    );

    expect(error.getStatus()).toBe(404);
    expect(bodyOf(error).code).toBe('MERCHANT_STAFF_NOT_FOUND');

    const rows = await prisma.merchantStaff.findMany({
      where: { coffeeShopId: shop.id },
    });
    expect(rows).toHaveLength(1);
  });

  it('refuses to remove a user outside the merchant staff', async () => {
    const shop = await createShop();
    const owner = await createUser('Owner');
    const stranger = await createUser('Ajeno');
    await createStaff(shop.id, owner.id, 'OWNER');

    const error = await errorOf(service.removeStaff(shop.id, stranger.id));

    expect(error.getStatus()).toBe(404);
    expect(bodyOf(error).code).toBe('MERCHANT_STAFF_NOT_FOUND');
    await expect(ownerCountOf(shop.id)).resolves.toBe(1);

    const rows = await prisma.merchantStaff.findMany({
      where: { coffeeShopId: shop.id },
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].userId).toBe(owner.id);
  });

  it('answers 404 MERCHANT_NOT_FOUND on every route of an unknown shop', async () => {
    const shop = await createShop();
    const owner = await createUser('Owner');
    const candidate = await createUser('Candidato');
    await createStaff(shop.id, owner.id, 'OWNER');

    // Un id con formato válido y otro que no lo es: ninguno puede llegar a una
    // escritura ni a una respuesta 500 de la base.
    const unknownIds = [`fantasma-${uniqueSuffix()}`, 'no-es-un-id'];

    for (const coffeeShopId of unknownIds) {
      await expect(ownerCountOf(coffeeShopId)).resolves.toBe(0);

      const listError = await errorOf(service.listStaff(coffeeShopId));
      expect(listError.getStatus()).toBe(404);
      expect(bodyOf(listError).code).toBe('MERCHANT_NOT_FOUND');

      const addError = await errorOf(
        service.addStaff(coffeeShopId, {
          email: candidate.email,
          role: 'MANAGER',
        }),
      );
      expect(addError.getStatus()).toBe(404);
      expect(bodyOf(addError).code).toBe('MERCHANT_NOT_FOUND');

      const patchError = await errorOf(
        service.updateStaffRole(coffeeShopId, owner.id, { role: 'MANAGER' }),
      );
      expect(patchError.getStatus()).toBe(404);
      expect(bodyOf(patchError).code).toBe('MERCHANT_NOT_FOUND');

      const deleteError = await errorOf(
        service.removeStaff(coffeeShopId, owner.id),
      );
      expect(deleteError.getStatus()).toBe(404);
      expect(bodyOf(deleteError).code).toBe('MERCHANT_NOT_FOUND');
    }

    // Nada de eso tocó el personal del comercio real ni creó filas huérfanas.
    const rows = await prisma.merchantStaff.findMany({
      where: { coffeeShopId: shop.id },
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].userId).toBe(owner.id);
    await expect(ownerCountOf(shop.id)).resolves.toBe(1);
  });

  it('serialises two concurrent owner demotions', async () => {
    // Write skew clásico: sin lock, las dos transacciones cuentan 2 owners, cada
    // una escribe su propia fila y el comercio queda sin dueño.
    const iterations = 20;

    for (let iteration = 0; iteration < iterations; iteration += 1) {
      const shop = await createShop();
      const firstOwner = await createUser('Primer dueño');
      const secondOwner = await createUser('Segundo dueño');
      await createStaff(shop.id, firstOwner.id, 'OWNER');
      await createStaff(shop.id, secondOwner.id, 'OWNER');

      const arrival = createBarrier(2);
      const originalTransaction = prisma.$transaction.bind(prisma);
      const gated = Object.create(prisma) as PrismaClient;
      gated.$transaction = ((callback: unknown, options: unknown) =>
        originalTransaction(async (tx: unknown) => {
          await arrival();
          return (callback as (client: unknown) => unknown)(tx);
        }, options)) as typeof prisma.$transaction;

      const gatedService = new MerchantsService(
        gated as unknown as PrismaService,
      );

      const results = await Promise.allSettled([
        gatedService.updateStaffRole(shop.id, firstOwner.id, {
          role: 'MANAGER',
        }),
        gatedService.updateStaffRole(shop.id, secondOwner.id, {
          role: 'MANAGER',
        }),
      ]);

      const rejected = results.filter((result) => result.status === 'rejected');
      const fulfilled = results.filter(
        (result) => result.status === 'fulfilled',
      );

      expect({ iteration, fulfilled: fulfilled.length }).toEqual({
        iteration,
        fulfilled: 1,
      });
      expect(rejected).toHaveLength(1);

      const reason = rejected[0].reason;
      expect(reason).toBeInstanceOf(DomainException);
      expect(bodyOf(reason as DomainException).code).toBe(
        'LAST_OWNER_PROTECTED',
      );

      await expect(ownerCountOf(shop.id)).resolves.toBe(1);
    }
  });

  it('serialises a demotion racing against a removal', async () => {
    // Mismo write skew que arriba, pero mezclando PATCH y DELETE: las dos rutas
    // tienen que pasar por el mismo lock.
    const shop = await createShop();
    const firstOwner = await createUser('Primer dueño');
    const secondOwner = await createUser('Segundo dueño');
    await createStaff(shop.id, firstOwner.id, 'OWNER');
    await createStaff(shop.id, secondOwner.id, 'OWNER');

    const arrival = createBarrier(2);
    const originalTransaction = prisma.$transaction.bind(prisma);
    const gated = Object.create(prisma) as PrismaClient;
    gated.$transaction = ((callback: unknown, options: unknown) =>
      originalTransaction(async (tx: unknown) => {
        await arrival();
        return (callback as (client: unknown) => unknown)(tx);
      }, options)) as typeof prisma.$transaction;

    const gatedService = new MerchantsService(
      gated as unknown as PrismaService,
    );

    const results = await Promise.allSettled([
      gatedService.updateStaffRole(shop.id, firstOwner.id, { role: 'MANAGER' }),
      gatedService.removeStaff(shop.id, secondOwner.id),
    ]);

    const rejected = results.filter((result) => result.status === 'rejected');
    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    expect(rejected).toHaveLength(1);

    const reason = rejected[0].reason;
    expect(reason).toBeInstanceOf(DomainException);
    expect(bodyOf(reason as DomainException).code).toBe('LAST_OWNER_PROTECTED');

    await expect(ownerCountOf(shop.id)).resolves.toBe(1);
  });
});
