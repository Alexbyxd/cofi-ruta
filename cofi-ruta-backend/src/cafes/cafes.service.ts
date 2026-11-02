import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { ListCafesQueryDto, CoffeeShopDetailDto } from './dto/cafes.dto';

@Injectable()
export class CafesService {
  constructor(private readonly prisma: PrismaService) {}

  async listCafes(query: ListCafesQueryDto) {
    const { neighborhood, isOpen, search, limit, offset } = query;

    const where: Record<string, unknown> = {};

    if (neighborhood) {
      where.neighborhood = neighborhood;
    }

    if (typeof isOpen === 'boolean') {
      where.isOpen = isOpen;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { neighborhood: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [cafes, total] = await Promise.all([
      this.prisma.coffeeShop.findMany({
        where,
        include: {
          products: {
            where: { isAvailable: true },
            orderBy: { name: 'asc' },
          },
        },
        orderBy: [{ isOpen: 'desc' }, { rating: 'desc' }, { name: 'asc' }],
        take: limit,
        skip: offset,
      }),
      this.prisma.coffeeShop.count({ where }),
    ]);

    return {
      cafes: cafes.map((cafe) => ({
        ...cafe,
        rating: cafe.rating ? String(cafe.rating) : null,
        createdAt: cafe.createdAt.toISOString(),
        updatedAt: cafe.updatedAt.toISOString(),
        products: cafe.products.map((product) => ({
          ...product,
          price: String(product.price),
          createdAt: product.createdAt.toISOString(),
          updatedAt: product.updatedAt.toISOString(),
        })),
      })),
      total,
      limit,
      offset,
    };
  }

  async getCafeById(id: string): Promise<CoffeeShopDetailDto> {
    const cafe = await this.prisma.coffeeShop.findUnique({
      where: { id },
      include: {
        products: {
          where: { isAvailable: true },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!cafe) {
      throw new NotFoundException('Cafetería no encontrada');
    }

    return {
      ...cafe,
      rating: cafe.rating ? String(cafe.rating) : null,
      createdAt: cafe.createdAt.toISOString(),
      updatedAt: cafe.updatedAt.toISOString(),
      products: cafe.products.map((product) => ({
        ...product,
        price: String(product.price),
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      })),
    };
  }

  async getCafeBySlug(slug: string): Promise<CoffeeShopDetailDto> {
    const cafe = await this.prisma.coffeeShop.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isAvailable: true },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!cafe) {
      throw new NotFoundException('Cafetería no encontrada');
    }

    return {
      ...cafe,
      rating: cafe.rating ? String(cafe.rating) : null,
      createdAt: cafe.createdAt.toISOString(),
      updatedAt: cafe.updatedAt.toISOString(),
      products: cafe.products.map((product) => ({
        ...product,
        price: String(product.price),
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      })),
    };
  }
}
