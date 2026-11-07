import { z } from 'zod';

/**
 * Contrato público de Fase 0. `openNow`, filtro por tags y distancia todavía
 * no existen: el objeto estricto rechaza esos parámetros en lugar de ignorarlos.
 */
export const listCafesQuerySchema = z
  .object({
    page: z.coerce
      .number('page debe ser un número')
      .int('page debe ser entero')
      .min(1, 'page debe ser mayor o igual a 1')
      .default(1),
    limit: z.coerce
      .number('limit debe ser un número')
      .int('limit debe ser entero')
      .min(1, 'limit debe ser mayor o igual a 1')
      .max(100, 'limit admite como máximo 100')
      .default(20),
    neighborhood: z.string().trim().max(80).optional(),
    q: z.string().trim().max(80).optional(),
    order: z.enum(['rating', 'name']).default('rating'),
  })
  .strict();

export type ListCafesQueryDto = z.infer<typeof listCafesQuerySchema>;

export const cafeSlugParamSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(1, 'El slug es requerido')
      .max(120, 'El slug es demasiado largo'),
  })
  .strict();

export type CafeSlugParamDto = z.infer<typeof cafeSlugParamSchema>;

export const reviewPaginationQuerySchema = z
  .object({
    page: z.coerce
      .number('page debe ser un número')
      .int('page debe ser entero')
      .min(1, 'page debe ser mayor o igual a 1')
      .default(1),
    limit: z.coerce
      .number('limit debe ser un número')
      .int('limit debe ser entero')
      .min(1, 'limit debe ser mayor o igual a 1')
      .max(100, 'limit admite como máximo 100')
      .default(20),
  })
  .strict();

export type ReviewPaginationQueryDto = z.infer<
  typeof reviewPaginationQuerySchema
>;

export interface CafeTagDto {
  slug: string;
  name: string;
}

export interface CafeListItemDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  neighborhood: string | null;
  latitude: string;
  longitude: string;
  averageRating: string;
  reviewCount: number;
  verifiedReviewCount: number;
  coverUrl: string | null;
  tags: CafeTagDto[];
}

export interface PaginationMetaDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedCafesDto {
  data: CafeListItemDto[];
  meta: PaginationMetaDto;
}

export interface MenuItemDto {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  sortOrder: number;
}

export interface MenuCategoryDto {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  icon: string | null;
}

export interface MenuGroupDto {
  category: MenuCategoryDto;
  items: MenuItemDto[];
}

export interface ReviewAuthorDto {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface ReviewPhotoDto {
  url: string;
}

export interface ReviewDto {
  id: string;
  rating: string;
  comment: string | null;
  createdAt: string;
  verified: boolean;
  author: ReviewAuthorDto;
  photos: ReviewPhotoDto[];
}

export interface OpeningHoursDto {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
}

export interface SpecialHoursDto {
  date: string;
  isClosed: boolean;
  openTime: string | null;
  closeTime: string | null;
  note: string | null;
}

export interface CafeStatsDto {
  averageRating: string;
  reviewCount: number;
  verifiedReviewCount: number;
  ratingCounts: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface CafeDetailDto extends CafeListItemDto {
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  openingHours: OpeningHoursDto[];
  specialHours: SpecialHoursDto[];
  menu: MenuGroupDto[];
  stats: CafeStatsDto;
  latestReviews: ReviewDto[];
}

export interface PaginatedReviewsDto {
  data: ReviewDto[];
  meta: PaginationMetaDto;
}
