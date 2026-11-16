import { z } from 'zod';

/**
 * Tipado estricto para entidades de cafeterías y productos del menú.
 * Sincronizado con los DTOs del backend (cofi-ruta-backend/src/cafes/dto/cafes.dto.ts).
 */

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

export type Product = z.infer<typeof productSchema>;

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

export type CoffeeShop = z.infer<typeof coffeeShopSchema>;

export const coffeeShopDetailSchema = coffeeShopSchema.extend({
  products: z.array(productSchema),
});

export type CoffeeShopDetail = z.infer<typeof coffeeShopDetailSchema>;

export const coffeeShopWithProductsSchema = coffeeShopSchema.extend({
  products: z.array(productSchema).optional(),
});

export type CoffeeShopWithProducts = z.infer<typeof coffeeShopWithProductsSchema>;

export const listCafesResponseSchema = z.object({
  cafes: z.array(coffeeShopSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export type ListCafesResponse = z.infer<typeof listCafesResponseSchema>;

export interface ListCafesQuery {
  neighborhood?: string;
  isOpen?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CafeFilterChip {
  label: string;
  value: string;
  color: 'amber' | 'cyan' | 'pink' | 'white';
}

export const DEFAULT_CAFE_FILTER_CHIPS: CafeFilterChip[] = [
  { label: '#ParaElFrío', value: 'ParaElFrío', color: 'amber' },
  { label: '#JugosYFrappés', value: 'JugosYFrappés', color: 'cyan' },
  { label: '#AntojoDulce', value: 'AntojoDulce', color: 'pink' },
  { label: '#ParaEstudiar', value: 'ParaEstudiar', color: 'white' },
];
