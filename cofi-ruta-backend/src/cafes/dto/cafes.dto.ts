import { z } from 'zod';

export const listCafesQuerySchema = z
  .object({
    neighborhood: z.string().optional(),
    isOpen: z
      .string()
      .optional()
      .transform((val) => (val === undefined ? undefined : val === 'true')),
    search: z.string().optional(),
    limit: z
      .string()
      .optional()
      .transform((val) => (val === undefined ? undefined : parseInt(val, 10) || 20)),
    offset: z
      .string()
      .optional()
      .transform((val) => (val === undefined ? undefined : parseInt(val, 10) || 0)),
  })
  .strict();

export type ListCafesQueryDto = z.infer<typeof listCafesQuerySchema>;

export const cafeIdParamSchema = z.object({
  id: z.string().uuid('ID de cafetería inválido'),
});

export type CafeIdParamDto = z.infer<typeof cafeIdParamSchema>;

export const coffeeShopSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  address: z.string().nullable(),
  neighborhood: z.string().nullable(),
  distanceMeters: z.number().nullable(),
  rating: z.string().nullable(),
  reviewCount: z.number(),
  imageUrl: z.string().nullable(),
  isOpen: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CoffeeShopDto = z.infer<typeof coffeeShopSchema>;

export const productSchema = z.object({
  id: z.string().uuid(),
  coffeeShopId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.string(),
  currency: z.string(),
  imageUrl: z.string().nullable(),
  isAvailable: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ProductDto = z.infer<typeof productSchema>;

export const coffeeShopDetailSchema = coffeeShopSchema.extend({
  products: z.array(productSchema),
});

export type CoffeeShopDetailDto = z.infer<typeof coffeeShopDetailSchema>;

export const listCafesResponseSchema = z.object({
  cafes: z.array(coffeeShopSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export type ListCafesResponseDto = z.infer<typeof listCafesResponseSchema>;
