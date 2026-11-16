import { SetMetadata } from '@nestjs/common';
import type { MerchantRole } from '@prisma/client';

export const MERCHANT_ROLES_KEY = 'merchantRoles';

/**
 * Exige el rol de comercio mínimo para el `coffeeShopId` de la ruta.
 *
 * La jerarquía es `OWNER > MANAGER > STAFF`: declarar `MANAGER` admite también a
 * un `OWNER`, pero nunca al revés. El guard toma el id del local sólo de los
 * params de ruta, así que el decorador nunca lleva un id adentro.
 */
export const MerchantRoles = (...roles: MerchantRole[]) =>
  SetMetadata(MERCHANT_ROLES_KEY, roles);
