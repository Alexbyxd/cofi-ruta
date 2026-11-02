import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PairingService } from './pairing.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PairingService', () => {
  let service: PairingService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      pairingToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      coupleLink: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      groupMember: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PairingService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<PairingService>(PairingService);
  });

  describe('createPairingToken', () => {
    it('should generate a token with 5-minute TTL and QR payload', async () => {
      const mockExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
      prisma.pairingToken.create.mockResolvedValue({
        id: 'pt1',
        token: 'COFI-123456',
        type: 'DUO',
        expiresAt: mockExpiresAt,
      });

      const result = await service.createPairingToken('user-1', {
        type: 'DUO',
      });

      expect(result.token).toBe('COFI-123456');
      expect(result.type).toBe('DUO');
      expect(result.qrPayload).toContain('COFI-123456');
    });
  });

  describe('claimPairingToken', () => {
    it('should throw NotFoundException if token does not exist', async () => {
      prisma.pairingToken.findUnique.mockResolvedValue(null);

      await expect(
        service.claimPairingToken('user-2', 'INVALID'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if token is already used', async () => {
      prisma.pairingToken.findUnique.mockResolvedValue({
        id: 'pt1',
        usedAt: new Date(),
        expiresAt: new Date(Date.now() + 100000),
      });

      await expect(
        service.claimPairingToken('user-2', 'COFI-USED'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if token has expired', async () => {
      prisma.pairingToken.findUnique.mockResolvedValue({
        id: 'pt1',
        usedAt: null,
        expiresAt: new Date(Date.now() - 10000), // in the past
      });

      await expect(
        service.claimPairingToken('user-2', 'COFI-EXPIRED'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if creator tries to claim their own token', async () => {
      prisma.pairingToken.findUnique.mockResolvedValue({
        id: 'pt1',
        creatorId: 'user-1',
        usedAt: null,
        expiresAt: new Date(Date.now() + 100000),
      });

      await expect(
        service.claimPairingToken('user-1', 'COFI-SELF'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully link two users in Modo Dúo', async () => {
      prisma.pairingToken.findUnique.mockResolvedValue({
        id: 'pt1',
        creatorId: 'user-1',
        type: 'DUO',
        usedAt: null,
        expiresAt: new Date(Date.now() + 100000),
      });
      prisma.coupleLink.findFirst.mockResolvedValue(null);
      prisma.coupleLink.create.mockResolvedValue({
        id: 'link-1',
        userAId: 'user-1',
        userBId: 'user-2',
        status: 'ACTIVE',
      });
      prisma.pairingToken.update.mockResolvedValue({ id: 'pt1' });

      const result = await service.claimPairingToken('user-2', 'COFI-VALID');

      expect(result.message).toContain('Modo Dúo');
      expect(result.type).toBe('DUO');
      expect(prisma.coupleLink.create).toHaveBeenCalled();
      expect(prisma.pairingToken.update).toHaveBeenCalled();
    });
  });

  describe('archiveLink', () => {
    it('should archive relationship if user is a member of the link', async () => {
      prisma.coupleLink.findUnique.mockResolvedValue({
        id: 'link-1',
        userAId: 'user-1',
        userBId: 'user-2',
        status: 'ACTIVE',
      });
      prisma.coupleLink.update.mockResolvedValue({
        id: 'link-1',
        status: 'ARCHIVED',
        archivedAt: new Date(),
      });

      const result = await service.archiveLink('user-1', 'link-1');
      expect(result.message).toContain('Relación archivada');
      expect(result.link.status).toBe('ARCHIVED');
    });
  });
});
