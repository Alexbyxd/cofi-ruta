import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { createTestPrisma, truncateAll, uniqueSuffix } from './helpers';

const ID = {
  userA: '01900000-0000-7000-8000-00000000000a',
  userB: '01900000-0000-7000-8000-00000000000b',
  userC: '01900000-0000-7000-8000-00000000000c',
  userD: '01900000-0000-7000-8000-00000000000d',
  shop: '01900000-0000-7000-8000-000000000001',
  category: '01900000-0000-7000-8000-000000000002',
  couple: '01900000-0000-7000-8000-000000000003',
  group: '01900000-0000-7000-8000-000000000004',
  visit: '01900000-0000-7000-8000-000000000005',
  item: '01900000-0000-7000-8000-000000000006',
};

const visitDate = new Date('2026-11-05T00:00:00.000Z');

describe('DB constraints and indexes (Fase 0)', () => {
  let prisma: PrismaClient;
  let pool: Pool;

  beforeAll(() => {
    const test = createTestPrisma();
    prisma = test.prisma;
    pool = test.pool;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  beforeEach(async () => {
    await truncateAll(prisma);
    await createBaseFixtures();
  });

  async function createBaseFixtures() {
    await prisma.user.createMany({
      data: [
        { id: ID.userA, email: 'a@test.local', fullName: 'User A' },
        { id: ID.userB, email: 'b@test.local', fullName: 'User B' },
        { id: ID.userC, email: 'c@test.local', fullName: 'User C' },
        { id: ID.userD, email: 'd@test.local', fullName: 'User D' },
      ],
    });

    await prisma.coffeeShop.create({
      data: {
        id: ID.shop,
        name: 'Café de prueba',
        slug: `cafe-${uniqueSuffix()}`,
        address: 'Calle 1',
        latitude: '-17.964700',
        longitude: '-67.107800',
        status: 'ACTIVE',
      },
    });

    await prisma.category.create({
      data: {
        id: ID.category,
        name: 'Categoría de prueba',
        slug: `cat-${uniqueSuffix()}`,
      },
    });

    await prisma.menuItem.create({
      data: {
        id: ID.item,
        coffeeShopId: ID.shop,
        categoryId: ID.category,
        name: 'Submarino con churros',
        description: 'Chocolate caliente con churros',
        price: '12.50',
      },
    });

    await prisma.coupleLink.create({
      data: {
        id: ID.couple,
        userAId: ID.userA,
        userBId: ID.userB,
        status: 'ACTIVE',
      },
    });

    await prisma.groupRoom.create({
      data: {
        id: ID.group,
        name: 'Grupo de prueba',
        code: `T${uniqueSuffix()}`.slice(0, 6).toUpperCase(),
        hostId: ID.userA,
        expiresAt: new Date('2026-11-06T12:00:00.000Z'),
      },
    });
  }

  it('rejects a rating outside 1.0..5.0 or not in 0.5 steps', async () => {
    const base = {
      coffeeShopId: ID.shop,
      authorId: ID.userA,
      rating: '4.3',
    };

    await expect(prisma.review.create({ data: base })).rejects.toThrow();
    await expect(
      prisma.review.create({ data: { ...base, rating: '5.5' } }),
    ).rejects.toThrow();
    await expect(
      prisma.review.create({ data: { ...base, rating: '4.5' } }),
    ).resolves.toBeTruthy();
  });

  it('rejects a PIN that is not exactly four digits', async () => {
    const base = {
      coffeeShopId: ID.shop,
      date: visitDate,
      expiresAt: new Date('2026-11-05T23:59:59.000Z'),
    };

    await expect(
      prisma.dailyPin.create({ data: { ...base, pinCode: '12a4' } }),
    ).rejects.toThrow();
    await expect(
      prisma.dailyPin.create({ data: { ...base, pinCode: '12345' } }),
    ).rejects.toThrow();
    await expect(
      prisma.dailyPin.create({ data: { ...base, pinCode: '1234' } }),
    ).resolves.toBeTruthy();
  });

  it('rejects a visit whose context does not match its link columns', async () => {
    const base = {
      coffeeShopId: ID.shop,
      createdById: ID.userA,
      visitDate,
    };

    await expect(
      prisma.visit.create({
        data: { ...base, context: 'SOLO', coupleLinkId: ID.couple },
      }),
    ).rejects.toThrow();

    await expect(
      prisma.visit.create({
        data: { ...base, context: 'DUO', coupleLinkId: null },
      }),
    ).rejects.toThrow();

    await expect(
      prisma.visit.create({
        data: { ...base, context: 'GROUP', groupId: ID.group },
      }),
    ).resolves.toBeTruthy();
  });

  it('enforces canonical couple order and one active link per user', async () => {
    await expect(
      prisma.coupleLink.create({
        data: { userAId: ID.userB, userBId: ID.userA, status: 'ARCHIVED' },
      }),
    ).rejects.toThrow();

    await expect(
      prisma.coupleLink.create({
        data: { userAId: ID.userC, userBId: ID.userD, status: 'ACTIVE' },
      }),
    ).resolves.toBeTruthy();

    await expect(
      prisma.coupleLink.create({
        data: { userAId: ID.userA, userBId: ID.userC, status: 'ACTIVE' },
      }),
    ).rejects.toThrow();
  });

  it('allows a new couple link after the previous one is archived', async () => {
    await prisma.coupleLink.update({
      where: { id: ID.couple },
      data: { status: 'ARCHIVED', archivedAt: new Date() },
    });

    const firstArchive = await prisma.coupleLink.create({
      data: { userAId: ID.userA, userBId: ID.userB, status: 'ARCHIVED' },
    });
    const secondArchive = await prisma.coupleLink.create({
      data: { userAId: ID.userA, userBId: ID.userB, status: 'ARCHIVED' },
    });
    const newActive = await prisma.coupleLink.create({
      data: { userAId: ID.userA, userBId: ID.userB, status: 'ACTIVE' },
    });

    expect(firstArchive.id).toBeTruthy();
    expect(secondArchive.id).toBeTruthy();
    expect(newActive.id).toBeTruthy();
  });

  it('keeps one non-deleted couple review per shop', async () => {
    const base = {
      coffeeShopId: ID.shop,
      coupleLinkId: ID.couple,
      rating: '4.5',
    };

    const first = await prisma.review.create({
      data: { ...base, authorId: ID.userA, status: 'PUBLISHED' },
    });

    await expect(
      prisma.review.create({
        data: { ...base, authorId: ID.userB, status: 'PUBLISHED' },
      }),
    ).rejects.toThrow();

    await prisma.review.update({
      where: { id: first.id },
      data: { status: 'HIDDEN' },
    });

    await expect(
      prisma.review.create({
        data: { ...base, authorId: ID.userB, status: 'PUBLISHED' },
      }),
    ).rejects.toThrow();

    await prisma.review.update({
      where: { id: first.id },
      data: { status: 'DELETED', deletedAt: new Date() },
    });

    await expect(
      prisma.review.create({
        data: { ...base, authorId: ID.userB, status: 'PUBLISHED' },
      }),
    ).resolves.toBeTruthy();
  });

  it('keeps one active match session per couple and per group', async () => {
    const base = {
      context: 'DUO' as const,
      coupleLinkId: ID.couple,
      deckSeed: 'seed',
      expiresAt: new Date('2026-11-05T13:00:00.000Z'),
    };

    const first = await prisma.matchSession.create({
      data: { ...base, status: 'WAITING' },
    });

    await expect(
      prisma.matchSession.create({ data: { ...base, status: 'ACTIVE' } }),
    ).rejects.toThrow();

    await prisma.matchSession.update({
      where: { id: first.id },
      data: { status: 'CANCELLED' },
    });

    await expect(
      prisma.matchSession.create({ data: { ...base, status: 'WAITING' } }),
    ).resolves.toBeTruthy();

    const groupBase = {
      context: 'GROUP' as const,
      groupId: ID.group,
      deckSeed: 'seed',
      expiresAt: new Date('2026-11-05T13:00:00.000Z'),
    };

    await prisma.matchSession.create({
      data: { ...groupBase, status: 'ACTIVE' },
    });
    await expect(
      prisma.matchSession.create({
        data: { ...groupBase, status: 'WAITING' },
      }),
    ).rejects.toThrow();
  });

  it('rejects negative money, zero quantity and out-of-range coordinates', async () => {
    await expect(
      prisma.coffeeShop.create({
        data: {
          name: 'Fuera de rango',
          slug: `out-${uniqueSuffix()}`,
          address: 'Calle 2',
          latitude: '91.000000',
          longitude: '-67.107800',
        },
      }),
    ).rejects.toThrow();

    const visit = await prisma.visit.create({
      data: {
        coffeeShopId: ID.shop,
        createdById: ID.userA,
        context: 'SOLO',
        visitDate,
      },
    });

    await expect(
      prisma.visitItem.create({
        data: {
          visitId: visit.id,
          menuItemId: ID.item,
          itemName: 'Submarino',
          quantity: 0,
          unitPrice: '12.50',
        },
      }),
    ).rejects.toThrow();

    await expect(
      prisma.visit.update({
        where: { id: visit.id },
        data: { totalSpent: '-1.00' },
      }),
    ).rejects.toThrow();
  });

  it('enforces one verified visit per user, shop and date', async () => {
    const visit = await prisma.visit.create({
      data: {
        coffeeShopId: ID.shop,
        createdById: ID.userA,
        context: 'SOLO',
        visitDate,
        status: 'VERIFIED',
      },
    });

    const base = {
      visitId: visit.id,
      userId: ID.userA,
      coffeeShopId: ID.shop,
      visitDate,
    };

    await prisma.verifiedVisit.create({ data: base });
    await expect(
      prisma.verifiedVisit.create({
        data: { ...base, visitId: visit.id },
      }),
    ).rejects.toThrow();
  });

  it('exposes unaccent, Spanish FTS and trigram search', async () => {
    const matches = await prisma.$queryRaw<{ id: string }[]>`
      SELECT "id"
      FROM "MenuItem"
      WHERE to_tsvector(
        'spanish',
        cofi_unaccent("name" || ' ' || coalesce("description", ''))
      ) @@ plainto_tsquery('spanish', cofi_unaccent('submarino'))
    `;

    expect(matches.map((row) => row.id)).toContain(ID.item);

    const unaccented = await prisma.$queryRaw<{ value: string }[]>`
      SELECT cofi_unaccent('Café de especialidad') AS value
    `;
    expect(unaccented[0]?.value).toBe('Cafe de especialidad');

    const trigram = await prisma.$queryRaw<{ id: string }[]>`
      SELECT "id" FROM "MenuItem" WHERE "name" % 'submarin'
    `;
    expect(trigram.map((row) => row.id)).toContain(ID.item);
  });

  it('creates the expected partial, GIN and query indexes', async () => {
    const indexes = await prisma.$queryRaw<{ indexname: string }[]>`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
    `;

    const names = indexes.map((row) => row.indexname);
    expect(names).toEqual(
      expect.arrayContaining([
        'couple_link_active_user_a_key',
        'couple_link_active_user_b_key',
        'review_couple_unique_key',
        'match_session_active_couple_key',
        'match_session_active_group_key',
        'menu_item_fts_spanish_idx',
        'menu_item_name_trgm_idx',
        'coffee_shop_name_trgm_idx',
      ]),
    );
  });
});
