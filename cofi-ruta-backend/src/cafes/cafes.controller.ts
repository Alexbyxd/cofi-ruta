import { Controller, Get, Query, Param } from '@nestjs/common';
import { CafesService } from './cafes.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  listCafesQuerySchema,
  cafeIdParamSchema,
  listCafesResponseSchema,
  coffeeShopDetailSchema,
} from './dto/cafes.dto';
import type {
  ListCafesQueryDto,
  ListCafesResponseDto,
  CoffeeShopDetailDto,
} from './dto/cafes.dto';

@Controller('cafes')
export class CafesController {
  constructor(private readonly cafesService: CafesService) {}

  @Get()
  async list(
    @Query(new ZodValidationPipe(listCafesQuerySchema))
    query: ListCafesQueryDto,
  ): Promise<ListCafesResponseDto> {
    const result = await this.cafesService.listCafes(query);
    return listCafesResponseSchema.parse(result);
  }

  @Get(':id')
  async getById(
    @Param(new ZodValidationPipe(cafeIdParamSchema)) params: { id: string },
  ): Promise<CoffeeShopDetailDto> {
    const cafe = await this.cafesService.getCafeById(params.id);
    return coffeeShopDetailSchema.parse(cafe);
  }
}
