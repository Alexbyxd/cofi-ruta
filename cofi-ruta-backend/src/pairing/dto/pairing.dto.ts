import { z } from 'zod';

export const createPairingTokenSchema = z
  .object({
    type: z.enum(['DUO', 'GROUP']).default('DUO'),
    groupId: z.uuid('groupId inválido').optional(),
  })
  .refine((value) => value.type !== 'GROUP' || Boolean(value.groupId), {
    message: 'groupId es requerido para un token de tipo GROUP',
    path: ['groupId'],
  });

export type CreatePairingTokenDto = z.infer<typeof createPairingTokenSchema>;

export const claimPairingTokenSchema = z.object({
  token: z
    .string()
    .trim()
    .min(10, 'El token debe tener al menos 10 caracteres')
    .max(200, 'El token es demasiado largo'),
});

export type ClaimPairingTokenDto = z.infer<typeof claimPairingTokenSchema>;
