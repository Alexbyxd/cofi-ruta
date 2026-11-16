import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MerchantRole } from '@prisma/client';
import { MERCHANT_ROLES_KEY } from '../auth/decorators/merchant-roles.decorator';
import { MerchantGuard } from '../auth/guards/merchant.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { PrismaService } from '../prisma/prisma.service';
import { createStaffSchema, updateStaffSchema } from './dto/merchants.dto';
import { MerchantsController } from './merchants.controller';
import { MerchantsService } from './merchants.service';

interface FakeRequest {
  user?: { id?: string; role?: string };
  params?: Record<string, string | undefined>;
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
  merchantStaff?: unknown;
}

type RouteName = 'listStaff' | 'addStaff' | 'updateStaff' | 'removeStaff';

const ROUTES: RouteName[] = [
  'listStaff',
  'addStaff',
  'updateStaff',
  'removeStaff',
];

function handlerOf(route: RouteName): (...args: unknown[]) => unknown {
  // Se lee el descriptor en vez de la referencia para no atar la función
  // separada a su objeto: acá sólo interesa la metadata del decorador.
  const descriptor = Object.getOwnPropertyDescriptor(
    MerchantsController.prototype,
    route,
  );

  return descriptor?.value as (...args: unknown[]) => unknown;
}

function contextFor(route: RouteName, request: FakeRequest): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: <T>() => request as T }),
    getHandler: () => handlerOf(route),
    getClass: () => MerchantsController,
  } as unknown as ExecutionContext;
}

const STAFF_PARAMS = {
  coffeeShopId: 'shop-a',
  userId: 'u-target',
};

interface Actor {
  label: string;
  user?: { id: string; role: string };
  membershipFor?: 'shop-a' | 'shop-b' | null;
  membershipRole?: string;
  allowed: boolean;
}

/**
 * Matriz de roles de S2: `SUPERADMIN` pasa siempre, el `OWNER` del mismo
 * comercio pasa, y ningún rol de comercio inferior (ni el `OWNER` de otro
 * comercio) administra el personal de esta cafetería.
 */
const ACTORS: Actor[] = [
  {
    label: 'SUPERADMIN sin pertenencia',
    user: { id: 'u1', role: 'SUPERADMIN' },
    membershipFor: null,
    allowed: true,
  },
  {
    label: 'OWNER del mismo merchant',
    user: { id: 'u1', role: 'USER' },
    membershipFor: 'shop-a',
    membershipRole: 'OWNER',
    allowed: true,
  },
  {
    label: 'OWNER de otro merchant',
    user: { id: 'u1', role: 'USER' },
    membershipFor: 'shop-b',
    membershipRole: 'OWNER',
    allowed: false,
  },
  {
    label: 'MANAGER del mismo merchant',
    user: { id: 'u1', role: 'USER' },
    membershipFor: 'shop-a',
    membershipRole: 'MANAGER',
    allowed: false,
  },
  {
    label: 'STAFF del mismo merchant',
    user: { id: 'u1', role: 'USER' },
    membershipFor: 'shop-a',
    membershipRole: 'STAFF',
    allowed: false,
  },
  {
    label: 'USER sin pertenencia',
    user: { id: 'u1', role: 'USER' },
    membershipFor: null,
    allowed: false,
  },
];

