import { Injectable } from '@nestjs/common';
import { Prisma, type MerchantRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateStaffDto, UpdateStaffDto } from './dto/merchants.dto';
import { merchantsErrors } from './merchants.errors';

/** Rol que esta ruta nunca asigna ni concede: la propiedad no se reparte. */
const OWNER: MerchantRole = 'OWNER';

/**
 * Datos de cuenta que el panel puede ver del personal de una cafetería.
 * Nunca se expone el hash de credenciales ni las relaciones de auth.
 */
const staffUserSelect = {
  id: true,
  email: true,
  fullName: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

const staffSelect = {
  id: true,
  userId: true,
  coffeeShopId: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  user: { select: staffUserSelect },
} satisfies Prisma.MerchantStaffSelect;

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

@Injectable()
export class MerchantsService {
  constructor(private readonly prisma: PrismaService) {}

  async listStaff(coffeeShopId: string) {
    await this.assertMerchantExists(coffeeShopId);

    return this.prisma.merchantStaff.findMany({
      where: { coffeeShopId },
      select: staffSelect,
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
  }

  async addStaff(coffeeShopId: string, dto: CreateStaffDto) {
    // El rechazo de OWNER va antes que cualquier lectura: la ruta no puede
    // mirar siquiera qué cuenta hay detrás del correo.
    this.assertAssignableRole(dto.role);

    try {
      return await this.prisma.$transaction(async (tx) => {
        await this.lockMerchant(tx, coffeeShopId);

        const user = await tx.user.findUnique({
          where: { email: dto.email },
          select: { id: true },
        });

        if (!user) {
          throw merchantsErrors.userNotFound();
        }

        return tx.merchantStaff.create({
          data: { coffeeShopId, userId: user.id, role: dto.role },
          select: staffSelect,
        });
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw merchantsErrors.staffAlreadyExists();
      }
      throw error;
    }
  }

  /**
   * Cambia el rol de una pertenencia existente.
   *
   * El lock del comercio, la lectura de la pertenencia, el conteo de dueños y la
   * escritura viven en la misma transacción: ver `lockMerchant`.
   */
  async updateStaffRole(
    coffeeShopId: string,
    userId: string,
    dto: UpdateStaffDto,
  ) {
    this.assertAssignableRole(dto.role);

    return this.prisma.$transaction(async (tx) => {
      await this.lockMerchant(tx, coffeeShopId);

      const membership = await tx.merchantStaff.findUnique({
        where: { userId_coffeeShopId: { userId, coffeeShopId } },
        select: { id: true, role: true },
      });

      if (!membership) {
        throw merchantsErrors.staffNotFound();
      }

      if (membership.role === OWNER) {
        await this.assertAnotherOwnerRemains(tx, coffeeShopId);
      }

      return tx.merchantStaff.update({
        where: { id: membership.id },
        data: { role: dto.role },
        select: staffSelect,
      });
    });
  }

  async removeStaff(coffeeShopId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      await this.lockMerchant(tx, coffeeShopId);

      const membership = await tx.merchantStaff.findUnique({
        where: { userId_coffeeShopId: { userId, coffeeShopId } },
        select: { id: true, role: true },
      });

      if (!membership) {
        throw merchantsErrors.staffNotFound();
      }

      if (membership.role === OWNER) {
        await this.assertAnotherOwnerRemains(tx, coffeeShopId);
      }

      await tx.merchantStaff.delete({ where: { id: membership.id } });

      return {
        message: 'La cuenta ya no forma parte del personal',
        userId,
      };
    });
  }

  /**
   * Toma el lock de la fila del comercio como **primera sentencia** de la
   * transacción interactiva.
   *
   * `findUnique` + `count(role = OWNER)` + escritura bajo `read committed` es un
   * write skew: dos degradaciones de dos OWNER distintos leen `count = 2`,
   * escriben filas distintas y ambas confirman, dejando el comercio sin dueño y
   * sin forma de repararlo desde la API (esta ruta nunca asigna OWNER). El
   * `SELECT ... FOR UPDATE` serializa esas operaciones por comercio: la segunda
   * espera al commit de la primera y su conteo ya ve el estado nuevo.
   *
   * Se prefiere el lock de fila a `SERIALIZABLE` + reintento porque además deja
   * un único punto para responder `404 MERCHANT_NOT_FOUND` cuando el id de la
   * ruta no existe, y no obliga a reintentar SQLSTATE 40001/40P01 en cada
   * escritura.
   */
  private async lockMerchant(
    tx: Prisma.TransactionClient,
    coffeeShopId: string,
  ): Promise<void> {
    const rows = await tx.$queryRaw<{ id: string }[]>`
      SELECT id FROM "CoffeeShop" WHERE id = ${coffeeShopId} FOR UPDATE
    `;

    if (rows.length === 0) {
      throw merchantsErrors.merchantNotFound();
    }
  }

  /**
   * Lectura sin lock para la ruta de listado: un id inexistente es un `404`
   * estable y no puede terminar en `[]` ni en el error 500 de una escritura.
   */
  private async assertMerchantExists(coffeeShopId: string): Promise<void> {
    const shop = await this.prisma.coffeeShop.findUnique({
      where: { id: coffeeShopId },
      select: { id: true },
    });

    if (!shop) {
      throw merchantsErrors.merchantNotFound();
    }
  }

  /** Ninguna operación puede dejar el comercio sin dueño. */
  private async assertAnotherOwnerRemains(
    tx: Prisma.TransactionClient,
    coffeeShopId: string,
  ): Promise<void> {
    const owners = await tx.merchantStaff.count({
      where: { coffeeShopId, role: OWNER },
    });

    if (owners <= 1) {
      throw merchantsErrors.lastOwnerProtected();
    }
  }

  private assertAssignableRole(role: MerchantRole): void {
    if (role === OWNER) {
      throw merchantsErrors.roleNotAssignable();
    }
  }
}
