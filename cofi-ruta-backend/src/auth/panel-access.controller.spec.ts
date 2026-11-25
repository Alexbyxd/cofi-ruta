import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { ACCESS_ROLES_KEY } from './decorators/roles.decorator';
import { PanelAccessController } from './panel-access.controller';

// Importar el controller arrastra el guard de JWT, que resuelve Better Auth de
// forma perezosa; el mock evita cargar su ESM en Jest.
jest.mock('./better-auth/auth.provider', () => ({
  getAuth: () => ({ api: { getSession: () => Promise.resolve(null) } }),
}));

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

/**
 * El guard por sí solo no prueba que la ruta esté protegida: si alguien borra
 * el `@Roles` o cambia el `@UseGuards`, la suite del guard sigue verde. Estos
 * tests miran la metadata real del controller.
 */
describe('PanelAccessController authorization wiring', () => {
  const reflector = new Reflector();

  it('declares the panel roles on the controller', () => {
    expect(reflector.get(ACCESS_ROLES_KEY, PanelAccessController)).toEqual([
      'SUPERADMIN',
      'OWNER',
    ]);
  });

  it('applies identity and role guards, in that order', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, PanelAccessController)).toEqual(
      [JwtAuthGuard, RolesGuard],
    );
  });
});

/**
 * El wiring del guard no dice nada sobre lo que la ruta responde. Estos tests
 * fijan la resolución de la pertenencia de merchant, que es lo único que el
 * panel usa para dejar entrar a un dueño de cafetería.
 */
describe('PanelAccessController merchant role resolution', () => {
  interface Membership {
    role: string;
  }

  function build(memberships: Membership[]) {
    const findMany = jest.fn(() => Promise.resolve(memberships));
    const prisma = { merchantStaff: { findMany } };
    const controller = new PanelAccessController(prisma as never);

    return { controller, findMany };
  }

  it('reports no merchant role when the user has no memberships', async () => {
    const { controller } = build([]);

    await expect(
      controller.getPanelAccess({ id: 'user_1', role: 'USER' }),
    ).resolves.toEqual({ accountRole: 'USER', merchantRole: null });
  });

  it('reports the single membership role', async () => {
    const { controller } = build([{ role: 'STAFF' }]);

    await expect(
      controller.getPanelAccess({ id: 'user_1', role: 'USER' }),
    ).resolves.toEqual({ accountRole: 'USER', merchantRole: 'STAFF' });
  });

  it('lets OWNER win over every other membership', async () => {
    const { controller } = build([
      { role: 'STAFF' },
      { role: 'MANAGER' },
      { role: 'OWNER' },
    ]);

    await expect(
      controller.getPanelAccess({ id: 'user_1', role: 'USER' }),
    ).resolves.toEqual({ accountRole: 'USER', merchantRole: 'OWNER' });
  });

  it('ranks MANAGER above STAFF instead of trusting the row order', async () => {
    const staffFirst = build([{ role: 'STAFF' }, { role: 'MANAGER' }]);
    const managerFirst = build([{ role: 'MANAGER' }, { role: 'STAFF' }]);

    await expect(
      staffFirst.controller.getPanelAccess({ id: 'user_1', role: 'USER' }),
    ).resolves.toEqual({ accountRole: 'USER', merchantRole: 'MANAGER' });
    await expect(
      managerFirst.controller.getPanelAccess({ id: 'user_1', role: 'USER' }),
    ).resolves.toEqual({ accountRole: 'USER', merchantRole: 'MANAGER' });
  });

  it('skips the membership query when the session carries no user id', async () => {
    const { controller, findMany } = build([{ role: 'OWNER' }]);

    await expect(controller.getPanelAccess(undefined)).resolves.toEqual({
      accountRole: 'USER',
      merchantRole: null,
    });
    expect(findMany).not.toHaveBeenCalled();
  });

  it('passes a SUPERADMIN account role through untouched', async () => {
    const { controller } = build([]);

    await expect(
      controller.getPanelAccess({ id: 'user_1', role: 'SUPERADMIN' }),
    ).resolves.toEqual({ accountRole: 'SUPERADMIN', merchantRole: null });
  });
});
