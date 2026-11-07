import { Test, TestingModule } from '@nestjs/testing';
import * as crypto from 'crypto';
import { PairingService } from './pairing.service';
import { PrismaService } from '../prisma/prisma.service';
import { DomainException } from '../common/errors/domain.exception';

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

describe('PairingService', () => {
  let service: PairingService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      pairingToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        updateMany: jest.fn(),
      },
      coupleLink: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      groupRoom: { findUnique: jest.fn() },
      groupMember: { findUnique: jest.fn(), count: jest.fn() },
      $transaction: jest.fn((callback: (tx: any) => unknown) =>
        callback(prisma),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PairingService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<PairingService>(PairingService);
  });

  describe('createToken', () => {
    it('stores only the SHA-256 hash with a 15-minute TTL', async () => {
      prisma.pairingToken.create.mockImplementation(({ data }: any) =>
        Promise.resolve({
          id: 'pt1',
          type: data.type,
          expiresAt: data.expiresAt,
        }),
      );

      const result = await service.createToken('user-1', { type: 'DUO' });
      const createArgs = prisma.pairingToken.create.mock.calls[0][0];

      expect(result.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
      expect(createArgs.data.tokenHash).toBe(sha256(result.token));
      expect(createArgs.data.tokenPrefix).toBe(result.token.slice(0, 8));
      expect(createArgs.data.creatorId).toBe('user-1');
      expect(
        Math.abs(
          createArgs.data.expiresAt.getTime() - (Date.now() + 15 * 60 * 1000),
        ),
      ).toBeLessThan(5_000);
      expect(result.qrPayload).toBe(`cofirutas://pair?token=${result.token}`);
    });

    it('requires a groupId for GROUP tokens', async () => {
      await expect(
        service.createToken('user-1', { type: 'GROUP' }),
      ).rejects.toMatchObject({ code: 'GROUP_REQUIRED' });
    });
  });

  describe('claimToken', () => {
    it('maps an unknown token to a domain error', async () => {
      prisma.pairingToken.findUnique.mockResolvedValue(null);

      const error = (await service
        .claimToken('user-2', 'missing-token')
        .catch((caught: unknown) => caught)) as DomainException;

      expect(error).toBeInstanceOf(DomainException);
      expect((error.getResponse() as { code?: string }).code).toBe(
        'PAIRING_TOKEN_NOT_FOUND',
      );
    });
  });

  describe('getDuo', () => {
    it('returns null when there is no active link', async () => {
      prisma.coupleLink.findFirst.mockResolvedValue(null);
      await expect(service.getDuo('user-1')).resolves.toBeNull();
    });
  });
});
