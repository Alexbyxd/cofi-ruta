# Product Requirements Document (PRD) — CofiRutas

**Proyecto:** CofiRutas — Guía & Matcher de Cafeterías en Oruro
**Versión:** 2.0.0 — Modelo de datos v2 + roadmap de implementación
**Estado:** modelo de datos validado; implementación por fases
**Última actualización:** 2026-11-05

**Stack**

- Frontend: Next.js (App Router, Tailwind CSS)
- Mobile: Capacitor (Android / iOS)
- Backend: NestJS (REST + Socket.io)
- ORM / DB: Prisma 7 + PostgreSQL
- Multimedia: Cloudinary
- Auth: JWT + Google OAuth2
- Zona horaria de negocio: `America/La_Paz`
- Moneda: boliviano (BOB)

> **Fuente de verdad del dominio:** `cofi-ruta-backend/prisma/schema.prisma`.
> Este PRD describe qué se construye, cómo funciona cada módulo y en qué orden. Si el documento y el schema difieren, el schema gana y el documento se corrige.

---

## 0. Resumen ejecutivo

CofiRutas resuelve dos problemas concretos en Oruro:

1. **Descubrimiento:** “¿a qué café vamos hoy?” y “¿qué antojo se me antoja?”.
2. **Registro y reputación:** dejar constancia de visitas reales, gasto aproximado, reseñas y preferencias, sin reseñas falsas.

El MVP se enfoca exclusivamente en cafeterías, casas de té, juguerías y espacios de repostería. Quedan fuera almuerzos, comida rápida general y bares nocturnos.

La versión 2.0.0 parte de una decisión estructural: **la base de datos es la fuente de verdad del dominio**. El modelo de 27 tablas reemplaza el esquema plano de videocoding (`CoffeeShop` + `Product`) por un modelo que sostiene:

- identidad, sesiones y staff por local;
- catálogo global con categorías y tags normalizados;
- vínculos de pareja y salas grupales;
- visitas compartidas con PIN y GPS;
- reseñas individuales y de pareja con moderación;
- matcher de cafeterías para dúo y grupo;
- paneles de comercio y administración.

### 0.1. Principios de arquitectura

1. **Una sola fuente de verdad:** `schema.prisma` y la migración baseline. Los DTOs, servicios y la UI se adaptan al modelo, no al revés.
2. **Identidad canónica:** un usuario tiene como máximo un `CoupleLink` activo; el par se guarda con `userAId < userBId`.
3. **Visita como evento compartido:** una `Visit` tiene un creador y varios `VisitParticipant`; la reseña y el gasto cuelgan de la visita, no de un usuario suelto.
4. **Verificación server-side:** el PIN y el GPS se validan en el backend; el cliente nunca decide si una visita es válida.
5. **Historial preservado:** las visitas no se borran; las reseñas y los ítems de menú usan soft delete. Las FKs usan `Restrict`/`SetNull` para no perder historia.
6. **Cálculo determinístico:** promedios, contadores y decks se recalculan en el servidor; el cliente solo presenta.
7. **Contexto explícito:** `VisitContext` y `MatchContext` (`SOLO` / `DUO` / `GROUP`) hacen explícita la modalidad; no se infiere de campos opcionales.

### 0.2. Cómo leer este documento

- **Sección 1:** alcance, roles y superficies.
- **Sección 2:** inventario explícito del modelo de datos, enums e invariantes.
- **Sección 3:** módulos. Para cada uno: objetivo, modelos, reglas, endpoints y UI.
- **Sección 4:** flujos end-to-end.
- **Sección 5:** vistas por rol.
- **Sección 6:** contrato REST.
- **Sección 7:** requisitos no funcionales.
- **Sección 8:** roadmap por fases y tasks.
- **Sección 9:** decisiones cerradas, supuestos y fuera de alcance.
- **Sección 10:** estado actual del repositorio y deuda transitoria.

---

## 1. Visión, alcance y roles

### 1.1. Alcance del MVP

**Incluido**

- Cafeterías, casas de té, juguerías y repostería de Oruro.
- Descubrimiento por categoría, tag, cercanía y búsqueda de antojos.
- Ficha de local con horarios, menú, reseñas y reputación.
- Modo individual, dúo y grupo.
- Check-in con PIN diario + GPS y bitácora de visitas.
- Reseñas con medias estrellas, fotos y moderación.
- Matcher de locales para dúo y grupo.
- Panel de comercio (`OWNER`, `MANAGER`, `STAFF`).
- Panel de administración (`SUPERADMIN`).

**Excluido del MVP**

- Almuerzos, comida rápida general, bares nocturnos y delivery.
- Pedidos, pagos en línea, reservas de mesa y facturación.
- Variantes de producto (tamaño, leche, extras). Un `MenuItem` = una presentación.
- Múltiples monedas. Todo en BOB.
- Reseñas con respuestas del comercio (no hay modelo de reply en v2).
- PostGIS. La distancia se calcula en aplicación con lat/long para 15–30 locales.
- Múltiples sucursales por comercio. Un `CoffeeShop` = un local físico.

### 1.2. Roles, modos y contextos

**Pareja y grupo NO son roles de autorización.** Son vínculos y contextos de uso:

- `Role` global solo tiene `USER` y `SUPERADMIN`.
- El permiso sobre un local viene de `MerchantStaff` (`OWNER`, `MANAGER`, `STAFF`).
- “Cliente”, “pareja” y “grupo” son formas de usar la app con la misma cuenta `USER`.
- Una persona puede ser `USER` y a la vez `OWNER` de un local. No necesita otra cuenta.

| Actor / modo | Identidad en el modelo | Qué puede hacer | Qué NO puede hacer |
|---|---|---|---|
| **Visitante** | Sin sesión | Ver home, listado, ficha, menú, reseñas publicadas y buscador | Check-in, reseñar, swipear, ver PIN, ver paneles |
| **Cliente (`USER`)** | `User.role = USER` | Perfil, historial, check-in, reseñas, bitácora, matcher dúo/grupo | Ver PIN, editar locales, moderar reseñas |
| **Pareja (contexto `DUO`)** | `CoupleLink` activo + `Visit.coupleLinkId` / `MatchSession.coupleLinkId` | Dashboard compartido, visita en pareja, reseña compartida, matcher dúo, archivar vínculo | Pertenece a más de un vínculo activo a la vez |
| **Grupo (contexto `GROUP`)** | `GroupRoom` + `GroupMember` | Crear/unirse por código, visita grupal, matcher grupal, ver miembros | Superar `maxMembers`; usar sala expirada |
| **Merchant `OWNER`** | `MerchantStaff.role = OWNER` | Editar local, horarios, menú, fotos, staff, ver PIN y métricas del local | Cambiar el estado del local a `ACTIVE`/`SUSPENDED`; moderar reseñas ajenas |
| **Merchant `MANAGER`** | `MerchantStaff.role = MANAGER` | Editar local, horarios, menú, ver PIN y métricas; ver staff | Gestionar staff; suspender local |
| **Merchant `STAFF`** | `MerchantStaff.role = STAFF` | Ver PIN del día, ver menú/horarios y visitas de hoy, marcar ítems agotados | Editar datos del local, gestionar staff, ver métricas financieras detalladas |
| **SuperAdmin** | `User.role = SUPERADMIN` | CRUD de locales, activar/suspender, asignar staff, categorías/tags, moderar reseñas, gestionar usuarios | Ser staff de un local sin registro explícito en `MerchantStaff` |
| **Sistema (jobs)** | Sin usuario | Generar PIN, expirar salas/sesiones, reconciliar métricas, limpiar tokens | Saltarse reglas de negocio o validaciones |

### 1.3. Superficies

| Superficie | Runtime | Audiencia | Notas |
|---|---|---|---|
| App cliente | Next.js + Capacitor | Visitante, `USER`, dúo, grupo | Mobile first; cámara para QR y GPS para check-in |
| Panel merchant | Next.js (web) | `OWNER`, `MANAGER`, `STAFF` | Puede compartir codebase con la app, con layout y guards propios |
| Panel admin | Next.js (web) | `SUPERADMIN` | Gestión y moderación; no expuesto en la app móvil |
| API | NestJS | Todas | REST versionada `/api/v1`; Socket.io para matcher |
| Jobs | NestJS scheduler | Sistema | Zona horaria `America/La_Paz` |

### 1.4. Matriz de permisos por módulo

| Módulo | Visitante | `USER` | Dúo / Grupo | Merchant | SuperAdmin |
|---|---|---|---|---|---|
| Catálogo y ficha | Lectura | Lectura | Lectura | Lectura + edición de su local | CRUD total |
| Buscador FTS | Lectura | Lectura | Lectura | Lectura | Lectura |
| Vínculo dúo | — | Crear / aceptar / archivar | Uso compartido | — | Lectura de soporte |
| Salas grupales | — | Crear / unirse / salir | Uso compartido | — | Lectura de soporte |
| Visitas y PIN | — | Crear / cancelar / ver propias | Participar | Ver PIN y visitas de su local | Lectura total |
| Reseñas | Lectura | Crear / editar / borrar propias | Reseña compartida | Lectura; solicitar moderación | Moderar |
| Matcher | — | — | Jugar en dúo/grupo | — | — |
| Panel merchant | — | — | — | Según `MerchantRole` | Acceso de soporte |
| Panel admin | — | — | — | — | Total |

---

## 2. La base de datos como fuente de verdad

### 2.1. Convenciones globales

- **IDs:** `String @id @default(uuid(7))` en todas las tablas. UUIDv7 mantiene orden temporal y buen desempeño de índice.
- **Fechas absolutas:** `DateTime @db.Timestamptz(3)` para auditoría (`createdAt`, `updatedAt`, `verifiedAt`, etc.).
- **Fechas de negocio:** `DateTime @db.Date` para `visitDate`, `SpecialHours.date`, `DailyPin.date` y `VerifiedVisit.visitDate`; se calculan en `America/La_Paz`.
- **Horas de atención:** `DateTime @db.Time(0)` para `openTime`/`closeTime`. Son horas locales, sin zona.
- **Dinero:** `Decimal(10,2)` para precios y gasto; `Decimal(3,2)` para `averageRating`; `Decimal(2,1)` para la nota de una reseña.
- **Coordenadas:** `Decimal(9,6)` para latitud/longitud.
- **Borrado:** cascada solo en identidad, tokens, fotos y pivots; `Restrict`/`SetNull` para preservar historial.
- **Prisma 7:** la URL de conexión vive en `prisma.config.ts`, no en el bloque `datasource`. `uuid(7)` está validado con Prisma 7.10.1.

### 2.2. Inventario de modelos (27)

#### Identidad y acceso (4)

| Modelo | Propósito | Campos y relaciones clave | Reglas |
|---|---|---|---|
| `User` | Cuenta única de la persona | `email` único, `passwordHash?` (OAuth), `fullName`, `avatarUrl?`, `role`, `isActive`, timestamps | Email normalizado a minúsculas; `role` solo `USER`/`SUPERADMIN` |
| `Account` | Proveedor OAuth vinculado | `provider`, `providerAccountId`, `userId`, `createdAt` | Único `(provider, providerAccountId)`; cascada con el usuario |
| `Session` | Sesión de acceso | `tokenHash` único, `userAgent?`, `ipAddress?`, `expiresAt`, `revokedAt?`, `lastUsedAt?` | Se guarda hash, nunca el token plano; revocación lógica |
| `MerchantStaff` | Pertenencia de un usuario a un local | `userId`, `coffeeShopId`, `role` (`MerchantRole`), timestamps | Único `(userId, coffeeShopId)`; un usuario puede ser staff de varios locales |

