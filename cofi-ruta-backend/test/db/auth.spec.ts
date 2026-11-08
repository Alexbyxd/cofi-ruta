import type { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';

// @nestjs/jwt v12 and @nestjs/passport v12 are ESM-only and the DB suite runs
// through ts-jest/CJS. Mock the classes needed for DI metadata; the test uses
// its own HS256 helpers below.
jest.mock('@nestjs/jwt', () => ({
  JwtService: class MockJwtService {},
}));

jest.mock('@nestjs/passport', () => ({
  PassportStrategy: () => class MockPassportStrategy {},
}));
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Pool } from 'pg';
import { AuthService } from '../../src/auth/auth.service';
import { JwtStrategy } from '../../src/auth/strategies/jwt.strategy';
import { DomainException } from '../../src/common/errors/domain.exception';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createTestPrisma, truncateAll, uniqueSuffix } from './helpers';

const PASSWORD = 'secreto123';

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

// @nestjs/jwt v12 is ESM-only and the DB suite runs through ts-jest/CJS.
// A minimal HS256 implementation keeps the integration test dependency-free.
function signJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
  ).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const body = Buffer.from(
    JSON.stringify({ ...payload, iat: now, exp: now + 900 }),
  ).toString('base64url');
  const data = `${header}.${body}`;
  const signature = crypto
    .createHmac('sha256', process.env.JWT_ACCESS_SECRET!)
    .update(data)
    .digest('base64url');

  return `${data}.${signature}`;
}

function verifyJwt<T>(token: string): T {
  const [header, body, signature] = token.split('.');
  const expected = crypto
    .createHmac('sha256', process.env.JWT_ACCESS_SECRET!)
    .update(`${header}.${body}`)
    .digest('base64url');

  expect(signature).toBe(expected);

  const payload = JSON.parse(
    Buffer.from(body, 'base64url').toString('utf8'),
  ) as T & { exp: number };
  expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));

  return payload;
}

const fakeJwtService = {
  signAsync: (payload: Record<string, unknown>) =>
    Promise.resolve(signJwt(payload)),
} as unknown as JwtService;

async function captureError(
  promise: Promise<unknown>,
): Promise<DomainException> {
  try {
    await promise;
  } catch (error) {
    expect(error).toBeInstanceOf(DomainException);
    return error as DomainException;
  }
  throw new Error('Expected the promise to reject with a DomainException');
}

function codeOf(error: DomainException): unknown {
  return (error.getResponse() as { code?: string }).code;
}

