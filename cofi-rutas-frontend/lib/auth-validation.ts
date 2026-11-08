import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.string().email('Ingresá un correo electrónico válido').toLowerCase().trim(),
  // El backend solo exige que no esté vacía: la valida contra el hash.
  password: z.string().trim().min(1, 'La contraseña es requerida'),
});

export const registerFormSchema = loginFormSchema.extend({
  fullName: z.string().min(2, 'Ingresá tu nombre completo').trim(),
  // Debe coincidir con `registerSchema` del backend.
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .trim(),
});