#### Local, horarios, tags y catálogo (6)

| Modelo | Propósito | Campos y relaciones clave | Reglas |
|---|---|---|---|
| `CoffeeShop` | Local físico | `name`, `slug` único, `description?`, `address`, `neighborhood?`, `latitude`, `longitude`, `phone?`, `whatsapp?`, `instagram?`, `coverUrl?`, `coverPublicId?`, `status`, métricas de reputación, timestamps | `status`: `DRAFT`/`ACTIVE`/`SUSPENDED`; las métricas se recalculan, no se editan a mano |
| `OpeningHours` | Horario semanal | `dayOfWeek` 0–6, `openTime`, `closeTime` | Único `(coffeeShopId, dayOfWeek, openTime)`; permite varios intervalos por día (p. ej. mañana y tarde) |
| `SpecialHours` | Excepción por fecha | `date`, `isClosed`, `openTime?`, `closeTime?`, `note?` | Único `(coffeeShopId, date)`; tiene prioridad sobre `OpeningHours` |
| `Tag` | Etiqueta de ambiente/servicio | `name` único, `slug` único | Semilla: `#con-wifi`, `#ambiente-romantico`, `#pet-friendly`, `#para-el-frio`, `#cafe-de-especialidad` |
| `CoffeeShopTag` | Pivot local–tag | `coffeeShopId`, `tagId`, `createdAt` | PK compuesta `(coffeeShopId, tagId)`; cascada en ambos lados |
| `Category` | Categoría global de menú | `name` único, `slug` único, `sortOrder`, `icon?` | Semilla con las 6 categorías del PRD; no pertenece a un local |

#### Menú (1)

| Modelo | Propósito | Campos y relaciones clave | Reglas |
|---|---|---|---|
| `MenuItem` | Ítem de carta de un local | `coffeeShopId`, `categoryId`, `name`, `description?`, `price`, `imageUrl?`, `imagePublicId?`, `isAvailable`, `isFeatured`, `sortOrder`, `archivedAt?`, timestamps | Único `(coffeeShopId, name)`; se archiva, no se borra; sin variantes en el MVP |

#### Vínculos dúo/grupo y tokens QR (4)

| Modelo | Propósito | Campos y relaciones clave | Reglas |
|---|---|---|---|
| `CoupleLink` | Vínculo 1:1 de pareja | `userAId`, `userBId`, `status`, `startedAt`, `archivedAt?` | Orden canónico `userAId < userBId`; un solo `ACTIVE` por usuario (índices únicos parciales en SQL). El mismo par puede tener varios vínculos `ARCHIVED` y crear uno nuevo al volver |
| `GroupRoom` | Sala temporal de grupo | `name`, `code` único, `hostId`, `status`, `maxMembers` 12, `expiresAt`, `closedAt?`, `createdAt` | `status`: `OPEN`/`CLOSED`/`EXPIRED`; expira por defecto a las 24 h |
| `GroupMember` | Pertenencia a sala | `groupId`, `userId`, `role` (`HOST`/`MEMBER`), `joinedAt`, `leftAt?` | Único `(groupId, userId)`; salir es lógico (`leftAt`) |
| `PairingToken` | Token de invitación QR | `creatorId`, `tokenHash` único, `tokenPrefix`, `type` (`DUO`/`GROUP`), `groupId?`, `expiresAt`, `consumedById?`, `consumedAt?`, `revokedAt?`, `createdAt` | Se guarda hash, no el token plano; un solo consumo; expiración y revocación |

#### Visitas, PIN y verificación (6)

| Modelo | Propósito | Campos y relaciones clave | Reglas |
|---|---|---|---|
| `Visit` | Evento de visita compartido | `coffeeShopId`, `createdById`, `coupleLinkId?`, `groupId?`, `context`, `status`, `visitDate`, `totalSpent`, `notes?`, `photoUrl?`, `photoPublicId?`, `checkInLatitude?`, `checkInLongitude?`, `distanceMeters?`, `gpsAccuracyMeters?`, `verifiedAt?`, `rejectedAt?`, `rejectionReason?`, timestamps | `context` coherente con `coupleLinkId`/`groupId`; `totalSpent` snapshot; el historial no se borra |
| `VisitParticipant` | Quién participó | `visitId`, `userId`, `role` (`CREATOR`/`PARTNER`/`MEMBER`), `joinedAt` | Único `(visitId, userId)`; el creador siempre es participante |
| `VisitItem` | Consumo declarado | `visitId`, `menuItemId`, `itemName`, `quantity`, `unitPrice` | Único `(visitId, menuItemId)`; `itemName` y `unitPrice` son snapshot |
| `DailyPin` | PIN del día por local | `coffeeShopId`, `date`, `pinCode` (`VarChar(4)`), `generatedAt`, `expiresAt` | Único `(coffeeShopId, date)`; 4 dígitos; generación 00:00 + on-demand idempotente |
| `VerificationAttempt` | Intento de verificación | `visitId`, `userId`, `pinHash`, `distanceMeters?`, `gpsAccuracyMeters?`, `result`, `createdAt` | Rate limit por visita/usuario; se guarda hash del PIN enviado, no el PIN |
| `VerifiedVisit` | Ledger de visitas válidas | `visitId`, `userId`, `coffeeShopId`, `visitDate`, `verifiedAt` | Único `(userId, coffeeShopId, visitDate)`: una visita verificada por usuario/local/día |

#### Reseñas y reputación (2)

| Modelo | Propósito | Campos y relaciones clave | Reglas |
|---|---|---|---|
| `Review` | Reseña de un local | `coffeeShopId`, `authorId`, `coupleLinkId?`, `visitId?` único, `rating`, `comment?` (500), `status`, `moderatedById?`, `moderatedAt?`, `moderationReason?`, `deletedAt?`, timestamps | Una reseña activa por `(authorId, coffeeShopId)`; reseña de pareja única por `(coupleLinkId, coffeeShopId)` (índice parcial); media estrella permitida |
| `ReviewPhoto` | Fotos de reseña | `reviewId`, `url`, `publicId`, `sortOrder`, `createdAt` | Hasta 3 por reseña (regla de servicio); cascada con la reseña |

#### Matcher (4)

| Modelo | Propósito | Campos y relaciones clave | Reglas |
|---|---|---|---|
| `MatchSession` | Sesión de swipe | `context` (`DUO`/`GROUP`), `coupleLinkId?`, `groupId?`, `status`, `deckSeed`, `expiresAt`, `startedAt?`, `completedAt?`, `createdAt` | `WAITING`/`ACTIVE`/`MATCHED`/`EXPIRED`/`CANCELLED`; una sola sesión `WAITING`/`ACTIVE` por vínculo/grupo, reforzada por índice único parcial |
| `MatchParticipant` | Participante de la sesión | `sessionId`, `userId`, `joinedAt`, `leftAt?` | Único `(sessionId, userId)` |
| `Swipe` | Voto sobre un local | `sessionId`, `userId`, `coffeeShopId`, `liked`, `createdAt` | Único `(sessionId, userId, coffeeShopId)`; inmutable |
| `Match` | Resultado de la sesión | `sessionId` único, `coffeeShopId`, `likesCount`, `participantsCount`, `matchedAt` | Uno por sesión; al crearse, la sesión pasa a `MATCHED` y se cierra |

### 2.3. Enums (15)

| Enum | Valores | Uso |
|---|---|---|
| `Role` | `USER`, `SUPERADMIN` | Rol global de la cuenta |
| `MerchantRole` | `OWNER`, `MANAGER`, `STAFF` | Rol dentro de un local |
| `RelationshipStatus` | `ACTIVE`, `ARCHIVED` | Estado del vínculo dúo |
| `PairingType` | `DUO`, `GROUP` | Tipo de token QR |
| `CoffeeShopStatus` | `DRAFT`, `ACTIVE`, `SUSPENDED` | Publicación y suspensión del local |
| `GroupRoomStatus` | `OPEN`, `CLOSED`, `EXPIRED` | Ciclo de vida de la sala |
| `GroupMemberRole` | `HOST`, `MEMBER` | Rol dentro de la sala |
| `VisitContext` | `SOLO`, `DUO`, `GROUP` | Modalidad de la visita |
| `VisitStatus` | `PENDING`, `VERIFIED`, `REJECTED`, `CANCELLED` | Estado de la visita |
| `VisitParticipantRole` | `CREATOR`, `PARTNER`, `MEMBER` | Rol en la visita |
| `VisitRejectionReason` | `WRONG_PIN`, `OUT_OF_RANGE`, `LOW_ACCURACY`, `PIN_EXPIRED`, `TOO_MANY_ATTEMPTS` | Motivo persistido en la visita |
| `VerificationResult` | `SUCCESS`, `WRONG_PIN`, `OUT_OF_RANGE`, `LOW_ACCURACY`, `EXPIRED`, `RATE_LIMITED` | Resultado de cada intento |
| `ReviewStatus` | `PUBLISHED`, `HIDDEN`, `DELETED` | Soft delete y moderación |
| `MatchContext` | `DUO`, `GROUP` | Modalidad del matcher |
| `MatchSessionStatus` | `WAITING`, `ACTIVE`, `MATCHED`, `EXPIRED`, `CANCELLED` | Estado de la sesión de swipe |

### 2.4. Invariantes que la migración baseline debe garantizar en SQL

Prisma no expresa todos los constraints. La migración inicial incluye SQL crudo para:

1. Extensiones `unaccent` y `pg_trgm`, más un wrapper `cofi_unaccent(text)` inmutable para índices.
2. `CHECK` de `latitude BETWEEN -90 AND 90`, `longitude BETWEEN -180 AND 180`.
3. `CHECK` de `rating BETWEEN 1.0 AND 5.0` y `(rating * 2) = floor(rating * 2)` para pasos de 0.5; `averageRating BETWEEN 0 AND 5` y contadores de reputación `>= 0`.
4. `CHECK` de `quantity > 0`, `unitPrice >= 0`, `totalSpent >= 0`.
5. `CHECK` de `pinCode ~ '^[0-9]{4}$'`.
6. `CHECK` de consistencia de contexto en `Visit`:
   - `SOLO` ⇒ `coupleLinkId IS NULL AND groupId IS NULL`;
   - `DUO` ⇒ `coupleLinkId IS NOT NULL AND groupId IS NULL`;
   - `GROUP` ⇒ `groupId IS NOT NULL AND coupleLinkId IS NULL`.
7. `CHECK` de orden canónico en `CoupleLink`: `userAId < userBId`.
8. Índices únicos parciales:
   - un `CoupleLink` `ACTIVE` por usuario (dos índices: `userAId` y `userBId` con `WHERE status = 'ACTIVE'`);
   - una reseña de pareja no borrada (`status <> 'DELETED'`) por `(coupleLinkId, coffeeShopId)`;
   - una sesión `WAITING`/`ACTIVE` por `coupleLinkId` y por `groupId` (`WHERE status IN ('WAITING','ACTIVE')` y columna no nula).
9. Índices GIN de búsqueda:
   - `to_tsvector('spanish', cofi_unaccent(name || ' ' || coalesce(description, '')))` en `MenuItem`;
   - trigram sobre `MenuItem.name` y `CoffeeShop.name` para tolerancia a errores.
10. Índices de consulta: `Visit(coffeeShopId, visitDate)`, `Review(coffeeShopId, status)`, `Swipe(sessionId, coffeeShopId)`, `VerifiedVisit(coffeeShopId, visitDate)`.

