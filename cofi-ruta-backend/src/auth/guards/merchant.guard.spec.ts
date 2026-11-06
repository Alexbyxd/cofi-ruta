import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MerchantRole, Role } from '@prisma/client';
import { DomainException } from '../../common/errors/domain.exception';
import { PrismaService } from '../../prisma/prisma.service';
import { MerchantGuard } from './merchant.guard';

function contextFor(
  params: Record<string, string>,
  user?: { id?: string; role?: string },
  body: Record<string, unknown> = {},
): ExecutionContext {
  const request = { params, user, body, merchantStaff: undefined };
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

function codeOf(error: unknown): unknown {
  return ((error as DomainException).getResponse() as { code?: string }).code;
}

describe('MerchantGuard', () => {
  let reflector: { getAllAndOverride: jest.Mock };
  let prisma: { merchantStaff: { findUnique: jest.Mock } };
  let guard: MerchantGuard;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    prisma = { merchantStaff: { findUnique: jest.fn() } };
    guard = new MerchantGuard(
      reflector as unknown as Reflector,
      prisma as unknown as PrismaService,
    );
  });

  it('allows requests without merchant metadata', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    await expect(
      guard.canActivate(contextFor({ id: 'shop-1' }, { id: 'u1' })),
    ).resolves.toBe(true);
    expect(prisma.merchantStaff.findUnique).not.toHaveBeenCalled();
  });

  it('rejects anonymous requests', async () => {
    reflector.getAllAndOverride.mockReturnValue([MerchantRole.STAFF]);

    await expect(
      guard.canActivate(contextFor({ id: 'shop-1' }, undefined)),
    ).rejects.toMatchObject({ code: 'MERCHANT_ACCESS_DENIED' });
  });

  it('resolves the coffeeShopId only from route params', async () => {
    reflector.getAllAndOverride.mockReturnValue([MerchantRole.STAFF]);
    prisma.merchantStaff.findUnique.mockResolvedValue({ role: 'STAFF' });

    const context = contextFor(
      { id: 'shop-route' },
      { id: 'u1' },
      { coffeeShopId: 'shop-body' },
    );

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(prisma.merchantStaff.findUnique).toHaveBeenCalledWith({
      where: {
        userId_coffeeShopId: { userId: 'u1', coffeeShopId: 'shop-route' },
      },
    });
  });

  it.each([
    ['STAFF', MerchantRole.STAFF, true],
    ['MANAGER', MerchantRole.STAFF, true],
    ['OWNER', MerchantRole.STAFF, true],
    ['STAFF', MerchantRole.MANAGER, false],
    ['MANAGER', MerchantRole.MANAGER, true],
    ['OWNER', MerchantRole.MANAGER, true],
    ['MANAGER', MerchantRole.OWNER, false],
    ['OWNER', MerchantRole.OWNER, true],
  ])(
    'applies the hierarchy: %s against required %s -> %s',
    async (role, required, allowed) => {
      reflector.getAllAndOverride.mockReturnValue([required]);
      prisma.merchantStaff.findUnique.mockResolvedValue({ role });

      const result = await guard
        .canActivate(contextFor({ id: 'shop-1' }, { id: 'u1' }))
        .then(() => true)
        .catch((error: unknown) => error);

      if (allowed) {
        expect(result).toBe(true);
      } else {
        expect(codeOf(result)).toBe('MERCHANT_ACCESS_DENIED');
      }
    },
  );

  it('rejects when the user is not staff of the coffee shop', async () => {
    reflector.getAllAndOverride.mockReturnValue([MerchantRole.STAFF]);
    prisma.merchantStaff.findUnique.mockResolvedValue(null);

    await expect(
      guard.canActivate(contextFor({ id: 'shop-1' }, { id: 'u1' })),
    ).rejects.toMatchObject({ code: 'MERCHANT_ACCESS_DENIED' });
  });

  it('rejects when the route has no coffeeShopId', async () => {
    reflector.getAllAndOverride.mockReturnValue([MerchantRole.STAFF]);

    await expect(
      guard.canActivate(contextFor({}, { id: 'u1' })),
    ).rejects.toMatchObject({ code: 'MERCHANT_ACCESS_DENIED' });
  });

  it('ignores the global SUPERADMIN role without a MerchantStaff row', async () => {
    reflector.getAllAndOverride.mockReturnValue([MerchantRole.STAFF]);
    prisma.merchantStaff.findUnique.mockResolvedValue(null);

    await expect(
      guard.canActivate(
        contextFor({ id: 'shop-1' }, { id: 'u1', role: Role.SUPERADMIN }),
      ),
    ).rejects.toMatchObject({ code: 'MERCHANT_ACCESS_DENIED' });
  });
});
