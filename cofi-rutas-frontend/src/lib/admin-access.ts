/**
 * Quién entra al panel administrativo (`/admin`) y qué puede ejecutar.
 *
 * CofiRutas tiene tres tipos de identidad:
 *
 * 1. `SUPERADMIN` — `User.role` (enum Prisma `Role`). Ve y ejecuta todo.
 * 2. `OWNER` — dueño de cafetería. **No** vive en `User.role`: el enum `Role`
 *    sólo tiene `USER` y `SUPERADMIN`. La pertenencia de un dueño es
 *    `MerchantStaff.role === MerchantRole.OWNER`, apuntando desde `MerchantStaff.userId`.
 * 3. `USER` — usuario normal de la app: usa `/inicio` y su home, nunca el panel.
 *
 * El backend expone la pertenencia en `GET /api/v1/panel-access`, que responde
 * `{ accountRole, merchantRole }`: `merchantRole` es la `MerchantStaff.role` de
 * mayor rango del usuario en sesión (`OWNER > MANAGER > STAFF`) o `null`. El
 * panel (`app/admin/page.tsx`) alimenta ese valor a `resolvePanelAccess`; sin
 * una pertenencia `OWNER`, un dueño de cafetería no entra al panel.
 */
export type PanelRole = 'SUPERADMIN' | 'OWNER' | 'USER';

export interface PanelSubject {
  /** `User.role`: `USER` o `SUPERADMIN`. */
  role?: string | null;
  /** `MerchantStaff.role` del usuario, cuando el backend lo provea. */
  merchantRole?: string | null;
}

export interface PanelAccess {
  role: PanelRole;
  canAccess: boolean;
  /**
   * Emitir el PIN diario y congelar la rotación son acciones globales de la
   * red: sólo el superadmin las ejecuta.
   */
  canRunGlobalActions: boolean;
}

export function resolvePanelAccess(
  subject: PanelSubject | null | undefined,
): PanelAccess {
  const accountRole = (subject?.role ?? '').toUpperCase();
  const merchantRole = (subject?.merchantRole ?? '').toUpperCase();

  if (accountRole === 'SUPERADMIN') {
    return { role: 'SUPERADMIN', canAccess: true, canRunGlobalActions: true };
  }

  if (merchantRole === 'OWNER') {
    return { role: 'OWNER', canAccess: true, canRunGlobalActions: false };
  }

  return { role: 'USER', canAccess: false, canRunGlobalActions: false };
}