> La migración baseline, el seed y el refactor de módulos son la **Fase 0** del roadmap. Hasta que se ejecuten, el backend actual no compila con el cliente nuevo porque `auth`, `pairing` y `cafes` todavía referencian `Product`, `PairingToken.token` y campos viejos.

---

## 3. Módulos: qué se construye y cómo funciona

Cada módulo define: objetivo, modelos que usa, reglas de negocio, contrato de API y superficie de UI. Los endpoints son la propuesta de contrato; los nombres finales se fijan en la implementación, pero la semántica no cambia.

### 3.1. Identidad, sesiones y perfil

**Objetivo:** una cuenta por persona, con login local y Google, sesiones revocables y permisos separados entre rol global y rol de comercio.

**Modelos:** `User`, `Account`, `Session`, `MerchantStaff`.

**Reglas**

1. Registro local: email + password. Email se normaliza a minúsculas y se valida formato. Password mínimo 8 caracteres; se hashea con bcrypt (coste 12). Nunca se devuelve `passwordHash`.
2. Google OAuth2: se crea o vincula `Account` por `(provider, providerAccountId)`. Si el email ya existe, se vincula solo cuando el proveedor lo confirma; nunca se fusionan cuentas por email sin verificación.
3. Emisión de sesión: access token JWT de 15 minutos + refresh token opaco de 30 días. El refresh se guarda como `Session.tokenHash` (SHA-256); el token plano solo viaja al cliente. `expiresAt`, `revokedAt` y `lastUsedAt` permiten revocar y auditar.
4. Guards:
   - `JwtAuthGuard`: exige sesión válida y `User.isActive = true`.
   - `RolesGuard`: exige `Role.SUPERADMIN` para el panel admin.
   - `MerchantGuard`: resuelve `MerchantStaff` para el `coffeeShopId` de la ruta y aplica el `MerchantRole` mínimo.
5. Un `USER` puede ser `OWNER` de un local y cliente al mismo tiempo. El rol de comercio no se guarda en `User`.
6. Desactivar cuenta (`isActive = false`) revoca todas las sesiones y bloquea login. No se borra al usuario para preservar reseñas y visitas.
7. Logout revoca la sesión actual; “cerrar todas las sesiones” revoca todas.
8. Cambio de contraseña revoca todas las sesiones menos la actual.

**API**

| Método | Ruta | Auth | Comportamiento |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Público | Crea `User` + sesión inicial |
| POST | `/api/v1/auth/login` | Público | Valida credenciales y crea `Session` |
| POST | `/api/v1/auth/google` | Público | Intercambia código/token de Google y crea/vincula `Account` |
| POST | `/api/v1/auth/refresh` | Refresh token | Rota el refresh y emite access nuevo |
| POST | `/api/v1/auth/logout` | `USER` | Revoca la sesión actual |
| POST | `/api/v1/auth/logout-all` | `USER` | Revoca todas las sesiones |
| GET | `/api/v1/me` | `USER` | Perfil + rol global + membresías de comercio |
| PATCH | `/api/v1/me` | `USER` | `fullName`, `avatarUrl` |
| PATCH | `/api/v1/me/password` | `USER` | Cambio de contraseña con verificación de la actual |
| GET | `/api/v1/me/sessions` | `USER` | Lista sesiones activas |
| DELETE | `/api/v1/me/sessions/:id` | `USER` | Revoca una sesión propia |

**UI**

- Pantallas de login, registro, recuperación (fase posterior) y callback OAuth.
- Perfil con avatar, nombre, email, cambio de contraseña, sesiones activas y “cerrar todas”.
- Selector de contexto si el usuario tiene panel de comercio: “Como cliente” / “Panel de [local]”.

### 3.2. Catálogo: locales, horarios, tags y menú

**Objetivo:** que un visitante entienda qué ofrece un local, cuándo abre y a qué precio, sin ambigüedad.

**Modelos:** `CoffeeShop`, `OpeningHours`, `SpecialHours`, `Tag`, `CoffeeShopTag`, `Category`, `MenuItem`.

**Reglas**

1. **Estados del local:** `DRAFT` no se lista ni se accede por slug público; `ACTIVE` es visible; `SUSPENDED` devuelve 404 en superficie pública y muestra un aviso en el panel.
2. **Quién cambia el estado:** solo `SUPERADMIN` crea el local, lo activa y lo suspende. `OWNER`/`MANAGER` editan contenido, pero no publican ni suspenden. El alta inicial de las 15–30 cafeterías la hace el admin en la Fase 0.
3. **Horarios:** `OpeningHours` define intervalos semanales; puede haber varios por día. `SpecialHours` tiene prioridad para una fecha concreta. `isOpenNow`, `nextOpenAt` y `todayHours` se calculan en el backend con zona `America/La_Paz`; el cliente no replica la lógica.
4. **Tags:** catálogo global administrado por `SUPERADMIN`. El merchant asigna tags existentes; no crea tags desde el panel.
5. **Categorías:** catálogo global con las 6 categorías. El ítem pertenece a una categoría; el orden de la carta usa `Category.sortOrder` y `MenuItem.sortOrder`.
6. **Menú:** `OWNER`/`MANAGER` crean y editan ítems; `STAFF` solo alterna `isAvailable` (agotado/disponible). Un ítem no se borra: se archiva con `archivedAt` y deja de mostrarse. El único `(coffeeShopId, name)` impide duplicados; para dos presentaciones distintas se usan nombres distintos.
7. **Imágenes:** una portada por local y una imagen por ítem, subidas firmadas a Cloudinary. Se guarda `url` + `publicId` para poder reemplazar o borrar.
8. **Precios:** `Decimal(10,2)` en BOB; se muestran con dos decimales. No hay impuestos ni cargos extra en el MVP.
9. **Reputación:** `averageRating` es el promedio simple de reseñas `PUBLISHED`; `reviewCount` cuenta `PUBLISHED`; `verifiedReviewCount` cuenta `PUBLISHED` con `visit.status = VERIFIED`. El desglose `rating1Count`..`rating5Count` agrupa por redondeo half-up a la estrella entera; el promedio usa el valor exacto con media estrella.
10. **Borrado lógico:** un local no se borra si tiene visitas; se suspende. Un `MenuItem` con `VisitItem` no se borra; se archiva.

**API pública**

| Método | Ruta | Auth | Comportamiento |
|---|---|---|---|
| GET | `/api/v1/cafes` | Público | Lista paginada de `ACTIVE`, filtros `neighborhood`, `tags`, `openNow`, `q`, orden `rating`/`name`/`distance` |
| GET | `/api/v1/cafes/:slug` | Público | Ficha con horarios, tags, menú por categoría, stats y últimas reseñas |
| GET | `/api/v1/cafes/:slug/menu` | Público | Menú completo agrupado por categoría |
| GET | `/api/v1/cafes/:slug/reviews` | Público | Reseñas `PUBLISHED`, paginadas, verificadas primero |

**API merchant**

| Método | Ruta | Rol mínimo | Comportamiento |
|---|---|---|---|
| GET | `/api/v1/merchant/cafes` | `STAFF` | Locales donde el usuario es staff |
| GET | `/api/v1/merchant/cafes/:id` | `STAFF` | Ficha editable + estado + métricas |
| PATCH | `/api/v1/merchant/cafes/:id` | `MANAGER` | Datos de contacto, descripción, coordenadas, portada, tags |
| PUT | `/api/v1/merchant/cafes/:id/hours` | `MANAGER` | Reemplaza el horario semanal completo |
| POST | `/api/v1/merchant/cafes/:id/special-hours` | `MANAGER` | Crea/actualiza una excepción por fecha |
| DELETE | `/api/v1/merchant/cafes/:id/special-hours/:date` | `MANAGER` | Elimina la excepción |
| GET | `/api/v1/merchant/cafes/:id/menu` | `STAFF` | Menú completo, incluidos agotados |
| POST | `/api/v1/merchant/cafes/:id/menu` | `MANAGER` | Crea ítem |
| PATCH | `/api/v1/merchant/cafes/:id/menu/:itemId` | `MANAGER` | Edita nombre, precio, categoría, imagen, destacado |
| PATCH | `/api/v1/merchant/cafes/:id/menu/:itemId/availability` | `STAFF` | Alterna `isAvailable` |
| DELETE | `/api/v1/merchant/cafes/:id/menu/:itemId` | `MANAGER` | Archiva el ítem |
| GET | `/api/v1/merchant/cafes/:id/staff` | `MANAGER` | Lista staff |
| POST | `/api/v1/merchant/cafes/:id/staff` | `OWNER` | Asigna `MANAGER`/`STAFF` por email |
| PATCH | `/api/v1/merchant/cafes/:id/staff/:userId` | `OWNER` | Cambia rol de staff |
| DELETE | `/api/v1/merchant/cafes/:id/staff/:userId` | `OWNER` | Quita staff (no a sí mismo si es el único `OWNER`) |

**UI**

- **Cliente:** home con buscador, filtros por tag/categoría/cercanía, tarjetas de local con rating, estado abierto/cerrado y tags; ficha con portada, horarios, mapa, menú y reseñas.
- **Merchant:** dashboard del local, editor de ficha, editor de horarios, CRUD de menú, disponibilidad rápida y gestión de staff.
- **Admin:** tabla de locales con estado, alta/edición, activación/suspensión y asignación de `OWNER`.

### 3.3. Búsqueda de antojos y sugerencias

**Objetivo:** responder “quiero un submarino con churros” o “algo frío” con ítems concretos y su local, no solo con nombres de cafeterías.

**Modelos:** `MenuItem`, `Category`, `CoffeeShop`, `CoffeeShopTag`, `VisitItem`, `Visit`.

**Reglas**

1. La búsqueda principal indexa `MenuItem.name` + `MenuItem.description` con FTS español, `unaccent` y `pg_trgm`.
2. El resultado es un `MenuItem` con su local, precio, categoría, tags y estado abierto/cerrado. El nombre del local suma como señal secundaria en el ranking.
3. Ranking: `ts_rank` + similitud trigram + `averageRating` + bonus si el local está abierto. Orden determinístico; sin resultados aleatorios.
4. Filtros: `category`, `tags`, `minPrice`, `maxPrice`, `neighborhood`, `openNow`, `lat`/`lng` opcionales para distancia.
5. Si la consulta está vacía, se devuelven categorías y locales destacados; no se inventa una búsqueda.
6. **Sugerencias personalizadas:** a partir de las categorías de los `VisitItem` de las últimas 5 visitas verificadas del usuario (o del vínculo dúo/grupo activo). Si no hay historial, se usan los locales mejor valorados. Se devuelven como “Para tu antojo”, no como resultados de búsqueda.
7. La búsqueda solo considera locales `ACTIVE` y ítems `isAvailable = true` y no archivados.

**API**

| Método | Ruta | Auth | Comportamiento |
|---|---|---|---|
| GET | `/api/v1/search/cravings?q=&category=&tags=&openNow=&lat=&lng=` | Público | Búsqueda FTS + trigram sobre ítems |
| GET | `/api/v1/search/suggestions` | `USER` opcional | Sugerencias por historial o top rated |
| GET | `/api/v1/categories` | Público | Categorías ordenadas |
| GET | `/api/v1/tags` | Público | Tags con conteo de locales |

**UI**

- Buscador con debounce, chips de categoría/tag, toggle “abierto ahora”, orden por relevancia/rating/distancia.
- Resultados con foto del ítem, nombre, local, precio, rating y distancia.
- Estado vacío con categorías sugeridas.

### 3.4. Vínculo dúo y salas grupales

