# ODD: Especialidad favorita persistida (`User.specialty`)

Objetivo: dar finalidad real al campo "Tu especialidad favorita" del registro: persistirlo en `User.specialty` y reemplazar las opciones inventadas por las 3 bebidas más frecuentes del catálogo seed.
Branch: `feat/login-desktop-responsive`. Delivery: un work unit. Runner: backend `pnpm test:unit` + `pnpm test:db`; frontend `pnpm test`.

## Specs

S1: `User.specialty` es un campo opcional (nullable) tipado con el enum Prisma `CoffeeSpecialty`, cuyos únicos valores son los 3 más recurrentes del catálogo seed (`prisma/seed-data`): `CAFE_AMERICANO` (9 apariciones), `CAPPUCCINO` (9), `SUBMARINO_CON_CHURROS` (5). Los usuarios existentes quedan en `null` sin backfill.
S2: `POST /auth/register` acepta `specialty` opcional, lo persiste y lo devuelve en `user.specialty` de la respuesta de auth y en `GET /me`.
S3: `PATCH /me` acepta `specialty` opcional (incluido `null`) para poder editarlo después.
S4: Un `specialty` fuera del enum responde 400 con el mensaje de validación del campo.
S5: El registro muestra exactamente 3 chips con las etiquetas "Café americano", "Cappuccino" y "Submarino con churros"; ninguno viene preseleccionado; el valor elegido viaja en el payload de registro.

## Contrato congelado (ambos lados)

- Enum Prisma / API: `CAFE_AMERICANO` | `CAPPUCCINO` | `SUBMARINO_CON_CHURROS`
- Campo: `User.specialty CoffeeSpecialty?`
- Etiquetas UI: `CAFE_AMERICANO` → "Café americano", `CAPPUCCINO` → "Cappuccino", `SUBMARINO_CON_CHURROS` → "Submarino con churros"
- Registro: `specialty` opcional; sin preselección (arranca en `null`); si es `null`/`undefined` se omite del payload.

## Tasks

T1: Backend — enum Prisma + migración aditiva nullable + `registerSchema`/`updateProfileSchema` + `auth.service` (create, `toPublicUser`, `updateProfile`) + tests unit y DB — S1-S4 — delegado (writer backend)
T2: Frontend — `CoffeeSpecialty` + etiquetas, `SpecialtyChips`, `AuthForm`, `useAuthForm`, `auth.service.register` + tests — S5 — delegado (writer frontend)
T3: Verificación — builds, suites, migración aplicada, smoke API — delegado (verifier independiente por Risk item 1)
T4: Commit del work unit — S1-S5

## Log

L1 (verbatim): "quiero la uno pero en las opciones que da, de los datos que sacaste quiero que pongas los 3 mas recurrentes."
L2: Datos medidos sobre los 154 ítems de menú de 22 cafeterías (`prisma/seed-data/catalog.ts` + `cafes.json`, incluyendo el ítem `signature` de cada café). Ranking de bebidas (categorías `cafes-calientes`, `bebidas-frias`, `especiales`): Café americano 9, Cappuccino 9, Submarino con churros 5, Café con leche 4, Chocolate caliente 4. Sin empate en el podio.
L3: Decisión: enum Prisma (constraint real en DB) en vez de `String?` + Zod, para que el valor inválido no pueda entrar por ninguna vía.
L4: Risk: item 1 — agrega una migración Prisma (columna nullable + enum). Aditiva y reversible, sin backfill.
