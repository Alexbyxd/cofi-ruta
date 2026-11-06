# Feature: Fase 0 — Fundaciones y baseline

Objetivo: dejar el repositorio compilable contra el modelo v2, con baseline de migraciones, seed idempotente, `auth`/`pairing`/`cafes` adaptados y tests de constraints.

Branch: `feat/fase-0-baseline` (desde `develop`).
Delivery: work-unit commits; sin push ni PR (decisión del usuario).
Runner: `pnpm exec prisma validate`, `pnpm test`, `pnpm build`, `pnpm lint`.

## Specs

S1 — Corrección del schema
- `CoupleLink`: un usuario puede tener **un solo vínculo `ACTIVE`**; al archivarlo puede crear uno nuevo. Se elimina `@@unique([userAId, userBId])` y se mantienen dos índices únicos parciales `WHERE status = 'ACTIVE'` (uno por `userAId` y otro por `userBId`). Pueden existir varios vínculos `ARCHIVED` para el mismo par.
- Orden canónico `userAId < userBId`, validado por CHECK en SQL y por servicio.
- `PRD-tecnico.md` §2.2 y §2.4 se corrigen para reflejar esta regla.

S2 — Invariantes SQL de la migración baseline
- Extensiones `unaccent` y `pg_trgm`; función `cofi_unaccent(text)` `IMMUTABLE` con diccionario explícito.
- CHECKs: latitud `-90..90` y longitud `-180..180`; `rating` `1.0..5.0` en pasos de 0.5; `averageRating` `0..5`; contadores de reputación `>= 0`; `quantity > 0`; `unitPrice >= 0`; `totalSpent >= 0`; `pinCode ~ '^[0-9]{4}$'`; consistencia de `Visit.context` con `coupleLinkId`/`groupId`; orden canónico de `CoupleLink`.
- Índices únicos parciales: vínculo activo por usuario (`userAId` y `userBId`); reseña de pareja no borrada por `(coupleLinkId, coffeeShopId)` con `status <> 'DELETED'`; sesión `WAITING`/`ACTIVE` por `coupleLinkId` y por `groupId`.
- GIN: FTS español sobre `MenuItem.name` + `description` con `cofi_unaccent`; trigram sobre `MenuItem.name` y `CoffeeShop.name`.
- No se duplican índices que Prisma ya genera desde `@@index`/`@@unique`.

S3 — Baseline único
- Se eliminan las migraciones `init_module_1_auth` y `add_coffee_shops_and_products`.
- Se crea una única migración `init` desde `prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script` más el SQL crudo de S2.
- La DB dev se resetea con `prisma migrate reset --force`. Consecuencia aprobada: se pierden 3 usuarios de prueba; catálogo 0.

S4 — Tests de DB y CI
- Suite de constraints y FTS contra `DATABASE_URL_TEST`; el nombre de la base debe terminar en `_test` o la suite falla.
- `pnpm test` ejecuta unit + DB; `pnpm test:unit` queda para el loop rápido.
- CI backend agrega servicio `postgres:16-alpine`, aplica migraciones, corre `prisma validate`, `pnpm test` y `pnpm build`.

S5 — Seed idempotente
- `prisma/seed.ts` + datos validados con zod; comando `migrations.seed` en `prisma.config.ts`; `tsx` como devDependency.
- 6 categorías, 5 tags, 15–30 cafeterías de Oruro `ACTIVE` con horarios, coordenadas y menús. Cada registro incluye `sourceUrl` de provenance en el archivo de datos, fuera de la DB.
- Upserts por `slug` y claves compuestas; correr dos veces no duplica. No se seedean usuarios.

S6 — Auth
- Registro local: email normalizado a minúsculas, password mínimo 8, bcrypt coste 12.
- Access token JWT 15 min con `sid`; refresh token opaco 30 días guardado como SHA-256 en `Session.tokenHash`; rotación en cada refresh; `revokedAt`, `lastUsedAt`.
- `JwtAuthGuard` exige `User.isActive = true` y sesión vigente; `logout` revoca la sesión actual; `logout-all` revoca todas; cambio de password revoca todas menos la actual.
- Endpoints: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/logout-all`, `GET /auth/google`, `GET /auth/google/callback`, `GET /me`, `PATCH /me`, `PATCH /me/password`, `GET /me/sessions`, `DELETE /me/sessions/:id`. `GET /auth/profile` queda como alias de `GET /me`.
- Google: se vincula `Account` por `(provider, providerAccountId)`; solo se vincula por email si el proveedor lo confirma como verificado.
- Errores de dominio con `{ statusCode, code, message, details? }`.

S7 — Guards
- `RolesGuard` con decorador `@Roles(Role.SUPERADMIN)`.
- `MerchantGuard` con `@MerchantRoles(...)`; resuelve `coffeeShopId` desde la ruta, consulta `MerchantStaff` y aplica jerarquía `OWNER > MANAGER > STAFF`; nunca confía en un id del body.

S8 — Dúo
- `PairingToken`: token plano de 32 bytes base64url, `tokenHash` SHA-256, `tokenPrefix`, TTL 15 min, un solo consumo, revocación; el token plano se devuelve una sola vez.
- QR `cofirutas://pair?token=<token>`.
- Aceptar en transacción: token válido/no consumido/no revocado/no vencido, no auto-invitación, ninguno con vínculo activo (`COUPLE_ALREADY_ACTIVE`), orden canónico y creación de vínculo **nuevo** (no se reactiva uno archivado).
- `GET /pairing/duo`, `DELETE /pairing/duo` (archiva el vínculo activo).

