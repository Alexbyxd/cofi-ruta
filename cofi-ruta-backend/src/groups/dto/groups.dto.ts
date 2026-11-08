import { z } from 'zod';

export const createGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'El nombre del grupo debe tener al menos 2 caracteres')
    .max(60, 'El nombre del grupo es demasiado largo'),
  maxMembers: z
    .number('maxMembers debe ser un número')
    .int('maxMembers debe ser entero')
    .min(2, 'El grupo debe permitir al menos 2 miembros')
    .max(12, 'El grupo admite como máximo 12 miembros')
    .default(12),
  expiresInHours: z
    .number('expiresInHours debe ser un número')
    .min(1, 'La sala debe durar al menos 1 hora')
    .max(24, 'La sala admite como máximo 24 horas')
    .default(24),
});

export type CreateGroupDto = z.infer<typeof createGroupSchema>;

export const joinGroupSchema = z.union([
  z.object({
    code: z
      .string()
      .trim()
      .length(6, 'El código debe tener 6 caracteres')
      .regex(
        /^[A-HJ-NP-Z2-9]+$/,
        'El código contiene caracteres no permitidos',
      ),
  }),
  z.object({
    token: z
      .string()
      .trim()
      .min(10, 'El token debe tener al menos 10 caracteres'),
  }),
]);

export type JoinGroupDto = z.infer<typeof joinGroupSchema>;