**Objetivo:** convertir una cuenta individual en una experiencia compartida sin duplicar cuentas ni romper el historial cuando la relación termina o la sala expira.

**Modelos:** `CoupleLink`, `GroupRoom`, `GroupMember`, `PairingToken`.

**Reglas del vínculo dúo**

1. Un usuario solo puede tener un `CoupleLink` `ACTIVE`. La migración agrega índices únicos parciales por `userAId` y `userBId` con `WHERE status = 'ACTIVE'`.
2. Orden canónico obligatorio: `userAId < userBId`; el servicio ordena antes de insertar. Evita duplicados `(A,B)` y `(B,A)`.
3. Invitación: el creador genera un `PairingToken` `DUO`; se devuelve el token plano una sola vez y se guarda `tokenHash` + `tokenPrefix`. El QR usa `cofirutas://pair?token=<token>`. Expira en 15 minutos.
4. Aceptación: el consumidor escanea o pega el token; el backend valida hash, expiración, no consumo, no revocación, que no sea el creador y que ninguno de los dos tenga vínculo activo. Luego crea `CoupleLink` y marca `consumedById`/`consumedAt` en una transacción.
5. Si cualquiera ya tiene vínculo activo, se rechaza con un error de dominio claro; no se archiva el vínculo existente automáticamente.
6. Archivar: cualquiera de los dos puede archivar. Se setea `status = ARCHIVED` y `archivedAt`. Las visitas, reseñas y matches históricos se conservan y se muestran como recuerdos; no se pueden crear nuevas visitas dúo con ese vínculo.
7. No hay reactivación: para volver a estar juntos se crea un vínculo nuevo. El historial anterior queda enlazado al vínculo viejo.
8. La reseña de pareja requiere `CoupleLink` activo al momento de crearla y se marca con `coupleLinkId`; si el vínculo se archiva, la reseña se conserva.

**Reglas de salas grupales**

1. El host crea `GroupRoom` con nombre, `maxMembers` (por defecto 12) y expiración (24 h por defecto). El backend genera un `code` único de 6 caracteres, sin caracteres ambiguos (`0/O`, `1/I`).
2. Unirse: por `code` o por `PairingToken` `GROUP`. El código es la vía principal para compartir; el token es una invitación de un solo uso que el host regenera cuando necesita otro QR.
3. `GroupMember` se crea con `HOST` para el creador y `MEMBER` para el resto. `leftAt` permite salir sin borrar historia. Un usuario no puede estar dos veces en la misma sala.
4. La sala solo acepta miembros si está `OPEN`, no expiró y no alcanzó `maxMembers`.
5. El host puede cerrar la sala (`CLOSED`, `closedAt`). El job de expiración la pasa a `EXPIRED` cuando vence. Una sala cerrada o expirada no acepta nuevos miembros ni nuevas visitas/matches.
6. Al expirar, las visitas y matches ya creados se conservan; solo se cierra la posibilidad de seguir usándola.
7. Un miembro puede salir; si el host sale, la sala se cierra (no se transfiere el host en el MVP). Esta regla se valida en servicio.

**API**

| Método | Ruta | Auth | Comportamiento |
|---|---|---|---|
| POST | `/api/v1/pairing/duo/token` | `USER` | Genera token QR de dúo (15 min) |
| POST | `/api/v1/pairing/duo/accept` | `USER` | Acepta token y crea `CoupleLink` |
| GET | `/api/v1/pairing/duo` | `USER` | Vínculo activo + historial resumido |
| DELETE | `/api/v1/pairing/duo` | `USER` | Archiva el vínculo activo |
| POST | `/api/v1/groups` | `USER` | Crea sala y devuelve `code` |
| POST | `/api/v1/groups/join` | `USER` | Une por `code` o token |
| GET | `/api/v1/groups/:id` | Miembro | Detalle, miembros y estado |
| POST | `/api/v1/groups/:id/leave` | Miembro | Marca `leftAt`; si es host, cierra |
| POST | `/api/v1/groups/:id/close` | Host | Cierra la sala |
| POST | `/api/v1/groups/:id/invites` | Host | Genera token `GROUP` de un uso |
| GET | `/api/v1/groups/me` | `USER` | Salas activas e históricas del usuario |

**UI**

- **Dúo:** pantalla “Conecta con tu pareja” con QR, código copiable, estado del vínculo, botón archivar con confirmación y dashboard compartido.
- **Grupo:** crear sala, compartir código/QR, lista de miembros con host, estado de expiración, botón salir/cerrar.
- **Cliente:** selector de contexto al iniciar una visita o un matcher: “Solo”, “En pareja”, “En grupo”.

### 3.5. Visitas, PIN diario y verificación

**Objetivo:** registrar visitas reales con una prueba mínima de presencia física (PIN del local + GPS), sin convertirlo en un sistema de vigilancia ni en un fraude trivial.

**Modelos:** `Visit`, `VisitParticipant`, `VisitItem`, `DailyPin`, `VerificationAttempt`, `VerifiedVisit`.

**Ciclo de vida de una visita**

```
PENDING ──(PIN + GPS válidos)──> VERIFIED
   │
   ├──(límite de intentos / PIN vencido)──> REJECTED
   └──(cancelada por el creador)────────────> CANCELLED
```

`VERIFIED` es terminal e inmutable. `REJECTED` y `CANCELLED` no generan `VerifiedVisit`.

**Reglas**

1. **Creación:** el creador elige un local `ACTIVE`, un contexto (`SOLO`, `DUO`, `GROUP`), ítems del menú (opcional), notas y foto (opcional).
2. **Contexto:**
   - `SOLO`: un único participante (`CREATOR`).
   - `DUO`: requiere `CoupleLink` `ACTIVE`; participan ambos (`CREATOR` y `PARTNER`).
   - `GROUP`: requiere `GroupRoom` `OPEN` y que el creador sea miembro; participan el creador y los miembros activos seleccionados, mínimo 2.
3. **Participantes:** se persisten en `VisitParticipant` al crear la visita. Si alguien sale del grupo después, la visita conserva a los participantes originales.
4. **Ítems:** se toman del menú del local. `itemName` y `unitPrice` se copian como snapshot; si el precio cambia después, la visita no cambia. `quantity > 0`.
5. **Gasto:** si hay ítems, `totalSpent` se calcula en el servidor como `Σ(quantity × unitPrice)` y el cliente no puede sobreescribirlo. Si no hay ítems, el creador puede enviar `totalSpent >= 0`. La métrica por usuario es `totalSpent / número de participantes`, calculada en consulta y no almacenada.
6. **Fecha de negocio:** `visitDate` es la fecha local (`America/La_Paz`) al momento de crear la visita. La verificación usa el PIN de esa fecha; si el PIN ya expiró, la visita se rechaza con `PIN_EXPIRED` y se debe crear una nueva.
7. **PIN diario:**
   - Un `DailyPin` por local y fecha, de 4 dígitos, generado a las 00:00 local por un job y on-demand de forma idempotente para el primer request del día.
   - `pinCode` se guarda plano porque el merchant debe leerlo; el acceso está restringido a staff autenticado del local.
   - `expiresAt` es el final del día local (23:59:59). No se reutiliza el PIN de ayer.
   - El PIN es del local, no de la visita: varios clientes pueden usar el mismo PIN el mismo día.
8. **Verificación:** el cliente envía `pin`, `latitude`, `longitude` y `accuracy`. El backend:
   1. valida que la visita esté `PENDING` y que el usuario sea participante;
   2. aplica rate limit: máximo 5 intentos por visita en 15 minutos y máximo 10 intentos por usuario/local/día; crear una visita nueva no reinicia el contador diario;
   3. calcula la distancia Haversine entre el GPS y el local;
   4. exige `accuracy <= 100 m` y `distance <= 80 m`, sin override del merchant;
   5. compara el PIN con `DailyPin.pinCode` usando HMAC-SHA256 con secreto de servidor y comparación en tiempo constante;
   6. registra un `VerificationAttempt` con `pinHash`, distancia, accuracy y resultado;
   7. si todo es válido, en una transacción: marca `Visit.VERIFIED`, setea `verifiedAt` e inserta un `VerifiedVisit` por participante.
9. **Fallos:**
   - PIN incorrecto, fuera de rango o baja precisión: se registra el intento y la visita sigue `PENDING` para reintentar.
   - Al llegar a 5 intentos en la ventana de la visita o 10 en el día por usuario/local: la visita pasa a `REJECTED` con `TOO_MANY_ATTEMPTS` y no se aceptan nuevas verificaciones de ese usuario en ese local hasta el día siguiente.
   - PIN vencido: `REJECTED` con `PIN_EXPIRED`.
   - El usuario puede cancelar una visita `PENDING`; no puede cancelar una `VERIFIED`.
10. **Ledger `VerifiedVisit`:** único `(userId, coffeeShopId, visitDate)`. Antes de verificar se comprueba que ningún participante tenga ya una visita verificada en ese local y fecha; si alguno la tiene, se rechaza la verificación completa con 409. Esto evita doble conteo y mantiene la regla “una visita verificada por usuario/local/día”.
11. **Privacidad:** se guardan las coordenadas del check-in en `Visit` y la distancia/accuracy derivadas en `Visit` y `VerificationAttempt`. No se guarda un historial de ubicación continuo ni se rastrea al usuario fuera del check-in.
12. **Foto:** una foto opcional por visita, subida a Cloudinary con `url` + `publicId`.

**API**

| Método | Ruta | Auth | Comportamiento |
|---|---|---|---|
| POST | `/api/v1/visits` | `USER` | Crea visita `PENDING` con contexto, participantes e ítems |
| GET | `/api/v1/visits/:id` | Participante | Detalle, estado e intentos propios |
| GET | `/api/v1/me/visits` | `USER` | Bitácora paginada con local, fecha, gasto y estado |
| POST | `/api/v1/visits/:id/verify` | Participante | Verifica PIN + GPS |
| POST | `/api/v1/visits/:id/cancel` | Creador | Cancela una visita `PENDING` |
| GET | `/api/v1/merchant/cafes/:id/pin` | `STAFF` | PIN del día y hora de expiración |
| GET | `/api/v1/merchant/cafes/:id/visits` | `STAFF` | Visitas del local, paginadas y filtrables por fecha/estado |
| GET | `/api/v1/merchant/cafes/:id/visits/stats` | `MANAGER` | Agregados de visitas y gasto |

**UI**

- **Check-in:** elegir local → confirmar contexto y participantes → marcar ítems → foto opcional → “Estoy aquí” → pedir PIN al cajero → enviar PIN + GPS → resultado.
- **Estados:** `PENDING` con contador de intentos, `VERIFIED` con badge verde, `REJECTED` con motivo y opción de crear otra visita, `CANCELLED` en gris.
- **Bitácora:** timeline por fecha, local, gasto, badge verificado y acceso a la reseña.
- **Merchant:** tarjeta grande con el PIN del día, expiración, botón copiar; lista de visitas y conteo.

### 3.6. Reseñas, reputación y moderación

**Objetivo:** reputación útil y difícil de falsificar, con una reseña por persona/local y una reseña compartida por pareja.

**Modelos:** `Review`, `ReviewPhoto`, `CoffeeShop`, `Visit`, `CoupleLink`, `MerchantStaff`.

**Reglas**

