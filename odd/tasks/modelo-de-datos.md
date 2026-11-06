# Feature: Modelo de datos CofiRutas

Objetivo: reemplazar el schema plano de videocoding (`CoffeeShop` + `Product`) por un modelo de dominio que sostenga auth, catálogo, búsqueda, vínculos dúo/grupo, visitas con PIN, reseñas/reputación y matcher.

Branch: `develop` (commit autorizado por el usuario; la rama `feat/modelo-de-datos` se descartó).
Delivery: work-unit commits; baseline único de migraciones; seed idempotente.
Runner: `pnpm prisma validate`, `pnpm test`, `pnpm build`.

## Specs

S1 — Identidad y acceso
- `User`: `email` único (normalizado a minúsculas), `passwordHash` nullable para OAuth, `fullName`, `avatarUrl?`, `role` (`USER` | `SUPERADMIN`), `isActive`.
- `Account`: `provider` + `providerAccountId` único, cascada al borrar usuario.
- `Session`: `tokenHash` único, `expiresAt`, `revokedAt?`, `lastUsedAt?`.
- `MerchantStaff`: `userId` + `coffeeShopId` único, `role` (`OWNER` | `MANAGER` | `STAFF`). No existe `Role.MERCHANT` global.
- IDs UUIDv7; timestamps absolutos con `@db.Timestamptz(3)`.

S2 — Local, horarios, tags y geolocalización
- `CoffeeShop`: `name`, `slug` único, `description?`, `address`, `neighborhood?`, `latitude`/`longitude` `Decimal(9,6)`, `phone?`, `whatsapp?`, `instagram?`, `coverUrl?`, `coverPublicId?`, `status` (`DRAFT` | `ACTIVE` | `SUSPENDED`), métricas de reputación.
- `OpeningHours`: `dayOfWeek` 0–6, `openTime`/`closeTime` tipo `time`, múltiples intervalos por día; único `(coffeeShopId, dayOfWeek, openTime)`.
- `SpecialHours`: `date` única por local, `isClosed`, `openTime?`/`closeTime?`, `note?`.
- `Tag` + `CoffeeShopTag`, semilla: `#con-wifi`, `#ambiente-romantico`, `#pet-friendly`, `#para-el-frio`, `#cafe-de-especialidad`.
- `distanceMeters` no existe en `CoffeeShop`: la distancia se calcula con la ubicación del usuario y lat/long del local. Sin PostGIS para 30 locales.
- Moneda única BOB; sin columna `currency` por ítem.

S3 — Catálogo y taxonomía
- `Category` global, semilla con las 6 categorías del PRD: `Café Caliente & Especialidad`, `Bebidas Frías & Frappés`, `Tés & Infusiones`, `Jugos Naturales & Licuados`, `Repostería & Pastelería`, `Salados & Tostadas`.
- `MenuItem`: `coffeeShopId`, `categoryId`, `name`, `description?`, `price` `Decimal(10,2)`, `imageUrl?`, `imagePublicId?`, `isAvailable`, `isFeatured`, `sortOrder`, `archivedAt?`.
- Único `(coffeeShopId, name)`; los ítems se archivan, no se borran. Sin variantes en el MVP; un ítem por presentación.
- Una foto por ítem y una portada por local; `imageUrl` + `imagePublicId` de Cloudinary.

S4 — Búsqueda de antojos
- Búsqueda sobre `MenuItem.name` y `MenuItem.description` con PostgreSQL FTS en español + `pg_trgm` + `unaccent`, índices GIN.
- El resultado principal es un `MenuItem` con su local; el nombre del local suma como señal secundaria.
- Extensiones e índices se agregan en migración SQL cruda.

S5 — Vínculos dúo/grupo y tokens QR
- `CoupleLink`: orden canónico `userAId < userBId`, `status` (`ACTIVE` | `ARCHIVED`), `startedAt`, `archivedAt?`; un solo `ACTIVE` por usuario mediante índices únicos parciales.
- `PairingToken`: `tokenHash` único, `tokenPrefix`, `type` (`DUO` | `GROUP`), `groupId?` FK, `expiresAt`, `consumedById?`, `consumedAt?`, `revokedAt?`.
- `GroupRoom`: `hostId`, `code` único, `status` (`OPEN` | `CLOSED` | `EXPIRED`), `maxMembers` 12, `expiresAt` (24 h por defecto), `closedAt?`.
- `GroupMember`: `role` (`HOST` | `MEMBER`), `joinedAt`, `leftAt?`; único `(groupId, userId)`.

