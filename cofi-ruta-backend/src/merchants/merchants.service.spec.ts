import { DomainException } from '../common/errors/domain.exception';
import { PrismaService } from '../prisma/prisma.service';
import { MerchantsService } from './merchants.service';

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

/** Texto SQL recibido por `$queryRaw`, con `?` en lugar de los parámetros. */
function sqlOf(strings: unknown): string {
  return Array.isArray(strings) ? (strings as string[]).join('?') : '';
}

describe('MerchantsService (reglas de dominio)', () => {
  let calls: string[];
  let merchantStaff: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    count: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  let userFindUnique: jest.Mock;
  let shopFindUnique: jest.Mock;
  let queryRaw: jest.Mock;
  let statements: string[];
  let service: MerchantsService;

  function record(name: string) {
    calls.push(name);
  }

  beforeEach(() => {
    calls = [];
    statements = [];

    merchantStaff = {
      findMany: jest.fn(() => {
        record('findMany');
        return Promise.resolve([]);
      }),
      findUnique: jest.fn(() => {
        record('findUnique');
        return Promise.resolve(null);
      }),
      count: jest.fn(() => {
        record('count');
        return Promise.resolve(1);
      }),
      create: jest.fn((args: unknown) => {
        record('create');
        return Promise.resolve({ id: 'm-new', ...(args as object) });
      }),
      update: jest.fn(() => {
        record('update');
        return Promise.resolve({ id: 'm-owned' });
      }),
      delete: jest.fn(() => {
        record('delete');
        return Promise.resolve({ id: 'm-owned' });
      }),
    };

    userFindUnique = jest.fn(() => {
      record('user.findUnique');
      return Promise.resolve({ id: 'u-target' });
    });

    shopFindUnique = jest.fn(() => {
      record('coffeeShop.findUnique');
      return Promise.resolve({ id: 'shop-a' });
    });

    queryRaw = jest.fn((strings: unknown) => {
      record('lock');
      statements.push(sqlOf(strings));
      return Promise.resolve([{ id: 'shop-a' }]);
    });

    const client = {
      $queryRaw: queryRaw,
      merchantStaff,
      user: { findUnique: userFindUnique },
      coffeeShop: { findUnique: shopFindUnique },
    };

    const prisma = {
      ...client,
      $transaction: jest.fn((callback: (tx: unknown) => unknown) =>
        callback(client),
      ),
    };

    service = new MerchantsService(prisma as unknown as PrismaService);
  });

  it('locks the merchant row as the first statement of the transaction', async () => {
    merchantStaff.findUnique.mockImplementation(() => {
      record('findUnique');
      return Promise.resolve({
        id: 'm-target',
        role: 'MANAGER',
      });
    });

    await service.updateStaffRole('shop-a', 'u-target', { role: 'STAFF' });

    expect(calls[0]).toBe('lock');
    expect(calls.indexOf('lock')).toBeLessThan(calls.indexOf('findUnique'));
    expect(statements[0]).toContain('"CoffeeShop"');
    expect(statements[0]).toContain('FOR UPDATE');
    expect(queryRaw).toHaveBeenCalledTimes(1);
  });

  it('takes the same lock before removing a membership', async () => {
    merchantStaff.findUnique.mockImplementation(() => {
      record('findUnique');
      return Promise.resolve({ id: 'm-target', role: 'STAFF' });
    });

    await service.removeStaff('shop-a', 'u-target');

    expect(calls[0]).toBe('lock');
    expect(statements[0]).toContain('FOR UPDATE');
  });

  it('answers MERCHANT_NOT_FOUND when the lock finds no merchant', async () => {
    queryRaw.mockResolvedValue([]);

    const updateError = await errorOf(
      service.updateStaffRole('shop-x', 'u-target', { role: 'STAFF' }),
    );
    expect(updateError.getStatus()).toBe(404);
    expect(bodyOf(updateError).code).toBe('MERCHANT_NOT_FOUND');

    const removeError = await errorOf(
      service.removeStaff('shop-x', 'u-target'),
    );
    expect(removeError.getStatus()).toBe(404);
    expect(bodyOf(removeError).code).toBe('MERCHANT_NOT_FOUND');

    expect(merchantStaff.findUnique).not.toHaveBeenCalled();
    expect(merchantStaff.count).not.toHaveBeenCalled();
    expect(merchantStaff.update).not.toHaveBeenCalled();
    expect(merchantStaff.delete).not.toHaveBeenCalled();
  });

  it('answers MERCHANT_NOT_FOUND when adding staff to an unknown merchant', async () => {
    queryRaw.mockResolvedValue([]);

    const error = await errorOf(
      service.addStaff('shop-x', { email: 'ana@cofi.test', role: 'MANAGER' }),
    );

    expect(error.getStatus()).toBe(404);
    expect(bodyOf(error).code).toBe('MERCHANT_NOT_FOUND');
    expect(userFindUnique).not.toHaveBeenCalled();
    expect(merchantStaff.create).not.toHaveBeenCalled();
  });

  it('answers MERCHANT_NOT_FOUND when listing an unknown merchant', async () => {
    shopFindUnique.mockResolvedValue(null);

    const error = await errorOf(service.listStaff('shop-x'));

    expect(error.getStatus()).toBe(404);
    expect(bodyOf(error).code).toBe('MERCHANT_NOT_FOUND');
    expect(merchantStaff.findMany).not.toHaveBeenCalled();
  });

  it('rejects assigning the OWNER role when adding staff', async () => {
    const error = await errorOf(
      service.addStaff('shop-a', { email: 'ana@cofi.test', role: 'OWNER' }),
    );

    expect(error.getStatus()).toBe(400);
    expect(bodyOf(error).code).toBe('MERCHANT_ROLE_NOT_ASSIGNABLE');
    expect(merchantStaff.create).not.toHaveBeenCalled();
    expect(userFindUnique).not.toHaveBeenCalled();
  });

  it('rejects promoting to OWNER through the role update', async () => {
    const error = await errorOf(
      service.updateStaffRole('shop-a', 'u-target', { role: 'OWNER' }),
    );

    expect(error.getStatus()).toBe(400);
    expect(bodyOf(error).code).toBe('MERCHANT_ROLE_NOT_ASSIGNABLE');
    expect(merchantStaff.update).not.toHaveBeenCalled();
    expect(queryRaw).not.toHaveBeenCalled();
  });

  it('protects the last owner from being demoted', async () => {
    merchantStaff.findUnique.mockResolvedValue({
      id: 'm-owned',
      userId: 'u-owner',
      coffeeShopId: 'shop-a',
      role: 'OWNER',
    });
    merchantStaff.count.mockResolvedValue(1);

    const error = await errorOf(
      service.updateStaffRole('shop-a', 'u-owner', { role: 'MANAGER' }),
    );

    expect(error.getStatus()).toBe(409);
    expect(bodyOf(error).code).toBe('LAST_OWNER_PROTECTED');
    expect(merchantStaff.update).not.toHaveBeenCalled();
  });

  it('protects the last owner from being removed', async () => {
    merchantStaff.findUnique.mockResolvedValue({
      id: 'm-owned',
      userId: 'u-owner',
      coffeeShopId: 'shop-a',
      role: 'OWNER',
    });
    merchantStaff.count.mockResolvedValue(1);

    const error = await errorOf(service.removeStaff('shop-a', 'u-owner'));

    expect(error.getStatus()).toBe(409);
    expect(bodyOf(error).code).toBe('LAST_OWNER_PROTECTED');
    expect(merchantStaff.delete).not.toHaveBeenCalled();
  });

  it('still demotes an owner when the merchant keeps another owner', async () => {
    merchantStaff.findUnique.mockResolvedValue({
      id: 'm-owned',
      userId: 'u-owner',
      coffeeShopId: 'shop-a',
      role: 'OWNER',
    });
    merchantStaff.count.mockResolvedValue(2);

    await service.updateStaffRole('shop-a', 'u-owner', { role: 'STAFF' });

    expect(merchantStaff.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'm-owned' },
        data: { role: 'STAFF' },
      }),
    );
  });

  it('rejects a role update for a user outside the merchant staff', async () => {
    merchantStaff.findUnique.mockResolvedValue(null);

    const error = await errorOf(
      service.updateStaffRole('shop-a', 'u-stranger', { role: 'STAFF' }),
    );

    expect(error.getStatus()).toBe(404);
    expect(bodyOf(error).code).toBe('MERCHANT_STAFF_NOT_FOUND');
    expect(merchantStaff.update).not.toHaveBeenCalled();
  });

  it('rejects removing a user outside the merchant staff', async () => {
    merchantStaff.findUnique.mockResolvedValue(null);

    const error = await errorOf(service.removeStaff('shop-a', 'u-stranger'));

    expect(error.getStatus()).toBe(404);
    expect(bodyOf(error).code).toBe('MERCHANT_STAFF_NOT_FOUND');
    expect(merchantStaff.delete).not.toHaveBeenCalled();
  });
});
