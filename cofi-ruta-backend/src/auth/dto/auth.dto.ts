import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email('Dirección de correo inválida').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
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

export const googleSignupSchema = z.object({
  signupToken: z
    .string()
    .min(1, 'El token de registro con Google es requerido')
    .trim(),
});

export type GoogleSignupDto = z.infer<typeof googleSignupSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'El token de refresco es requerido').trim(),
});

export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;

export const updateProfileSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'El nombre completo debe tener al menos 2 caracteres')
      .trim()
      .optional(),
    avatarUrl: z.url('URL de avatar inválida').nullable().optional(),
  })
  .refine(
    (value) => value.fullName !== undefined || value.avatarUrl !== undefined,
    { message: 'Debes enviar al menos un campo para actualizar' },
  );

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'La contraseña actual es requerida')
      .trim(),
    newPassword: z
      .string()
      .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
      .trim(),
  })
  .refine((value) => value.currentPassword !== value.newPassword, {
    message: 'La nueva contraseña debe ser distinta de la actual',
    path: ['newPassword'],
  });

export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
