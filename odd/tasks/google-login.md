# ODD: Login con Google (Passport OAuth2)

## Specs

S1: El botón "Continuar con Google" en `app/login/page.tsx` redirige al flujo de autorización de Google OAuth2 vía backend (`GET /api/v1/auth/google`).
S2: El backend expone `GET /auth/google` y `GET /auth/google/callback` usando Passport con `passport-google-oauth20`.
S3: La estrategia Google reusa `AuthService.googleLogin(profile)` existente (cuenta por `googleId` o por email, crea `Account` si no existe).
S4: Tras autenticación exitosa, el backend redirige al frontend con `accessToken`, `refreshToken` y `user` en query params.
S5: El frontend guarda la sesión en `localStorage` vía `authService.saveSession()` y limpia la URL.
S6: Las variables `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` deben tener valores reales de Google Cloud Console (no placeholders).

## Tasks
T1: Backend — Crear `GoogleStrategy` (`src/auth/strategies/google.strategy.ts`) — S2, S3 — commit 4e864ab
T2: Backend — Exponer endpoints `/auth/google` y `/auth/google/callback` en `AuthController` — S2, S4 — commit 4e864ab
T3: Backend — Registrar `GoogleStrategy` en `AuthModule` — S2 — commit 4e864ab
T4: Frontend — Agregar `loginWithGoogle()` a `services/auth.service.ts` — S1 — commit 4e864ab
T5: Frontend — Conectar `handleGoogleLogin` en `hooks/useAuthForm.ts` — S1 — commit 4e864ab
T6: Frontend — Manejar callback OAuth2 en `app/auth/callback/page.tsx` (leer sessionStorage, `saveSession`, limpiar URL) — S4, S5 — commit 4e864ab
T7: Tests — Spec para `GoogleStrategy` (4 casos) — S2, S3 — commit 4e864ab
T8: Verificar build y suite de pruebas — todas — commit 4e864ab

## Log
L1: Usuario quiere que el botón de Google se conecte por Passport OAuth2
L2: Arquitectura elegida: Passport OAuth2 (no Google Identity Services ID token). Backend expone GET /auth/google y callback que guarda tokens en sessionStorage y redirige al frontend a /auth/callback, que los lee y guarda en localStorage.
L3: Commit 4e864ab feat(auth): login con Google vía Passport OAuth2 — 8 archivos, 304 inserciones.
L4: Todas las suites pasan: backend jest 36 tests, frontend vitest 14 tests, next build y nest build limpios.
L5: S3 quedó superseded por `odd/tasks/auth-flow-hardening.md` (S6): `googleLogin` ya no crea usuarios automáticamente; un email verificado sin cuenta devuelve `GOOGLE_ACCOUNT_NOT_REGISTERED` y requiere `POST /auth/google/register` con consentimiento explícito.