describe('MerchantsController (RBAC)', () => {
  let findUnique: jest.Mock;
  let guard: MerchantGuard;
  let merchantsService: {
    listStaff: jest.Mock;
    addStaff: jest.Mock;
    updateStaffRole: jest.Mock;
    removeStaff: jest.Mock;
  };
  let controller: MerchantsController;

  function requestOf(actor: Actor): FakeRequest {
    return {
      user: actor.user,
      params: { ...STAFF_PARAMS },
      body: { email: 'nuevo@cofi.test', role: 'MANAGER' },
    };
  }

  function prepareMembership(actor: Actor) {
    findUnique.mockImplementation(
      (args: { where: { userId_coffeeShopId: { coffeeShopId: string } } }) => {
        const asked = args.where.userId_coffeeShopId.coffeeShopId;

        if (!actor.membershipFor || asked !== actor.membershipFor) {
          return Promise.resolve(null);
        }

        return Promise.resolve({
          id: `m-${asked}`,
          role: actor.membershipRole ?? 'STAFF',
          coffeeShopId: asked,
        });
      },
    );
  }

  async function authorizationOf(
    route: RouteName,
    actor: Actor,
  ): Promise<unknown> {
    prepareMembership(actor);

    return guard.canActivate(contextFor(route, requestOf(actor))).then(
      () => null,
      (reason: unknown) => reason,
    );
  }

  beforeEach(() => {
    findUnique = jest.fn();
    guard = new MerchantGuard(new Reflector(), {
      merchantStaff: { findUnique },
    } as unknown as PrismaService);

    merchantsService = {
      listStaff: jest.fn().mockResolvedValue([{ id: 'm1', role: 'OWNER' }]),
      addStaff: jest.fn().mockResolvedValue({ id: 'm2', role: 'MANAGER' }),
      updateStaffRole: jest.fn().mockResolvedValue({ id: 'm2', role: 'STAFF' }),
      removeStaff: jest
        .fn()
        .mockResolvedValue({ message: 'ok', userId: 'u-target' }),
    };

    controller = new MerchantsController(
      merchantsService as unknown as MerchantsService,
    );
  });

  it('declares the OWNER merchant role on every staff route', () => {
    for (const route of ROUTES) {
      expect(Reflect.getMetadata(MERCHANT_ROLES_KEY, handlerOf(route))).toEqual(
        [MerchantRole.OWNER],
      );
    }
  });

  it.each(ROUTES)(
    'answers %s without a session user with 403 before touching the database',
    async (route) => {
      const error = await authorizationOf(route, {
        label: 'anónimo',
        allowed: false,
      });

      expect(error).toBeInstanceOf(ForbiddenException);
      expect((error as ForbiddenException).getStatus()).toBe(403);
      expect(findUnique).not.toHaveBeenCalled();
    },
  );

  for (const route of ROUTES) {
    it.each(ACTORS)(
      `answers ${route} for $label as allowed=$allowed`,
      async (actor) => {
        const error = await authorizationOf(route, actor);

        if (actor.allowed) {
          expect(error).toBeNull();
        } else {
          expect(error).toBeInstanceOf(ForbiddenException);
          expect((error as ForbiddenException).getStatus()).toBe(403);
        }
      },
    );
  }

  it('resolves the membership of the coffee shop named by the route', async () => {
    const owner = ACTORS[1];
    prepareMembership(owner);

    await expect(
      guard.canActivate(contextFor('listStaff', requestOf(owner))),
    ).resolves.toBe(true);
    expect(findUnique).toHaveBeenCalledWith({
      where: {
        userId_coffeeShopId: { userId: 'u1', coffeeShopId: 'shop-a' },
      },
    });
  });

  it('delegates each route to the service with the route coffee shop id', async () => {
    const list = await controller.listStaff('shop-a');
    expect(list.data).toEqual([{ id: 'm1', role: 'OWNER' }]);
    expect(merchantsService.listStaff).toHaveBeenCalledWith('shop-a');

    await controller.addStaff('shop-a', {
      email: 'nuevo@cofi.test',
      role: 'MANAGER',
    });
    expect(merchantsService.addStaff).toHaveBeenCalledWith('shop-a', {
      email: 'nuevo@cofi.test',
      role: 'MANAGER',
    });

    await controller.updateStaff('shop-a', 'u-target', { role: 'STAFF' });
    expect(merchantsService.updateStaffRole).toHaveBeenCalledWith(
      'shop-a',
      'u-target',
      { role: 'STAFF' },
    );

    await controller.removeStaff('shop-a', 'u-target');
    expect(merchantsService.removeStaff).toHaveBeenCalledWith(
      'shop-a',
      'u-target',
    );
  });

  it('normalizes the invited email at the validation edge', () => {
    const dto = new ZodValidationPipe(createStaffSchema).transform({
      email: '  Nueva@Cofi.TEST  ',
      role: 'MANAGER',
    });

    expect(dto).toEqual({ email: 'nueva@cofi.test', role: 'MANAGER' });
  });

  it('keeps OWNER parseable so the service can answer with its domain code', () => {
    const dto = new ZodValidationPipe(updateStaffSchema).transform({
      role: 'OWNER',
    });

    expect(dto).toEqual({ role: 'OWNER' });
  });
});
