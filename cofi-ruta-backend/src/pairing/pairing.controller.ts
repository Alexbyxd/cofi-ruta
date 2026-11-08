import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PairingService } from './pairing.service';
import type {
  ClaimPairingTokenDto,
  CreatePairingTokenDto,
} from './dto/pairing.dto';
import {
  claimPairingTokenSchema,
  createPairingTokenSchema,
} from './dto/pairing.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('pairing')
@UseGuards(JwtAuthGuard)
export class PairingController {
  constructor(private readonly pairingService: PairingService) {}

  @Post('token')
  async createToken(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(createPairingTokenSchema))
    dto: CreatePairingTokenDto,
  ) {
    return this.pairingService.createToken(userId, dto);
  }

  @Post('claim')
  @HttpCode(HttpStatus.OK)
  async claimToken(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(claimPairingTokenSchema))
    dto: ClaimPairingTokenDto,
  ) {
    return this.pairingService.claimToken(userId, dto.token);
  }

  @Get('duo')
  async getDuo(@CurrentUser('id') userId: string) {
    return this.pairingService.getDuo(userId);
  }

  @Delete('duo')
  async archiveDuo(@CurrentUser('id') userId: string) {
    return this.pairingService.archiveDuo(userId);
  }

  @Delete('tokens/:id')
  async revokeToken(
    @CurrentUser('id') userId: string,
    @Param('id') tokenId: string,
  ) {
    return this.pairingService.revokeToken(userId, tokenId);
  }
}
