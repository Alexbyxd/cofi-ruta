import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { CreateGroupDto, JoinGroupDto } from './dto/groups.dto';
import { createGroupSchema, joinGroupSchema } from './dto/groups.dto';
import { GroupsService } from './groups.service';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  async create(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(createGroupSchema)) dto: CreateGroupDto,
  ) {
    return this.groupsService.create(userId, dto);
  }

  @Post('join')
  @HttpCode(HttpStatus.OK)
  async join(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(joinGroupSchema)) dto: JoinGroupDto,
  ) {
    return this.groupsService.join(userId, dto);
  }

  @Get('me')
  async getMine(@CurrentUser('id') userId: string) {
    return { data: await this.groupsService.getMine(userId) };
  }

  @Get(':id')
  async get(@CurrentUser('id') userId: string, @Param('id') groupId: string) {
    return this.groupsService.get(userId, groupId);
  }

  @Post(':id/leave')
  @HttpCode(HttpStatus.OK)
  async leave(@CurrentUser('id') userId: string, @Param('id') groupId: string) {
    return this.groupsService.leave(userId, groupId);
  }

  @Post(':id/close')
  @HttpCode(HttpStatus.OK)
  async close(@CurrentUser('id') userId: string, @Param('id') groupId: string) {
    return this.groupsService.close(userId, groupId);
  }

  @Post(':id/invites')
  async createInvite(
    @CurrentUser('id') userId: string,
    @Param('id') groupId: string,
  ) {
    return this.groupsService.createInvite(userId, groupId);
  }
}
