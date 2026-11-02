import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email('Dirección de correo inválida').toLowerCase().trim(),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .trim(),
  fullName: z
    .string()
    .min(2, 'El nombre completo debe tener al menos 2 caracteres')
    .trim(),
  avatarUrl: z.url('URL de avatar inválida').optional().nullable(),
});

export type RegisterDto = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email('Dirección de correo inválida').toLowerCase().trim(),
  password: z.string().min(1, 'La contraseña es requerida').trim(),
});

export type LoginDto = z.infer<typeof loginSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'El token de refresco es requerido').trim(),
});

export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
