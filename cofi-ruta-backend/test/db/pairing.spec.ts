import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';
import { Pool } from 'pg';
import { DomainException } from '../../src/common/errors/domain.exception';
import { PairingService } from '../../src/pairing/pairing.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createTestPrisma, truncateAll, uniqueSuffix } from './helpers';

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

async function captureError(
  promise: Promise<unknown>,
): Promise<DomainException> {
  try {
    await promise;
  } catch (error) {
    expect(error).toBeInstanceOf(DomainException);
    return error as DomainException;
  }
  throw new Error('Expected the promise to reject with a DomainException');
}

function codeOf(error: DomainException): unknown {
  return (error.getResponse() as { code?: string }).code;
}

describe('Pairing dúo (Fase 0)', () => {
  let prisma: PrismaClient;
  let pool: Pool;
  let service: PairingService;

  beforeAll(() => {
    const test = createTestPrisma();
    prisma = test.prisma;
    pool = test.pool;
    service = new PairingService(prisma as unknown as PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  beforeEach(async () => {
    await truncateAll(prisma);
  });

  async function createUser(name = 'Persona') {
    return prisma.user.create({
      data: {
        email: `${name.toLowerCase()}-${uniqueSuffix()}@cofi.test`,
        fullName: `${name} de prueba`,
      },
    });
  }

  async function invite(creatorId: string) {
    return service.createToken(creatorId, { type: 'DUO' });
  }

  it('creates a 32-byte opaque token stored only as SHA-256 with a 15-minute TTL', async () => {
    const creator = await createUser('Creador');
    const result = await invite(creator.id);

    expect(result.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(result.qrPayload).toBe(`cofirutas://pair?token=${result.token}`);
    expect(
      Math.abs(result.expiresAt.getTime() - (Date.now() + 15 * 60 * 1000)),
    ).toBeLessThan(5_000);

    const stored = await prisma.pairingToken.findUniqueOrThrow({
      where: { tokenHash: sha256(result.token) },
    });
    expect(stored.tokenPrefix).toBe(result.token.slice(0, 8));
    expect(stored.creatorId).toBe(creator.id);
    expect(stored.type).toBe('DUO');
    expect(stored.consumedAt).toBeNull();
    expect(stored.revokedAt).toBeNull();

    const plaintextRows = await prisma.pairingToken.findMany();
    expect(plaintextRows.every((row) => row.tokenHash !== result.token)).toBe(
      true,
    );
  });

  it('accepts an invite in canonical order and creates a new ACTIVE link', async () => {
    const creator = await createUser('Zoe');
    const claimer = await createUser('Ana');
    const token = await invite(creator.id);

    const result = await service.claimToken(claimer.id, token.token);

    expect(result.type).toBe('DUO');
    expect(result.link.userAId < result.link.userBId).toBe(true);
    expect(result.link.status).toBe('ACTIVE');

    const stored = await prisma.pairingToken.findUniqueOrThrow({
      where: { tokenHash: sha256(token.token) },
    });
    expect(stored.consumedAt).not.toBeNull();
    expect(stored.consumedById).toBe(claimer.id);
  });

  it('rejects a consumed token and a self-claim', async () => {
    const creator = await createUser('Creador');
    const claimer = await createUser('Invitado');
    const token = await invite(creator.id);

    await service.claimToken(claimer.id, token.token);
    const reused = await captureError(
      service.claimToken(claimer.id, token.token),
    );
    expect(codeOf(reused)).toBe('PAIRING_TOKEN_ALREADY_USED');

    const selfToken = await invite(creator.id);
    const self = await captureError(
      service.claimToken(creator.id, selfToken.token),
    );
    expect(codeOf(self)).toBe('CANNOT_PAIR_WITH_SELF');
  });

  it('rejects an expired or revoked token', async () => {
    const creator = await createUser('Creador');
    const claimer = await createUser('Invitado');

    const expired = await invite(creator.id);
    await prisma.pairingToken.update({
      where: { tokenHash: sha256(expired.token) },
      data: { expiresAt: new Date(Date.now() - 1_000) },
    });
    const expiredError = await captureError(
      service.claimToken(claimer.id, expired.token),
    );
    expect(codeOf(expiredError)).toBe('PAIRING_TOKEN_EXPIRED');

    const revoked = await invite(creator.id);
    await prisma.pairingToken.update({
      where: { tokenHash: sha256(revoked.token) },
      data: { revokedAt: new Date() },
    });
    const revokedError = await captureError(
      service.claimToken(claimer.id, revoked.token),
    );
    expect(codeOf(revokedError)).toBe('PAIRING_TOKEN_REVOKED');
  });

  it('rejects an unknown token', async () => {
    const claimer = await createUser('Invitado');
    const error = await captureError(
      service.claimToken(claimer.id, 'token-que-no-existe'),
    );
    expect(codeOf(error)).toBe('PAIRING_TOKEN_NOT_FOUND');
  });

  it('rejects a claim when either user already has an ACTIVE link', async () => {
    const first = await createUser('Uno');
    const second = await createUser('Dos');
    const third = await createUser('Tres');

    const firstToken = await invite(first.id);
    await service.claimToken(second.id, firstToken.token);

    const secondToken = await invite(first.id);
    const error = await captureError(
      service.claimToken(third.id, secondToken.token),
    );
    expect(codeOf(error)).toBe('COUPLE_ALREADY_ACTIVE');

    const otherToken = await invite(third.id);
    const targetLinked = await captureError(
      service.claimToken(first.id, otherToken.token),
    );
    expect(codeOf(targetLinked)).toBe('COUPLE_ALREADY_ACTIVE');
  });

  it('archives the active link and creates a brand-new one for the same pair', async () => {
    const first = await createUser('Uno');
    const second = await createUser('Dos');

    const token = await invite(first.id);
    const original = await service.claimToken(second.id, token.token);

    const archived = await service.archiveDuo(first.id);
    expect(archived.link.id).toBe(original.link.id);
    expect(archived.link.status).toBe('ARCHIVED');

    const retryToken = await invite(first.id);
    const relinked = await service.claimToken(second.id, retryToken.token);
    expect(relinked.link.id).not.toBe(original.link.id);
    expect(relinked.link.status).toBe('ACTIVE');

    const links = await prisma.coupleLink.findMany({
      where: {
        OR: [{ userAId: first.id }, { userBId: first.id }],
      },
      orderBy: { startedAt: 'asc' },
    });
    expect(links).toHaveLength(2);
    expect(links.filter((link) => link.status === 'ARCHIVED')).toHaveLength(1);
    expect(links.filter((link) => link.status === 'ACTIVE')).toHaveLength(1);
  });

  it('returns the active duo with partner data and archives it', async () => {
    const first = await createUser('Uno');
    const second = await createUser('Dos');
    const token = await invite(first.id);
    await service.claimToken(second.id, token.token);

    const duo = await service.getDuo(first.id);
    expect(duo?.partner.id).toBe(second.id);
    expect(duo?.partner).not.toHaveProperty('passwordHash');

    expect(await service.getDuo(second.id)).not.toBeNull();
    expect(await service.getDuo(thirdId())).toBeNull();

    await service.archiveDuo(first.id);
    expect(await service.getDuo(first.id)).toBeNull();

    const missing = await captureError(service.archiveDuo(first.id));
    expect(codeOf(missing)).toBe('COUPLE_NOT_FOUND');

    function thirdId() {
      return '00000000-0000-0000-0000-000000000000';
    }
  });

  it('revokes a token so it cannot be claimed', async () => {
    const creator = await createUser('Creador');
    const claimer = await createUser('Invitado');
    const token = await invite(creator.id);

    const stored = await prisma.pairingToken.findUniqueOrThrow({
      where: { tokenHash: sha256(token.token) },
    });
    await service.revokeToken(creator.id, stored.id);

    const error = await captureError(
      service.claimToken(claimer.id, token.token),
    );
    expect(codeOf(error)).toBe('PAIRING_TOKEN_REVOKED');

    const other = await createUser('Otra');
    const foreign = await captureError(
      service.revokeToken(other.id, stored.id),
    );
    expect(codeOf(foreign)).toBe('PAIRING_TOKEN_NOT_FOUND');
  });
});
