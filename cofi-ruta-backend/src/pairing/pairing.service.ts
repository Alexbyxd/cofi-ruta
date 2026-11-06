import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as crypto from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import type { CreatePairingTokenDto } from './dto/pairing.dto';
import { pairingErrors } from './pairing.errors';

const TOKEN_TTL_MS = 15 * 60 * 1000;

const publicUserSelect = {
  id: true,
  fullName: true,
  avatarUrl: true,
  email: true,
} satisfies Prisma.UserSelect;

type PublicUser = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;

type PairingTokenRow = Prisma.PairingTokenGetPayload<object>;

export interface DuoView {
  id: string;
  status: string;
  startedAt: Date;
  partner: PublicUser;
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

@Injectable()
export class PairingService {
  constructor(private readonly prisma: PrismaService) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private createOpaqueToken(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  async createToken(userId: string, dto: CreatePairingTokenDto) {
    if (dto.type === 'GROUP') {
      if (!dto.groupId) {
        throw pairingErrors.groupRequired();
      }

      const group = await this.prisma.groupRoom.findUnique({
        where: { id: dto.groupId },
        select: { id: true, hostId: true },
      });

      if (!group) {
        throw pairingErrors.groupNotFound();
      }

      if (group.hostId !== userId) {
        const member = await this.prisma.groupMember.findUnique({
          where: {
            groupId_userId: { groupId: group.id, userId },
          },
          select: { leftAt: true },
        });

        if (!member || member.leftAt) {
          throw pairingErrors.groupNotFound();
        }
      }
    }

    const token = this.createOpaqueToken();
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
    const tokenPrefix = token.slice(0, 8);

    const record = await this.prisma.pairingToken.create({
      data: {
        creatorId: userId,
        tokenHash: this.hashToken(token),
        tokenPrefix,
        type: dto.type,
        groupId: dto.groupId ?? null,
        expiresAt,
      },
    });

    return {
      id: record.id,
      token,
      tokenPrefix,
      type: record.type,
      expiresAt: record.expiresAt,
      // El token plano se devuelve una sola vez; el cliente lo convierte en QR.
      qrPayload: `cofirutas://pair?token=${token}`,
    };
  }

  async claimToken(claimerId: string, token: string) {
    const tokenHash = this.hashToken(token.trim());

    return this.prisma.$transaction(async (tx) => {
      const record = await tx.pairingToken.findUnique({
        where: { tokenHash },
        include: { creator: { select: publicUserSelect } },
      });

      if (!record) {
        throw pairingErrors.tokenNotFound();
      }

      if (record.consumedAt) {
        throw pairingErrors.tokenAlreadyUsed();
      }

      if (record.revokedAt) {
        throw pairingErrors.tokenRevoked();
      }

      if (record.expiresAt.getTime() <= Date.now()) {
        throw pairingErrors.tokenExpired();
      }

      if (record.creatorId === claimerId) {
        throw pairingErrors.cannotPairWithSelf();
      }

      if (record.type === 'DUO') {
        return this.claimDuo(tx, record, claimerId);
      }

      return this.claimGroup(tx, record, claimerId);
    });
  }

  private async claimDuo(
    tx: Prisma.TransactionClient,
    record: PairingTokenRow,
    claimerId: string,
  ) {
    const userIds = [record.creatorId, claimerId];

    const active = await tx.coupleLink.findFirst({
      where: {
        status: 'ACTIVE',
        OR: [{ userAId: { in: userIds } }, { userBId: { in: userIds } }],
      },
      select: { id: true },
    });

    if (active) {
      throw pairingErrors.coupleAlreadyActive();
    }

    const [userAId, userBId] =
      record.creatorId < claimerId
        ? [record.creatorId, claimerId]
        : [claimerId, record.creatorId];

    await this.consumeToken(tx, record.id, claimerId);

    try {
      const link = await tx.coupleLink.create({
        data: { userAId, userBId, status: 'ACTIVE' },
        include: {
          userA: { select: publicUserSelect },
          userB: { select: publicUserSelect },
        },
      });

      return {
        message: 'Emparejado exitosamente en Modo Dúo',
        type: 'DUO' as const,
        link,
      };
    } catch (error) {
      // El índice único parcial puede rechazar una carrera entre dos claims.
      if (isUniqueConstraintError(error)) {
        throw pairingErrors.coupleAlreadyActive();
      }
      throw error;
    }
  }

  private async claimGroup(
    tx: Prisma.TransactionClient,
    record: PairingTokenRow,
    claimerId: string,
  ) {
    if (!record.groupId) {
      throw pairingErrors.groupNotFound();
    }

    const group = await tx.groupRoom.findUnique({
      where: { id: record.groupId },
      select: {
        id: true,
        status: true,
        maxMembers: true,
        expiresAt: true,
      },
    });

    if (!group) {
      throw pairingErrors.groupNotFound();
    }

    if (group.status !== 'OPEN') {
      throw pairingErrors.groupClosed();
    }

    if (group.expiresAt.getTime() <= Date.now()) {
      throw pairingErrors.groupExpired();
    }

    const existing = await tx.groupMember.findUnique({
      where: {
        groupId_userId: { groupId: group.id, userId: claimerId },
      },
    });

    if (existing && !existing.leftAt) {
      throw pairingErrors.groupAlreadyMember();
    }

    const memberCount = await tx.groupMember.count({
      where: { groupId: group.id, leftAt: null },
    });

    if (memberCount >= group.maxMembers) {
      throw pairingErrors.groupFull();
    }

    await this.consumeToken(tx, record.id, claimerId);

    const membership = existing
      ? await tx.groupMember.update({
          where: { id: existing.id },
          data: { leftAt: null, role: 'MEMBER', joinedAt: new Date() },
          include: { group: true },
        })
      : await tx.groupMember.create({
          data: { groupId: group.id, userId: claimerId, role: 'MEMBER' },
          include: { group: true },
        });

    return {
      message: 'Te uniste al grupo',
      type: 'GROUP' as const,
      membership,
    };
  }

  private async consumeToken(
    tx: Prisma.TransactionClient,
    tokenId: string,
    claimerId: string,
  ): Promise<void> {
    const consumed = await tx.pairingToken.updateMany({
      where: { id: tokenId, consumedAt: null, revokedAt: null },
      data: { consumedAt: new Date(), consumedById: claimerId },
    });

    if (consumed.count !== 1) {
      throw pairingErrors.tokenAlreadyUsed();
    }
  }

  async getDuo(userId: string): Promise<DuoView | null> {
    const link = await this.prisma.coupleLink.findFirst({
      where: {
        status: 'ACTIVE',
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      include: {
        userA: { select: publicUserSelect },
        userB: { select: publicUserSelect },
      },
    });

    if (!link) {
      return null;
    }

    return {
      id: link.id,
      status: link.status,
      startedAt: link.startedAt,
      partner: link.userAId === userId ? link.userB : link.userA,
    };
  }

  async archiveDuo(userId: string) {
    const link = await this.prisma.coupleLink.findFirst({
      where: {
        status: 'ACTIVE',
        OR: [{ userAId: userId }, { userBId: userId }],
      },
    });

    if (!link) {
      throw pairingErrors.coupleNotFound();
    }

    const archived = await this.prisma.coupleLink.update({
      where: { id: link.id },
      data: { status: 'ARCHIVED', archivedAt: new Date() },
    });

    return {
      message: 'Vínculo archivado; el historial queda preservado',
      link: archived,
    };
  }

  async revokeToken(userId: string, tokenId: string) {
    const result = await this.prisma.pairingToken.updateMany({
      where: {
        id: tokenId,
        creatorId: userId,
        consumedAt: null,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    if (result.count === 0) {
      throw pairingErrors.tokenNotFound();
    }

    return { message: 'Token revocado', revoked: result.count };
  }
}
