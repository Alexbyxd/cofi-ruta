import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ACCESS_ROLES_KEY, type AccessRole } from '../decorators/roles.decorator';

interface FakeRequest {
  user?: { id?: string; role?: string };
}

function contextFor(user?: FakeRequest['user']): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: <T>() => ({ user }) as T }),
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as ExecutionContext;
}

function guardFor(options: {
  required?: AccessRole[];
  membership?: { id: string } | null;
}) {
  const reflector = {
    getAllAndOverride: () => options.required,
  } as unknown as Reflector;

  const prisma = {
    merchantStaff: {
      findFirst: async () => options.membership ?? null,
    },
  };

  const findFirst = jest.spyOn(prisma.merchantStaff, 'findFirst');
  const guard = new RolesGuard(reflector, prisma as never);

  return { guard, findFirst };
}

describe('RolesGuard', () => {
  it('lets anything through when the route declares no roles', async () => {
    const { guard } = guardFor({ required: undefined });

    await expect(guard.canActivate(contextFor(undefined))).resolves.toBe(true);
  });

  it('admits a SUPERADMIN without asking for a merchant membership', async () => {
    const { guard, findFirst } = guardFor({ required: ['SUPERADMIN'] });

    await expect(
      guard.canActivate(contextFor({ id: 'u1', role: 'SUPERADMIN' })),
    ).resolves.toBe(true);
    expect(findFirst).not.toHaveBeenCalled();
  });

  it('admits a merchant OWNER through MerchantStaff, not User.role', async () => {
    const { guard, findFirst } = guardFor({
      required: ['OWNER'],
      membership: { id: 'm1' },
    });

    await expect(
      guard.canActivate(contextFor({ id: 'u2', role: 'USER' })),
    ).resolves.toBe(true);
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'u2', role: { in: ['OWNER'] } },
      }),
    );
  });

  it('rejects a plain USER', async () => {
    const { guard } = guardFor({ required: ['SUPERADMIN', 'OWNER'] });

    await expect(
      guard.canActivate(contextFor({ id: 'u3', role: 'USER' })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects a request without a session even when the route only wants merchants', async () => {
    const { guard, findFirst } = guardFor({ required: ['OWNER'] });

    await expect(guard.canActivate(contextFor(undefined))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(findFirst).not.toHaveBeenCalled();
  });

  it('ignores an unknown role name instead of admitting it', async () => {
    const { guard } = guardFor({ required: ['MANAGER'] });

    await expect(
      guard.canActivate(contextFor({ id: 'u4', role: 'USER' })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('reads the declared roles from the metadata key', () => {
    expect(ACCESS_ROLES_KEY).toBe('accessRoles');
  });
});
