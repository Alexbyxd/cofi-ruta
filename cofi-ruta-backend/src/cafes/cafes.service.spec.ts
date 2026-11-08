import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { CafesService } from './cafes.service';
import { PrismaService } from '../prisma/prisma.service';

const decimal = (value: string) => new Prisma.Decimal(value);

const tag = { id: 'tag-1', name: 'Wi-Fi', slug: 'wifi' };

function shopRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'shop-1',
    name: 'Alfa Café',
    slug: 'alfa-cafe',
    description: null,
    address: 'Calle 1',
    neighborhood: 'Centro',
    latitude: decimal('-17.96'),
    longitude: decimal('-67.11'),
    phone: null,
    whatsapp: null,
    instagram: null,
    coverUrl: null,
    status: 'ACTIVE',
    averageRating: decimal('4.5'),
    reviewCount: 2,
    verifiedReviewCount: 1,
    rating1Count: 0,
    rating2Count: 0,
    rating3Count: 0,
    rating4Count: 1,
    rating5Count: 1,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    tags: [{ tag }],
    ...overrides,
  };
}

function menuItem(overrides: Record<string, unknown> = {}) {
  return {
    id: 'item-1',
    coffeeShopId: 'shop-1',
    categoryId: 'cat-1',
    name: 'Cappuccino',
    description: 'Espresso con leche',
    price: decimal('16.5'),
    imageUrl: null,
    isAvailable: true,
    isFeatured: false,
    sortOrder: 2,
    archivedAt: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    category: {
      id: 'cat-1',
      name: 'Bebidas calientes',
      slug: 'bebidas-calientes',
      sortOrder: 1,
      icon: null,
      createdAt: new Date('2026-01-01T00:00:00Z'),
    },
    ...overrides,
  };
}

function reviewRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'review-1',
    coffeeShopId: 'shop-1',
    authorId: 'user-1',
    coupleLinkId: null,
    visitId: null,
    rating: decimal('4.5'),
    comment: 'Muy bueno',
    status: 'PUBLISHED',
    moderatedById: null,
    moderatedAt: null,
    moderationReason: null,
    deletedAt: null,
    createdAt: new Date('2026-01-02T00:00:00Z'),
    updatedAt: new Date('2026-01-02T00:00:00Z'),
    author: { id: 'user-1', fullName: 'Ana', avatarUrl: null },
    photos: [{ url: 'https://example.com/foto.jpg' }],
    visit: null,
    ...overrides,
  };
}

