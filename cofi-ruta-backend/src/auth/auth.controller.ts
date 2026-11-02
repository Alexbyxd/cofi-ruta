import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Ip,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from './dto/auth.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body(new ZodValidationPipe(registerSchema)) dto: RegisterDto,
    @Headers('user-agent') userAgent?: string,
    @Ip() ipAddress?: string,
  ) {
    return this.authService.register(dto, userAgent, ipAddress);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) dto: LoginDto,
    @Headers('user-agent') userAgent?: string,
    @Ip() ipAddress?: string,
  ) {
    return this.authService.login(dto, userAgent, ipAddress);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body(new ZodValidationPipe(refreshTokenSchema)) dto: RefreshTokenDto,
    @Headers('user-agent') userAgent?: string,
    @Ip() ipAddress?: string,
  ) {
    return this.authService.refreshTokens(
      dto.refreshToken,
      userAgent,
      ipAddress,
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Body(new ZodValidationPipe(refreshTokenSchema)) dto: RefreshTokenDto,
  ) {
    return this.authService.logout(dto.refreshToken);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }
}
