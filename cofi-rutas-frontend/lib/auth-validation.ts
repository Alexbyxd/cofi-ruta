import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.string().email('Ingresá un correo electrónico válido').toLowerCase().trim(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerFormSchema = loginFormSchema.extend({
  fullName: z.string().min(2, 'Ingresá tu nombre completo').trim(),
});