S9 — Grupos
- `POST /groups` crea sala con código único de 6 caracteres sin `0/O/1/I`, `maxMembers` 2–12 (default 12) y expiración 24 h (configurable 1–24 h).
- `POST /groups/join` por `code` o `PairingToken` `GROUP`; valida `OPEN`, no vencida, no llena y no miembro.
- `GET /groups/:id` solo miembros; `POST /groups/:id/leave` (host cierra), `POST /groups/:id/close`, `POST /groups/:id/invites`, `GET /groups/me`.

S10 — Catálogo público
- `GET /cafes`: solo `ACTIVE`; `page`/`limit` (máx. 100, default 20), `neighborhood`, `q`, `order=rating|name`; envelope `{ data, meta }`.
- `GET /cafes/:slug`: ficha con horarios, tags, menú agrupado por categoría, stats y últimas reseñas `PUBLISHED`.
- `GET /cafes/:slug/menu` y `GET /cafes/:slug/reviews` paginado.
- Decimales se serializan como string. `openNow`, filtro por tags y distancia quedan para Fase 1; el DTO estricto los rechaza.

S11 — Gate de salida
- `pnpm exec prisma validate`, `pnpm test`, `pnpm build`, `pnpm lint` pasan.
- Seed corre dos veces sin duplicar.
- Smoke API: register, login, refresh, logout, listado de cafés, dúo aceptado por segunda cuenta, grupo creado/unido.
- Se actualiza `odd/tasks/modelo-de-datos.md` (T3–T9), este documento y `PRD-tecnico.md` §10.

S12 — Fuera de alcance
- Visitas/PIN/verificación, reseñas/reputación, matcher, paneles merchant/admin, endpoint FTS, jobs, adaptación frontend y APK.
- El frontend puede quedar temporalmente fuera de contrato; Fase 0 se verifica por API.

## Tasks

| ID | Tarea | Specs | Route | Estado |
|----|-------|-------|-------|--------|
| U1 | Baseline + correcciones de schema y PRD | S1–S3 | inline | hecho |
| U2 | Harness de tests DB + constraints/FTS + CI | S4 | inline | hecho |
| U3 | Seed idempotente con datos de Oruro | S5 | inline | hecho |
| U4 | Auth core (refresh opaco, sesiones, /me) | S6 | inline | hecho |
| U5 | Guards de rol y merchant | S7 | inline | hecho |
| U6 | Dúo (tokens hasheados, vínculo canónico) | S8 | inline | hecho |
| U7 | Grupos (código, lobby, expiración) | S9 | inline | hecho |
| U8 | Catálogo público v2 | S10 | inline | pendiente |
| U9 | Gate final, smoke y cierre documental | S11 | inline | pendiente |

## Log

L1: Usuario, textual: "Vale hoy vamos a empezar con la fase 0 definida en @PRD-tecnico.md . Hazme el planning para que yo lo verifique y apruebe"

L2: Usuario aprueba el plan, textual: "Perfecto en la parte couplelink es cierto un usuario solo puede tener un vinculo activo solo uno pero puede archivarse(romper el vinculo para crear otro). ahora sobre las decisiones: 1. a 2. a, yo luego hare los diseños para poder implementar lo que hicimos por parte del backend. 3. si solo son datos de prueba. 4. me parece bien. ten en cuenta hacerlo con ODD"

L3: Decisiones aplicadas: (1a) el agente investiga fuentes públicas para el seed con `sourceUrl` por registro; (2a) se acepta ruptura temporal del frontend y Fase 0 se verifica por API; (3) reset autorizado, solo hay datos de prueba; (4) se quita el unique absoluto de `CoupleLink`, la reseña de pareja usa `status <> 'DELETED'`, auth completo §3.1 y `pnpm test` = unit + DB.

L4: Evidencia inicial: `schema.prisma` válido; DB dev con 2 migraciones viejas y 3 usuarios; `pnpm test` 40/40 verde (mockeado); `pnpm build` falla con 24 errores TS en `cafes.service.ts` (16) y `pairing.service.ts` (8); CI backend sin build y sin Postgres de servicio.

