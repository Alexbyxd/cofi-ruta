import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MerchantRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  MERCHANT_ROLES_KEY,
  MerchantRoles,
} from '../decorators/merchant-roles.decorator';
import { MerchantGuard } from './merchant.guard';

interface FakeRequest {
  user?: { id?: string; role?: string };
  params?: Record<string, string | undefined>;
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
  merchantStaff?: unknown;
}

function contextFor(request: FakeRequest): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: <T>() => request as T }),
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as ExecutionContext;
}

/** Ruta real: el decorador escribe la metadata y un Reflector real la lee. */
@MerchantRoles(MerchantRole.MANAGER)
class DecoratedMerchantRoute {}

/** Handler suelto: la autorización vive en la clase, no en el handler. */
function decoratedHandler() {}

/** Varios roles declarados: el mínimo es el de mayor rango. */
@MerchantRoles(MerchantRole.STAFF, MerchantRole.OWNER)
class MixedMerchantRoute {}

function mixedHandler() {}

describe('MerchantGuard', () => {
  let reflector: { getAllAndOverride: jest.Mock };
  let findUnique: jest.Mock;
  let guard: MerchantGuard;

  function requireRoles(...roles: MerchantRole[]) {
    reflector.getAllAndOverride.mockReturnValue(roles);
  }

  function membershipOf(role: string, coffeeShopId = 'shop-a') {
    findUnique.mockResolvedValue({
      id: 'm1',
      role,
      coffeeShopId,
    });
  }

  async function rejectionOf(promise: Promise<boolean>): Promise<unknown> {
    return promise.then(
      () => null,
      (reason: unknown) => reason,
    );
  }

  async function expectForbidden(promise: Promise<boolean>) {
    const error = await rejectionOf(promise);
    expect(error).toBeInstanceOf(ForbiddenException);
    expect((error as ForbiddenException).getStatus()).toBe(403);
  }

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    findUnique = jest.fn();
    guard = new MerchantGuard(
      reflector as unknown as Reflector,
      { merchantStaff: { findUnique } } as unknown as PrismaService,
    );
  });

  it('lets a route without merchant metadata through', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    await expect(
      guard.canActivate(
        contextFor({ user: { id: 'u1' }, params: { coffeeShopId: 'shop-a' } }),
      ),
    ).resolves.toBe(true);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('admits a SUPERADMIN without any merchant membership', async () => {
    requireRoles(MerchantRole.OWNER);

    await expect(
      guard.canActivate(
        contextFor({
          user: { id: 'u1', role: 'SUPERADMIN' },
          params: { coffeeShopId: 'shop-a' },
        }),
      ),
    ).resolves.toBe(true);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('rejects a request without a session user', async () => {
    requireRoles(MerchantRole.STAFF);

    await expectForbidden(
      guard.canActivate(contextFor({ params: { coffeeShopId: 'shop-a' } })),
    );
    expect(findUnique).not.toHaveBeenCalled();
  });

  it.each<[MerchantRole, MerchantRole, boolean]>([
    [MerchantRole.OWNER, MerchantRole.OWNER, true],
    [MerchantRole.MANAGER, MerchantRole.MANAGER, true],
    [MerchantRole.STAFF, MerchantRole.STAFF, true],
    [MerchantRole.OWNER, MerchantRole.STAFF, true],
    [MerchantRole.MANAGER, MerchantRole.STAFF, true],
    [MerchantRole.STAFF, MerchantRole.MANAGER, false],
    [MerchantRole.STAFF, MerchantRole.OWNER, false],
    [MerchantRole.MANAGER, MerchantRole.OWNER, false],
  ])(
    'applies the hierarchy: %s membership against a %s minimum -> %s',
    async (role, minimum, allowed) => {
      requireRoles(minimum);
      membershipOf(role);

      const result = await rejectionOf(
        guard
          .canActivate(
            contextFor({
              user: { id: 'u1', role: 'USER' },
              params: { coffeeShopId: 'shop-a' },
            }),
          )
          .then(() => true),
      );

      if (allowed) {
        expect(result).toBeNull();
      } else {
        expect(result).toBeInstanceOf(ForbiddenException);
      }
    },
  );

  it('resolves the membership of the shop named by the route params', async () => {
    requireRoles(MerchantRole.STAFF);
    membershipOf('STAFF');

    const context = contextFor({
      user: { id: 'u1', role: 'USER' },
      params: { coffeeShopId: 'shop-a' },
    });
    const request = context.switchToHttp().getRequest<FakeRequest>();

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(findUnique).toHaveBeenCalledWith({
      where: {
        userId_coffeeShopId: { userId: 'u1', coffeeShopId: 'shop-a' },
      },
    });
    expect(request.merchantStaff).toEqual({
      id: 'm1',
      role: 'STAFF',
      coffeeShopId: 'shop-a',
    });
  });

  it('rejects the OWNER of another merchant', async () => {
    requireRoles(MerchantRole.OWNER);
    findUnique.mockImplementation(
      (args: { where: { userId_coffeeShopId: { coffeeShopId: string } } }) =>
        Promise.resolve(
          args.where.userId_coffeeShopId.coffeeShopId === 'shop-a'
            ? { id: 'm1', role: 'OWNER', coffeeShopId: 'shop-a' }
            : null,
        ),
    );

    await expectForbidden(
      guard.canActivate(
        contextFor({
          user: { id: 'u1', role: 'USER' },
          params: { coffeeShopId: 'shop-b' },
        }),
      ),
    );
    expect(findUnique).toHaveBeenCalledWith({
      where: {
        userId_coffeeShopId: { userId: 'u1', coffeeShopId: 'shop-b' },
      },
    });
  });

  it('rejects a user without membership in that merchant', async () => {
    requireRoles(MerchantRole.STAFF);
    findUnique.mockResolvedValue(null);

    await expectForbidden(
      guard.canActivate(
        contextFor({
          user: { id: 'u1', role: 'USER' },
          params: { coffeeShopId: 'shop-a' },
        }),
      ),
    );
  });

  it('ranks a role outside the enum at 0 and grants nothing', async () => {
    requireRoles(MerchantRole.STAFF);
    membershipOf('SUPERVISOR');

    await expectForbidden(
      guard.canActivate(
        contextFor({
          user: { id: 'u1', role: 'USER' },
          params: { coffeeShopId: 'shop-a' },
        }),
      ),
    );
  });

  it.each(['toString', 'constructor', '__proto__'])(
    'ranks the prototype key %s coming from the database at 0',
    async (role) => {
      requireRoles(MerchantRole.STAFF);
      membershipOf(role);

      await expectForbidden(
        guard.canActivate(
          contextFor({
            user: { id: 'u1', role: 'USER' },
            params: { coffeeShopId: 'shop-a' },
          }),
        ),
      );
    },
  );

  it('ignores a coffeeShopId coming from the body', async () => {
    requireRoles(MerchantRole.STAFF);
    membershipOf('STAFF', 'shop-a');

    const context = contextFor({
      user: { id: 'u1', role: 'USER' },
      params: { coffeeShopId: 'shop-a' },
      body: { coffeeShopId: 'shop-b' },
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(findUnique).toHaveBeenCalledWith({
      where: {
        userId_coffeeShopId: { userId: 'u1', coffeeShopId: 'shop-a' },
      },
    });
  });

  it('ignores a coffeeShopId coming from the query string', async () => {
    requireRoles(MerchantRole.STAFF);
    membershipOf('STAFF', 'shop-a');

    const context = contextFor({
      user: { id: 'u1', role: 'USER' },
      params: { coffeeShopId: 'shop-a' },
      query: { coffeeShopId: 'shop-b' },
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(findUnique).toHaveBeenCalledWith({
      where: {
        userId_coffeeShopId: { userId: 'u1', coffeeShopId: 'shop-a' },
      },
    });
  });

  it('rejects a foreign membership named only in the body and the query', async () => {
    requireRoles(MerchantRole.STAFF);
    findUnique.mockImplementation(
      (args: { where: { userId_coffeeShopId: { coffeeShopId: string } } }) =>
        Promise.resolve(
          args.where.userId_coffeeShopId.coffeeShopId === 'shop-b'
            ? { id: 'm-b', role: 'OWNER', coffeeShopId: 'shop-b' }
            : null,
        ),
    );

    const context = contextFor({
      user: { id: 'u1', role: 'USER' },
      params: { coffeeShopId: 'shop-a' },
      body: { coffeeShopId: 'shop-b' },
      query: { coffeeShopId: 'shop-b' },
    });
    const request = context.switchToHttp().getRequest<FakeRequest>();

    await expectForbidden(guard.canActivate(context));
    expect(findUnique).toHaveBeenCalledTimes(1);
    expect(findUnique).toHaveBeenCalledWith({
      where: {
        userId_coffeeShopId: { userId: 'u1', coffeeShopId: 'shop-a' },
      },
    });
    expect(request.merchantStaff).toBeUndefined();
  });

  it('treats an empty route coffeeShopId as no id at all', async () => {
    requireRoles(MerchantRole.STAFF);
    membershipOf('OWNER');

    await expectForbidden(
      guard.canActivate(
        contextFor({
          user: { id: 'u1', role: 'USER' },
          params: { coffeeShopId: '' },
        }),
      ),
    );
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('does not resolve a membership when the route carries no coffeeShopId', async () => {
    requireRoles(MerchantRole.STAFF);
    membershipOf('OWNER');

    await expectForbidden(
      guard.canActivate(
        contextFor({
          user: { id: 'u1', role: 'USER' },
          params: {},
          body: { coffeeShopId: 'shop-b' },
          query: { coffeeShopId: 'shop-b' },
        }),
      ),
    );
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('reads the minimum role through the real decorator metadata', async () => {
    // Sin stub: si el guard leyera otra clave de metadata, este test falla.
    const realGuard = new MerchantGuard(new Reflector(), {
      merchantStaff: { findUnique },
    } as unknown as PrismaService);
    membershipOf('MANAGER');

    const context = {
      switchToHttp: () => ({
        getRequest: <T>() =>
          ({
            user: { id: 'u1', role: 'USER' },
            params: { coffeeShopId: 'shop-a' },
          }) as T,
      }),
      getHandler: () => decoratedHandler,
      getClass: () => DecoratedMerchantRoute,
    } as unknown as ExecutionContext;

    await expect(realGuard.canActivate(context)).resolves.toBe(true);
    expect(MERCHANT_ROLES_KEY).toBe('merchantRoles');
  });

  it('rejects a role below the declared minimum through the real metadata', async () => {
    const realGuard = new MerchantGuard(new Reflector(), {
      merchantStaff: { findUnique },
    } as unknown as PrismaService);
    membershipOf('STAFF');

    const context = {
      switchToHttp: () => ({
        getRequest: <T>() =>
          ({
            user: { id: 'u1', role: 'USER' },
            params: { coffeeShopId: 'shop-a' },
          }) as T,
      }),
      getHandler: () => decoratedHandler,
      getClass: () => DecoratedMerchantRoute,
    } as unknown as ExecutionContext;

    await expectForbidden(realGuard.canActivate(context));
  });

  it('uses the highest declared role as the minimum', async () => {
    const realGuard = new MerchantGuard(new Reflector(), {
      merchantStaff: { findUnique },
    } as unknown as PrismaService);
    membershipOf('MANAGER');

    const context = {
      switchToHttp: () => ({
        getRequest: <T>() =>
          ({
            user: { id: 'u1', role: 'USER' },
            params: { coffeeShopId: 'shop-a' },
          }) as T,
      }),
      getHandler: () => mixedHandler,
      getClass: () => MixedMerchantRoute,
    } as unknown as ExecutionContext;

    await expectForbidden(realGuard.canActivate(context));
  });
});