1. **Una reseña por usuario/local:** único `(authorId, coffeeShopId)`. Si el usuario borra su reseña, la fila queda `DELETED`; puede restaurarla o editarla, pero no crear una segunda.
2. **Nota:** `Decimal(2,1)` entre 1.0 y 5.0 en pasos de 0.5. El formulario muestra media estrella; el backend valida el paso.
3. **Comentario:** máximo 500 caracteres; puede estar vacío si hay nota.
4. **Fotos:** hasta 3 por reseña, con `url` + `publicId` y `sortOrder`. Se pueden reemplazar; las fotos eliminadas se borran de Cloudinary.
5. **Visita verificada:** no se guarda un booleano. El badge se deriva de `review.visitId` → `visit.status = VERIFIED`. Una reseña sin visita o con visita no verificada es “Opinión de la comunidad”.
6. **Una reseña por visita:** `Review.visitId` es único. Una visita verificada puede originar como máximo una reseña; si es en pareja, esa reseña es la compartida.
7. **Reseña de pareja:**
   - Requiere `CoupleLink` `ACTIVE` y se guarda con `coupleLinkId`.
   - Es única por `(coupleLinkId, coffeeShopId)` entre reseñas no borradas (índice único parcial en SQL).
   - La escribe cualquiera de los dos; ambos pueden editarla. Se muestra como “Carlos & Laura”.
   - Mientras exista una reseña de pareja no borrada, ninguno de los dos puede crear una reseña individual del mismo local; el servicio lo bloquea.
8. **Prohibiciones:** un usuario no puede reseñar un local del que es staff (`MerchantStaff`). Tampoco puede reseñar dos veces el mismo local.
9. **Moderación:** `SUPERADMIN` puede pasar una reseña a `HIDDEN` (con `moderationReason`) o `DELETED` (con `deletedAt`). `HIDDEN` no se muestra al público; el autor la ve con su estado. El autor puede editar una reseña `HIDDEN`, pero no se republica sola: sigue oculta hasta que el admin la revise.
10. **Borrado del autor:** `DELETED` + `deletedAt`. Si el autor la restaura, vuelve a `PUBLISHED`; si el admin la vuelve a ocultar, requiere una nueva revisión.
11. **Reputación:** al crear, editar, borrar o moderar una reseña, se recalculan en la misma transacción `averageRating`, `reviewCount`, `verifiedReviewCount` y los contadores `rating1Count`..`rating5Count`. Un job nocturno reconcilia todos los locales contra las reseñas `PUBLISHED` por si hubo una falla.
12. **Promedio:** media simple de `PUBLISHED`, sin ponderar por usuario ni por visita. El desglose visual usa redondeo half-up a la estrella entera.

**API**

| Método | Ruta | Auth | Comportamiento |
|---|---|---|---|
| POST | `/api/v1/reviews` | `USER` | Crea reseña individual o de pareja |
| GET | `/api/v1/reviews/:id` | Público | Detalle de reseña `PUBLISHED` |
| PATCH | `/api/v1/reviews/:id` | Autor | Edita nota, comentario y fotos |
| DELETE | `/api/v1/reviews/:id` | Autor | Soft delete |
| POST | `/api/v1/reviews/:id/restore` | Autor | Restaura una reseña propia |
| GET | `/api/v1/me/reviews` | `USER` | Reseñas propias, incluidas ocultas |
| GET | `/api/v1/admin/reviews` | `SUPERADMIN` | Todas las reseñas con filtros de estado/local |
| PATCH | `/api/v1/admin/reviews/:id/status` | `SUPERADMIN` | `PUBLISHED`/`HIDDEN`/`DELETED` + motivo |

**UI**

- Formulario con estrellas (media estrella), comentario, hasta 3 fotos y toggle “reseña en pareja” cuando hay vínculo activo.
- Ficha del local: resumen de rating, desglose, filtro “solo verificadas”, reseñas con badge y fotos.
- “Mis reseñas”: estado, editar, borrar, restaurar.
- Admin: tabla con búsqueda, filtro por estado, detalle y acciones de moderación.

### 3.7. Matcher de cafeterías

**Objetivo:** convertir la indecisión “¿a qué café vamos?” en una decisión compartida y divertida, sin votos individuales visibles antes del match.

**Modelos:** `MatchSession`, `MatchParticipant`, `Swipe`, `Match`, `CoffeeShop`, `MenuItem`, `Visit`, `VisitItem`.

**Reglas**

1. **No hay matcher individual.** `MatchContext` solo tiene `DUO` y `GROUP`. Un `USER` sin vínculo activo no puede iniciar una sesión.
2. **Creación:**
   - `DUO`: requiere `CoupleLink` `ACTIVE`; se agregan ambos participantes.
   - `GROUP`: requiere `GroupRoom` `OPEN`; se agregan los miembros activos, mínimo 2.
3. **Estado:** `WAITING` al crear; `ACTIVE` cuando están todos los participantes esperados (dúo) o cuando el host inicia (grupo); `MATCHED` al encontrar local; `EXPIRED` por tiempo; `CANCELLED` por el host o por falta de participantes.
4. **Deck:** se genera server-side una sola vez con `deckSeed` persistido. Es el mismo orden para todos los participantes. Candidatos: locales `ACTIVE`, sin repetir los ya swipeados en la sesión. Orden: categorías preferidas de las últimas 5 visitas verificadas del vínculo/grupo, luego `averageRating`, luego distancia si hay ubicación. Cada tarjeta muestra un ítem destacado (`isFeatured`, si no el primero disponible por `sortOrder`), precio, foto, tags y rating.
5. **Swipe:** un voto inmutable por `(sessionId, userId, coffeeShopId)`. `liked = false` descarta el local para ese usuario; no cuenta como voto positivo.
6. **Match dúo:** se produce cuando ambos participantes activos likearon el mismo local.
7. **Match grupal:** se produce cuando los likes alcanzan mayoría estricta de los participantes activos y al menos 2 votos. `umbral = max(2, floor(n/2) + 1)`. Los participantes que salieron (`leftAt`) no cuentan. El primer local que alcanza el umbral gana.
8. **Cierre:** al crear `Match`, la sesión pasa a `MATCHED` y se cierra; los swipes posteriores se rechazan. `Match` guarda `likesCount` y `participantsCount` como snapshot.
9. **Tiempo real:** Socket.io con una sala por sesión. Eventos: `session.joined`, `session.started`, `swipe.recorded` (solo agregados, nunca el voto individual), `session.matched`, `session.expired`. Persistencia en Postgres; el adapter Redis queda para escalar a varias instancias.
10. **Expiración:** 30 minutos por defecto. El job marca `EXPIRED`; una sesión vencida no acepta swipes.
11. **Resultado:** pantalla de match con local, foto, rating, tags, botón “Ver ficha” y “Crear visita”. No se crea una visita automáticamente; el usuario decide.
12. **Repetición:** al terminar o expirar, se puede crear una sesión nueva. No se reutiliza `deckSeed` ni los swipes.

**API**

| Método | Ruta | Auth | Comportamiento |
|---|---|---|---|
| POST | `/api/v1/match/sessions` | `USER` | Crea sesión `DUO` o `GROUP` |
| GET | `/api/v1/match/sessions/:id` | Participante | Estado, participantes y resultado |
| POST | `/api/v1/match/sessions/:id/join` | `USER` | Une a un participante (dúo/grupo) |
| POST | `/api/v1/match/sessions/:id/start` | Host / dúo completo | Pasa a `ACTIVE` |
| GET | `/api/v1/match/sessions/:id/next` | Participante | Siguiente local no swipeado |
| POST | `/api/v1/match/sessions/:id/swipes` | Participante | Registra `liked` y devuelve si hubo match |
| POST | `/api/v1/match/sessions/:id/cancel` | Host / participante | Cancela la sesión |
| GET | `/api/v1/match/sessions/:id/result` | Participante | `Match` con local y métricas |

**UI**

- Dúo: pantalla de espera con avatar de ambos, “Empezar”, tarjeta grande con swipe (izquierda/derecha o botones), contador de cartas, animación de match.
- Grupo: lobby con código, lista de miembros, host inicia, tarjeta compartida, contador de votos (“3 de 5”) sin revelar quién.
- Resultado: tarjeta de local con CTA a ficha y a check-in.

### 3.8. Paneles de comercio y administración

#### Panel merchant (`OWNER`, `MANAGER`, `STAFF`)

**Objetivo:** que el local mantenga su información y su PIN sin depender del admin.

| Vista | `OWNER` | `MANAGER` | `STAFF` |
|---|---|---|---|
| Dashboard del local | Métricas completas | Métricas completas | PIN, visitas de hoy, disponibilidad |
| Ficha (descripción, contacto, coords, portada, tags) | Editar | Editar | Lectura |
| Horarios y excepciones | Editar | Editar | Lectura |
| Menú | CRUD + archivar | CRUD + archivar | Solo `isAvailable` |
| Staff | CRUD | Ver staff | — |
| PIN del día | Ver | Ver | Ver |
| Visitas y gasto | Ver | Ver | Ver visitas de hoy; sin gasto detallado |
| Reseñas | Lectura | Lectura | Lectura |
| Moderación | Solicitar al admin | Solicitar al admin | — |

**Reglas**

- El `coffeeShopId` sale de la ruta y se valida contra `MerchantStaff`; nunca se confía en un id del body.
- Un `OWNER` no puede quitarse a sí mismo si es el único `OWNER` del local.
- `STAFF` no puede ver el gasto total ni el ticket promedio; sí el PIN y el estado del menú.
- El panel no permite cambiar `CoffeeShop.status`; eso es del admin.
- No hay respuestas del comercio a reseñas en v2. Si hay un problema, el merchant lo reporta al admin por el canal de soporte; la moderación se registra en `Review`.

#### Panel admin (`SUPERADMIN`)

**Objetivo:** cargar y curar el catálogo de Oruro, moderar y dar soporte.

| Vista | Acciones |
|---|---|
| Locales | Crear `DRAFT`, editar, activar, suspender, ver métricas, asignar `OWNER` |
| Staff | Ver membresías por local, asignar/cambiar roles |
| Categorías | CRUD, orden, icono |
| Tags | CRUD, ver conteo de locales |
| Reseñas | Filtrar, ocultar, borrar, restaurar, motivo |
| Usuarios | Listar, buscar, desactivar, cambiar `Role` (solo otro `SUPERADMIN` puede crear `SUPERADMIN`) |
| Métricas globales | Locales activos, visitas verificadas, reseñas, ratings, crecimiento |
| Operación | Forzar generación de PIN, expirar salas/sesiones, reconciliar métricas |

**Reglas**

- Un `SUPERADMIN` no puede desactivarse a sí mismo ni quitarse el rol si es el último.
- Cambiar `Role` a `SUPERADMIN` es una acción explícita y auditada por logs; no hay tabla de auditoría en v2.
- El admin no puede editar la nota de una reseña; solo ocultarla o borrarla.
- El admin no puede verificar visitas manualmente ni hacer override de GPS/PIN.

### 3.9. Jobs y procesos del sistema

| Job | Frecuencia | Qué hace | Idempotencia |
|---|---|---|---|
| `daily-pin` | 00:00 `America/La_Paz` | Crea `DailyPin` para cada local `ACTIVE` | `unique(coffeeShopId, date)`; on-demand si falta |
| `group-expiry` | Cada 5 min | `GroupRoom` `OPEN` con `expiresAt` vencido → `EXPIRED` | Solo transiciona una vez |
| `match-expiry` | Cada 5 min | `MatchSession` `WAITING`/`ACTIVE` vencida → `EXPIRED` | Solo transiciona una vez |
| `review-stats-reconcile` | Diario 03:00 | Recalcula métricas de `CoffeeShop` desde reseñas `PUBLISHED` | Recalcula desde cero, no incrementa |
| `session-cleanup` | Diario 04:00 | Borra `Session` expiradas/revocadas con más de 30 días | Borrado físico permitido |
| `token-cleanup` | Diario 04:10 | Borra `PairingToken` expirados/revocados con más de 30 días | Borrado físico permitido |
| `verification-cleanup` | Diario 04:20 | Borra `VerificationAttempt` con más de 90 días | Borrado físico; no afecta visitas |

