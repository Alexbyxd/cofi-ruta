import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import type { MerchantRole } from '@prisma/client';

interface SessionUser {
  id?: string;
  role?: string;
}

/**
 * Jerarquía de `MerchantRole` (OWNER > MANAGER > STAFF).
 *
 * La resolución no puede depender del orden en que Postgres devuelva las filas
 * de `MerchantStaff`: un usuario con varias pertenencias tiene que resolver
 * siempre a la de mayor rango. El mapa se tipa contra el enum de Prisma, así que
 * agregar un rol nuevo rompe la compilación en lugar de quedar silenciosamente
 * fuera. Un rol ajeno al enum se rango 0 y no se reporta, que es el lado seguro:
 * el panel exige exactamente `OWNER` para entrar.
 */
const MERCHANT_ROLE_RANK: Record<MerchantRole, number> = {
  OWNER: 3,
  MANAGER: 2,
  STAFF: 1,
};

function rankOfMerchantRole(role: string): number {
  return Object.prototype.hasOwnProperty.call(MERCHANT_ROLE_RANK, role)
    ? MERCHANT_ROLE_RANK[role as MerchantRole]
    : 0;
}

/**
 * Acceso al panel administrativo del usuario en sesión.
 *
 * CofiRutas tiene tres identidades y no viven en el mismo lugar: `User.role` es
 * el enum `Role` (`USER` | `SUPERADMIN`) y la pertenencia de un dueño de
 * cafetería es `MerchantStaff.role` (`MerchantRole`). La sesión de Better Auth
 * sólo expone `User.role`, así que el panel necesita este endpoint para saber si
 * el usuario es OWNER de alguna cafetería.
 *
 * Vive en `/api/v1/panel-access` y no bajo `/auth` a propósito: el controller de
 * Better Auth atiende `auth/*` con un wildcard y se tragaría la ruta.
 */
@Controller('panel-access')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPERADMIN', 'OWNER')
export class PanelAccessController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getPanelAccess(@CurrentUser() user: SessionUser | undefined) {
    const accountRole = (user?.role ?? 'USER').toUpperCase();

    const memberships = user?.id
      ? await this.prisma.merchantStaff.findMany({
          where: { userId: user.id },
          select: { role: true },
        })
      : [];

    // Un dueño manda sobre las demás pertenencias que pueda tener.
    const merchantRole = memberships.reduce<string | null>((best, staff) => {
      const currentRank = best ? rankOfMerchantRole(best) : 0;

      return rankOfMerchantRole(staff.role) > currentRank ? staff.role : best;
    }, null);

    return { accountRole, merchantRole };
  }
}
