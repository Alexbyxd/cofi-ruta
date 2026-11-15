# ODD: Admin dashboard (/admin) + Inicio routing

Feature: separate the administrative console from the coffee drinker's home.
Branch: `feat/login-desktop-responsive`. Delivery: work-unit commits on the branch.
Runner: frontend `pnpm exec tsc --noEmit`, `pnpm test` (vitest), `pnpm build`, `pnpm exec eslint <files>`.

## Specs

S1: `/admin` carga la pantalla "Superadmin Dashboard Desktop — CofiRutas" (Stitch screen `cdb163c9e64b4f6ea216efc733cddbcc`, 2560×5316).

S2: `/admin` es el panel administrativo **tanto para SUPERADMIN como para OWNER**; en el caso de OWNER se ocultan los módulos que no le pertenecen.

S3: OWNER oculta solo las acciones globales: el generador de PIN y el freeze de emergencia. Ve KPIs, analítica, tabla de cafeterías y feed de check-ins.

S4: `/inicio` es la pantalla "Inicio — CofiRutas Desktop Dashboard" (Stitch screen `75fc9a3f1d214c97acea1155fe6c1aa7`). Ya existe y no cambia en esta feature.

S5: Existe el screen "Superadmin Dashboard Mobile — CofiRutas" (Stitch screen `a3749b1cc6c842d58cfe3b90cb0ad461`, 780×4568) y es la versión mobile del dashboard administrativo: KPIs apilados, chart "Usuarios vs Visitas Dúo", lista de cafeterías con PIN hoy / equipo / estado, sin sidebar y con navegación inferior.

S6: `/dashboard` queda como home del cafetero, sin widgets de administración.

S7: `/admin` tiene guard real por rol: sin rol SUPERADMIN ni OWNER no se entra.

S8: Hoy `/dashboard` redirige un SUPERADMIN a `/superadmin`, una ruta que no existe. Ese destino pasa a `/admin`.

S9: El seed crea de forma idempotente un dueño de cafetería: usuario con rol de cuenta `USER` más `MerchantStaff.role = OWNER` sobre una cafetería existente. Configurable con `OWNER_EMAIL` / `OWNER_PASSWORD` / `OWNER_CAFE_SLUG`; en producción no crea una contraseña conocida si falta `OWNER_PASSWORD`. Sin esta fila, `/admin` no puede resolver a un dueño.

## Risk

- item 2 (security): S7 introduce un gate de acceso a un panel administrativo. El gate del cliente no es autoridad: la API rechaza por rol con `RolesGuard` + `@Roles(...)`, reconstruido en `feat(auth)` después de que la migración a Better Auth lo borrara junto al stack viejo. El panel sigue sin datos reales, así que la única ruta de panel que existe es `GET /api/v1/panel-access`.
- item 6: el panel no tiene tests; la verificación es `tsc` + `next build` + smoke manual.

## Tasks

| ID | Specs | Route | Commit |
|----|-------|-------|--------|
| T1 | S1, S5 | Create `/admin` route with the desktop shell (sidebar + header + modules) | `68b8eec` |
| T2 | S5 | Mobile layout from the mobile screen: stacked modules + bottom nav, no sidebar | `68b8eec` |
| T3 | S2, S3, S7 | Role gate (SUPERADMIN/OWNER) and OWNER module hiding (PIN + freeze) | `68b8eec` |
| T4 | S6, S8 | `/dashboard` redirect `/superadmin` → `/admin`; no admin widgets in the home | `68b8eec` |
| T5 | all | Verify `tsc`, `vitest`, `next build`, `eslint` on touched files | see evidence |
| T6 | — | Record evidence in this document | `docs(odd)` |
| T7 | S2, S3, S9 | Seed idempotente del dueño + `MerchantStaff OWNER` + spec de DB | `feat(seed)` |

## Evidence (T5)

- `next build`: green, `/admin` and `/dashboard` both prerendered.
- `tsc -p tsconfig.json --noEmit`: clean.
- `eslint app/admin/page.tsx src/components/dashboard/AdminBottomNav.tsx`: clean.
- `vitest run`: 3 files / 12 tests, unchanged (no new test covers the panel).
- `test:db` (backend, con Postgres levantado): 6 suites / 43 tests verdes, incluido `test/db/seed.spec.ts`
  con el caso del dueño.
- Seed real corrido dos veces: `Dueño listo: owner@cofirutas.bo → perfecto-coffee-lounge (OWNER)`, y en
  la base queda exactamente **1** fila `MerchantStaff` (`OWNER`) y 1 usuario con ese email.
- Not verified: no browser smoke of `/admin` with a SUPERADMIN or OWNER session, and no visual
  comparison against the Stitch screens. Nothing on the panel calls the API yet, so there is no
  runtime data to check.

## Known gaps

- El redirect del cliente está respaldado por el servidor: `GET /api/v1/panel-access` exige `@Roles('SUPERADMIN','OWNER')` con `JwtAuthGuard` +
  `RolesGuard`, así que un `USER` recibe 403 y el panel lo manda a `/inicio`. Ningún otro endpoint de panel existe todavía: cuando se
  agreguen los de datos, cada uno necesita su propio `@Roles(...)`.
- Advisory findings from the approved review: **resueltos** el `orderBy` de la query `merchantStaff` (se
  reemplazó por una selección por rango `OWNER > MANAGER > STAFF`, que ya no depende del orden de filas),
  el comentario de cabecera de `src/lib/admin-access.ts`, la falta de test del controller
  (`panel-access.controller.spec.ts`, 8 casos) y el fetch de `/panel-access` sin timeout
  (`src/lib/panel-access.ts` con `AbortSignal`, 5 casos) y el label "Cuenta" de la nav mobile, que ahora se
  llama "Acciones" y apunta a `#acciones`, la sección de PIN diario y freeze de rotación. **No queda ningún
  advisory abierto de esa revisión.**
