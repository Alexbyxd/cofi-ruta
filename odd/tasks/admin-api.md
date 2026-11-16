# ODD: admin-api

Objetivo: construir los endpoints que faltan, módulo por módulo, antes de cablear el panel administrativo a la API.
Branch: `feat/admin-api` (desde `develop`). Delivery: slices verticales, un work-unit commit por módulo. Runner: `pnpm test:unit` + `pnpm test:db` (backend), `pnpm test` (frontend, solo en S7).

## Specs

S0 (estado de partida, verificado en el árbol el 2026-11-15): existen `auth` (Better Auth + `GET /api/v1/panel-access`),
`cafes` (`GET /cafes/:slug`, `:slug/menu`, `:slug/reviews`), `pairing` y `groups`. **No existen** endpoints de merchants,
visitas, check-ins, reseñas (escritura/moderación), PIN diario ni agregación administrativa. Los modelos de Prisma ya están
(`MerchantStaff`, `Visit`, `VisitParticipant`, `VisitItem`, `DailyPin`, `VerificationAttempt`, `VerifiedVisit`, `Review`,
`ReviewPhoto`), con `VisitStatus = PENDING | VERIFIED | REJECTED | CANCELLED` y `MerchantRole = OWNER | MANAGER | STAFF`.

S1: Todo endpoint de datos del panel exige `JwtAuthGuard` + `MerchantGuard`. `MerchantGuard` resuelve la pertenencia del
usuario en sesión y toma el `coffeeShopId` **solo de los params de ruta**, nunca del body ni del query. Jerarquía
`OWNER > MANAGER > STAFF`; un rol ajeno al enum se descarta (rango 0), igual que en `MERCHANT_ROLE_RANK` de
`panel-access.controller.ts`. `SUPERADMIN` pasa siempre. Un `USER` sin pertenencia recibe `403`.

S2: `GET /api/v1/merchants/:coffeeShopId/staff` lista el personal de esa cafetería (`SUPERADMIN` o `OWNER` del mismo
merchant). `POST` con `{ email, role }` agrega una pertenencia; `role` acepta `MANAGER` o `STAFF` — **`OWNER` no** (la
transferencia de propiedad es otra operación): `400 MERCHANT_ROLE_NOT_ASSIGNABLE`. `PATCH .../staff/:userId` con `{ role }`
cambia el rol y `DELETE .../staff/:userId` la elimina. Ninguna de las dos puede dejar el merchant sin `OWNER`:
`409 LAST_OWNER_PROTECTED`. Un `STAFF` no puede invitar ni ascender a nadie: `403`.

S3: `POST /api/v1/visits` con `{ coffeeShopId, items }` crea una visita en estado `PENDING` para el usuario de la sesión.
`POST /api/v1/visits/:id/verify` con `{ pin }` la pasa a `VERIFIED` si el PIN corresponde a esa cafetería y al día; si no,
`400 INVALID_PIN` y cada fallo queda registrado en `VerificationAttempt`. Una visita `PENDING` de otro usuario no se puede
verificar: `404`. Los check-ins del panel son las visitas `VERIFIED`.

S4: `POST /api/v1/reviews` con `{ visitId, rating, comment? }` crea una reseña solo si existe `VerifiedVisit` para esa
visita (`409 REVIEW_REQUIRES_VERIFIED_VISIT`) y solo una vez por visita (`409 REVIEW_ALREADY_EXISTS`); `rating` es 1..5
(`400 REVIEW_RATING_OUT_OF_RANGE`). La reseña nace sin aprobar. `GET /api/v1/cafes/:slug/reviews` sigue devolviendo
únicamente las aprobadas. Moderación: `GET /api/v1/admin/reviews?status=PENDING` y `POST /api/v1/admin/reviews/:id/moderate`
con `{ action: "APPROVE" | "HIDE" }`, ambos `@Roles('SUPERADMIN')`.

S5: `POST /api/v1/admin/daily-pins` (`SUPERADMIN`) emite el PIN del día para una cafetería y es idempotente por
`(coffeeShopId, fecha)`: reemitir el mismo día devuelve el PIN vigente, no otro. El valor en claro nunca se persiste ni se
devuelve en un GET. `POST /api/v1/admin/daily-pins/freeze` con `{ frozen: boolean }` congela o descongela la emisión; con
la rotación congelada, `POST /admin/daily-pins` responde `409 ROTATION_FROZEN`. Este endpoint es el que reemplaza el
`TODO` de `EmergencyFreezeButton`: el botón deja de existir hasta que esto responda de verdad.

