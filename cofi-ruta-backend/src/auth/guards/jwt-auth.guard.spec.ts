import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { getAuth } from '../better-auth/auth.provider';

jest.mock('../better-auth/auth.provider', () => ({
  getAuth: jest.fn(),
}));

const mockedGetAuth = getAuth as jest.MockedFunction<typeof getAuth>;

function contextFor(headers: Record<string, string> = {}): ExecutionContext {
  const request = { headers };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  let getSession: jest.Mock;

  beforeEach(() => {
    getSession = jest.fn();
    mockedGetAuth.mockReturnValue({
      api: { getSession },
    } as unknown as ReturnType<typeof getAuth>);
  });

  it('maps the Better Auth session into the legacy request.user shape', async () => {
    getSession.mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'ana@cofi.test',
        name: 'Ana',
        image: null,
        fullName: 'Ana Pérez',
        avatarUrl: 'https://cdn.test/ana.png',
        role: 'SUPERADMIN',
        createdAt: new Date('2026-01-01T00:00:00Z'),
      },
      session: { id: 'session-1' },
    });

    const context = contextFor({ cookie: 'better-auth.session_token=abc' });
    await expect(new JwtAuthGuard().canActivate(context)).resolves.toBe(true);

    const request = context.switchToHttp().getRequest();
    expect(request.user).toEqual({
      id: 'user-1',
      email: 'ana@cofi.test',
      fullName: 'Ana Pérez',
      avatarUrl: 'https://cdn.test/ana.png',
      role: 'SUPERADMIN',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      sessionId: 'session-1',
    });
    expect(request.session).toEqual({ id: 'session-1' });
  });

  it('falls back to Better Auth name/image and USER role', async () => {
    getSession.mockResolvedValue({
      user: {
        id: 'user-2',
        email: 'beto@cofi.test',
        name: 'Beto',
        image: 'https://cdn.test/beto.png',
        createdAt: new Date('2026-01-02T00:00:00Z'),
      },
      session: { id: 'session-2' },
    });

    const context = contextFor();
    await new JwtAuthGuard().canActivate(context);

    const request = context.switchToHttp().getRequest();
    expect(request.user.fullName).toBe('Beto');
    expect(request.user.avatarUrl).toBe('https://cdn.test/beto.png');
    expect(request.user.role).toBe('USER');
  });

  it('rejects a request without a session', async () => {
    getSession.mockResolvedValue(null);

    await expect(
      new JwtAuthGuard().canActivate(contextFor()),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects when Better Auth cannot validate the session', async () => {
    getSession.mockRejectedValue(new Error('boom'));

    await expect(
      new JwtAuthGuard().canActivate(contextFor()),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