describe('CafesService', () => {
  let service: CafesService;
  let prisma: {
    coffeeShop: { findMany: jest.Mock; count: jest.Mock; findFirst: jest.Mock };
    review: { findMany: jest.Mock; count: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      coffeeShop: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
      },
      review: { findMany: jest.fn(), count: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CafesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<CafesService>(CafesService);
  });

  it('lists only ACTIVE shops with filters, decimals as strings and pagination meta', async () => {
    prisma.coffeeShop.findMany.mockResolvedValue([shopRow()]);
    prisma.coffeeShop.count.mockResolvedValue(1);

    const result = await service.listCafes({
      page: 2,
      limit: 10,
      order: 'name',
      neighborhood: 'Centro',
      q: 'alfa',
    });

    const args = prisma.coffeeShop.findMany.mock.calls[0][0];
    expect(args.where).toMatchObject({
      status: 'ACTIVE',
      neighborhood: { equals: 'Centro', mode: 'insensitive' },
    });
    expect(args.where.OR).toHaveLength(3);
    expect(args.orderBy).toEqual([{ name: 'asc' }, { id: 'asc' }]);
    expect(args.skip).toBe(10);
    expect(args.take).toBe(10);

    expect(result.meta).toEqual({
      page: 2,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
    expect(result.data[0]).toMatchObject({
      id: 'shop-1',
      averageRating: '4.50',
      latitude: '-17.960000',
      longitude: '-67.110000',
      tags: [{ slug: 'wifi', name: 'Wi-Fi' }],
    });
  });

  it('returns 0 total pages when there are no shops', async () => {
    prisma.coffeeShop.findMany.mockResolvedValue([]);
    prisma.coffeeShop.count.mockResolvedValue(0);

    const result = await service.listCafes({
      page: 1,
      limit: 20,
      order: 'rating',
    });

    expect(result.meta).toEqual({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    });
    expect(result.data).toEqual([]);
  });

  it('maps the detail with hours, grouped menu, stats and published reviews', async () => {
    prisma.coffeeShop.findFirst.mockResolvedValue(
      shopRow({
        openingHours: [
          {
            dayOfWeek: 1,
            openTime: new Date(Date.UTC(1970, 0, 1, 9)),
            closeTime: new Date(Date.UTC(1970, 0, 1, 18, 30)),
          },
        ],
        specialHours: [
          {
            date: new Date('2026-12-24'),
            isClosed: true,
            openTime: null,
            closeTime: null,
            note: null,
          },
        ],
        menuItems: [
          menuItem({
            id: 'item-2',
            name: 'Americano',
            sortOrder: 1,
            price: decimal('10'),
          }),
          menuItem(),
          menuItem({
            id: 'item-3',
            categoryId: 'cat-2',
            name: 'Torta',
            price: decimal('12.5'),
            category: {
              id: 'cat-2',
              name: 'Repostería',
              slug: 'reposteria',
              sortOrder: 3,
              icon: null,
            },
          }),
        ],
        reviews: [reviewRow()],
      }),
    );

    const detail = await service.getCafeBySlug('alfa-cafe');

    expect(prisma.coffeeShop.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'alfa-cafe', status: 'ACTIVE' },
      }),
    );
    expect(detail.openingHours).toEqual([
      { dayOfWeek: 1, openTime: '09:00', closeTime: '18:30' },
    ]);
    expect(detail.specialHours).toEqual([
      {
        date: '2026-12-24',
        isClosed: true,
        openTime: null,
        closeTime: null,
        note: null,
      },
    ]);
    expect(detail.menu.map((group) => group.category.slug)).toEqual([
      'bebidas-calientes',
      'reposteria',
    ]);
    expect(detail.menu[0].items.map((item) => item.name)).toEqual([
      'Americano',
      'Cappuccino',
    ]);
    expect(detail.menu[0].items[1].price).toBe('16.50');
    expect(detail.stats).toEqual({
      averageRating: '4.50',
      reviewCount: 2,
      verifiedReviewCount: 1,
      ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 },
    });
    expect(detail.latestReviews[0]).toMatchObject({
      id: 'review-1',
      rating: '4.5',
      verified: false,
      author: { id: 'user-1', fullName: 'Ana' },
      photos: [{ url: 'https://example.com/foto.jpg' }],
    });
  });

  it('rejects a missing or non-ACTIVE slug with CAFE_NOT_FOUND', async () => {
    prisma.coffeeShop.findFirst.mockResolvedValue(null);

    await expect(service.getCafeBySlug('no-existe')).rejects.toMatchObject({
      code: 'CAFE_NOT_FOUND',
    });
    await expect(service.getMenu('no-existe')).rejects.toMatchObject({
      code: 'CAFE_NOT_FOUND',
    });
    await expect(
      service.getReviews('no-existe', { page: 1, limit: 20 }),
    ).rejects.toMatchObject({ code: 'CAFE_NOT_FOUND' });
  });

  it('serves only PUBLISHED reviews with pagination', async () => {
    prisma.coffeeShop.findFirst.mockResolvedValue({ id: 'shop-1' });
    prisma.review.findMany.mockResolvedValue([reviewRow()]);
    prisma.review.count.mockResolvedValue(3);

    const result = await service.getReviews('alfa-cafe', {
      page: 2,
      limit: 2,
    });

    expect(prisma.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { coffeeShopId: 'shop-1', status: 'PUBLISHED' },
        skip: 2,
        take: 2,
      }),
    );
    expect(result.meta).toEqual({
      page: 2,
      limit: 2,
      total: 3,
      totalPages: 2,
    });
    expect(result.data[0].rating).toBe('4.5');
  });
});