S6: El panel lee datos reales de la API y deja de usar datos locales:
`GET /api/v1/admin/kpis` (`activeCoffeeShops`, `checkInsToday`, `pendingReviews`),
`GET /api/v1/admin/coffee-shops` (tabla con `status`, `visitsToday`, `rating`),
`GET /api/v1/admin/check-ins` (últimas visitas verificadas, orden descendente).
Un `OWNER` recibe los mismos endpoints **filtrados a su cafetería** y nunca ve datos de otra: pedir los de otro merchant
con un id explícito devuelve `403`.

S7: Cada módulo se entrega con sus tests de contrato y de DB, y con el RBAC probado: `SUPERADMIN` sí, `OWNER` sí (solo lo
suyo), `MANAGER` según el spec, `STAFF` no, `USER` no. Un endpoint sin test de rol no se considera terminado.

## Tasks

| ID | Specs | Ruta | Alcance | Commit |
|----|-------|------|---------|--------|
| T1 | S0, S1 | `src/common/` + `src/auth/guards/` | Reponer `MerchantGuard` + `@MerchantRoles` (jerarquía, id solo de params) y sus tests. Base de todo lo que sigue. | _pendiente_ |
| T2 | S2 | `src/merchants/` | Módulo merchants: CRUD de staff, `LAST_OWNER_PROTECTED`, roles no asignables. | _pendiente_ |
| T3 | S3 | `src/visits/` | Alta de visita + verificación por PIN + `VerificationAttempt`. | _pendiente_ |
| T4 | S4 | `src/reviews/` | Alta de reseña sobre visita verificada + cola de moderación. | _pendiente_ |
| T5 | S5 | `src/daily-pins/` | Emisión idempotente del PIN diario + freeze de rotación. | _pendiente_ |
| T6 | S6 | `src/admin/` | Endpoints de agregación para el panel, con scoping de OWNER. | _pendiente_ |
| T7 | S6, S7 | `cofi-rutas-frontend/src/components/dashboard/` | Cablear los 8 componentes del panel a la API; borrar los datos locales y el `TODO` del freeze. | _pendiente_ |

## Decisiones abiertas

- **D1**: cuántos intentos fallidos de PIN antes de pasar la visita a `REJECTED`. S3 exige registrar cada fallo pero no
  fija el umbral: es una decisión de producto, no la inventa el implementador.
- **D2**: si `MANAGER` puede emitir el PIN diario de su cafetería o si queda exclusivo de `SUPERADMIN` y `OWNER`.
- **D3**: si la reseña se modera antes o después de publicarse (S4 asume "nace sin aprobar").

## Fuera de alcance

- Matcher / pasaporte / reseñas del lado del usuario fuera de lo que pide S4.
- Pantallas nuevas del panel: esta feature conecta las existentes, no agrega diseño.
- Migrar el frontend a endpoints que hoy no existen en otro módulo.

## Log

### L1 (verbatim, 2026-11-15)

> "sabes por el momento mergueare a develop sabes porque ? esta mal que empecemos por el login todo completo. asi que subire todo lo que ya esta. y empezaremos primero por el dashboard administrativo. asi para tener endpoints de todos los modulos y asi no estar peleandoq ue no hay registro ni nada te aprece?"

### L2 (decisión, 2026-11-15)

- El orden cambia: **API primero, pantalla después**. Un slice vertical por módulo: modelo (ya existe) → endpoints con
  RBAC → tests → recién ahí el componente consume la API.
- El panel no se cablea hasta que existan los datos que muestra. Construir los endpoints de lectura sin las rutas de
  escritura reproduce el problema original del otro lado: tablas vacías.
- Se aprobó el orden `merchants → visits → reviews → daily-pin → agregación → cableado del panel`, y el scoping de `OWNER`
  resuelto en el primer slice y no después.
- Pendiente y bloqueante del merge: el `BETTER_AUTH_SECRET` real sigue en la historia del remoto (purga local hecha, el
  force-push quedó bloqueado por el policy de Pi) y el fix del seed sin credenciales por defecto no está subido.

### L3 (evidencia del árbol, 2026-11-15)

- Módulos backend: `auth`, `cafes`, `common`, `config`, `groups`, `pairing`, `prisma`. Controladores: `auth`
  (Better Auth), `panel-access`, `cafes`, `pairing`, `groups`.
- `cafes.controller.ts` ya expone `GET :slug/reviews`: la lectura pública de reseñas existe, la escritura y la moderación
  no.
- Modelos de Prisma presentes para todo lo que piden S2–S6, así que ningún slice necesita migración de esquema salvo que
  la implementación lo demuestre.
