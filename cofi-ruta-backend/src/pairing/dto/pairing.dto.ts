import { z } from 'zod';

export const createPairingTokenSchema = z.object({
  type: z.enum(['DUO', 'GROUP']).default('DUO'),
  groupId: z.string().uuid().optional(),
});

export type CreatePairingTokenDto = z.infer<typeof createPairingTokenSchema>;

export const claimPairingTokenSchema = z.object({
  token: z.string().min(4, 'Token must be at least 4 characters').trim(),
});

export type ClaimPairingTokenDto = z.infer<typeof claimPairingTokenSchema>;
