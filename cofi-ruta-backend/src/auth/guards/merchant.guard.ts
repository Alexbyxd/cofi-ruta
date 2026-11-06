import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { MerchantRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { authErrors } from '../auth.errors';
import { MERCHANT_ROLES_KEY } from '../decorators/merchant-roles.decorator';

const MERCHANT_ROLE_RANK: Record<MerchantRole, number> = {
  STAFF: 1,
  MANAGER: 2,
  OWNER: 3,
};

interface MerchantRequest {
  user?: { id?: string };
  params?: Record<string, string | undefined>;
  merchantStaff?: {
    id: string;
    role: MerchantRole;
    coffeeShopId: string;
  };
}

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
    // El id del local sale exclusivamente de la ruta; nunca del body.
    const coffeeShopId = request.params?.coffeeShopId ?? request.params?.id;

    if (!userId || !coffeeShopId) {
      throw authErrors.merchantAccessDenied();
    }

    const staff = await this.prisma.merchantStaff.findUnique({
      where: {
        userId_coffeeShopId: { userId, coffeeShopId },
      },
    });

    if (!staff) {
      throw authErrors.merchantAccessDenied();
    }

    const minimumRank = Math.max(
      ...required.map((role) => MERCHANT_ROLE_RANK[role]),
    );

    if (MERCHANT_ROLE_RANK[staff.role] < minimumRank) {
      throw authErrors.merchantAccessDenied();
    }

    request.merchantStaff = {
      id: staff.id,
      role: staff.role,
      coffeeShopId: staff.coffeeShopId,
    };

    return true;
  }
}
