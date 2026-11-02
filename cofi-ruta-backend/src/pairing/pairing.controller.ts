import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PairingService } from './pairing.service';
import type {
  CreatePairingTokenDto,
  ClaimPairingTokenDto,
} from './dto/pairing.dto';
import {
  createPairingTokenSchema,
  claimPairingTokenSchema,
} from './dto/pairing.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('pairing')
@UseGuards(JwtAuthGuard)
export class PairingController {
  constructor(private readonly pairingService: PairingService) {}

  @Post('qr-token')
  async createQrToken(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(createPairingTokenSchema))
    dto: CreatePairingTokenDto,
  ) {
    return this.pairingService.createPairingToken(userId, dto);
  }

  @Post('claim')
  @HttpCode(HttpStatus.OK)
  async claimToken(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(claimPairingTokenSchema))
    dto: ClaimPairingTokenDto,
  ) {
    return this.pairingService.claimPairingToken(userId, dto.token);
  }

  @Get('my-links')
  async getMyLinks(@CurrentUser('id') userId: string) {
    return this.pairingService.listMyLinks(userId);
  }

  @Patch('links/:id/archive')
  async archiveLink(
    @CurrentUser('id') userId: string,
    @Param('id') linkId: string,
  ) {
    return this.pairingService.archiveLink(userId, linkId);
  }
}
