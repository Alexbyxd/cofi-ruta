import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { MerchantRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MERCHANT_ROLES_KEY } from '../decorators/merchant-roles.decorator';

/**
 * Jerarquía de `MerchantRole` (OWNER > MANAGER > STAFF).
 *
 * Igual que en `panel-access.controller.ts`, el mapa se tipa contra el enum de
 * Prisma para que un rol nuevo rompa la compilación en lugar de quedar afuera
 * en silencio. Un rol que no está en el enum rango 0: falla cerrado.
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

interface MerchantRequest {
  user?: { id?: string; role?: string };
  params?: Record<string, string | undefined>;
  merchantStaff?: {
    id: string;
    role: MerchantRole;
    coffeeShopId: string;
  };
}

/**
 * Autorización por pertenencia de comercio.
 *
 * Resuelve la fila de `MerchantStaff` del usuario en sesión contra la cafetería
 * que nombra la ruta. El `coffeeShopId` sale **solo** de `request.params`: nunca
 * del body, del query ni de un valor por defecto. Si la ruta no trae el id, no
 * hay pertenencia que resolver y la request se rechaza.
 *
 * `SUPERADMIN` es un rol de cuenta (`User.role`) y pasa siempre. Cualquier otro
 * usuario necesita una fila de `MerchantStaff` con rango suficiente; sin fila,
 * sin rango o con un rol ajeno al enum, la respuesta es `403`.
 *
 * Sin `@MerchantRoles(...)` la ruta no pide rol de comercio y el guard no decide
 * nada. Combinarlo con `JwtAuthGuard` es obligatorio: este guard lee
 * `request.user` pero no lo puebla.
 */
@Injectable()
export class MerchantGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<
      MerchantRole[] | undefined
    >(MERCHANT_ROLES_KEY, [context.getHandler(), context.getClass()]);

    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<MerchantRequest>();
    const userId = request.user?.id;

    if (!userId) {
      throw new ForbiddenException('Sin sesión para autorizar esta ruta');
    }

    if ((request.user?.role ?? '').toUpperCase() === 'SUPERADMIN') {
      return true;
    }

    // El id del local sale exclusivamente de la ruta; nunca del body ni del query.
    const coffeeShopId = request.params?.coffeeShopId;

    if (!coffeeShopId) {
      throw new ForbiddenException('La ruta no identifica una cafetería');
    }

    const staff = await this.prisma.merchantStaff.findUnique({
      where: {
        userId_coffeeShopId: { userId, coffeeShopId },
      },
    });

    if (!staff) {
      throw new ForbiddenException('No pertenecés a esta cafetería');
    }

    const minimumRank = Math.max(
      ...required.map((role) => rankOfMerchantRole(role)),
    );

    if (rankOfMerchantRole(staff.role) < minimumRank) {
      throw new ForbiddenException('Tu rol de comercio no habilita esta ruta');
    }

    request.merchantStaff = {
      id: staff.id,
      role: staff.role,
      coffeeShopId: staff.coffeeShopId,
    };

    return true;
  }
}
