# Migración Custom Auth → Better Auth

## Auditoría (Fase 0) - COMPLETADA

### Stack Backend Actual
- **Framework**: NestJS 11 + Prisma 7 + PostgreSQL
- **Password Hash**: bcrypt **12 rounds** ✅ (compatible con Better Auth default)
- **JWT**:
  - Access Token: 15 min (`ACCESS_TOKEN_EXPIRES_IN = '15m'`)
  - Refresh Token: 30 días (`REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000`)
  - Rotation: **Sí** (nuevo refresh token en cada refresh)
  - Reuse Detection: **Sí** (revoca sesión anterior)
- **Google OAuth**: Flow custom 2 pasos
  1. `GET /auth/google` → Passport redirect a Google
  2. Callback → Si usuario no existe: devuelve `signupToken` (JWT 10min)
  3. Frontend → `POST /auth/google/register` con `signupToken` → crea usuario
- **Scopes Google**: `['email', 'profile']`
- **Callback URL**: `process.env.GOOGLE_CALLBACK_URL`

### Schema Prisma - Modelos Auth Relevantes

```prisma
model User {
  id           String   @id @default(uuid(7))  // Short UUID (7 chars)
  email        String   @unique
  passwordHash String?  // nullable para OAuth-only users
  fullName     String
  avatarUrl    String?
  role         Role     @default(USER)         // USER | SUPERADMIN
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now()) @db.Timestamptz(3)
  updatedAt    DateTime @updatedAt @db.Timestamptz(3)
  accounts     Account[]
  sessions     Session[]
  // ... otras relations
}

model Account {
  id                String   @id @default(uuid(7))
  userId            String
  provider          String   // "google"
  providerAccountId String   // Google sub
  createdAt         DateTime @default(now()) @db.Timestamptz(3)
  @@unique([provider, providerAccountId])
}

model Session {
  id         String    @id @default(uuid(7))
  userId     String
  tokenHash  String    @unique                    // SHA256(refreshToken)
  userAgent  String?
  ipAddress  String?
  expiresAt  DateTime  @db.Timestamptz(3)
  revokedAt  DateTime? @db.Timestamptz(3)
  lastUsedAt DateTime? @db.Timestamptz(3)
  createdAt  DateTime  @default(now()) @db.Timestamptz(3)
  @@index([userId])
}
```

### Campos Custom
| Campo | En Backend | En Frontend | Notas |
|-------|------------|-------------|-------|
| `fullName` | ✅ `String` | ✅ `fullName` | Requerido en registro |
| `avatarUrl` | ✅ `String?` | ✅ `avatarUrl` | Opcional |
| `role` | ✅ `Role` enum | ✅ `role?: string` | USER/SUPERADMIN |
| `isActive` | ✅ `Boolean` | ❌ | Soft delete / ban |
| `specialty` | ❌ | ✅ `CoffeeSpecialty` | **Solo frontend** - decidir si migrar a BD |
| `createdAt` | ✅ | ✅ | |
| `sessionId` | En JWT (`sid`) | ❌ | Para revocación selectiva |

### Diferencias Clave vs Better Auth Defaults
1. **User ID**: `uuid(7)` (7 chars) vs UUID estándar (36 chars)
2. **Session tokenHash**: SHA256(refreshToken) - Better Auth usa hash similar
3. **Google flow**: Custom 2-step con `signupToken` vs flow estándar OAuth
4. **Email verification**: No requerido actualmente
5. **No `specialty` en BD** - solo frontend (decidir: agregar a User o usar metadata)

### Variables de Entorno Requeridas
```env
# Ya existen
DATABASE_URL
JWT_ACCESS_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL
FRONTEND_URL

# Nuevas para Better Auth
BETTER_AUTH_SECRET="openssl rand -base64 32"
BETTER_AUTH_URL="http://localhost:3001"  # backend URL
```

---

## Plan de Migración

### Fase 1: Setup Better Auth en Backend (EN PROGRESO)
- [ ] Instalar `better-auth` + `@better-auth/prisma`
- [ ] Crear `src/auth/config.ts` con configuración completa
- [ ] Crear `src/auth/schema.ts` para campos custom
- [ ] Crear `src/auth/middleware.ts` para exportar `authMiddleware`
- [ ] Montar handler en `main.ts` o route `/api/auth/*`
- [ ] Generar tipos para frontend

### Fase 2: Migración de Datos
- [ ] Script migración users → mejor-auth users (mantener hash bcrypt)
- [ ] Script migración accounts (Google OAuth)
- [ ] Decisión: ¿Migrar sessions activas? (Recomendado: NO - forzar re-login limpio)
- [ ] Verificar integridad post-migración

### Fase 3: Cliente Better Auth en Frontend
- [ ] Instalar `better-auth` + `better-auth/react`
- [ ] Crear `lib/auth-client.ts`
- [ ] Crear `hooks/useAuth.ts` wrapper compatibilidad
- [ ] Provider `SessionProvider` en layout
- [ ] Eliminar `services/auth.service.ts`

### Fase 4: Componentes Auth
- [ ] Adaptar `AuthForm` → `useAuth().login/register`
- [ ] Adaptar `GoogleAuthButton` → `signIn.social({ provider: "google" })`
- [ ] Manejar `specialty` como `additionalFields`
- [ ] Callback OAuth si necesario

### Fase 5: Middleware Protección
- [ ] Next.js middleware con `authMiddleware`
- [ ] API routes validation con `getSession()`

### Fase 6: Limpieza + Tests
- [ ] Eliminar código legacy auth
- [ ] Tests E2E (Playwright)
- [ ] Deploy staging → producción

---

## Decisiones Pendientes

1. **`specialty` field**: ¿Agregar a `User` model o usar `user.metadata` (JSON)?
   - Recomendación: `additionalFields` en Better Auth schema → columna en User

2. **User ID format**: ¿Mantener `uuid(7)` o migrar a UUID estándar?
   - Better Auth usa UUID v4 estándar. Opción: mantener IDs existentes como string custom.

3. **Email verification**: ¿Habilitar? (Better Auth lo soporta nativo)
   - Recomendación: Sí, post-migración.

4. **Session migration**: ¿Migrar sessions activas?
   - Recomendación: **No**. Forzar re-login = más limpio, menos riesgo.

5. **Google flow**: Cambiar a flow estándar OAuth (1 paso) vs mantener 2 pasos?
   - Better Auth flow estándar es 1 paso. El `signupToken` custom se pierde.
   - Si se necesita `specialty` en registro Google: usar `additionalFields` + onboarding post-login.