L5: U1 hecho. Se quitó `@@unique([userAId, userBId])` de `CoupleLink`; baseline `20261106134500_init` generado desde vacío (779 líneas) más SQL crudo (93 líneas): extensiones, `cofi_unaccent`, CHECKs, parciales y GIN/trigram. Se eliminaron las 2 migraciones viejas. PRD §2.2 y §2.4 corregidos.

L6: U2 hecho. RED observado: 11/11 tests fallaban con `relation "MerchantStaff" does not exist` contra el esquema viejo. GREEN contra `cofi_rutas_v2_test`: 11/11 constraints/FTS y 40/40 unit. `pnpm test` ahora encadena unit + DB; CI agrega Postgres 16, `prisma validate` y `migrate deploy`. El reset de la DB dev queda pendiente de consentimiento explícito del guard de Prisma 7.

L7: U3 hecho. Investigación con Restaurants10 (DuckDuckGo HTML como índice): 22 cafeterías reales de Oruro con dirección y coordenadas tomadas de la ficha de origen, `sourceUrl` por registro en `prisma/seed-data/cafes.json`. Horarios de Picasso y Café Roma salen de la fuente; el resto son horarios y menús representativos declarados en `dataNote`. 6 categorías, 5 tags, 154 ítems de menú (plantillas representativas + un ítem de firma por local) y 133 horarios. RED: `Cannot find module '../../prisma/seed'`. GREEN: 2/2 tests de seed; suite total 40 unit + 13 DB. CLI `pnpm db:seed` dos veces seguidas devuelve los mismos conteos. `prisma/seed.ts` y `prisma/seed-data` se agregaron al lint.

L8: U4 hecho. `AuthService` con refresh opaco de 32 bytes (SHA-256 en `Session.tokenHash`), rotación por refresh, sesiones revocables, cambio de password que revoca las demás, `getMe` con vínculos activos y membresías de comercio, y Google solo con correo verificado. `JwtStrategy` exige `sid` con sesión vigente y `User.isActive`. Endpoints: `auth/*`, `GET/PATCH /me`, `PATCH /me/password`, `GET /me/sessions`, `DELETE /me/sessions/:id`; `GET /auth/profile` queda como alias. RED: el spec DB de auth no compilaba (servicio y estrategia viejos); GREEN: 11/11 DB y 32/32 unit de auth. Suite completa 48 unit + 24 DB. Nota técnica: `@nestjs/jwt` y `@nestjs/passport` v12 son ESM-only; el spec DB los mockea para metadata de DI y firma/verifica JWT HS256 con `node:crypto`.

L9: U5 hecho. `RolesGuard` + `@Roles(...)` valida el rol global del `User` autenticado. `MerchantGuard` + `@MerchantRoles(...)` resuelve el local solo desde `params.id`/`params.coffeeShopId`, consulta `MerchantStaff` y aplica la jerarquía `OWNER > MANAGER > STAFF`; un `SUPERADMIN` sin fila de staff no pasa. Errores `FORBIDDEN` y `MERCHANT_ACCESS_DENIED`. Ambos guards quedaron registrados y exportados en `AuthModule`. RED: `Cannot find module './merchant.guard'`/`'./roles.guard'`; GREEN: 18/18 tests de guards; unit total 66/66.

L10: U6 hecho. `PairingService` emite tokens opacos de 32 bytes base64url con TTL de 15 min, guarda solo `tokenHash` SHA-256 y `tokenPrefix`, y devuelve el token plano una única vez con QR `cofirutas://pair?token=<token>`. El claim corre en transacción, consume el token con `updateMany` condicional (idempotencia ante carreras), rechaza auto-invitación, tokens consumidos/revocados/vencidos y cualquier cuenta con vínculo `ACTIVE`, ordena el par canónicamente y crea un vínculo nuevo (nunca reactiva uno archivado). `GET /pairing/duo` devuelve la pareja con datos públicos y `DELETE /pairing/duo` archiva. `DELETE /pairing/tokens/:id` revoca. El claim de tokens `GROUP` valida sala abierta/vigente/no llena y crea membresía. RED: métodos `createToken`/`claimToken`/`getDuo`/`archiveDuo` inexistentes; GREEN: 9/9 DB y 10/10 unit de pairing.

L11: U7 hecho. Nuevo `GroupsModule`: `POST /groups` genera código único de 6 caracteres con alfabeto sin `0/O/1/I` (reintenta ante colisión), `maxMembers` 2–12 (default 12), expiración 1–24 h (default 24 h) y crea al host como `HOST` en transacción. `POST /groups/join` acepta `code` o `PairingToken` GROUP, normaliza el código a mayúsculas y valida sala `OPEN`, vigente, no llena y no miembro; el token reutiliza el claim transaccional de U6. `GET /groups/:id` solo miembros, `GET /groups/me`, `POST /groups/:id/leave` (el host cierra la sala), `POST /groups/:id/close` solo host y `POST /groups/:id/invites`. RED: `Cannot find module '../../src/groups/groups.service'`; GREEN: 9/9 DB y 7/7 unit de grupos.