**Reglas transversales**

- Los jobs usan la zona `America/La_Paz`, no la del servidor.
- Si un job falla, se registra el error y se reintenta en la siguiente ejecución; no se marca un estado a medias.
- Las transiciones de estado se hacen con `updateMany` condicionado al estado actual para evitar carreras.
- Los jobs no envían notificaciones push en el MVP; solo mantienen consistencia.

---

## 4. Flujos end-to-end

### 4.1. Alta y primer acceso

1. El visitante abre la app y ve el home público.
2. Se registra con email/password o Google.
3. El backend crea `User` (`role = USER`) y una `Session`; devuelve access + refresh.
4. La app pide nombre visible y avatar (opcional).
5. El usuario cae en el home autenticado. No se le obliga a crear pareja ni grupo.

**Errores:** email duplicado, password débil, cuenta desactivada, OAuth sin email verificado.

### 4.2. Descubrimiento y búsqueda

1. El usuario explora por categoría, tag, “abierto ahora” o cercanía.
2. Escribe un antojo (“submarino”, “frappé”, “waffle”) en el buscador.
3. El backend ejecuta FTS + trigram sobre `MenuItem` y devuelve ítems con su local.
4. El usuario abre la ficha del local: horarios, menú, rating, reseñas y mapa.
5. Desde la ficha puede iniciar un check-in o escribir una reseña. El matcher se juega desde una sesión de dúo o grupo, no desde la ficha.

**Errores:** sin resultados, local suspendido, menú vacío.

### 4.3. Vínculo dúo

1. Usuario A entra a “CofiDúo” y genera un token.
2. La app muestra QR + enlace copiable. El token vence en 15 minutos.
3. Usuario B escanea el QR o pega el enlace.
4. El backend valida token, expiración, consumo, auto-invitación y que ninguno tenga vínculo activo.
5. En una transacción se crea `CoupleLink` canónico y se marca el token como consumido.
6. Ambos ven el dashboard dúo y el contexto “En pareja” se habilita en visitas, reseñas y matcher.

**Errores:** token inválido/vencido/usado, usuario con vínculo activo, intento de vincularse consigo mismo.

### 4.4. Sala grupal

1. Usuario host crea una sala con nombre y `maxMembers`.
2. La app muestra el código de 6 caracteres y un QR de invitación.
3. Los amigos se unen por código o QR; cada uno queda como `GroupMember` `MEMBER`.
4. El lobby muestra miembros, host, expiración y acciones disponibles.
5. El host inicia una visita grupal o un matcher grupal.
6. Al terminar, el host cierra la sala o el job la expira a las 24 h.

**Errores:** sala llena, sala cerrada/expirada, código inválido, usuario ya miembro.

### 4.5. Check-in individual

1. El usuario elige “Estoy aquí” en la ficha del local.
2. Selecciona contexto `SOLO`; la app muestra el menú.
3. Marca ítems (opcional), agrega nota/foto (opcional) y confirma.
4. El backend crea `Visit` `PENDING` y `VisitParticipant` `CREATOR`.
5. La app pide el PIN al cajero y permiso de ubicación.
6. El usuario ingresa el PIN; la app envía PIN + lat/lng + accuracy.
7. El backend valida y responde `VERIFIED` con `VerifiedVisit`, o un error con motivo.
8. La app ofrece escribir la reseña de esa visita.

**Errores:** GPS denegado, accuracy > 100 m, distancia > 80 m, PIN incorrecto, PIN vencido, rate limit, visita ya verificada ese día.

### 4.6. Check-in en pareja

1. Con `CoupleLink` activo, el usuario elige contexto `DUO`.
2. La visita incluye a ambos participantes; el creador marca los ítems.
3. Cualquiera de los dos puede enviar la verificación desde su dispositivo; la visita guarda las coordenadas de ese dispositivo.
4. Al verificar, se acredita un `VerifiedVisit` a cada participante (misma visita, misma fecha).
5. La reseña puede ser individual o compartida; si es compartida, se marca con `coupleLinkId` y bloquea reseñas individuales de ambos para ese local.

**Errores:** sin vínculo activo, participante con visita ya verificada ese día, vínculo archivado durante el flujo.

### 4.7. Check-in grupal

1. El creador elige contexto `GROUP` y una sala `OPEN` de la que es miembro.
2. Selecciona a los participantes activos (mínimo 2, incluido él).
3. Marca ítems y confirma; se crea la visita con todos los participantes.
4. Un participante verifica con PIN + GPS.
5. Se acredita `VerifiedVisit` a cada participante; si alguno ya tenía una visita verificada ese día en ese local, la verificación completa se rechaza con 409.

**Errores:** sala cerrada/expirada, participantes fuera de la sala, menos de 2 participantes, conflicto de ledger.

### 4.8. Reseña individual y de pareja

1. Desde una visita verificada o desde la ficha, el usuario abre “Escribir reseña”.
2. Elige nota (1–5, pasos de 0.5), comentario y hasta 3 fotos.
3. Si tiene pareja activa, puede marcar “reseña en pareja”; si la marca, se guarda con `coupleLinkId`.
4. El backend valida unicidad, pertenencia y que el autor no sea staff del local.
5. Se guarda la reseña y se recalculan las métricas del local en la misma transacción.
6. La ficha muestra la reseña con badge “Visita verificada” si corresponde.

**Errores:** reseña duplicada, reseña de pareja duplicada, usuario staff, visita ya reseñada, nota inválida.

### 4.9. Matcher dúo

1. Ambos miembros del vínculo activo abren “Matcher”.
2. Uno crea la sesión `DUO`; el otro se une.
3. Cuando están ambos, la sesión pasa a `ACTIVE` y se genera el deck.
4. Cada uno swipea el mismo deck; ve el siguiente local no swipeado.
5. Cuando ambos likearon el mismo local, se crea `Match`, la sesión pasa a `MATCHED` y se muestra el resultado.
6. La app ofrece “Ver ficha” y “Crear visita”.

**Errores:** sin vínculo activo, sesión expirada, sesión ya matcheada, deck vacío.

### 4.10. Matcher grupal

1. El host crea la sesión `GROUP` desde una sala `OPEN`.
2. Los miembros se unen; el host inicia cuando hay al menos 2.
3. Todos swipean el deck común; la app muestra el contador de votos sin revelar votantes.
4. Cuando un local alcanza la mayoría estricta (mínimo 2), se crea `Match` y se cierra la sesión.
5. El resultado se muestra a todos y se ofrece crear una visita grupal.

**Errores:** sala cerrada, menos de 2 participantes, empate sin umbral, sesión expirada.

### 4.11. Operación diaria del merchant

1. El staff abre el panel y ve el PIN del día en grande.
2. `STAFF` marca ítems agotados antes del servicio.
3. Durante el día, el staff consulta visitas de hoy.
4. `OWNER`/`MANAGER` revisan métricas, reseñas y editan menú/horarios.
5. Al cerrar, el PIN expira solo; no hay acción manual.

### 4.12. Moderación y administración

1. El admin entra al panel y ve locales, usuarios y reseñas.
2. Activa un local `DRAFT` cuando la información está completa.
3. Asigna `OWNER` por email; el owner invita al resto del staff.
4. Ante una reseña problemática, la oculta con motivo; el autor la ve como oculta.
5. Si el local incumple, lo suspende; deja de ser visible al público.
6. El admin revisa métricas globales y ejecuta operaciones de mantenimiento.

---

## 5. Vistas por rol

### 5.1. Visitante y cliente (`USER`)

| Vista | Contenido | Datos | Estados |
|---|---|---|---|
| Home | Buscador, categorías, tags, “abierto ahora”, destacados, CTA a matcher si tiene vínculo | `CoffeeShop` activos, `Category`, `Tag` | Cargando, sin locales, error |
| Resultados de búsqueda | Ítems con foto, local, precio, rating, distancia; filtros y orden | `MenuItem` + `CoffeeShop` | Sin resultados, filtros vacíos |
| Ficha de local | Portada, nombre, rating, tags, dirección, mapa, horarios, menú por categoría, reseñas | `CoffeeShop`, `OpeningHours`, `SpecialHours`, `MenuItem`, `Review` | Local suspendido, menú vacío, sin reseñas |
| Check-in | Selector de contexto, menú, cantidades, nota, foto, PIN, GPS | `Visit`, `VisitItem`, `DailyPin` | GPS denegado, PIN inválido, verificado |
| Mi bitácora | Timeline de visitas, gasto, local, badge, acceso a reseña | `Visit`, `VisitParticipant`, `VerifiedVisit` | Sin visitas, pendientes |
| Mis reseñas | Reseñas propias, estado, editar, borrar, restaurar | `Review`, `ReviewPhoto` | Oculta, borrada, editable |
| Perfil | Nombre, avatar, email, sesiones, logout, desactivar cuenta | `User`, `Session` | — |
| CofiDúo | Vínculo, QR, dashboard, archivar | `CoupleLink`, `PairingToken` | Sin vínculo, vínculo activo, archivado |
| Grupos | Salas activas, crear, unirse, lobby | `GroupRoom`, `GroupMember` | Sala llena, expirada |
| Matcher | Lobby, deck, swipe, resultado | `MatchSession`, `Swipe`, `Match` | Esperando, activo, match, expirado |

**Reglas de UI**

- El botón de check-in aparece en locales `ACTIVE`. Si el local está fuera de horario, se muestra un aviso y se permite continuar; la validación real es PIN + GPS.
- El PIN nunca se muestra en la app cliente; solo lo da el cajero.
- La ubicación se pide solo al enviar la verificación, con explicación previa.
- El gasto se muestra como “gasto registrado”, no como cobro.
- La reseña verificada se distingue con el badge verde; la no verificada dice “Opinión de la comunidad”.

### 5.2. Pareja (contexto `DUO`)

| Vista | Contenido | Reglas |
|---|---|---|
| Conexión | QR, enlace, expiración, estado | Token de un solo uso, 15 min |
| Dashboard dúo | Visitas juntos, gasto total y dividido, local favorito, rating promedio, últimas reseñas | Solo lectura; se calcula desde `Visit`/`VisitItem` |
| Visita en pareja | Igual que check-in, con ambos participantes | Requiere vínculo activo |
| Reseña compartida | Formulario único, se muestra “A & B” | Bloquea reseñas individuales de ambos en ese local |
| Matcher dúo | Deck común, match cuando ambos likearon | Sin votos individuales visibles |
| Archivar | Confirmación, consecuencias, historial conservado | `ARCHIVED`; no se puede deshacer |

### 5.3. Grupo (contexto `GROUP`)

| Vista | Contenido | Reglas |
|---|---|---|
| Crear sala | Nombre, máximo de miembros, expiración | Host queda `HOST` |
| Unirse | Código o QR | Sala `OPEN`, no llena, no expirada |
| Lobby | Miembros, host, código, expiración, acciones | El host inicia visita/matcher |
| Visita grupal | Participantes, menú, PIN, GPS | Mínimo 2; ledger por participante |
| Matcher grupal | Deck común, contador de votos, resultado | Mayoría estricta, quórum 2 |
| Historial | Salas cerradas/expiradas y visitas | Solo lectura |

### 5.4. Merchant (`OWNER`, `MANAGER`, `STAFF`)

