import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters long')
    .trim(),
  avatarUrl: z.string().url('Invalid avatar URL').optional().nullable(),
});

export type RegisterDto = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginDto = z.infer<typeof loginSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