- Panel data is local to the components; no endpoint feeds the KPIs, charts, table or feed.
- `EmergencyFreezeButton` still logs its intent and holds a `TODO` for the freeze endpoint.
- The mobile bottom nav uses section anchors and a four-module set; the Stitch mobile screen shows a
  user-facing bar (Rutas / Explorar / Pasaporte / Perfil) that does not fit an admin console.

## Log

### L1 (verbatim, 2026-11-15)

> "haber te comento como esta la estructura, la ruta /admin deberia cargar la pantalla "Superadmin Dashboard Desktop — CofiRutas" este sera el admin admisnitrativo tanto para el super andmin como el owner (en el caso de owner se ocultaran los modulos que no le pertenecen). y para /inicio es la pantalla "Inicio — CofiRutas Desktop Dashboard". ten en cuenta que tambien hay un screen llamado "Superadmin Dashboard Mobile — CofiRutas" y este es la version mobil del dashboard administrativo. tienes alguna duda?"

### L2 (decisions, 2026-11-15)

- `/dashboard` queda como home del cafetero, sin widgets admin.
- OWNER oculta solo generador de PIN + freeze de emergencia.
- El export mobile se baja con el Stitch CLI desde el proyecto `17305238942107884719`.
- La protección de `/admin` por rol entra en este alcance.

### L3 (evidence, before implementation)

- `app/` tenía `auth`, `dashboard`, `inicio`, `login`, `page.tsx`. No existía `/admin`.
- `7db25d7` agregó 8 componentes de dashboard administrativo y nadie los importa: código muerto hasta esta feature.
- `1cdac32` convirtió `/dashboard` en la home del cafetero; conserva el redirect a `/superadmin` (ruta inexistente).
- Los 3 HTML de Stitch en la raíz del repo están sin trackear: `dashboard-superadmin-desktop.html` (CofiRutas Superadmin - Oruro Operations HQ), `stitch-inicio-desktop.html`, `stitch-inicio-mobile.html`.

### L4 (resolución de la pertenencia de merchant, 2026-11-15)

- Corregido un dato falso de la documentación: `GET /api/v1/panel-access` **ya** resolvía `merchantRole`
  desde `MerchantStaff` y `app/admin/page.tsx` ya lo consumía. El plan original de "crear el módulo de
  merchants" partía de un gap inexistente; se verificó contra el árbol antes de escribir código.
- Bug real encontrado: la query no tenía `orderBy` y el código usaba `memberships[0]?.role`, así que con
  varias pertenencias el resultado dependía del orden arbitrario de Postgres. RED: `[{STAFF},{MANAGER}]`
  devolvía `STAFF`. GREEN: selección por rango `OWNER > MANAGER > STAFF` en `MERCHANT_ROLE_RANK`.
- Evidencia: `pnpm exec jest src/auth/panel-access.controller.spec.ts` 8/8; `pnpm test:unit` 12 suites /
  55 tests verdes.
- No cambia el contrato de la respuesta (`{ accountRole, merchantRole }`) ni amplía el acceso: el panel
  solo admite `merchantRole === 'OWNER'`, y la ruta sigue respaldada por `JwtAuthGuard` + `RolesGuard`.

### L5 (timeout del fetch de `/panel-access`, 2026-11-15)

- Advisory real: el panel bloquea la pantalla con un spinner hasta que `accessResolved` es `true`, y la
  lectura de `/panel-access` no tenía cota. Una API colgada dejaba "Cargando consola..." para siempre.
- Se extrajo la lectura a `src/lib/panel-access.ts` (`fetchPanelAccess`, `PANEL_ACCESS_TIMEOUT_MS = 8000`)
  con `AbortController` + `Promise.race` (el race cubre también a un `fetchImpl` que ignore la señal).
  Devuelve `null` en 403, timeout, red caída o JSON inválido: sin pertenencia válida no se entra al panel.
- `app/admin/page.tsx` consume el módulo; el `finally` sigue marcando `accessResolved` en todos los casos.
- Evidencia: `pnpm exec vitest run src/lib/panel-access.spec.ts` 5/5; `pnpm test` 5 archivos / 22 tests;
  `tsc --noEmit` y `eslint` sobre los archivos tocados, limpios.

### L6 (label "Cuenta" de la nav mobile, 2026-11-15)

- El ítem `#cuenta` de `AdminBottomNav` se llamaba "Cuenta" con ícono de usuario, pero la sección destino es
  `aria-label="Acciones globales"`: PIN diario y freeze de rotación. Para un OWNER ni siquiera hay acciones,
  solo una nota explicando que no le corresponden. La etiqueta prometía una pantalla de cuenta inexistente.
- Se renombró a "Acciones" con ícono `ShieldCheck` y el ancla pasó de `#cuenta` a `#acciones`, así el label
  nombra el módulo al que lleva. Verificación: los cuatro `href` de la nav (`#resumen`, `#cafeterias`,
  `#checkins`, `#acciones`) existen como `id` en `app/admin/page.tsx`; `tsc --noEmit` y `eslint` limpios.
- Sin test propio: es copy/estructura, no comportamiento. El bucle de la nav ya se prueba en el
  comportamiento que importa —qué acceso resuelve el panel— vía `admin-access.spec.ts` y el spec del módulo.
