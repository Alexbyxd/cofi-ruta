# Better Auth Migration - Specs & Tasks

## Header
- **Feature**: Migrate custom NestJS/Prisma auth to Better Auth
- **Branch**: `feat/better-auth-migration`
- **Author**: alexbyxd
- **Date**: 2025

## Specs

### S1: Backend Setup
Install and configure Better Auth with Prisma adapter, email/password, Google OAuth, and base plugins (organization, twoFactor). Mount handler at `/api/auth/*`.

### S2: Data Migration
Migrate existing users, accounts (Google OAuth), and optionally sessions to Better Auth schema. Preserve bcrypt password hashes (12 rounds compatible). Decide: not migrate active sessions → force clean re-login.

### S3: Frontend Client
Install Better Auth React client, create typed `authClient`, `useAuth` hook wrapper, `SessionProvider` in layout. Remove legacy `AuthService`.

### S4: UI Components Migration
Adapt login/register forms to use `signIn.email`, `signUp.email`. Adapt Google button to `signIn.social({provider:"google"})`. Handle `specialty` custom field via `additionalFields`.

### S5: Route Protection
Replace custom middleware with Better Auth `authMiddleware` for Next.js. Protect `/dashboard`, `/profile`, `/settings`, `/api/protected/*`.

### S6: Cleanup & Testing
Remove legacy auth files (`auth.service.ts`, `types/auth.ts`, backend auth module). E2E tests for all auth flows. Deploy staging → production.

### S7: Real Better Auth schema contract (verification blocker)
`GET /api/v1/auth/sign-in/email` returns HTTP 500 with `code: SCHEMA_MISMATCH`. The identity tables must match what Better Auth 1.7 actually reads/writes:
- `Session.token` (unique), not `tokenHash`.
- `Account.providerId` + `Account.accountId`, not `provider` + `providerAccountId`.
- Credential passwords live on `Account.password`, not `User.password`.
- `Account.accessTokenExpiresAt` and `Account.refreshTokenExpiresAt`.
- `User` keeps `emailVerified`, `createdAt`, `updatedAt`; Better Auth's `name`/`image` map to the existing `fullName`/`avatarUrl` columns through `user.fields` (single source of truth, no duplicate columns).

### S8: Password hashing compatibility
Better Auth defaults to scrypt. Existing/migrated hashes are bcrypt cost 12, so `emailAndPassword.password.hash/verify` must use bcrypt 12 to keep seeded and migrated credentials valid.

### S9: Plugins not used
`organization` and `twoFactor` are removed from the config (user decision 2026-11-09) until their tables and features are actually needed. No plugin tables are added.

### S10: Seed superadmin through Better Auth contract
`prisma/seed.ts` must stop importing the deleted `src/auth/auth.constants` and must create the SUPERADMIN plus a `providerId: "credential"` `Account` row holding the bcrypt hash, idempotently.

### S11: Jest cannot load ESM-only better-auth
Unit and DB suites run on Node 22 + ts-jest/CJS, where Jest cannot `require()` Better Auth ESM. App code must not load the Better Auth instance at module import: guard and controller resolve it lazily. Unit coverage for `JwtAuthGuard` mocks that provider.

### S12: Legacy auth DB tests are obsolete
`test/db/auth.spec.ts` imports deleted `auth.service`/`jwt.strategy`. Replace it with tests of what the app still owns (credential account shape, uniqueness, FK cascade, session token uniqueness). Better Auth's own sign-in/sign-up flows are covered by the library; HTTP E2E (T17) stays pending.

## Tasks

