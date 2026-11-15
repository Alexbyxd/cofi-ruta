/**
 * Lectura de `GET /api/v1/panel-access`, el endpoint que resuelve **quién** es
 * el usuario en sesión para el panel administrativo.
 *
 * Responde `{ accountRole, merchantRole }`:
 *
 * - `accountRole`: `User.role` (`USER` | `SUPERADMIN`).
 * - `merchantRole`: la `MerchantStaff.role` de mayor rango del usuario
 *   (`OWNER > MANAGER > STAFF`) o `null` si no pertenece a ningún merchant.
 *
 * La ruta está protegida con `JwtAuthGuard` + `RolesGuard`: un `USER` recibe
 * 403 y aquí se traduce a `null`, que `resolvePanelAccess` resuelve como "no
 * entra al panel".
 *
 * El fetch lleva timeout propio porque el panel bloquea la pantalla con un
 * spinner hasta que el acceso se resuelve (`accessResolved`): sin cota, una API
 * colgada deja al operador mirando "Cargando consola..." para siempre.
 */

export interface PanelAccessPayload {
  accountRole: string;
  merchantRole: string | null;
}

export interface FetchPanelAccessOptions {
  /** Inyectable para los tests; por defecto el `fetch` global. */
  fetchImpl?: typeof fetch;
  /** Cota en milisegundos. Por defecto `PANEL_ACCESS_TIMEOUT_MS`. */
  timeoutMs?: number;
}

/**
 * Cota por defecto del request. Suficiente para una API local o de red normal,
 * y corta como para que el spinner nunca sea la experiencia final.
 */
export const PANEL_ACCESS_TIMEOUT_MS = 8_000;

export async function fetchPanelAccess(
  baseUrl: string,
  options: FetchPanelAccessOptions = {},
): Promise<PanelAccessPayload | null> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const requestedTimeout = options.timeoutMs ?? PANEL_ACCESS_TIMEOUT_MS;
  const timeoutMs =
    Number.isFinite(requestedTimeout) && requestedTimeout > 0
      ? requestedTimeout
      : PANEL_ACCESS_TIMEOUT_MS;

  const url = `${baseUrl.replace(/\/+$/, '')}/panel-access`;
  const controller = new AbortController();

  let timer: ReturnType<typeof setTimeout> | undefined;
  const timedOut = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      // El abort cierra la conexión real; el reject cubre a un `fetchImpl` que
      // ignore la señal.
      controller.abort();
      reject(new DOMException('Panel access request timed out.', 'TimeoutError'));
    }, timeoutMs);
  });

  try {
    const response = await Promise.race([
      fetchImpl(url, { credentials: 'include', signal: controller.signal }),
      timedOut,
    ]);

    if (!response.ok) return null;

    return (await response.json()) as PanelAccessPayload;
  } catch {
    // 403, timeout, red caída o JSON inválido: sin respuesta válida no hay
    // pertenencia que resolver, y el lado seguro es no entrar al panel.
    return null;
  } finally {
    clearTimeout(timer);
  }
}