| Vista | `OWNER` | `MANAGER` | `STAFF` |
|---|---|---|---|
| Dashboard | Métricas, PIN, reseñas recientes | Métricas, PIN, reseñas | PIN, visitas de hoy, disponibilidad |
| Ficha | Editar | Editar | Lectura |
| Horarios | Editar | Editar | Lectura |
| Menú | CRUD | CRUD | Toggle disponibilidad |
| Staff | CRUD | Ver/invitar `STAFF` | — |
| Visitas | Ver | Ver | Ver hoy |
| Reseñas | Lectura | Lectura | Lectura |
| PIN | Ver/copiar | Ver/copiar | Ver/copiar |

**Reglas de UI**

- El local activo se elige en un selector si el usuario es staff de varios.
- Las acciones destructivas (archivar ítem, quitar staff) piden confirmación.
- El panel muestra el estado del local (`DRAFT`/`ACTIVE`/`SUSPENDED`) y explica quién puede cambiarlo.
- Los errores de permisos son explícitos (“No tienes rol para esta acción”), no 404 silenciosos.

### 5.5. SuperAdmin

| Vista | Contenido | Acciones |
|---|---|---|
| Locales | Tabla con estado, rating, visitas, reseñas, staff | Crear, editar, activar, suspender, asignar owner |
| Staff | Membresías por local | Asignar/cambiar roles |
| Categorías | Lista ordenable | CRUD |
| Tags | Lista con conteo | CRUD |
| Reseñas | Tabla con filtros | Ocultar, borrar, restaurar, motivo |
| Usuarios | Tabla con rol, estado, actividad | Desactivar, cambiar rol |
| Métricas | Locales, visitas, reseñas, ratings, crecimiento | Exportar CSV (fase posterior) |
| Operación | Estado de jobs, PIN, salas/sesiones | Forzar PIN, expirar, reconciliar |

### 5.6. Sistema

No tiene UI propia. Su “vista” es el estado de los jobs y los logs. El panel admin muestra la última ejecución y el resultado; no se permite editar datos desde ahí.

### 5.7. Estados transversales de UI

- **Vacío:** explicar qué hacer, no solo “no hay datos”.
- **Error de red:** reintentar y conservar el formulario.
- **Permiso denegado:** mensaje claro y CTA a la pantalla correcta.
- **Cargando:** skeletons en listas y fichas.
- **Offline (Capacitor):** el check-in requiere conexión; se avisa antes de abrir el formulario.
- **Accesibilidad:** contraste, foco visible, targets de 44 px, texto alternativo en fotos.
- **Estilo:** seguir `PRD-visual.md` y `DESIGN.md` (neobrutalismo, mobile first).

---

## 6. Contrato REST

### 6.1. Convenciones

- Base: `/api/v1`. versionado en la URL.
- Formato: JSON, `camelCase`.
- Autenticación: `Authorization: Bearer <accessToken>`.
- Fechas absolutas: ISO 8601 con zona (`2026-11-05T14:30:00.000Z`).
- Fechas de negocio: `YYYY-MM-DD` en `America/La_Paz`.
- Dinero: string decimal (`"12.50"`) para no perder precisión; el cliente lo formatea.
- Coordenadas: números decimales.
- Paginación: `page` (1-based) y `limit` (máximo 100, por defecto 20). Respuesta `{ data, meta: { page, limit, total, totalPages } }`.
- Errores: `{ statusCode, code, message, details? }`. `code` es estable para la UI (p. ej. `PAIRING_TOKEN_EXPIRED`).
- Validación: DTOs con `class-validator`/Zod; el backend rechaza campos desconocidos.
- Documentación: OpenAPI/Swagger generado desde NestJS.
- Idempotencia: los endpoints que crean recursos únicos (`DailyPin`, `VerifiedVisit`, `CoupleLink`, reseña) devuelven 409 con código de dominio si ya existen.

### 6.2. Índice de endpoints por módulo

| Módulo | Endpoints principales | Auth |
|---|---|---|
| Auth | `/auth/register`, `/auth/login`, `/auth/google`, `/auth/refresh`, `/auth/logout`, `/auth/logout-all` | Público / token |
| Perfil | `/me`, `/me/password`, `/me/sessions` | `USER` |
| Catálogo | `/cafes`, `/cafes/:slug`, `/cafes/:slug/menu`, `/cafes/:slug/reviews` | Público |
| Búsqueda | `/search/cravings`, `/search/suggestions`, `/categories`, `/tags` | Público / `USER` opcional |
| Dúo | `/pairing/duo/token`, `/pairing/duo/accept`, `/pairing/duo` | `USER` |
| Grupos | `/groups`, `/groups/join`, `/groups/:id`, `/groups/:id/leave`, `/groups/:id/close`, `/groups/:id/invites` | `USER` |
| Visitas | `/visits`, `/visits/:id`, `/visits/:id/verify`, `/visits/:id/cancel`, `/me/visits` | `USER` participante |
| Reseñas | `/reviews`, `/reviews/:id`, `/me/reviews` | `USER` autor |
| Matcher | `/match/sessions`, `/match/sessions/:id/join`, `/start`, `/next`, `/swipes`, `/cancel`, `/result` | `USER` participante |
| Merchant | `/merchant/cafes`, `/merchant/cafes/:id`, `/hours`, `/special-hours`, `/menu`, `/staff`, `/pin`, `/visits`, `/visits/stats` | `MerchantStaff` |
| Admin | `/admin/cafes`, `/admin/staff`, `/admin/categories`, `/admin/tags`, `/admin/reviews`, `/admin/users`, `/admin/metrics`, `/admin/ops` | `SUPERADMIN` |

### 6.3. Códigos de error de dominio

| Código | HTTP | Cuándo |
|---|---|---|
| `AUTH_INVALID_CREDENTIALS` | 401 | Email/password incorrectos |
| `AUTH_ACCOUNT_INACTIVE` | 403 | `isActive = false` |
| `AUTH_SESSION_REVOKED` | 401 | Sesión revocada/expirada |
| `PAIRING_TOKEN_INVALID` | 400 | Token inexistente o mal formado |
| `PAIRING_TOKEN_EXPIRED` | 410 | Token vencido |
| `PAIRING_TOKEN_CONSUMED` | 409 | Token ya usado |
| `COUPLE_ALREADY_ACTIVE` | 409 | Alguno ya tiene vínculo activo |
| `GROUP_FULL` | 409 | `maxMembers` alcanzado |
| `GROUP_CLOSED` | 409 | Sala cerrada/expirada |
| `VISIT_NOT_PENDING` | 409 | Verificar/cancelar una visita no pendiente |
| `VISIT_OUT_OF_RANGE` | 422 | Distancia > 80 m |
| `VISIT_LOW_ACCURACY` | 422 | Accuracy > 100 m |
| `VISIT_WRONG_PIN` | 422 | PIN incorrecto |
| `VISIT_PIN_EXPIRED` | 410 | PIN del día vencido |
| `VISIT_RATE_LIMITED` | 429 | 5 intentos/15 min por visita o 10/día por usuario/local |
| `VISIT_ALREADY_VERIFIED_TODAY` | 409 | Ledger duplicado |
| `REVIEW_DUPLICATE` | 409 | Ya existe reseña de ese usuario/local |
| `REVIEW_COUPLE_DUPLICATE` | 409 | Ya existe reseña de pareja para ese local |
| `REVIEW_STAFF_FORBIDDEN` | 403 | Autor es staff del local |
| `MATCH_SESSION_NOT_ACTIVE` | 409 | Swipe en sesión no activa |
| `MATCH_SESSION_EXPIRED` | 410 | Sesión vencida |
| `MATCH_NO_CANDIDATES` | 404 | Deck vacío |

---

## 7. Requisitos no funcionales

### 7.1. Rendimiento

- Catálogo y ficha: p95 < 300 ms con 30 locales y ~1.500 ítems.
- Búsqueda FTS: p95 < 400 ms.
- Verificación: p95 < 1 s (incluye GPS y transacción).
- Deck de matcher: generación < 500 ms para 30 locales.
- Listados paginados; nunca se devuelve el catálogo completo sin límite.

### 7.2. Seguridad

- Passwords con bcrypt coste 12; nunca se loguean.
- Refresh tokens y pairing tokens hasheados (SHA-256); PIN de verificación con HMAC-SHA256 y comparación en tiempo constante.
- JWT firmado con secreto de entorno; rotación de refresh.
- Guards por rol global y por `MerchantStaff`; ningún `coffeeShopId` del body se confía.
- Rate limits: login 10/min/IP, verificación 5/15 min/visita y 10/día/usuario/local, búsqueda 60/min/IP, creación de reseñas 10/hora/usuario.
- Helmet, CORS restringido, validación de payloads, límite de tamaño de request.
- Cloudinary con uploads firmados; no se exponen API secrets al cliente.
- No se registran coordenadas exactas ni tokens en logs.

### 7.3. Privacidad

- La ubicación se captura solo durante el check-in y se usa para calcular distancia; no hay tracking continuo.
- `VerificationAttempt` guarda distancia/accuracy, no lat/long crudas.
- Retención: intentos 90 días; sesiones/tokens expirados 30 días.
- El usuario puede desactivar su cuenta; el historial se conserva por integridad referencial.
- Exportación/borrado completo de datos queda para una fase posterior (requiere definir política legal).

### 7.4. Consistencia y transacciones

- Verificación: `Visit` + `VerifiedVisit` + métricas en una transacción.
- Reseñas: `Review` + `ReviewPhoto` + métricas de `CoffeeShop` en una transacción.
- Matcher: `Swipe` + verificación de umbral + `Match` + cierre de sesión en una transacción con lock por sesión.
- Jobs idempotentes y reintentables; reconciliación nocturna de métricas.

### 7.5. Observabilidad

- Logs estructurados con `requestId`, usuario (id, no email), ruta, latencia y código de error.
- Logs de jobs con inicio, fin, conteos y errores.
- Métricas básicas: requests, errores 4xx/5xx, latencia, visitas verificadas, matches.
- Health check `/health` y readiness de DB.

### 7.6. Testing

- Unit tests de reglas de dominio (rating, umbral de match, canonicalización de pareja, rate limit).
- E2E de auth, pairing, visitas/PIN, reseñas y matcher.
- Tests de constraints SQL en una DB de test (rating, contexto, PIN, orden canónico).
- Seed idempotente probado dos veces seguidas.
- `pnpm test`, `pnpm build`, `pnpm prisma validate` como gates de Fase 0.

### 7.7. Accesibilidad y localización

- Español de Bolivia en la UI; nombres de modelos y API en inglés.
- Contraste AA, foco visible, targets de 44 px, alt text.
- Fechas y horarios en `America/La_Paz`; moneda BOB.
- La app debe funcionar en Android de gama media; imágenes optimizadas por Cloudinary.

### 7.8. Escalabilidad

- Una instancia de NestJS con Socket.io en memoria para el MVP.
- Redis adapter para Socket.io cuando haya más de una instancia.
- PostgreSQL con índices de consulta y FTS; sin PostGIS.
- Cloudinary para multimedia; no se sirven imágenes desde el backend.

---

## 8. Roadmap de implementación

El orden no es negociable en la Fase 0: sin baseline y sin refactor, el backend no compila con el cliente nuevo. Las fases siguientes se pueden solapar solo si no comparten archivos críticos.

> Las tasks T1–T14 provienen de `odd/tasks/modelo-de-datos.md`. Las tasks T15–T18 se abren al iniciar la fase correspondiente; el identificador es estable para el seguimiento.

### Fase 0 — Fundaciones y baseline

