import { SetMetadata } from '@nestjs/common';

/**
 * Identidades que pueden habilitar una ruta.
 *
 * `SUPERADMIN` sale de `User.role`. `OWNER`, `MANAGER` y `STAFF` son
 * pertenencias de `MerchantStaff` y no viven en `User.role`: el enum `Role` sólo
 * tiene `USER` y `SUPERADMIN`.
 */
export type AccessRole = 'SUPERADMIN' | 'OWNER' | 'MANAGER' | 'STAFF';

export const ACCESS_ROLES_KEY = 'accessRoles';

export const Roles = (...roles: AccessRole[]) =>
  SetMetadata(ACCESS_ROLES_KEY, roles);
