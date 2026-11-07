import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { CafesService } from '../../src/cafes/cafes.service';
import { DomainException } from '../../src/common/errors/domain.exception';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createTestPrisma, truncateAll, uniqueSuffix } from './helpers';

function time(hours: number, minutes = 0): Date {
  return new Date(Date.UTC(1970, 0, 1, hours, minutes));
}

describe('Catálogo público (Fase 0)', () => {
  let prisma: PrismaClient;
  let pool: Pool;
  let service: CafesService;

  beforeAll(() => {
    const test = createTestPrisma();
    prisma = test.prisma;
    pool = test.pool;
    service = new CafesService(prisma as unknown as PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  beforeEach(async () => {
    await truncateAll(prisma);
  });

  async function createShop(
    overrides: Partial<{
      name: string;
      status: 'ACTIVE' | 'DRAFT' | 'SUSPENDED';
      neighborhood: string;
      averageRating: string;
      reviewCount: number;
      rating5Count: number;
    }> = {},
  ) {
    const suffix = uniqueSuffix();
    return prisma.coffeeShop.create({
      data: {
        name: overrides.name ?? `Café ${suffix}`,
        slug: `cafe-${suffix}`,
        address: 'Calle de prueba 123',
        neighborhood: overrides.neighborhood ?? 'Centro',
        latitude: '-17.960000',
        longitude: '-67.110000',
        status: overrides.status ?? 'ACTIVE',
        averageRating: overrides.averageRating ?? '0.00',
        reviewCount: overrides.reviewCount ?? 0,
        rating5Count: overrides.rating5Count ?? 0,
      },
    });
  }

  async function createUser(name = 'Autor') {
    return prisma.user.create({
      data: {
        email: `${name.toLowerCase()}-${uniqueSuffix()}@cofi.test`,
        fullName: `${name} de prueba`,
      },
    });
  }

  it('lists only ACTIVE shops, paginated, with decimals as strings', async () => {
    const first = await createShop({
      name: 'Alfa Café',
      averageRating: '4.50',
      reviewCount: 2,
    });
    const second = await createShop({
      name: 'Beta Café',
      averageRating: '4.90',
      reviewCount: 1,
    });
    await createShop({ name: 'Borrador', status: 'DRAFT' });
    await createShop({ name: 'Suspendido', status: 'SUSPENDED' });

    const tag = await prisma.tag.create({
      data: { name: 'Wi-Fi', slug: 'wifi' },
    });
    await prisma.coffeeShopTag.create({
      data: { coffeeShopId: first.id, tagId: tag.id },
    });

    const result = await service.listCafes({
      page: 1,
      limit: 20,
      order: 'rating',
    });

    expect(result.meta).toEqual({
      page: 1,
      limit: 20,
      total: 2,
      totalPages: 1,
    });
    expect(result.data.map((shop) => shop.name)).toEqual([
      'Beta Café',
      'Alfa Café',
    ]);
    expect(result.data[1].averageRating).toBe('4.50');
    expect(result.data[1].latitude).toBe('-17.960000');
    expect(result.data[1].reviewCount).toBe(2);
    expect(result.data[1].tags).toEqual([{ slug: 'wifi', name: 'Wi-Fi' }]);
    expect(result.data[1].id).toBe(first.id);
    expect(result.data[0].id).toBe(second.id);
  });

  it('filters by neighborhood and q, orders by name and paginates', async () => {
    await createShop({ name: 'Uno', neighborhood: 'Centro' });
    await createShop({ name: 'Dos', neighborhood: 'Sud' });
    await createShop({ name: 'Tres', neighborhood: 'Centro' });

    const byNeighborhood = await service.listCafes({
      page: 1,
      limit: 20,
      order: 'name',
      neighborhood: 'Centro',
    });
    expect(byNeighborhood.data.map((shop) => shop.name)).toEqual([
      'Tres',
      'Uno',
    ]);

    const byName = await service.listCafes({
      page: 1,
      limit: 20,
      order: 'name',
    });
    expect(byName.data.map((shop) => shop.name)).toEqual([
      'Dos',
      'Tres',
      'Uno',
    ]);

    const byQuery = await service.listCafes({
      page: 1,
      limit: 20,
      order: 'name',
      q: 'dos',
    });
    expect(byQuery.data.map((shop) => shop.name)).toEqual(['Dos']);

    const page2 = await service.listCafes({
      page: 2,
      limit: 2,
      order: 'name',
    });
    expect(page2.meta).toEqual({
      page: 2,
      limit: 2,
      total: 3,
      totalPages: 2,
    });
    expect(page2.data.map((shop) => shop.name)).toEqual(['Uno']);
  });

  it('returns the full detail with hours, tags, grouped menu, stats and published reviews', async () => {
    const shop = await createShop({
      name: 'Detalle Café',
      averageRating: '4.50',
      reviewCount: 1,
      rating5Count: 1,
    });
    const tag = await prisma.tag.create({
      data: { name: 'Para trabajar', slug: 'para-trabajar' },
    });
    await prisma.coffeeShopTag.create({
      data: { coffeeShopId: shop.id, tagId: tag.id },
    });

    await prisma.openingHours.create({
      data: {
        coffeeShopId: shop.id,
        dayOfWeek: 1,
        openTime: time(9),
        closeTime: time(18, 30),
      },
    });
    await prisma.specialHours.create({
      data: {
        coffeeShopId: shop.id,
        date: new Date('2026-12-24'),
        isClosed: true,
      },
    });

    const drinks = await prisma.category.create({
      data: {
        name: 'Bebidas calientes',
        slug: 'cafes-calientes',
        sortOrder: 1,
      },
    });
    const sweets = await prisma.category.create({
      data: { name: 'Repostería', slug: 'reposteria', sortOrder: 3 },
    });

    await prisma.menuItem.createMany({
      data: [
        {
          coffeeShopId: shop.id,
          categoryId: drinks.id,
          name: 'Cappuccino',
          description: 'Espresso con leche',
          price: '16.50',
          sortOrder: 2,
        },
        {
          coffeeShopId: shop.id,
          categoryId: drinks.id,
          name: 'Americano',
          price: '10.00',
          sortOrder: 1,
        },
        {
          coffeeShopId: shop.id,
          categoryId: sweets.id,
          name: 'Torta',
          price: '12.50',
          sortOrder: 1,
        },
      ],
    });

    const author = await createUser('Publicado');
    const hiddenAuthor = await createUser('Oculto');
    const published = await prisma.review.create({
      data: {
        coffeeShopId: shop.id,
        authorId: author.id,
        rating: '4.5',
        comment: 'Muy bueno',
        status: 'PUBLISHED',
      },
    });
    await prisma.review.create({
      data: {
        coffeeShopId: shop.id,
        authorId: hiddenAuthor.id,
        rating: '1.0',
        comment: 'Oculta',
        status: 'HIDDEN',
      },
    });
    await prisma.reviewPhoto.create({
      data: {
        reviewId: published.id,
        url: 'https://example.com/foto.jpg',
        publicId: 'cofi/foto',
      },
    });

    const detail = await service.getCafeBySlug(shop.slug);

    expect(detail.name).toBe('Detalle Café');
    expect(detail.latitude).toBe('-17.960000');
    expect(detail.averageRating).toBe('4.50');
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
    expect(detail.tags).toEqual([
      { slug: 'para-trabajar', name: 'Para trabajar' },
    ]);

    const drinkGroup = detail.menu.find(
      (group) => group.category.slug === 'cafes-calientes',
    );
    expect(drinkGroup?.items.map((item) => item.name)).toEqual([
      'Americano',
      'Cappuccino',
    ]);
    expect(drinkGroup?.items[1].price).toBe('16.50');
    expect(detail.menu).toHaveLength(2);

    expect(detail.stats).toEqual({
      averageRating: '4.50',
      reviewCount: 1,
      verifiedReviewCount: 0,
      ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 },
    });

    expect(detail.latestReviews).toHaveLength(1);
    expect(detail.latestReviews[0].id).toBe(published.id);
    expect(detail.latestReviews[0].rating).toBe('4.5');
    expect(detail.latestReviews[0].author.id).toBe(author.id);
    expect(detail.latestReviews[0].photos).toEqual([
      { url: 'https://example.com/foto.jpg' },
    ]);
  });

  it('serves menu and reviews with pagination and rejects non-ACTIVE shops', async () => {
    const shop = await createShop();
    const category = await prisma.category.create({
      data: { name: 'Bebidas frías', slug: 'bebidas-frias', sortOrder: 2 },
    });
    await prisma.menuItem.create({
      data: {
        coffeeShopId: shop.id,
        categoryId: category.id,
        name: 'Cold brew',
        price: '20.00',
      },
    });

    const users = await Promise.all([
      createUser('Uno'),
      createUser('Dos'),
      createUser('Tres'),
    ]);
    for (const [index, user] of users.entries()) {
      await prisma.review.create({
        data: {
          coffeeShopId: shop.id,
          authorId: user.id,
          rating: '4.0',
          comment: `Reseña ${index}`,
          status: 'PUBLISHED',
          createdAt: new Date(Date.now() - index * 1_000),
        },
      });
    }

    const menu = await service.getMenu(shop.slug);
    expect(menu).toHaveLength(1);
    expect(menu[0].items[0].price).toBe('20.00');

    const reviews = await service.getReviews(shop.slug, { page: 1, limit: 2 });
    expect(reviews.meta).toEqual({
      page: 1,
      limit: 2,
      total: 3,
      totalPages: 2,
    });
    expect(reviews.data).toHaveLength(2);

    const page2 = await service.getReviews(shop.slug, { page: 2, limit: 2 });
    expect(page2.data).toHaveLength(1);

    const draft = await createShop({ status: 'DRAFT' });
    try {
      await service.getCafeBySlug(draft.slug);
      throw new Error('Expected a DomainException');
    } catch (error) {
      expect(error).toBeInstanceOf(DomainException);
      expect(
        (error as DomainException).getResponse() as { code?: string },
      ).toMatchObject({ code: 'CAFE_NOT_FOUND' });
    }
  });
});