**Objetivo:** dejar el repositorio en un estado compilable, con la base de datos nueva, seed y módulos existentes adaptados.

| Entregable | Detalle | Tasks |
|---|---|---|
| Migración baseline | Borrar migraciones viejas, crear `init` con el modelo completo + SQL crudo de la sección 2.4 | T3, T4 |
| Seed | 6 categorías, 5 tags, 15–30 cafeterías de Oruro con menús y coordenadas | T8 |
| Refactor auth | `Role` global, `Session`, `Account`, guards | T5 |
| Refactor pairing | Tokens hasheados, `CoupleLink` canónico, `GroupRoom` nuevo | T6 |
| Refactor cafes | `Category`/`MenuItem`/`OpeningHours`/tags, quitar `Product` | T7 |
| Tests base | Constraints, auth, pairing, catálogo | T9 |

**Criterio de salida:** `pnpm prisma validate`, `pnpm test` y `pnpm build` pasan; el seed corre dos veces sin duplicar; login y listado de cafés funcionan contra la DB nueva.

### Fase 1 — Descubrimiento

**Objetivo:** que un visitante encuentre un café y un antojo sin iniciar sesión.

| Entregable | Detalle | Tasks |
|---|---|---|
| API de catálogo | Listado, ficha, menú, horarios calculados, tags | T7 |
| Búsqueda FTS | Endpoint `/search/cravings`, índices GIN/trigram, ranking | T13 |
| Frontend home/ficha/buscador | Adaptar el frontend existente al contrato nuevo | T14 |
| Estados vacíos y filtros | Categoría, tag, abierto ahora, cercanía | T14 |

**Criterio de salida:** un visitante puede buscar “submarino”, abrir la ficha y ver menú, horarios y reseñas; los filtros no rompen la paginación.

### Fase 2 — Capa social

**Objetivo:** vínculo dúo y salas grupales estables antes de visitas y matcher.

| Entregable | Detalle | Tasks |
|---|---|---|
| Dúo | Token QR, aceptación, archivo, dashboard | T6 + UI |
| Grupos | Crear/unirse por código, lobby, expiración, salir/cerrar | T6 + UI |
| Guards de contexto | Validaciones de vínculo/sala en visitas y matcher | T6 |

**Criterio de salida:** dos usuarios se vinculan y se desvinculan; una sala de 3 personas se crea, se llena y expira; los intentos inválidos devuelven códigos de dominio.

### Fase 3 — Visitas y verificación

**Objetivo:** registrar visitas reales con PIN + GPS y bitácora.

| Entregable | Detalle | Tasks |
|---|---|---|
| Visitas | Crear, participantes, ítems, snapshot de precio, gasto | T10 |
| PIN diario | Job 00:00 + on-demand, panel merchant | T10 |
| Verificación | GPS 80 m/100 m, HMAC, rate limit, ledger | T10 |
| Bitácora | Historial, estados, cancelación | T10 |

**Criterio de salida:** una visita solo pasa a `VERIFIED` con PIN correcto y GPS válido; un segundo intento verificado del mismo usuario/local/día devuelve 409; el merchant ve su PIN.

### Fase 4 — Reseñas y reputación

**Objetivo:** reputación confiable y moderable.

| Entregable | Detalle | Tasks |
|---|---|---|
| Reseñas | Individual, pareja, fotos, media estrella | T11 |
| Reputación | Recálculo transaccional + job de reconciliación | T11 |
| Moderación | Admin oculta/borra/restaura | T11 |
| Badge verificado | Derivado de la visita | T11 |

**Criterio de salida:** no se puede duplicar una reseña; la de pareja bloquea las individuales; el promedio y los contadores coinciden con la DB tras crear/editar/borrar/moderar.

### Fase 5 — Matcher

**Objetivo:** decisión compartida en tiempo real para dúo y grupo.

| Entregable | Detalle | Tasks |
|---|---|---|
| Sesiones | Crear, unirse, iniciar, expirar | T12 |
| Deck | Seed determinístico, candidatos, ítem destacado | T12 |
| Swipes y match | Dúo ambos; grupo mayoría + quórum 2 | T12 |
| Tiempo real | Socket.io, eventos agregados, cierre | T12 |

**Criterio de salida:** dos clientes ven el mismo deck; el match dúo aparece solo cuando ambos likearon; el grupo matchea con mayoría; una sesión matcheada rechaza swipes.

### Fase 6 — Paneles, hardening y Android

**Objetivo:** operación real en Oruro.

| Entregable | Detalle | Tasks |
|---|---|---|
| Panel merchant completo | Dashboard, menú, horarios, staff, visitas, reseñas | T15 |
| Panel admin completo | Locales, staff, categorías/tags, usuarios, moderación, métricas | T16 |
| Jobs y operación | Expiración, reconciliación, limpieza, health | T17 |
| Android | Capacitor, cámara QR, geolocalización, build APK | T18 |
| QA | E2E, carga básica, pruebas en locales reales | T18 |

**Criterio de salida:** un owner gestiona su local sin admin; un admin modera y suspende; el APK abre, escanea QR y verifica GPS en un local real; los jobs corren y son idempotentes.

### 8.1. Dependencias entre fases

```
F0 ──> F1 ──> F2 ──> F3 ──> F4 ──> F5 ──> F6
        │       │       │
        └───────┴───────┴──> T14 (frontend se adapta en cada fase)
```

- F2 necesita F0 (auth/sesión) y F1 (ficha para elegir local).
- F3 necesita F2 (contexto dúo/grupo) y F1 (menú).
- F4 necesita F3 para el badge verificado, pero puede empezar con reseñas sin visita.
- F5 necesita F2 (vínculo/sala) y F1 (catálogo/deck).
- F6 necesita todas las anteriores.

### 8.2. Riesgos del roadmap

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Baseline sin refactor deja el backend roto | Alto | Fase 0 junta migración + auth + pairing + cafes + tests |
| Datos reales de cafeterías incompletos | Medio | Seed con fuente verificable; admin completa en panel |
| GPS impreciso en interiores | Medio | Umbral 100 m de accuracy; mensaje claro; reintento |
| PIN compartido por WhatsApp | Medio | PIN diario + rate limit + ledger; no es prueba forense |
| Socket.io en una instancia | Bajo para MVP | Redis adapter documentado para escalar |
| Reseñas de pareja duplicadas | Medio | Índice único parcial + validación de servicio |
| Métricas desincronizadas | Medio | Transacción + job de reconciliación |

---

## 9. Decisiones cerradas, supuestos y fuera de alcance

### 9.1. Decisiones cerradas

1. La entidad del local es `CoffeeShop`; no se usa `Restaurant`.
2. `Role` global solo `USER`/`SUPERADMIN`; el rol de comercio vive en `MerchantStaff` (`OWNER`/`MANAGER`/`STAFF`).
3. Baseline limpio de migraciones; no se arrastran las migraciones de auth/products.
4. Catálogo global: `Category` no pertenece al local; `Tag` + `CoffeeShopTag` normalizados.
5. Búsqueda FTS español + `pg_trgm` + `unaccent`; sin PostGIS.
6. Horarios semanales + excepciones por fecha; `isOpenNow` se calcula en backend.
7. Sin variantes de producto; un `MenuItem` por presentación.
8. Visita como evento compartido con `VisitParticipant`; no una visita por usuario.
9. PIN diario de 4 dígitos, plano para el merchant, con acceso restringido a staff.
10. GPS ≤ 80 m y accuracy ≤ 100 m, sin override.
11. Una visita verificada por usuario/local/día vía `VerifiedVisit`.
12. Gasto snapshot en `Visit`; división por participante calculada.
13. Una reseña por usuario/local; reseña de pareja única y compartida.
14. Medias estrellas; promedio simple de `PUBLISHED`; badge verificado derivado.
15. Matcher solo dúo/grupo; no individual. Grupo por mayoría estricta con quórum 2.
16. El matcher cierra la sesión al matchear; no hay segunda ronda en la misma sesión.
17. Solo `SUPERADMIN` activa/suspende locales; el merchant edita contenido.
18. `STAFF` ve PIN y disponibilidad, pero no métricas financieras detalladas.
19. Grupo se une por código; los tokens `GROUP` son invitaciones de un solo uso que el host regenera.
20. Sin respuestas del comercio a reseñas en v2; moderación solo admin.

### 9.2. Supuestos

- 15–30 cafeterías en Oruro en el MVP; una sola ciudad.
- Una sola instancia de backend para Socket.io en producción inicial.
- Cloudinary disponible para portadas, ítems y reseñas.
- Google OAuth configurado con un proyecto válido.
- Los locales colaboran dando el PIN del día; no hay integración con POS.
- La zona horaria del negocio es `America/La_Paz` y no cambia.
- El equipo prioriza correctitud de datos sobre funciones sociales avanzadas.

### 9.3. Fuera de alcance (v2)

- Delivery, pedidos, pagos, reservas y facturación.
- Variantes de producto y modificadores.
- Múltiples sucursales por comercio.
- Favoritos guardados (el matcher usa swipes; no hay tabla de favoritos).
- Notificaciones push y emails transaccionales (se pueden agregar después).
- Respuestas del merchant a reseñas.
- Reportes de reseñas por usuarios (solo moderación admin).
- Auditoría detallada de acciones admin (solo logs).
- Exportación/borrado completo de datos de usuario.
- PostGIS y búsqueda geoespacial avanzada.
- Múltiples monedas e impuestos.
- Matcher individual.
- Chat entre usuarios.

---

## 10. Estado actual del repositorio y deuda transitoria

### 10.1. Hecho

- `cofi-ruta-backend/prisma/schema.prisma` reescrito: 27 modelos, 15 enums, 638 líneas; `prisma validate` pasa.
- Cliente Prisma generado con Prisma 7.10.1 contra el schema nuevo.
- Decisiones de modelado cerradas y registradas en `odd/tasks/modelo-de-datos.md` (S1–S10, T1–T14).
- Este PRD actualizado a v2.0.0 con el modelo real, roles, flujos, vistas y roadmap.

### 10.2. Pendiente inmediato (Fase 0)

- Migración baseline con SQL crudo de la sección 2.4.
- Seed de categorías, tags y cafeterías.
- Refactor de `auth`, `pairing` y `cafes` al modelo nuevo.
- Tests de constraints y de los tres módulos.

### 10.3. Deuda transitoria conocida

- Las migraciones actuales (`init_module_1_auth`, `add_coffee_shops_and_products`) siguen en el repo y no representan el modelo nuevo.
- El backend no compila con el cliente nuevo mientras `auth`, `pairing` y `cafes` referencien `Product`, `PairingToken.token` y campos viejos.
- El frontend mantiene `types/cafes.ts` y `services/cafes.service.ts` con el contrato legacy; se adapta en Fase 1.
- La DB de desarrollo conserva el esquema de las migraciones viejas; el baseline se aplicará en Fase 0 con reset controlado.
- No hay tests de constraints SQL todavía; se agregan con el baseline.

### 10.4. Próximo work unit

Cerrar Fase 0 en un solo bloque revisable:

1. T3: SQL crudo de extensiones, CHECKs, índices parciales y GIN.
2. T4: borrar migraciones viejas y crear `init`.
3. T5–T7: refactor de `auth`, `pairing` y `cafes`.
4. T8: seed idempotente.
5. T9: tests de constraints y módulos.
6. Gate: `pnpm prisma validate`, `pnpm test`, `pnpm build`.

> Este PRD no autoriza por sí solo cambios de alcance. Cualquier función nueva se contrasta contra el schema y se agrega como fase o se rechaza explícitamente.
