import { SetMetadata } from '@nestjs/common';
import type { MerchantRole } from '@prisma/client';

export const MERCHANT_ROLES_KEY = 'cofi:merchant-roles';

/**
 * Exige el rol de comercio mínimo para el `coffeeShopId` de la ruta.
 * La jerarquía es `OWNER > MANAGER > STAFF`.
 */
export const MerchantRoles = (...roles: MerchantRole[]) =>
  SetMetadata(MERCHANT_ROLES_KEY, roles);
