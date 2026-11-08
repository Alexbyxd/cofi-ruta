import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as crypto from 'node:crypto';
import { PairingService } from '../pairing/pairing.service';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateGroupDto, JoinGroupDto } from './dto/groups.dto';
import { groupErrors } from './groups.errors';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;
const CODE_ATTEMPTS = 5;

const publicUserSelect = {
  id: true,
  fullName: true,
  avatarUrl: true,
  email: true,
} satisfies Prisma.UserSelect;

const roomInclude = {
  host: { select: publicUserSelect },
  members: {
    where: { leftAt: null },
    include: { user: { select: publicUserSelect } },
    orderBy: { joinedAt: 'asc' },
  },
} satisfies Prisma.GroupRoomInclude;

type RoomWithRelations = Prisma.GroupRoomGetPayload<{
  include: typeof roomInclude;
}>;

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

@Injectable()
export class GroupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pairingService: PairingService,
  ) {}

  private generateCode(): string {
    let code = '';
    for (let index = 0; index < CODE_LENGTH; index += 1) {
      code += CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)];
    }
    return code;
  }

  private toView(room: RoomWithRelations, userId: string) {
    const membership = room.members.find((member) => member.user.id === userId);
    const myRole =
      room.hostId === userId
        ? 'HOST'
        : (membership?.role ?? ('MEMBER' as const));

    return {
      ...room,
      myRole,
    };
  }

  async create(userId: string, dto: CreateGroupDto) {
    const maxMembers = dto.maxMembers ?? 12;
    const expiresInHours = dto.expiresInHours ?? 24;
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    for (let attempt = 0; attempt < CODE_ATTEMPTS; attempt += 1) {
      const code = this.generateCode();

      try {
        const room = await this.prisma.$transaction(async (tx) => {
          const created = await tx.groupRoom.create({
            data: {
              name: dto.name,
              code,
              hostId: userId,
              maxMembers,
              expiresAt,
            },
          });

          await tx.groupMember.create({
            data: { groupId: created.id, userId, role: 'HOST' },
          });

          return created;
        });

        return this.get(userId, room.id);
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          continue;
        }
        throw error;
      }
    }

    throw groupErrors.codeUnavailable();
  }

  async get(userId: string, groupId: string) {
    const room = await this.prisma.groupRoom.findUnique({
      where: { id: groupId },
      include: roomInclude,
    });

    if (!room) {
      throw groupErrors.notFound();
    }

    const isHost = room.hostId === userId;
    const isMember = room.members.some((member) => member.user.id === userId);

    if (!isHost && !isMember) {
      throw groupErrors.forbidden();
    }

    return this.toView(room, userId);
  }

  private assertJoinable(room: { status: string; expiresAt: Date }): void {
    if (room.status !== 'OPEN') {
      throw groupErrors.closed();
    }

    if (room.expiresAt.getTime() <= Date.now()) {
      throw groupErrors.expired();
    }
  }

  async join(userId: string, dto: JoinGroupDto) {
    if ('token' in dto) {
      const result = await this.pairingService.claimToken(userId, dto.token);

      if (result.type !== 'GROUP') {
        throw groupErrors.tokenWrongType();
      }

      return {
        message: 'Te uniste al grupo',
        group: await this.get(userId, result.membership.groupId),
      };
    }

    const code = dto.code.toUpperCase();
    const room = await this.prisma.groupRoom.findUnique({ where: { code } });

    if (!room) {
      throw groupErrors.notFound();
    }

    this.assertJoinable(room);

    const existing = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: room.id, userId } },
    });

    if (existing && !existing.leftAt) {
      throw groupErrors.alreadyMember();
    }

    const activeMembers = await this.prisma.groupMember.count({
      where: { groupId: room.id, leftAt: null },
    });

    if (activeMembers >= room.maxMembers) {
      throw groupErrors.full();
    }

    try {
      if (existing) {
        await this.prisma.groupMember.update({
          where: { id: existing.id },
          data: { leftAt: null, role: 'MEMBER', joinedAt: new Date() },
        });
      } else {
        await this.prisma.groupMember.create({
          data: { groupId: room.id, userId, role: 'MEMBER' },
        });
      }
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw groupErrors.alreadyMember();
      }
      throw error;
    }

    return {
      message: 'Te uniste al grupo',
      group: await this.get(userId, room.id),
    };
  }

  async leave(userId: string, groupId: string) {
    const room = await this.prisma.groupRoom.findUnique({
      where: { id: groupId },
    });

    if (!room) {
      throw groupErrors.notFound();
    }

    if (room.hostId === userId) {
      if (room.status === 'OPEN') {
        await this.prisma.$transaction([
          this.prisma.groupMember.updateMany({
            where: { groupId, userId, leftAt: null },
            data: { leftAt: new Date() },
          }),
          this.prisma.groupRoom.update({
            where: { id: groupId },
            data: { status: 'CLOSED', closedAt: new Date() },
          }),
        ]);
      }

      return {
        message: 'El host salió del grupo y la sala quedó cerrada',
        closed: true,
        groupId,
      };
    }

    const membership = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (!membership || membership.leftAt) {
      throw groupErrors.forbidden();
    }

    await this.prisma.groupMember.update({
      where: { id: membership.id },
      data: { leftAt: new Date() },
    });

    return { message: 'Saliste del grupo', closed: false, groupId };
  }

  async close(userId: string, groupId: string) {
    const room = await this.prisma.groupRoom.findUnique({
      where: { id: groupId },
    });

    if (!room) {
      throw groupErrors.notFound();
    }

    if (room.hostId !== userId) {
      throw groupErrors.forbidden();
    }

    if (room.status !== 'CLOSED') {
      await this.prisma.groupRoom.update({
        where: { id: groupId },
        data: { status: 'CLOSED', closedAt: new Date() },
      });
    }

    return { message: 'Grupo cerrado', closed: true, groupId };
  }

  async createInvite(userId: string, groupId: string) {
    const room = await this.prisma.groupRoom.findUnique({
      where: { id: groupId },
      select: { id: true, hostId: true, status: true, expiresAt: true },
    });

    if (!room) {
      throw groupErrors.notFound();
    }

    if (room.hostId !== userId) {
      const membership = await this.prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId, userId } },
        select: { leftAt: true },
      });

      if (!membership || membership.leftAt) {
        throw groupErrors.forbidden();
      }
    }

    this.assertJoinable(room);

    return this.pairingService.createToken(userId, {
      type: 'GROUP',
      groupId,
    });
  }

  async getMine(userId: string) {
    const memberships = await this.prisma.groupMember.findMany({
      where: { userId },
      include: {
        group: { include: roomInclude },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return memberships.map((membership) => ({
      ...membership.group,
      myRole: membership.role,
      leftAt: membership.leftAt,
    }));
  }
}
