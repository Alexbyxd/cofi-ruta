import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { DomainException } from '../../common/errors/domain.exception';
import { RolesGuard } from './roles.guard';

function contextFor(user?: { role?: string }): ExecutionContext {
  const request = { user };
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

function codeOf(error: unknown): unknown {
  return ((error as DomainException).getResponse() as { code?: string }).code;
}

describe('RolesGuard', () => {
  let reflector: { getAllAndOverride: jest.Mock };
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('allows requests without role metadata', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    expect(guard.canActivate(contextFor({ role: Role.USER }))).toBe(true);
  });

  it('allows a user whose global role is required', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.SUPERADMIN]);
    expect(guard.canActivate(contextFor({ role: Role.SUPERADMIN }))).toBe(true);
  });

  it('rejects a user without the required global role', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.SUPERADMIN]);

    try {
      guard.canActivate(contextFor({ role: Role.USER }));
      throw new Error('Expected the guard to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(DomainException);
      expect(codeOf(error)).toBe('FORBIDDEN');
    }
  });

  it('rejects anonymous requests when a role is required', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.SUPERADMIN]);

    try {
      guard.canActivate(contextFor(undefined));
      throw new Error('Expected the guard to throw');
    } catch (error) {
      expect(codeOf(error)).toBe('FORBIDDEN');
    }
  });
});
