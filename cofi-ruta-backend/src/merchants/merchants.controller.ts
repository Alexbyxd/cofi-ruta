import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MerchantRole } from '@prisma/client';
import { MerchantRoles } from '../auth/decorators/merchant-roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MerchantGuard } from '../auth/guards/merchant.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { CreateStaffDto, UpdateStaffDto } from './dto/merchants.dto';
import { createStaffSchema, updateStaffSchema } from './dto/merchants.dto';
import { MerchantsService } from './merchants.service';

/**
 * Gestión del personal de una cafetería.
 *
 * El `coffeeShopId` sale siempre de los params de ruta: `MerchantGuard` resuelve
 * la pertenencia con ese valor y nunca con el body ni el query. Como toda la
 * administración de personal es una acción de dueño, cada ruta declara
 * `@MerchantRoles(MerchantRole.OWNER)`: un MANAGER o un STAFF recibe `403`, y un
 * `SUPERADMIN` pasa sin pertenencia.
 */
@Controller('merchants')
@UseGuards(JwtAuthGuard, MerchantGuard)
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Get(':coffeeShopId/staff')
  @MerchantRoles(MerchantRole.OWNER)
  async listStaff(@Param('coffeeShopId') coffeeShopId: string) {
    return { data: await this.merchantsService.listStaff(coffeeShopId) };
  }

  @Post(':coffeeShopId/staff')
  @MerchantRoles(MerchantRole.OWNER)
  async addStaff(
    @Param('coffeeShopId') coffeeShopId: string,
    @Body(new ZodValidationPipe(createStaffSchema)) dto: CreateStaffDto,
  ) {
    return this.merchantsService.addStaff(coffeeShopId, dto);
  }

  @Patch(':coffeeShopId/staff/:userId')
  @MerchantRoles(MerchantRole.OWNER)
  async updateStaff(
    @Param('coffeeShopId') coffeeShopId: string,
    @Param('userId') userId: string,
    @Body(new ZodValidationPipe(updateStaffSchema)) dto: UpdateStaffDto,
  ) {
    return this.merchantsService.updateStaffRole(coffeeShopId, userId, dto);
  }

  @Delete(':coffeeShopId/staff/:userId')
  @MerchantRoles(MerchantRole.OWNER)
  async removeStaff(
    @Param('coffeeShopId') coffeeShopId: string,
    @Param('userId') userId: string,
  ) {
    return this.merchantsService.removeStaff(coffeeShopId, userId);
  }
}
