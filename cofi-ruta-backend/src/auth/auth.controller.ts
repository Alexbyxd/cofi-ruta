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
  Req,
  Res,
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
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
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
