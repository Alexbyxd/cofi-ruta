import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { DomainException } from '../../src/common/errors/domain.exception';
import { GroupsService } from '../../src/groups/groups.service';
import { PairingService } from '../../src/pairing/pairing.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createTestPrisma, truncateAll, uniqueSuffix } from './helpers';

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

describe('Grupos (Fase 0)', () => {
  let prisma: PrismaClient;
  let pool: Pool;
  let service: GroupsService;
  let pairing: PairingService;

  beforeAll(() => {
    const test = createTestPrisma();
    prisma = test.prisma;
    pool = test.pool;
    pairing = new PairingService(prisma as unknown as PrismaService);
    service = new GroupsService(prisma as unknown as PrismaService, pairing);
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

  it('creates an OPEN room with an unambiguous 6-character code and host membership', async () => {
    const host = await createUser('Host');
    const group = await service.create(host.id, { name: 'Café de sábado' });

    expect(group.code).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
    expect(group.status).toBe('OPEN');
    expect(group.maxMembers).toBe(12);
    expect(
      Math.abs(group.expiresAt.getTime() - (Date.now() + 24 * 60 * 60 * 1000)),
    ).toBeLessThan(5_000);
    expect(group.myRole).toBe('HOST');
    expect(group.members).toHaveLength(1);
    expect(group.members[0].user.id).toBe(host.id);
    expect(group.members[0].role).toBe('HOST');

    const other = await service.create(host.id, { name: 'Otro plan' });
    expect(other.code).not.toBe(group.code);
  });

  it('honors custom maxMembers and expiry hours', async () => {
    const host = await createUser('Host');
    const group = await service.create(host.id, {
      name: 'Plan corto',
      maxMembers: 4,
      expiresInHours: 2,
    });

    expect(group.maxMembers).toBe(4);
    expect(
      Math.abs(group.expiresAt.getTime() - (Date.now() + 2 * 60 * 60 * 1000)),
    ).toBeLessThan(5_000);
  });

  it('joins by code, normalizes the code and rejects duplicates', async () => {
    const host = await createUser('Host');
    const guest = await createUser('Guest');
    const group = await service.create(host.id, { name: 'Plan' });

    const joined = await service.join(guest.id, {
      code: group.code.toLowerCase(),
    });
    expect(joined.group.members).toHaveLength(2);
    expect(joined.group.myRole).toBe('MEMBER');

    const duplicate = await captureError(
      service.join(guest.id, { code: group.code }),
    );
    expect(codeOf(duplicate)).toBe('GROUP_ALREADY_MEMBER');
  });

  it('rejects join when the room is full', async () => {
    const host = await createUser('Host');
    const second = await createUser('Dos');
    const third = await createUser('Tres');
    const group = await service.create(host.id, {
      name: 'Pareja',
      maxMembers: 2,
    });

    await service.join(second.id, { code: group.code });

    const full = await captureError(
      service.join(third.id, { code: group.code }),
    );
    expect(codeOf(full)).toBe('GROUP_FULL');
  });

  it('rejects join when the room is closed or expired', async () => {
    const host = await createUser('Host');
    const guest = await createUser('Guest');
    const group = await service.create(host.id, { name: 'Plan' });

    await service.close(host.id, group.id);
    const closed = await captureError(
      service.join(guest.id, { code: group.code }),
    );
    expect(codeOf(closed)).toBe('GROUP_CLOSED');

    const expiredGroup = await service.create(host.id, { name: 'Viejo' });
    await prisma.groupRoom.update({
      where: { id: expiredGroup.id },
      data: { expiresAt: new Date(Date.now() - 1_000) },
    });
    const expired = await captureError(
      service.join(guest.id, { code: expiredGroup.code }),
    );
    expect(codeOf(expired)).toBe('GROUP_EXPIRED');
  });

  it('joins with a GROUP pairing token and rejects a DUO token', async () => {
    const host = await createUser('Host');
    const guest = await createUser('Guest');
    const group = await service.create(host.id, { name: 'Plan' });

    const invite = await service.createInvite(host.id, group.id);
    expect(invite.type).toBe('GROUP');

    const joined = await service.join(guest.id, { token: invite.token });
    expect(joined.group.members).toHaveLength(2);

    const duoToken = await pairing.createToken(host.id, { type: 'DUO' });
    const wrong = await captureError(
      service.join(guest.id, { token: duoToken.token }),
    );
    expect(codeOf(wrong)).toBe('PAIRING_TOKEN_WRONG_TYPE');
  });

  it('only lets members read the room and only the host close it', async () => {
    const host = await createUser('Host');
    const member = await createUser('Member');
    const outsider = await createUser('Outsider');
    const group = await service.create(host.id, { name: 'Plan' });

    const forbidden = await captureError(service.get(outsider.id, group.id));
    expect(codeOf(forbidden)).toBe('GROUP_FORBIDDEN');

    const notHost = await captureError(service.close(member.id, group.id));
    expect(codeOf(notHost)).toBe('GROUP_FORBIDDEN');

    await service.join(member.id, { code: group.code });
    expect((await service.get(member.id, group.id)).members).toHaveLength(2);

    const closed = await service.close(host.id, group.id);
    expect(closed.closed).toBe(true);
    const joinClosed = await captureError(
      service.join(outsider.id, { code: group.code }),
    );
    expect(codeOf(joinClosed)).toBe('GROUP_CLOSED');
  });

  it('lets a member leave and closes the room when the host leaves', async () => {
    const host = await createUser('Host');
    const member = await createUser('Member');
    const group = await service.create(host.id, { name: 'Plan' });
    await service.join(member.id, { code: group.code });

    const left = await service.leave(member.id, group.id);
    expect(left.closed).toBe(false);
    expect((await service.get(host.id, group.id)).members).toHaveLength(1);

    const hostLeft = await service.leave(host.id, group.id);
    expect(hostLeft.closed).toBe(true);

    const stored = await prisma.groupRoom.findUniqueOrThrow({
      where: { id: group.id },
    });
    expect(stored.status).toBe('CLOSED');
    expect(stored.closedAt).not.toBeNull();
  });

  it('lists active and historic rooms of the user', async () => {
    const host = await createUser('Host');
    const group = await service.create(host.id, { name: 'Plan' });
    await service.create(host.id, { name: 'Otro plan' });

    const mine = await service.getMine(host.id);
    expect(mine).toHaveLength(2);
    expect(mine.map((room) => room.id)).toContain(group.id);
    expect(mine[0].myRole).toBe('HOST');
  });
});
