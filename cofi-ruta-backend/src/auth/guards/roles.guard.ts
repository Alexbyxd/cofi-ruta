import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ACCESS_ROLES_KEY,
  type AccessRole,
} from '../decorators/roles.decorator';

interface AuthorizedRequest {
  user?: { id?: string; role?: string };
}

const MERCHANT_ROLES = ['OWNER', 'MANAGER', 'STAFF'] as const;

/**
 * Autorización por rol.
 *
 * `JwtAuthGuard` sólo prueba identidad: dice quién sos, no qué podés hacer. Este
 * guard resuelve la autorización real y se apoya en las dos fuentes que tiene el
 * sistema: el rol de cuenta (`User.role`) y la pertenencia de merchant
 * (`MerchantStaff.role`).
 *
 * Sin `@Roles(...)` la ruta sólo exige sesión y el guard no decide nada.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<AccessRole[] | undefined>(
      ACCESS_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthorizedRequest>();
    const userId = request.user?.id;

    if (!userId) {
      throw new ForbiddenException('Sin sesión para autorizar esta ruta');
    }

    const accountRole = (request.user?.role ?? 'USER').toUpperCase();
    if (required.includes('SUPERADMIN') && accountRole === 'SUPERADMIN') {
      return true;
    }

    const wantedMerchantRoles = required.filter(
      (role): role is (typeof MERCHANT_ROLES)[number] =>
        (MERCHANT_ROLES as readonly string[]).includes(role),
    );

    if (wantedMerchantRoles.length > 0) {
      const membership = await this.prisma.merchantStaff.findFirst({
        where: { userId, role: { in: wantedMerchantRoles } },
        select: { id: true },
      });
      if (membership) {
        return true;
      }
    }

    throw new ForbiddenException('Tu rol no habilita esta ruta');
  }
}
