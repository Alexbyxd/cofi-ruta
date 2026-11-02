# ODD: Pantalla principal "Inicio - CofiRutas Dashboard" tras login con Google

## Specs
S1: Tras login exitoso con Google (botón "Continuar con Google"), el flujo OAuth2 redirige a `/dashboard` (no al home público).
S2: El backend envía en el JWT y en el perfil de usuario la `avatarUrl` de Google y la respuesta de `googleLogin`/`getProfile` la incluye.
S3: El frontend protege la ruta `/dashboard` con un hook `useAuth` que valida sesión en `localStorage`; sin sesión redirige a `/login`.
S4: La página `/dashboard` se titula "Inicio - CofiRutas Dashboard" (proyecto "CofiRutas Coffee Brutalism UI").
S5: El dashboard pinta el nombre completo (`fullName`) y el avatar de Google (`avatarUrl`) del usuario autenticado.
S6: El dashboard está construido por componentes tipados bajo `components/dashboard/` siguiendo el estilo Neobrutalismo del PRD-visual.md (bordes 3px negro, sombras duras, fondo crema #FFFDF5).
S7: El backend tiene tests que verifican que `googleLogin` y `getProfile` retornan `avatarUrl` y JWT válidos.
S8: El frontend tiene tests de `useAuth` y de los componentes del dashboard.
S9: `next build`, `nest build`, `vitest run` y `jest` pasan en verde.

## Tasks
T1: ODD feature document (este archivo) — commit propio
T2: Backend: tests de `auth.service` (googleLogin/getProfile) verificando avatarUrl y JWT — S2, S7
T3: Frontend: hook `useAuth` (sesión, login, logout, getUser, isAuthenticated) — S3
T4: Frontend: componentes del dashboard bajo `components/dashboard/` (DashboardHeader, UserProfile, etc.) — S5, S6
T5: Frontend: página `app/dashboard/page.tsx` protegida, título "Inicio - CofiRutas Dashboard" — S4, S5
T6: Frontend: callback OAuth2 redirige a `/dashboard`; `/dashboard` requiere sesión — S1, S3
T7: Frontend: tests vitest de `useAuth` y componentes dashboard — S8
T8: Backend: tests de auth/controller endpoints google (opcional, strategy ya testeada) — S2, S7
T9: Verificar builds y suites de pruebas — S9

## Log
L1: Usuario solicita dashboard principal tras login con Google, nombre "Inicio - CofiRutas Dashboard", proyecto "CofiRutas Coffee Brutalism UI", componentes tipados, backend con tests, JWT y avatarUrl de Google.
L2: Commit 2e56afb feat(auth): dashboard 'Inicio - CofiRutas Dashboard' tras login con Google — 11 archivos, 562 inserciones.
L3: Todas las suites pasan: backend jest 40 tests, frontend vitest 22 tests, next build y nest build limpios. Nueva ruta /dashboard registrada en el build.
