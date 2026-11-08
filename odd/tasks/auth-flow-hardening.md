# ODD: Login flow hardening + SUPERADMIN seed + Google signup consent

Objetivo: verificar y cerrar el flujo de login (email/password y Google), agregar un seed idempotente de `SUPERADMIN`, y pedir consentimiento explícito antes de crear una cuenta con Google. Branch: `feat/login-desktop-responsive`. Delivery: work-unit commits. Runner: backend `pnpm test:unit` + `pnpm test:db`; frontend `pnpm test`.

## Specs

S1: `prisma/seed.ts` crea de forma idempotente un usuario con `role = SUPERADMIN`, `isActive = true` y contraseña hasheada con bcrypt, usable para iniciar sesión. Email y contraseña configurables por `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD`; en desarrollo usa defaults documentados; en producción no crea credenciales conocidas si `SUPERADMIN_PASSWORD` no está definido.
S2: El login con email/contraseña correctos guarda la sesión y redirige a `/dashboard`. Un email o contraseña incorrectos muestran el mensaje del backend (`Correo o contraseña incorrectos`).
S3: Los errores de validación del backend (`{ statusCode, message, errors: [{ field, message }] }`) muestran el mensaje específico del primer campo, no el genérico "La validación falló".
S4: La validación del cliente coincide con el backend: login exige contraseña no vacía; registro exige mínimo 8 caracteres.
S5: Un login con Google de una cuenta ya vinculada (o de un email verificado que ya existe localmente) inicia sesión y redirige a `/dashboard`.
S6: Un login con Google de un email verificado sin cuenta NO crea el usuario automáticamente. El backend devuelve un token de registro firmado y de corta vida; el frontend muestra un pedido explícito: "Tu cuenta de Google no está registrada en CofiRutas. ¿Querés crear una cuenta con Google?".
S7: Confirmar el registro con Google crea el `User` + `Account`, inicia sesión y redirige a `/dashboard`. Cancelar limpia el token y no crea nada.
S8: Un token de registro con Google inválido o expirado produce un error claro y no crea usuarios.
S9: El HTML del callback OAuth2 escapa `<` al serializar datos de usuario en `<script>` para impedir inyección de `</script>`.

## Tasks

T1: Backend — seed SUPERADMIN idempotente + tests — S1 — inline — DONE (`prisma/seed.ts`, `test/db/seed.spec.ts`)
T2: Backend — Google signup consent: error tipado, token firmado, endpoint `/auth/google/register`, callback con rama `signup_required` — S5-S9 — inline — DONE
T3: Backend — actualizar tests unitarios y de DB de auth/estrategia/seed — S1, S5-S9 — inline — DONE
T4: Frontend — servicio (errores por campo, `registerWithGoogle`), validación alineada, hook, prompt de consentimiento, redirect post-login, callback — S2-S7 — inline — DONE
T5: Frontend — tests de servicio/validación — S3, S4 — inline — DONE
T6: Verificación — suites backend y frontend, seed real, smoke de login SUPERADMIN contra la API — todas — inline — DONE

### Verification evidence

- Backend unit: 86 tests passed.
- Backend DB: 47 tests passed (auth + seed re-run: 14 passed).
- Frontend: 27 tests passed; `tsc --noEmit`, ESLint (changed files) and `next build` clean; `nest build` clean.
- Seed real: 22 cafeterías, 154 ítems, 133 horarios, 6 categorías, 5 tags; `SuperAdmin listo: superadmin@cofirutas.bo`.
- API smoke: login `superadmin@cofirutas.bo` / `CofiRutas2026!` → `role: SUPERADMIN` en JWT y en `GET /me`; contraseña incorrecta → `401 INVALID_CREDENTIALS` "Correo o contraseña incorrectos"; `/auth/google/register` con token inválido → `400 GOOGLE_SIGNUP_INVALID`.

### Known gaps (not implemented)

- No existe panel admin ni endpoints `@Roles(Role.SUPERADMIN)`: el `RolesGuard` está registrado pero sin uso. El seed deja el rol listo para cuando se implemente (PRD T16/Fase 2).
- `DashboardNav` enlaza a `/explore`, `/matcher`, `/check-in` y `/profile/duo`, rutas que todavía no existen.
- `specialty` se elige en el registro pero el backend no lo persiste.

## Log

L1 (verbatim): "quiero que verifiques que el flujo de @cofi-rutas-frontend/app/login/page.tsx , osea que todo el flujo de logueo funcione, tanto como los roles y demas. tambien agrega un seed donde cree un el usuario SUPERADMIN para pribar los flujos que hace el administrador. Tambien verifica si maneja el caso si se loguea con google y no esta registrado le pregunte si se quiere registrar con Google, en el caso del email que le diga qie datos incorrectos y asi."

L2: Hallazgos de la verificación inicial: (a) el login exitoso no redirige, solo muestra feedback; (b) `RolesGuard` existe pero ningún endpoint usa `@Roles(...)` y no hay panel admin (PRD lo ubica en T16/Fase 2), así que un `SUPERADMIN` hoy ve la misma UI que un `USER`; (c) Google crea la cuenta automáticamente sin preguntar; (d) el backend responde `Correo o contraseña incorrectos` correctamente, pero los errores de validación por campo se muestran como "La validación falló"; (e) el callback OAuth2 embebe JSON sin escapar `<`.

L3: Decisión: implementar el consentimiento de Google sin auto-registro, manteniendo el vínculo automático cuando el email ya existe localmente y fue verificado por Google.
