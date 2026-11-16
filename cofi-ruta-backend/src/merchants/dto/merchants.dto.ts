import { z } from 'zod';

/**
 * Roles que un OWNER puede asignar desde el panel.
 *
 * `OWNER` figura en el enum del pipe a propósito: la transferencia de propiedad
 * es otra operación y el rechazo tiene que ser un error de dominio con código
 * estable (`MERCHANT_ROLE_NOT_ASSIGNABLE`), no un 400 genérico de validación.
 * Cualquier valor fuera del enum sí es un cuerpo inválido.
 */
export const assignableMerchantRoleSchema = z.enum(
  ['OWNER', 'MANAGER', 'STAFF'],
  { error: 'El rol debe ser MANAGER o STAFF' },
);

export const createStaffSchema = z
  .object({
    email: z
      .string('El correo es obligatorio')
      .trim()
      .toLowerCase()
      .pipe(z.email('El correo no es válido')),
    role: assignableMerchantRoleSchema,
  })
  .strict();

export type CreateStaffDto = z.infer<typeof createStaffSchema>;

export const updateStaffSchema = z
  .object({
    role: assignableMerchantRoleSchema,
  })
  .strict();

export type UpdateStaffDto = z.infer<typeof updateStaffSchema>;
