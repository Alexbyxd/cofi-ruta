import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { getAuth } from '../better-auth/auth.provider';

interface BetterAuthUser {
  id: string;
  email: string;
  name?: string;
  image?: string | null;
  fullName?: string;
  avatarUrl?: string | null;
  role?: string;
  isActive?: boolean;
  specialty?: string | null;
  createdAt?: Date;
}

interface BetterAuthSession {
  user: BetterAuthUser;
  session: { id: string };
}

interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string | undefined;
  avatarUrl: string | null | undefined;
  role: string;
  createdAt: Date | undefined;
  sessionId: string;
}

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  session?: { id: string };
}

/**
 * JwtAuthGuard compatible with Better Auth
 *
 * Validates the Better Auth session from the Authorization header or cookies.
 * Extracts user and session info and attaches to request.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const auth = getAuth();

    try {
      // Better Auth expects the Web Headers type, not Node's IncomingHttpHeaders.
      const headers = new Headers();
      for (const [key, value] of Object.entries(request.headers)) {
        if (Array.isArray(value)) {
          for (const item of value) headers.append(key, item);
        } else if (value !== undefined) {
          headers.set(key, value);
        }
      }

      // Get session from Better Auth using request headers
      const session = (await auth.api.getSession({
        headers,
      })) as BetterAuthSession | null;

      if (!session?.user) {
        throw new UnauthorizedException('No autenticado');
      }

      const { user } = session;

      // Attach user and session to request (matching old interface)
      request.user = {
        id: user.id,
        email: user.email,
        fullName: user.fullName || user.name,
        avatarUrl: user.avatarUrl || user.image,
        role: user.role || 'USER',
        createdAt: user.createdAt,
        sessionId: session.session.id,
      };
      request.session = { id: session.session.id };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Sesión inválida o expirada');
    }
  }
}
