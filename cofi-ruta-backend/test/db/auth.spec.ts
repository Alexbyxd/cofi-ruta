import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { createTestPrisma, truncateAll, uniqueSuffix } from './helpers';

const PASSWORD = 'secreto123';
const BCRYPT_ROUNDS = 12;

/**
 * Better Auth owns sign-up/sign-in flows; these DB tests pin the contract the
 * rest of the app depends on: credential accounts, identity uniqueness and
 * referential integrity.
 */
describe('Auth data contract (Better Auth)', () => {
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
  });

  function createUser(name = 'Persona') {
    return prisma.user.create({
      data: {
        email: `${name.toLowerCase().replace(/\s+/g, '-')}-${uniqueSuffix()}@cofi.test`,
        fullName: `${name} de prueba`,
      },
    });
  }

  it('stores credential passwords on Account using bcrypt cost 12', async () => {
    const user = await createUser('Ana');
    const password = await bcrypt.hash(PASSWORD, BCRYPT_ROUNDS);

    await prisma.account.create({
      data: {
        userId: user.id,
        providerId: 'credential',
        accountId: user.id,
        password,
      },
    });

    const account = await prisma.account.findUniqueOrThrow({
      where: {
        providerId_accountId: {
          providerId: 'credential',
          accountId: user.id,
        },
      },
    });

    expect(account.password).toMatch(/^\$2[aby]\$12\$/);
    expect(await bcrypt.compare(PASSWORD, account.password!)).toBe(true);
    expect(await bcrypt.compare('otra-clave', account.password!)).toBe(false);
  });

  it('keeps one credential account per user', async () => {
    const user = await createUser('Beto');
    const password = await bcrypt.hash(PASSWORD, BCRYPT_ROUNDS);
    const data = {
      userId: user.id,
      providerId: 'credential',
      accountId: user.id,
      password,
    };

    await prisma.account.create({ data });

    await expect(prisma.account.create({ data })).rejects.toMatchObject({
      code: 'P2002',
    });
  });

  it('keeps one external account per provider identity', async () => {
    const first = await createUser('Uno');
    const second = await createUser('Dos');
    const identity = {
      providerId: 'google',
      accountId: `google-${uniqueSuffix()}`,
    };

    await prisma.account.create({ data: { ...identity, userId: first.id } });

    await expect(
      prisma.account.create({ data: { ...identity, userId: second.id } }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });

  it('rejects duplicate emails', async () => {
    const user = await createUser('Carla');

    await expect(
      prisma.user.create({
        data: { email: user.email, fullName: 'Otra Carla' },
      }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });

  it('rejects duplicate session tokens', async () => {
    const user = await createUser('Dani');
    const token = `token-${uniqueSuffix()}`;
    const data = {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 60_000),
    };

    await prisma.session.create({ data });

    await expect(prisma.session.create({ data })).rejects.toMatchObject({
      code: 'P2002',
    });
  });

  it('cascades accounts and sessions when a user is deleted', async () => {
    const user = await createUser('Eli');

    await prisma.account.create({
      data: {
        userId: user.id,
        providerId: 'credential',
        accountId: user.id,
        password: await bcrypt.hash(PASSWORD, BCRYPT_ROUNDS),
      },
    });
    await prisma.session.create({
      data: {
        userId: user.id,
        token: `token-${uniqueSuffix()}`,
        expiresAt: new Date(Date.now() + 60_000),
      },
    });

    await prisma.user.delete({ where: { id: user.id } });

    expect(await prisma.account.count({ where: { userId: user.id } })).toBe(0);
    expect(await prisma.session.count({ where: { userId: user.id } })).toBe(0);
  });
});