S6 — Visitas, PIN y verificación
- `Visit`: evento compartido con `coffeeShopId`, `createdById`, `coupleLinkId?`, `groupId?`, `context` (`SOLO` | `DUO` | `GROUP`), `status` (`PENDING` | `VERIFIED` | `REJECTED` | `CANCELLED`), `visitDate` fecha local `America/La_Paz`, `totalSpent`, `notes?`, `photoUrl?`, `photoPublicId?`.
- `VisitParticipant`: `visitId`, `userId`, `role` (`CREATOR` | `PARTNER` | `MEMBER`); único `(visitId, userId)`.
- `VisitItem`: `menuItemId`, `itemName` y `unitPrice` como snapshot, `quantity`; único `(visitId, menuItemId)`.
- `DailyPin`: `coffeeShopId`, `date`, `pinCode` de 4 dígitos, `generatedAt`, `expiresAt`; único `(coffeeShopId, date)`. Generación a las 00:00 local + on-demand idempotente.
- `VerificationAttempt`: `visitId`, `userId`, `pinHash`, `distanceMeters?`, `gpsAccuracyMeters?`, `result`, `createdAt`; rate limit por visita/usuario.
- `VerifiedVisit`: ledger con `visitId`, `userId`, `coffeeShopId`, `visitDate`; único `(userId, coffeeShopId, visitDate)` para una visita verificada por usuario/local/día.
- GPS: se acepta `distance <= 80 m` y `accuracy <= 100 m`; sin override del merchant.
- Gasto: `totalSpent` snapshot de la visita; métrica por usuario = total / participantes.
- El PIN se guarda plano para que el merchant lo vea, con acceso restringido.

S7 — Reseñas, reputación y moderación
- `Review`: `coffeeShopId`, `authorId`, `coupleLinkId?`, `visitId?` único, `rating` `Decimal(2,1)` entre 1.0 y 5.0 en pasos de 0.5, `comment?` máx. 500, `status` (`PUBLISHED` | `HIDDEN` | `DELETED`), `moderatedById?`, `moderatedAt?`, `moderationReason?`, `deletedAt?`.
- Una reseña activa por usuario/local: único `(authorId, coffeeShopId)`.
- Reseña en dúo: una sola compartida con `coupleLinkId`, editable por ambos, visible como "Carlos & Laura"; índice único parcial por `(coupleLinkId, coffeeShopId)`.
- `ReviewPhoto`: hasta 3 por reseña, `url` + `publicId`, `sortOrder`.
- `isVerifiedVisit` no se guarda: se deriva de `visit.status === VERIFIED`.
- `CoffeeShop`: `averageRating` `Decimal(3,2)`, `reviewCount`, `verifiedReviewCount`, contadores `rating1Count`..`rating5Count`; promedio simple de reseñas `PUBLISHED`, recalculado en transacción + job de reconciliación.
- Un usuario no puede reseñar un local del que es staff.

S8 — Matcher y modo grupal
- `MatchSession`: `context` (`DUO` | `GROUP`), `coupleLinkId?`/`groupId?`, `status` (`WAITING` | `ACTIVE` | `MATCHED` | `EXPIRED` | `CANCELLED`), `deckSeed`, `expiresAt`, `startedAt?`, `completedAt?`.
- `MatchParticipant`: `sessionId`, `userId`, `joinedAt`, `leftAt?`; único `(sessionId, userId)`.
- `Swipe`: `sessionId`, `userId`, `coffeeShopId`, `liked`; único `(sessionId, userId, coffeeShopId)`, inmutable.
- `Match`: uno por sesión (`sessionId` único), `coffeeShopId`, `likesCount`, `participantsCount`, `matchedAt`.
- Dúo: match cuando ambos likearon el mismo local. Grupo: mayoría de participantes activos con quórum 2. Al matchear se cierra la sesión.
- Persistencia en Postgres; Socket.io en memoria para una sola instancia; Redis adapter queda para escalar.
- Deck generado server-side con seed determinístico; orden por categorías preferidas de las últimas 5 visitas, rating y distancia. Sin tabla de tarjetas curadas.

S9 — Invariantes y constraints
- CHECK de rating 1.0..5.0 y pasos de 0.5; `quantity > 0`; `unitPrice >= 0`; `totalSpent >= 0`; formato de PIN de 4 dígitos; consistencia de `context` con `coupleLinkId`/`groupId`; orden canónico de `CoupleLink`.
- Índices únicos parciales: un `CoupleLink` activo por usuario; una reseña de pareja por local; ledger de visitas verificadas.
- FKs: preservar historial con `Restrict`/`SetNull`; cascada solo en auth, tokens, fotos y pivots.
- Soft delete en reseñas e ítems de menú; no se borra historial de visitas.
- Timestamps absolutos en `Timestamptz(3)`; fechas de negocio en `Date`.

S10 — Baseline y seed
- Borrar las migraciones actuales; resetear la DB dev (3 usuarios, 0 catálogo); crear una migración inicial limpia con el modelo completo + SQL crudo de constraints/extensiones/índices.
- Seed: 6 categorías, 5 tags, 15–30 cafeterías reales de Oruro con menús y coordenadas.
- Verificar con `pnpm prisma validate`, `pnpm test` y `pnpm build`.

## Tasks

