import { describe, expect, it } from 'vitest';
import { resolvePanelAccess } from './admin-access';

describe('resolvePanelAccess', () => {
  it('gives a SUPERADMIN the whole panel, global actions included', () => {
    expect(resolvePanelAccess({ role: 'SUPERADMIN' })).toEqual({
      role: 'SUPERADMIN',
      canAccess: true,
      canRunGlobalActions: true,
    });
  });

  it('gives a merchant OWNER the panel without the global actions', () => {
    expect(resolvePanelAccess({ role: 'USER', merchantRole: 'OWNER' })).toEqual({
      role: 'OWNER',
      canAccess: true,
      canRunGlobalActions: false,
    });
  });

  it('keeps a plain USER out of the panel', () => {
    expect(resolvePanelAccess({ role: 'USER' })).toEqual({
      role: 'USER',
      canAccess: false,
      canRunGlobalActions: false,
    });
  });

  it('keeps a merchant OWNER role that arrives without a merchant membership out', () => {
    // `User.role` cannot be OWNER: the Prisma `Role` enum only has USER and
    // SUPERADMIN. Ownership comes from `MerchantStaff.role`.
    expect(resolvePanelAccess({ role: 'OWNER' }).canAccess).toBe(false);
  });

  it('treats a missing session as a plain USER', () => {
    expect(resolvePanelAccess(null)).toEqual({
      role: 'USER',
      canAccess: false,
      canRunGlobalActions: false,
    });
  });
});
