import type { ZodTypeAny } from 'zod';
import type {
  CoffeeShopDetail,
  ListCafesResponse,
  ListCafesQuery,
} from '@/types/cafes';
import { listCafesResponseSchema, coffeeShopDetailSchema } from '@/types/cafes';
import { clientEnv } from '@/lib/env';

export interface ICafesService {
  listCafes(query?: ListCafesQuery): Promise<ListCafesResponse>;
  getCafeById(id: string): Promise<CoffeeShopDetail>;
  getCafeBySlug(slug: string): Promise<CoffeeShopDetail>;
}

export class CafesService implements ICafesService {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    let resolved: string;
    try {
      resolved = new URL(
        baseUrl || clientEnv.NEXT_PUBLIC_API_URL,
      ).toString();
    } catch {
      resolved = baseUrl || clientEnv.NEXT_PUBLIC_API_URL;
    }
    this.baseUrl = resolved.replace(/\/$/, '');
  }

  private buildUrl(path: string, query?: ListCafesQuery): string {
    let url: URL;
    try {
      url = new URL(`${this.baseUrl}${path}`);
    } catch {
      url = new URL(path);
    }

    if (query) {
      if (query.neighborhood)
        url.searchParams.set('neighborhood', query.neighborhood);
      if (query.isOpen !== undefined)
        url.searchParams.set('isOpen', String(query.isOpen));
      if (query.search) url.searchParams.set('search', query.search);
      if (query.limit !== undefined)
        url.searchParams.set('limit', String(query.limit));
      if (query.offset !== undefined)
        url.searchParams.set('offset', String(query.offset));
    }

    return url.toString();
  }

  private async request<T>(url: string, schema: ZodTypeAny): Promise<T> {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Error al cargar cafeterías: ${response.status} ${body ||
          response.statusText}`,
      );
    }

    const data = await response.json();
    return schema.parse(data) as T;
  }

  async listCafes(query?: ListCafesQuery): Promise<ListCafesResponse> {
    return this.request<ListCafesResponse>(
      this.buildUrl('/cafes', query),
      listCafesResponseSchema,
    );
  }

  async getCafeById(id: string): Promise<CoffeeShopDetail> {
    return this.request<CoffeeShopDetail>(
      `${this.baseUrl}/cafes/${encodeURIComponent(id)}`,
      coffeeShopDetailSchema,
    );
  }

  async getCafeBySlug(slug: string): Promise<CoffeeShopDetail> {
    return this.request<CoffeeShopDetail>(
      `${this.baseUrl}/cafes/${encodeURIComponent(slug)}`,
      coffeeShopDetailSchema,
    );
  }
}

export const cafesService = new CafesService();
