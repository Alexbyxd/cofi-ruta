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
  GoogleSignupDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  UpdateProfileDto,
} from './dto/auth.dto';
import {
  changePasswordSchema,
  googleSignupSchema,
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

interface GoogleAuthSuccess {
  status?: 'authenticated';
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

interface GoogleAuthSignupRequired {
  status: 'signup_required';
  signupToken: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
}

type GoogleAuthResult = GoogleAuthSuccess | GoogleAuthSignupRequired;

/** Serializa datos para embeberlos en un `<script>` sin permitir `</script>`. */
function jsonForScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
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

  @Post('google/register')
  @HttpCode(HttpStatus.CREATED)
  async googleRegister(
    @Body(new ZodValidationPipe(googleSignupSchema)) dto: GoogleSignupDto,
    @Headers('user-agent') userAgent?: string,
    @Ip() ipAddress?: string,
  ) {
    return this.authService.registerWithGoogle(
      dto.signupToken,
      this.meta(userAgent, ipAddress),
    );
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthCallback(
    @Req() req: Request & { user: GoogleAuthResult },
    @Res() res: Response,
  ): void {
    // Passport tipa `req.user` como `Express.User`; en este callback siempre
    // es el resultado que devuelve `GoogleStrategy.validate`.
    const result = req.user;

    // Responde con una página HTML mínima que guarda los datos en
    // sessionStorage (nunca en la URL) y redirige al frontend. Esto evita
    // enviar credenciales por query string y elimina el vector de open redirect.
    let storageScript: string;

    if (result.status === 'signup_required') {
      storageScript = `sessionStorage.setItem('cofi_google_signup', ${jsonForScript(
        {
          signupToken: result.signupToken,
          email: result.email,
          fullName: result.fullName,
          avatarUrl: result.avatarUrl ?? null,
        },
      )});`;
    } else {
      storageScript = [
        `sessionStorage.setItem('cofi_google_accessToken', ${jsonForScript(result.accessToken)});`,
        `sessionStorage.setItem('cofi_google_refreshToken', ${jsonForScript(result.refreshToken)});`,
        `sessionStorage.setItem('cofi_google_user', ${jsonForScript(result.user)});`,
      ].join('\n      ');
    }

    const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>CofiRutas — Autenticación con Google</title></head>
<body>
<script>
  (function () {
    try {
      ${storageScript}
    } catch (e) {
      // sessionStorage no disponible (modo privado, etc.)
    }
    window.location.replace(${jsonForScript(env.FRONTEND_URL + '/auth/callback')});
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
