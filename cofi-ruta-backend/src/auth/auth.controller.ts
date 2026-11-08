import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Ip,
  Headers,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService, type SessionMeta } from './auth.service';
import type {
  ChangePasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  UpdateProfileDto,
} from './dto/auth.dto';
import {
  changePasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  updateProfileSchema,
} from './dto/auth.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { validateEnv } from '../config/env.validation';

const env = validateEnv();

interface GoogleAuthResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string | null;
    role?: string;
    createdAt?: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private meta(userAgent?: string, ipAddress?: string): SessionMeta {
    return { userAgent: userAgent ?? null, ipAddress: ipAddress ?? null };
  }

  @Post('register')
  async register(
    @Body(new ZodValidationPipe(registerSchema)) dto: RegisterDto,
    @Headers('user-agent') userAgent?: string,
    @Ip() ipAddress?: string,
  ) {
    return this.authService.register(dto, this.meta(userAgent, ipAddress));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) dto: LoginDto,
    @Headers('user-agent') userAgent?: string,
    @Ip() ipAddress?: string,
  ) {
    return this.authService.login(dto, this.meta(userAgent, ipAddress));
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
      this.meta(userAgent, ipAddress),
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Body(new ZodValidationPipe(refreshTokenSchema)) dto: RefreshTokenDto,
  ) {
    return this.authService.logout(dto.refreshToken);
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAll(@CurrentUser('id') userId: string) {
    return this.authService.logoutAll(userId);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth(): void {
    // Passport inicia el flujo de OAuth2 y redirige a Google automáticamente.
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthCallback(
    @Req() req: Request & { user: GoogleAuthResult },
    @Res() res: Response,
  ): void {
    const { accessToken, refreshToken, user } = req.user;

    // Responde con una página HTML mínima que guarda los tokens en
    // sessionStorage (nunca en la URL) y redirige al frontend. Esto evita
    // enviar credenciales por query string y elimina el vector de open redirect.
    const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>CofiRutas — Autenticación con Google</title></head>
<body>
<script>
  (function () {
    try {
      sessionStorage.setItem('cofi_google_accessToken', ${JSON.stringify(accessToken)});
      sessionStorage.setItem('cofi_google_refreshToken', ${JSON.stringify(refreshToken)});
      sessionStorage.setItem('cofi_google_user', ${JSON.stringify(user)});
    } catch (e) {
      // sessionStorage no disponible (modo privado, etc.)
    }
    window.location.replace(${JSON.stringify(env.FRONTEND_URL + '/auth/callback')});
  })();
</script>
</body>
</html>
    `;

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  }
}

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  async getMe(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }

  @Patch()
  async updateMe(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(updateProfileSchema)) dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(userId, dto);
  }

  @Patch('password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser('id') userId: string,
    @CurrentUser('sessionId') sessionId: string,
    @Body(new ZodValidationPipe(changePasswordSchema)) dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, sessionId, dto);
  }

  @Get('sessions')
  async getSessions(@CurrentUser('id') userId: string) {
    return { data: await this.authService.getSessions(userId) };
  }

  @Delete('sessions/:id')
  @HttpCode(HttpStatus.OK)
  async revokeSession(
    @CurrentUser('id') userId: string,
    @Param('id') sessionId: string,
  ) {
    return this.authService.revokeSession(userId, sessionId);
  }
}
