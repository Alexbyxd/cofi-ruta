import { Controller, Get, Param, Query } from '@nestjs/common';
import { CafesService } from './cafes.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  cafeSlugParamSchema,
  listCafesQuerySchema,
  reviewPaginationQuerySchema,
} from './dto/cafes.dto';
import type {
  CafeSlugParamDto,
  ListCafesQueryDto,
  ReviewPaginationQueryDto,
} from './dto/cafes.dto';

@Controller('cafes')
export class CafesController {
  constructor(private readonly cafesService: CafesService) {}

  @Get()
  async list(
    @Query(new ZodValidationPipe(listCafesQuerySchema))
    query: ListCafesQueryDto,
  ) {
    return this.cafesService.listCafes(query);
  }

  @Get(':slug/menu')
  async getMenu(
    @Param(new ZodValidationPipe(cafeSlugParamSchema))
    params: CafeSlugParamDto,
  ) {
    return { data: await this.cafesService.getMenu(params.slug) };
  }

  @Get(':slug/reviews')
  async getReviews(
    @Param(new ZodValidationPipe(cafeSlugParamSchema))
    params: CafeSlugParamDto,
    @Query(new ZodValidationPipe(reviewPaginationQuerySchema))
    query: ReviewPaginationQueryDto,
  ) {
    return this.cafesService.getReviews(params.slug, query);
  }

  @Get(':slug')
  async getBySlug(
    @Param(new ZodValidationPipe(cafeSlugParamSchema))
    params: CafeSlugParamDto,
  ) {
    return { data: await this.cafesService.getCafeBySlug(params.slug) };
  }
}
