import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

interface SessionUser {
  id?: string;
  role?: string;
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
@UseGuards(JwtAuthGuard)
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
    const merchantRole = memberships.some((staff) => staff.role === 'OWNER')
      ? 'OWNER'
      : (memberships[0]?.role ?? null);

    return { accountRole, merchantRole };
  }
}