| ID | Specs | Route | Commit |
|----|-------|-------|--------|
| T1 | S1 | Install better-auth, @better-auth/prisma; create config.ts, schema.ts, middleware.ts | `chore: add better-auth backend deps` |
| T2 | S1 | Configure emailAndPassword, Google OAuth, plugins (organization, twoFactor) | `feat: better-auth core config` |
| T3 | S1 | Mount Better Auth handler in NestJS (main.ts or route) | `feat: mount better-auth handler` |
| T4 | S1 | Generate types for frontend (`better-auth generate-types`) | `chore: generate auth types` |
| T5 | S2 | Write migration script: users, accounts → Better Auth tables | `feat: auth data migration script` |
| T6 | S2 | Run migration on staging DB, verify integrity | `chore: run migration staging` |
| T7 | S3 | Frontend: install better-auth, better-auth/react | `chore: add better-auth frontend deps` |
| T8 | S3 | Create lib/auth-client.ts with typed client | `feat: better-auth client setup` |
| T9 | S3 | Create hooks/useAuth.ts wrapper for compatibility | `feat: useAuth hook` |
| T10 | S3 | Add SessionProvider to app layout | `feat: auth provider` |
| T11 | S3 | Remove services/auth.service.ts, types/auth.ts | `refactor: remove legacy auth service` |
| T12 | S4 | Adapt AuthForm component to use useAuth() | `refactor: login/register forms` |
| T13 | S4 | Adapt GoogleAuthButton to signIn.social | `refactor: google oauth button` |
| T14 | S4 | Handle specialty field via additionalFields | `feat: specialty custom field` |
| T15 | S5 | Add Next.js middleware with authMiddleware | `feat: route protection middleware` |
| T16 | S5 | Protect API routes with getSession() | `feat: api route auth` |
| T17 | S6 | E2E tests: login, register, google, logout, protected routes | `test: auth e2e` (pending) |
| T18 | S6 | Deploy staging, verify, deploy production | `chore: deploy migration` (pending) |
| T19 | S7 | Align schema.prisma + corrective migrations `20261111_better_auth_alignment`, `20261112_user_specialty_cleanup` | done (uncommitted) |
| T20 | S7,S8,S9 | Config: bcrypt 12 hooks, remove plugins, map user name/image; Web `Request` mount in controller | done (uncommitted) |
| T21 | S10 | Seed SUPERADMIN + credential Account, fix seed spec | done (uncommitted) |
| T22 | S11 | Lazy `getAuth()` provider in guard/controller + guard unit spec | done (uncommitted) |
| T23 | S12 | Rewrite `test/db/auth.spec.ts` to app-owned invariants | done (uncommitted) |
| T24 | S7-S12 | Verify `test:unit`, `test:db`, frontend `test`; document pending E2E | done (uncommitted) |

## Log

### L1 (Original Request)
> "quiero que analices esta herramienta: https://better-auth.com/docs. Y me digas si la implementamos que cosas nos facilitaria, que cosas nos ofrece y demas. y un pequeño resumen de que es."

### L2
> "quiero que revises mi sistema de auteticacion @cofi-rutas-frontend/services/auth.service.ts y me digas como esta actualemente y como cambiaria si so betterauth"

### L3
> "si arma un plan de migracion"

### L4
> "quiero que todo lo revises tu revisa todo mi backend ahi esta la informacion"

### L5
> "antes de que continues debes usar el flujo de ODD usando engram y codegraph"

### L6 (2026-11-09)
> "quiero que arregles los test del backend y frontnd es que hicimmos una refactorizacion con betterauth, revisa tus memorias"

Evidence: unit suites fail on `ERR_REQUIRE_ESM` (better-auth); DB suites fail on `User.name` missing, deleted `auth.constants` import and deleted `auth.service`; HTTP sign-in returns 500 `SCHEMA_MISMATCH`. Frontend vitest is green (3 files, 12 tests); frontend eslint has 6 pre-existing errors.

### L7 (2026-11-09, user decision)
`organization` and `twoFactor` plugins removed because no code uses them and their 6 tables are part of the mismatch.

### L8 (2026-11-10, evidence)
- `pnpm test` backend: unit 9 suites / 33 tests, DB 6 suites / 42 tests — all green.
- `pnpm build` backend: green. `pnpm lint` backend: green.
- Frontend: `pnpm test` 3 files / 12 tests green; `pnpm build` green. Frontend `eslint` still has 6 pre-existing errors (hooks set-state-in-effect / unused vars), untouched by this feature.
- Runtime smoke on dev DB: `POST /api/v1/auth/sign-in/email` (seeded SUPERADMIN, migrated bcrypt hash) → 200 + session cookie; `GET /api/v1/groups/me` with that cookie → 200.
- `prisma migrate diff` residual: only DB-side defaults and the raw trigram indexes that the datamodel cannot express.
- Deleted obsolete `scripts/migrate-to-better-auth.ts` (superseded by the SQL migrations; it referenced dropped columns).
- Known gap (out of this feature): `DuoLinkModal` → `src/services/pairing.service.ts` still sends `Authorization: Bearer <localStorage token>`, which Better Auth ignores. Auth works with cookies; pairing UI needs the same cookie/credentials treatment. E2E auth tests (T17) remain pending.