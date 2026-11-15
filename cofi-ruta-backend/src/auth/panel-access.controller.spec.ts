import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { ACCESS_ROLES_KEY } from './decorators/roles.decorator';
import { PanelAccessController } from './panel-access.controller';

// Importar el controller arrastra el guard de JWT, que resuelve Better Auth de
// forma perezosa; el mock evita cargar su ESM en Jest.
jest.mock('./better-auth/auth.provider', () => ({
  getAuth: () => ({ api: { getSession: async () => null } }),
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
    expect(
      Reflect.getMetadata(GUARDS_METADATA, PanelAccessController),
    ).toEqual([JwtAuthGuard, RolesGuard]);
  });
});
