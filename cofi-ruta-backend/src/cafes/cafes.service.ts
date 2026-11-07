import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { cafesErrors } from './cafes.errors';
import type {
  CafeDetailDto,
  CafeListItemDto,
  CafeStatsDto,
  ListCafesQueryDto,
  MenuGroupDto,
  MenuItemDto,
  OpeningHoursDto,
  PaginatedCafesDto,
  PaginatedReviewsDto,
  ReviewDto,
  ReviewPaginationQueryDto,
  SpecialHoursDto,
} from './dto/cafes.dto';

const PUBLIC_REVIEWS_IN_DETAIL = 3;

const publicAuthorSelect = {
  id: true,
  fullName: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

const listInclude = {
  tags: { include: { tag: true } },
} satisfies Prisma.CoffeeShopInclude;

const menuItemInclude = { category: true } satisfies Prisma.MenuItemInclude;

const reviewInclude = {
  author: { select: publicAuthorSelect },
  photos: { orderBy: { sortOrder: 'asc' } },
  visit: { select: { status: true } },
} satisfies Prisma.ReviewInclude;

const menuOrderBy: Prisma.MenuItemOrderByWithRelationInput[] = [
  { category: { sortOrder: 'asc' } },
  { sortOrder: 'asc' },
  { name: 'asc' },
];

const detailInclude = {
  ...listInclude,
  openingHours: { orderBy: [{ dayOfWeek: 'asc' }, { openTime: 'asc' }] },
  specialHours: { orderBy: { date: 'asc' } },
  menuItems: {
    where: { archivedAt: null },
    orderBy: menuOrderBy,
    include: menuItemInclude,
  },
  reviews: {
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
    take: PUBLIC_REVIEWS_IN_DETAIL,
    include: reviewInclude,
  },
} satisfies Prisma.CoffeeShopInclude;

type ShopWithTags = Prisma.CoffeeShopGetPayload<{
  include: typeof listInclude;
}>;
type MenuItemWithCategory = Prisma.MenuItemGetPayload<{
  include: typeof menuItemInclude;
}>;

interface ShopRatingFields {
  averageRating: Prisma.Decimal;
  reviewCount: number;
  verifiedReviewCount: number;
  rating1Count: number;
  rating2Count: number;
  rating3Count: number;
  rating4Count: number;
  rating5Count: number;
}

function formatTime(value: Date): string {
  const hours = String(value.getUTCHours()).padStart(2, '0');
  const minutes = String(value.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatOptionalTime(value: Date | null): string | null {
  return value ? formatTime(value) : null;
}

function formatDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function paginationMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}

@Injectable()
export class CafesService {
  constructor(private readonly prisma: PrismaService) {}

  async listCafes(query: ListCafesQueryDto): Promise<PaginatedCafesDto> {
    const { page, limit } = query;
    const where: Prisma.CoffeeShopWhereInput = { status: 'ACTIVE' };

    if (query.neighborhood) {
      where.neighborhood = {
        equals: query.neighborhood,
        mode: 'insensitive',
      };
    }

    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
        { neighborhood: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.CoffeeShopOrderByWithRelationInput[] =
      query.order === 'name'
        ? [{ name: 'asc' }, { id: 'asc' }]
        : [{ averageRating: 'desc' }, { name: 'asc' }, { id: 'asc' }];

    const [rows, total] = await Promise.all([
      this.prisma.coffeeShop.findMany({
        where,
        include: listInclude,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.coffeeShop.count({ where }),
    ]);

    return {
      data: rows.map((row) => this.toListItem(row)),
      meta: paginationMeta(page, limit, total),
    };
  }

  async getCafeBySlug(slug: string): Promise<CafeDetailDto> {
    const shop = await this.prisma.coffeeShop.findFirst({
      where: { slug, status: 'ACTIVE' },
      include: detailInclude,
    });

    if (!shop) {
      throw cafesErrors.notFound();
    }

    const openingHours: OpeningHoursDto[] = shop.openingHours.map((row) => ({
      dayOfWeek: row.dayOfWeek,
      openTime: formatTime(row.openTime),
      closeTime: formatTime(row.closeTime),
    }));

    const specialHours: SpecialHoursDto[] = shop.specialHours.map((row) => ({
      date: formatDate(row.date),
      isClosed: row.isClosed,
      openTime: formatOptionalTime(row.openTime),
      closeTime: formatOptionalTime(row.closeTime),
      note: row.note,
    }));

    return {
      ...this.toListItem(shop),
      phone: shop.phone,
      whatsapp: shop.whatsapp,
      instagram: shop.instagram,
      openingHours,
      specialHours,
      menu: this.groupMenu(shop.menuItems),
      stats: this.toStats(shop),
      latestReviews: shop.reviews.map((review) => this.toReview(review)),
    };
  }

  async getMenu(slug: string): Promise<MenuGroupDto[]> {
    const shop = await this.prisma.coffeeShop.findFirst({
      where: { slug, status: 'ACTIVE' },
      select: {
        menuItems: {
          where: { archivedAt: null },
          orderBy: menuOrderBy,
          include: menuItemInclude,
        },
      },
    });

    if (!shop) {
      throw cafesErrors.notFound();
    }

    return this.groupMenu(shop.menuItems);
  }

  async getReviews(
    slug: string,
    query: ReviewPaginationQueryDto,
  ): Promise<PaginatedReviewsDto> {
    const shop = await this.prisma.coffeeShop.findFirst({
      where: { slug, status: 'ACTIVE' },
      select: { id: true },
    });

    if (!shop) {
      throw cafesErrors.notFound();
    }

    const { page, limit } = query;
    const where: Prisma.ReviewWhereInput = {
      coffeeShopId: shop.id,
      status: 'PUBLISHED',
    };

    const [rows, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: reviewInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      data: rows.map((row) => this.toReview(row)),
      meta: paginationMeta(page, limit, total),
    };
  }

  private toListItem(shop: ShopWithTags): CafeListItemDto {
    return {
      id: shop.id,
      name: shop.name,
      slug: shop.slug,
      description: shop.description,
      address: shop.address,
      neighborhood: shop.neighborhood,
      latitude: shop.latitude.toFixed(6),
      longitude: shop.longitude.toFixed(6),
      averageRating: shop.averageRating.toFixed(2),
      reviewCount: shop.reviewCount,
      verifiedReviewCount: shop.verifiedReviewCount,
      coverUrl: shop.coverUrl,
      tags: shop.tags.map((row) => ({
        slug: row.tag.slug,
        name: row.tag.name,
      })),
    };
  }

  private toStats(shop: ShopRatingFields): CafeStatsDto {
    return {
      averageRating: shop.averageRating.toFixed(2),
      reviewCount: shop.reviewCount,
      verifiedReviewCount: shop.verifiedReviewCount,
      ratingCounts: {
        1: shop.rating1Count,
        2: shop.rating2Count,
        3: shop.rating3Count,
        4: shop.rating4Count,
        5: shop.rating5Count,
      },
    };
  }

  private groupMenu(items: MenuItemWithCategory[]): MenuGroupDto[] {
    const groups = new Map<string, MenuGroupDto>();

    for (const item of items) {
      let group = groups.get(item.categoryId);

      if (!group) {
        group = {
          category: {
            id: item.category.id,
            name: item.category.name,
            slug: item.category.slug,
            sortOrder: item.category.sortOrder,
            icon: item.category.icon,
          },
          items: [],
        };
        groups.set(item.categoryId, group);
      }

      group.items.push(this.toMenuItem(item));
    }

    return [...groups.values()];
  }

  private toMenuItem(item: MenuItemWithCategory): MenuItemDto {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price.toFixed(2),
      imageUrl: item.imageUrl,
      isAvailable: item.isAvailable,
      isFeatured: item.isFeatured,
      sortOrder: item.sortOrder,
    };
  }

  private toReview(review: ReviewRow): ReviewDto {
    return {
      id: review.id,
      rating: review.rating.toFixed(1),
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
      verified: review.visit?.status === 'VERIFIED',
      author: {
        id: review.author.id,
        fullName: review.author.fullName,
        avatarUrl: review.author.avatarUrl,
      },
      photos: review.photos.map((photo) => ({ url: photo.url })),
    };
  }
}

type ReviewRow = Prisma.ReviewGetPayload<{ include: typeof reviewInclude }>;