| ID | Tarea | Specs | Route | Estado |
|----|-------|-------|-------|--------|
| T1 | Crear feature document con decisiones cerradas | S1–S10 | docs | hecho |
| T2 | Reescribir `prisma/schema.prisma` completo | S1–S9 | inline | hecho |
| T3 | Agregar SQL crudo: extensiones, CHECKs, índices parciales y búsqueda | S4, S9 | inline | pendiente |
| T4 | Baseline: borrar migraciones viejas, reset y migración `init` | S10 | inline | pendiente |
| T5 | Refactor `auth` al nuevo `Role`/`Session`/`Account` | S1 | inline | pendiente |
| T6 | Refactor `pairing` a tokens hasheados y `GroupRoom` nuevo | S5 | inline | pendiente |
| T7 | Refactor `cafes` a `Category`/`MenuItem`/`OpeningHours`/tags | S2, S3 | inline | pendiente |
| T8 | Seed de categorías, tags y cafeterías de Oruro | S10 | inline | pendiente |
| T9 | Tests de constraints, auth, pairing y catálogo | S1–S5, S9 | inline | pendiente |
| T10 | Módulo de visitas, PIN y verificación | S6 | inline | futuro |
| T11 | Módulo de reseñas, reputación y moderación | S7 | inline | futuro |
| T12 | Módulo de matcher y salas grupales | S8 | inline | futuro |
| T13 | Endpoint de búsqueda FTS | S4 | inline | futuro |
| T14 | Integración frontend con el nuevo contrato | S2–S8 | inline | futuro |

## Log

L1: Usuario, textual: "te comento que el sistema que estamos haciendo es @PRD-tecnico.md , pero como ves anteriormente queria seguir el flujo que me estaba dando la IA pero eso es hacer videcoding y yo soy un ingeniero informatico, y te comento que la experiencia es muy mala no hay nada de arquietectura ni de sostenibilidad. estabamos trabajando por partes la base de datos y todo desordenado. Asi que decidi que trabajaremos como usualmente yo trabajo primero modelando la base de datos ya que es la parte esencial asi tenemos un punto de partida asi , teniendo eso en cuenta quiero que revises el prd en su totalidad y empecemos a planificar hazme preguntas para que todo este detallado en el modelado de datos, ya tenemos el @cofi-ruta-backend/prisma/schema.prisma asi que ya podemos implementarlo ademas ya esta levantado el contenedor y demas (podman)."

L2: Diagnóstico: el schema actual (`CoffeeShop` + `Product`) no representa el dominio del PRD. Faltan visitas, reseñas, PIN, matcher, categorías, tags, staff y geolocalización. El schema del PRD tiene errores estructurales: `Visit` de un solo usuario con couple/group opcional, `MenuCategory` por local, `isVerifiedVisit` redundante, `rating Float`, sin modelos de matcher ni votación grupal, `PairingToken.groupId` sin FK, `CoupleLink` sin unicidad canónica, `GroupRoom` sin expiración y `DailyPin` sin timezone ni throttling. Prisma 7.10.1 rechaza `url` en el datasource (validado con `prisma validate`); `uuid(7)` sí funciona. DB dev: 3 usuarios, 0 cafeterías, 0 productos.

L3: Bloque 1 cerrado. `CoffeeShop` como entidad del local; baseline limpio de migraciones; `MerchantStaff` con roles `OWNER`/`MANAGER`/`STAFF` y sin `Role.MERCHANT`; un solo `CoupleLink` activo por usuario; se conservan y mejoran `Account`, `Session` y `PairingToken`.

L4: Bloque 2 cerrado. Taxonomía global, tags normalizados, búsqueda FTS + trigram + unaccent, horarios por día + override, sin variantes de producto.

L5: Bloque 3 cerrado. Visita como evento compartido con participantes; `VerificationAttempt` + rate limit; GPS 80 m + precisión <= 100 m sin override; gasto dividido entre participantes; una visita verificada por usuario/local/día; `totalSpent` snapshot; `visitDate` local; timestamps `Timestamptz(3)`; PIN diario plano con acceso restringido.

L6: Bloque 4 cerrado. Una reseña por usuario/local editable; reseña de pareja compartida; medias estrellas; promedio simple; soft delete con estado; `ReviewPhoto`; badge verificado derivado; stats en `CoffeeShop` con recálculo transaccional + reconciliación.

L7: Bloque 5 cerrado. Swipe sobre `CoffeeShop` con ítem destacado; matcher grupal con mayoría y quórum 2; persistencia en Postgres; cierre de sesión al matchear; deck determinístico; Socket.io en memoria.

L8: Próximo work unit: schema + validación. La migración baseline y el refactor de `auth`/`pairing`/`cafes` van juntos, porque aplicar el baseline deja el backend sin compilar hasta adaptar los tres módulos.

L9: Schema validado con Prisma 7.10.1 y cliente Prisma generado. PRD técnico actualizado a v2.0.0: inventario de los 27 modelos y 15 enums, invariantes SQL, módulos, flujos, vistas por rol (cliente, dúo, grupo, merchant y admin), contrato REST, requisitos no funcionales y roadmap F0–F6. T2 cerrado; el siguiente work unit es la Fase 0 (T3–T9).