describe('Auth (Fase 0)', () => {
  let prisma: PrismaClient;
  let pool: Pool;
  let service: AuthService;
  let strategy: JwtStrategy;

  beforeAll(() => {
    const test = createTestPrisma();
    prisma = test.prisma;
    pool = test.pool;
    service = new AuthService(
      prisma as unknown as PrismaService,
      fakeJwtService,
    );
    strategy = new JwtStrategy(prisma as unknown as PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  beforeEach(async () => {
    await truncateAll(prisma);
  });

  function credentials() {
    return {
      email: `user-${uniqueSuffix()}@cofi.test`,
      password: PASSWORD,
      fullName: 'Usuario de prueba',
    };
  }

  async function registerUser() {
    const dto = credentials();
    const result = await service.register(dto);
    return { dto, result };
  }

  it('registers with normalized email, bcrypt cost 12 and an opaque 30-day refresh token', async () => {
    const result = await service.register({
      email: '  Ana.Lopez@Example.COM ',
      password: PASSWORD,
      fullName: 'Ana López',
    });

    expect(result.user.email).toBe('ana.lopez@example.com');

    const stored = await prisma.user.findUniqueOrThrow({
      where: { id: result.user.id },
    });
    expect(stored.passwordHash).toMatch(/^\$2[aby]\$12\$/);
    expect(await bcrypt.compare(PASSWORD, stored.passwordHash!)).toBe(true);

    const session = await prisma.session.findFirstOrThrow({
      where: { userId: stored.id },
    });
    expect(session.tokenHash).toBe(sha256(result.refreshToken));
    expect(result.refreshToken).not.toContain('.');
    expect(
      Math.abs(
        session.expiresAt.getTime() - (Date.now() + 30 * 24 * 60 * 60 * 1000),
      ),
    ).toBeLessThan(5_000);

    const payload = verifyJwt<{
      sub: string;
      sid: string;
      role: string;
    }>(result.accessToken);
    expect(payload.sub).toBe(stored.id);
    expect(payload.sid).toBe(session.id);
    expect(payload.role).toBe('USER');
  });

  it('rejects a duplicate email regardless of case', async () => {
    const dto = credentials();
    await service.register(dto);

    const error = await captureError(
      service.register({ ...dto, email: dto.email.toUpperCase() }),
    );
    expect(codeOf(error)).toBe('EMAIL_ALREADY_REGISTERED');
  });

  it('rejects invalid credentials and inactive accounts', async () => {
    const { dto, result } = await registerUser();

    const wrong = await captureError(
      service.login({ email: dto.email, password: 'incorrecta123' }),
    );
    expect(codeOf(wrong)).toBe('INVALID_CREDENTIALS');

    const unknown = await captureError(
      service.login({ email: 'nadie@cofi.test', password: PASSWORD }),
    );
    expect(codeOf(unknown)).toBe('INVALID_CREDENTIALS');

    await prisma.user.update({
      where: { id: result.user.id },
      data: { isActive: false },
    });

    const inactive = await captureError(
      service.login({ email: dto.email, password: PASSWORD }),
    );
    expect(codeOf(inactive)).toBe('ACCOUNT_INACTIVE');
  });

  it('rotates the refresh token and rejects the previous one', async () => {
    const { result } = await registerUser();

    const rotated = await service.refreshTokens(result.refreshToken);
    expect(rotated.refreshToken).not.toBe(result.refreshToken);
    expect(rotated.accessToken).toBeTruthy();

    const reused = await captureError(
      service.refreshTokens(result.refreshToken),
    );
    expect(codeOf(reused)).toBe('INVALID_REFRESH_TOKEN');

    const session = await prisma.session.findFirstOrThrow({
      where: { userId: result.user.id },
    });
    expect(session.tokenHash).toBe(sha256(rotated.refreshToken));
    expect(session.lastUsedAt).not.toBeNull();
  });

  it('revokes the current session on logout and all sessions on logout-all', async () => {
    const { dto, result } = await registerUser();
    await service.login(dto);

    expect(await prisma.session.count({ where: { revokedAt: null } })).toBe(2);

    const revoked = await service.logout(result.refreshToken);
    expect(revoked.revoked).toBe(1);

    const afterLogout = await captureError(
      service.refreshTokens(result.refreshToken),
    );
    expect(codeOf(afterLogout)).toBe('INVALID_REFRESH_TOKEN');

    await service.logoutAll(result.user.id);
    expect(await prisma.session.count({ where: { revokedAt: null } })).toBe(0);
  });

  it('changes the password, revokes other sessions and keeps the current one', async () => {
    const { dto, result } = await registerUser();
    const second = await service.login(dto);

    const secondPayload = verifyJwt<{ sid: string }>(second.accessToken);

    await service.changePassword(result.user.id, secondPayload.sid, {
      currentPassword: PASSWORD,
      newPassword: 'nuevaClave123',
    });

    const sessions = await prisma.session.findMany({
      where: { userId: result.user.id },
      orderBy: { createdAt: 'asc' },
    });
    const current = sessions.find((s) => s.id === secondPayload.sid);
    const other = sessions.find((s) => s.id !== secondPayload.sid);
    expect(current?.revokedAt).toBeNull();
    expect(other?.revokedAt).not.toBeNull();

    const oldPassword = await captureError(
      service.login({ email: dto.email, password: PASSWORD }),
    );
    expect(codeOf(oldPassword)).toBe('INVALID_CREDENTIALS');

    const newPassword = await service.login({
      email: dto.email,
      password: 'nuevaClave123',
    });
    expect(newPassword.accessToken).toBeTruthy();
  });

  it('rejects a wrong current password and a missing password hash', async () => {
    const { dto, result } = await registerUser();
    const payload = verifyJwt<{ sid: string }>(result.accessToken);

    const wrong = await captureError(
      service.changePassword(result.user.id, payload.sid, {
        currentPassword: 'incorrecta123',
        newPassword: 'nuevaClave123',
      }),
    );
    expect(codeOf(wrong)).toBe('WRONG_PASSWORD');

    const googleUser = await prisma.user.create({
      data: {
        email: `google-${uniqueSuffix()}@cofi.test`,
        fullName: 'Solo Google',
      },
    });
    const noPassword = await captureError(
      service.changePassword(googleUser.id, payload.sid, {
        currentPassword: PASSWORD,
        newPassword: 'nuevaClave123',
      }),
    );
    expect(codeOf(noPassword)).toBe('PASSWORD_NOT_SET');

    expect(dto.email).toBeTruthy();
  });

  it('lists, revokes and scopes sessions to their owner', async () => {
    const first = await registerUser();
    const second = await service.login(first.dto);

    const sessions = await service.getSessions(first.result.user.id);
    expect(sessions).toHaveLength(2);
    expect(sessions[0]).not.toHaveProperty('tokenHash');

    const target = sessions[0];
    expect(target).toBeDefined();

    await service.revokeSession(first.result.user.id, target.id);
    const remaining = await service.getSessions(first.result.user.id);
    expect(remaining).toHaveLength(1);

    const otherUser = await registerUser();
    const notMine = await captureError(
      service.revokeSession(otherUser.result.user.id, target.id),
    );
    expect(codeOf(notMine)).toBe('SESSION_NOT_FOUND');

    expect(second.accessToken).toBeTruthy();
  });

  it('updates the profile of the current user', async () => {
    const { result } = await registerUser();

    const updated = await service.updateProfile(result.user.id, {
      fullName: 'Nombre Actualizado',
      avatarUrl: 'https://example.com/avatar.png',
    });

    expect(updated.fullName).toBe('Nombre Actualizado');
    expect(updated.avatarUrl).toBe('https://example.com/avatar.png');
    expect(updated).not.toHaveProperty('passwordHash');
  });

  it('links a verified Google account and rejects an unverified email', async () => {
    const dto = credentials();

    const rejected = await captureError(
      service.googleLogin({
        googleId: `google-${uniqueSuffix()}`,
        email: dto.email,
        emailVerified: false,
        fullName: 'Google Sin Verificar',
      }),
    );
    expect(codeOf(rejected)).toBe('GOOGLE_EMAIL_NOT_VERIFIED');
    expect(await prisma.user.count()).toBe(0);

    const googleId = `google-${uniqueSuffix()}`;
    const linked = await service.googleLogin({
      googleId,
      email: dto.email,
      emailVerified: true,
      fullName: 'Google Verificado',
      avatarUrl: 'https://example.com/google.png',
    });
    expect(linked.user.email).toBe(dto.email.toLowerCase());
    expect(
      await prisma.account.count({
        where: { provider: 'google', providerAccountId: googleId },
      }),
    ).toBe(1);

    const again = await service.googleLogin({
      googleId,
      email: dto.email,
      emailVerified: true,
      fullName: 'Google Verificado',
    });
    expect(again.user.id).toBe(linked.user.id);
    expect(await prisma.user.count()).toBe(1);
  });

  it('rejects inactive users and revoked sessions in the JWT strategy', async () => {
    const { result } = await registerUser();
    const payload = verifyJwt<{ sub: string; sid: string }>(result.accessToken);

    const active = await strategy.validate({
      sub: payload.sub,
      sid: payload.sid,
      email: 'x@cofi.test',
      role: 'USER',
    });
    expect(active.id).toBe(result.user.id);
    expect(active.sessionId).toBe(payload.sid);

    await prisma.session.update({
      where: { id: payload.sid },
      data: { revokedAt: new Date() },
    });
    const revoked = await captureError(
      strategy.validate({
        sub: payload.sub,
        sid: payload.sid,
        email: 'x@cofi.test',
        role: 'USER',
      }),
    );
    expect(codeOf(revoked)).toBe('SESSION_EXPIRED');

    const fresh = await service.login({
      email: result.user.email,
      password: PASSWORD,
    });
    const freshPayload = verifyJwt<{ sid: string }>(fresh.accessToken);
    await prisma.user.update({
      where: { id: result.user.id },
      data: { isActive: false },
    });

    const inactive = await captureError(
      strategy.validate({
        sub: payload.sub,
        sid: freshPayload.sid,
        email: 'x@cofi.test',
        role: 'USER',
      }),
    );
    expect(codeOf(inactive)).toBe('ACCOUNT_INACTIVE');
  });
});
