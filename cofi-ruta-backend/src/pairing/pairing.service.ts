import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePairingTokenDto } from './dto/pairing.dto';

@Injectable()
export class PairingService {
  constructor(private readonly prisma: PrismaService) {}

  private generateToken(): string {
    return 'COFI-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  }

  async createPairingToken(creatorId: string, dto: CreatePairingTokenDto) {
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes TTL

    const pairingToken = await this.prisma.pairingToken.create({
      data: {
        creatorId,
        token,
        type: dto.type,
        groupId: dto.groupId,
        expiresAt,
      },
    });

    const qrPayload = JSON.stringify({
      app: 'CofiRutas',
      type: dto.type,
      token: pairingToken.token,
      expiresAt: pairingToken.expiresAt.toISOString(),
    });

    return {
      token: pairingToken.token,
      type: pairingToken.type,
      expiresAt: pairingToken.expiresAt,
      qrPayload,
    };
  }

  async claimPairingToken(claimerId: string, tokenString: string) {
    const formattedToken = tokenString.trim().toUpperCase();

    const token = await this.prisma.pairingToken.findUnique({
      where: { token: formattedToken },
      include: {
        creator: {
          select: { id: true, fullName: true, avatarUrl: true, email: true },
        },
      },
    });

    if (!token) {
      throw new NotFoundException('Token QR no encontrado o inválido');
    }

    if (token.usedAt) {
      throw new BadRequestException('Este token QR ya ha sido reclamado');
    }

    if (new Date() > token.expiresAt) {
      throw new BadRequestException(
        'Este token QR ha expirado. Por favor, genera uno nuevo.',
      );
    }

    if (token.creatorId === claimerId) {
      throw new BadRequestException('No puedes reclamar tu propio token QR');
    }

    if (token.type === 'DUO') {
      // Check if relationship already exists
      const existing = await this.prisma.coupleLink.findFirst({
        where: {
          OR: [
            { userAId: token.creatorId, userBId: claimerId },
            { userAId: claimerId, userBId: token.creatorId },
          ],
        },
      });

      if (existing) {
        if (existing.status === 'ACTIVE') {
          throw new ConflictException(
            'Ya estás emparejado en Modo Dúo con este usuario',
          );
        }
        const updatedLink = await this.prisma.coupleLink.update({
          where: { id: existing.id },
          data: {
            status: 'ACTIVE',
            archivedAt: null,
            startedAt: new Date(),
          },
          include: {
            userA: { select: { id: true, fullName: true, avatarUrl: true } },
            userB: { select: { id: true, fullName: true, avatarUrl: true } },
          },
        });

        await this.prisma.pairingToken.update({
          where: { id: token.id },
          data: { usedAt: new Date() },
        });

        return {
          message: 'Emparejado exitosamente en Modo Dúo!',
          type: 'DUO',
          link: updatedLink,
        };
      }

      const newLink = await this.prisma.coupleLink.create({
        data: {
          userAId: token.creatorId,
          userBId: claimerId,
          status: 'ACTIVE',
        },
        include: {
          userA: { select: { id: true, fullName: true, avatarUrl: true } },
          userB: { select: { id: true, fullName: true, avatarUrl: true } },
        },
      });

      await this.prisma.pairingToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      });

      return {
        message: 'Emparejado exitosamente en Modo Dúo!',
        type: 'DUO',
        link: newLink,
      };
    }

    if (token.type === 'GROUP' && token.groupId) {
      const existingMember = await this.prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: token.groupId,
            userId: claimerId,
          },
        },
      });

      if (existingMember) {
        throw new ConflictException('Ya eres miembro de este grupo');
      }

      const membership = await this.prisma.groupMember.create({
        data: {
          groupId: token.groupId,
          userId: claimerId,
        },
        include: {
          group: true,
        },
      });

      await this.prisma.pairingToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      });

      return {
        message: '¡Te has unido al grupo exitosamente!',
        type: 'GROUP',
        membership,
      };
    }

    throw new BadRequestException(
      'Configuración de tipo de emparejamiento inválida',
    );
  }

  async listMyLinks(userId: string) {
    const duoLinks = await this.prisma.coupleLink.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: 'ACTIVE',
      },
      include: {
        userA: {
          select: { id: true, fullName: true, avatarUrl: true, email: true },
        },
        userB: {
          select: { id: true, fullName: true, avatarUrl: true, email: true },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    const groups = await this.prisma.groupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            members: {
              include: {
                user: { select: { id: true, fullName: true, avatarUrl: true } },
              },
            },
          },
        },
      },
    });

    return {
      duoLinks: duoLinks.map((link) => {
        const partner = link.userAId === userId ? link.userB : link.userA;
        return {
          id: link.id,
          status: link.status,
          startedAt: link.startedAt,
          partner,
        };
      }),
      groups: groups.map((g) => g.group),
    };
  }

  async archiveLink(userId: string, linkId: string) {
    const link = await this.prisma.coupleLink.findUnique({
      where: { id: linkId },
    });

    if (!link || (link.userAId !== userId && link.userBId !== userId)) {
      throw new NotFoundException(
        'Link no encontrado o no perteneciente al usuario',
      );
    }

    const updated = await this.prisma.coupleLink.update({
      where: { id: linkId },
      data: {
        status: 'ARCHIVED',
        archivedAt: new Date(),
      },
    });

    return {
      message:
        'Relación archivada. Las memorias históricas y los registros están congelados y preservados.',
      link: updated,
    };
  }
}
