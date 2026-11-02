Product Requirements Document (PRD)
Proyecto: CofiRutas (Guía & Matcher de Cafeterías en Oruro)TasteMatch / Antojo Oruro (Especialización: Cafés & Meriendas)
Versión: 1.1.0 (MVP Acotado a Cafeterías)
Estado: Listo para Desarrollo
Stack Tecnológico:
Frontend: Next.js (App Router, Tailwind CSS)
Mobile Runtime: Capacitor (Compilación a APK Android / iOS)
Backend: NestJS (Arquitectura modular, REST API, WebSockets para Match en tiempo real)
ORM & Database: Prisma v7 con PostgreSQL
Almacenamiento Multimedia: Cloudinary (Fotos de cafés, menús y reseñas)

1. Visión y Alcance del MVP
   1.1. Enfoque Exclusivo del MVP
   Para la versión 1.0, el producto se centrará 100% en Cafeterías, Casas de Té, Juguerías y Espacios de Repostería de la ciudad de Oruro.
   Se excluyen por el momento almuerzos, comida rápida general y bares nocturnos.
   1.2. Propuesta de Valor
   Para los Usuarios: Resolver de inmediato el "¿a qué café vamos hoy?", descubrir antojos dulces/calientes específicos (ej. Submarino con churros, Jugo de maracuyá, Frappé de Oreo), unificar las cartas con precios reales, registrar su diario de citas y calificar experiencias con reseñas verificadas.
   Para las Cafeterías de Oruro: Vitrina digital directa al público joven/parejas, datos agregados de qué productos se consumen más en su local y reputación basada en visitas reales.
2. Tipos de Usuario y Modos
   2.1. Roles
   Comensal (Consumer): Busca cafés por antojo, swipea en el Matcher, registra consumos y califica con estrellas y comentarios.
   Encargado de Cafetería (Merchant Owner/Staff): Gestiona su carta de bebidas/postres, ve analíticas de visitas y consulta su PIN diario.
   SuperAdmin: Carga inicial de las 20-30 cafeterías de Oruro, control de calidad y moderación de reseñas.
   2.2. Modos de Uso
   Modo Individual: Exploración personal, bitácora de cafés visitados y reseñas individuales.
   Modo Dúo (Parejas / Mejores Amigos): Enlace 1 a 1 vía escaneo de QR. Métricas compartidas, álbum de fotos de sus citas en cafés y reseñas publicadas como "Visita en pareja". En caso de separación, la relación pasa a ARCHIVED (los recuerdos y estadísticas históricas se conservan pero congelados).
   Modo Grupal: Salas temporales vía código QR para grupos de estudio o amigos que quieren decidir a qué cafetería ir mediante votación rápida.
3. Especificación Funcional
   Módulo 1: Autenticación y Perfil
   RF-1.1: Login con Google OAuth2 y alternativamente registro estándar con Email + Contraseña hasheada con bcrypt.
   RF-1.2: Generación y lectura de código QR nativo (vía plugin de cámara de Capacitor) para enlace instantáneo de cuentas en Modo Dúo o Grupal.
   Módulo 2: Catálogo Especializado en Cafeterías
   RF-2.1: Taxonomía de categorías orientada exclusivamente a café y repostería:
   Café Caliente & Especialidad (Espresso, Mocca, Capuchino, Submarino)
   Bebidas Frías & Frappés
   Tés & Infusiones
   Jugos Naturales & Licuados
   Repostería & Pastelería (Tortas, Waffles, Crepas)
   Salados & Tostadas (Sándwiches, Paninis)
   RF-2.2: Atributos de cafetería (Tags): #con-wifi, #ambiente-romantico, #pet-friendly, #para-el-frio, #café-de-especialidad.
   RF-2.3: Subida y compresión de fotografías de cada bebida y postre con su precio en Bolivianos (BOB).
   Módulo 3: Buscador de Antojos y Sugerencias
   RF-3.1: Full-Text Search sobre los nombres y descripciones de las bebidas y postres de todas las cafeterías (PostgreSQL FTS indexando MenuItem).
   RF-3.2: Algoritmo de sugerencias: Recomienda cafeterías basado en las categorías más pedidas por el usuario o la pareja en sus últimas 5 salidas.
   Módulo 4: "Tinder de Cafés" (Coffee Matcher)
   RF-4.1: Dinámica de Swipe de tarjetas: Cada tarjeta muestra un combo o producto estrella (ej. Capuchino Vainilla + Waffle con Frutillas en Café X).
   RF-4.2: Detección de coincidencia en tiempo real vía WebSockets (Socket.io en NestJS) cuando ambos usuarios dan "Me antoja" al mismo producto o cafetería.
   Módulo 5: Bitácora, Métricas y PIN Antifraude
   RF-5.1: Cron diario a medianoche (00:00) que genera un PIN numérico de 4 dígitos para cada cafetería.
   RF-5.2: Al terminar el consumo, el usuario marca en la app qué bebidas/postres pidió, sube una foto del momento (opcional) e ingresa el PIN proporcionado por el cajero.
   RF-5.3: Validación cruzada: La app envía el PIN y la posición GPS del dispositivo (@capacitor/geolocation validando radio de 80 m con el local). Al coincidir, la visita pasa a VERIFIED.
   RF-5.4: Dashboard "Wrapped" de citas: Muestra métricas de salidas, dinero aproximado invertido y gráfico de cafés favoritos.
   Módulo 6: Sistema de Valoraciones, Estrellas y Reseñas
   RF-6.1 (Calificación 1 a 5 Estrellas): El usuario califica la experiencia global de la cafetería con una escala del 1.0 al 5.0 (soporte para medias estrellas si se requiere).
   RF-6.2 (Comentario y Fotos): Campo de texto libre para reseña (hasta 500 caracteres) y opción de adjuntar hasta 3 fotos reales del pedido.
   RF-6.3 (Insignia "Visita Verificada"):
   Si la reseña se publica tras una visita validada con el PIN de caja, la reseña luce un distintivo visual verde: ✓ Visita Verificada.
   Si un usuario califica sin haber hecho check-in presencial con PIN, la reseña se publica como Opinión de la Comunidad sin distintivo. Esto incentiva el uso del PIN y elimina las reseñas falsas.
   RF-6.4 (Reseña en Modo Dúo): Cuando una pareja visita un café juntos, la reseña muestra la foto de ambos perfiles: "Reseña de Carlos & Laura", permitiendo que ambos agreguen su nota o comentario conjunto.
   RF-6.5 (Métricas de Reputación): Cada cafetería calcula y almacena:
   averageRating (Promedio ponderado).
   reviewCount (Total de reseñas recibidas).
   Desglose visual de estrellas (5★, 4★, 3★, 2★, 1★).
4. Esquema de Base de Datos (Prisma v7 Schema)
   code
   Prisma
   datasource db {
   provider = "postgresql"
   url      = env("DATABASE_URL")
   }

generator client {
provider = "prisma-client-js"
}

enum Role {
USER
MERCHANT
SUPERADMIN
}

enum RelationshipStatus {
ACTIVE
ARCHIVED
}

enum VisitStatus {
PENDING
VERIFIED
REJECTED
}

model User {
id            String         @id @default(uuid())
email         String         @unique
passwordHash  String?
fullName      String
avatarUrl     String?
role          Role           @default(USER)
createdAt     DateTime       @default(now())
updatedAt     DateTime       @updatedAt

duoAsUserA    CoupleLink[]   @relation("UserA")
duoAsUserB    CoupleLink[]   @relation("UserB")
groupMembers  GroupMember[]
visits        Visit[]
reviews       Review[]
staffAt       MerchantStaff[]
}

model CoupleLink {
id          String             @id @default(uuid())
userAId     String
userBId     String
status      RelationshipStatus @default(ACTIVE)
startedAt   DateTime           @default(now())
archivedAt  DateTime?

userA       User               @relation("UserA", fields: [userAId], references: [id])
userB       User               @relation("UserB", fields: [userBId], references: [id])
visits      Visit[]
reviews     Review[]

@@unique([userAId, userBId])
}

model GroupRoom {
id          String        @id @default(uuid())
name        String
code        String        @unique
createdAt   DateTime      @default(now())
members     GroupMember[]
visits      Visit[]
}

model GroupMember {
id          String    @id @default(uuid())
groupId     String
userId      String
joinedAt    DateTime  @default(now())

group       GroupRoom @relation(fields: [groupId], references: [id], onDelete: Cascade)
user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

@@unique([groupId, userId])
}

model Restaurant {
id            String          @id @default(uuid())
name          String
slug          String          @unique
description   String?
address       String
latitude      Float
longitude     Float
logoUrl       String?
bannerUrl     String?
tags          String[]        // ["#con-wifi", "#para-el-frio", "#cafe-de-especialidad"]
isActive      Boolean         @default(true)

// Métricas agregadas de reputación
averageRating Float           @default(0.0)
reviewCount   Int             @default(0)

categories    MenuCategory[]
dailyPins     DailyPin[]
visits        Visit[]
reviews       Review[]
staff         MerchantStaff[]

createdAt     DateTime        @default(now())
updatedAt     DateTime        @updatedAt
}

model MerchantStaff {
id           String     @id @default(uuid())
userId       String
restaurantId String
user         User       @relation(fields: [userId], references: [id])
restaurant   Restaurant @relation(fields: [restaurantId], references: [id])

@@unique([userId, restaurantId])
}

model MenuCategory {
id           String      @id @default(uuid())
restaurantId String
name         String      // ej: "Cafés Calientes", "Frappés", "Repostería"
sortOrder    Int         @default(0)
restaurant   Restaurant  @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
items        MenuItem[]
}

model MenuItem {
id           String        @id @default(uuid())
categoryId   String
name         String        // ej: "Submarino con Churros", "Café Mocca"
description  String?
price        Decimal       @db.Decimal(10, 2)
imageUrl     String?
isAvailable  Boolean       @default(true)
category     MenuCategory  @relation(fields: [categoryId], references: [id], onDelete: Cascade)
visitItems   VisitItem[]
}

model DailyPin {
id           String     @id @default(uuid())
restaurantId String
pinCode      String     @db.VarChar(4) // PIN de 4 dígitos generado a las 00:00
date         DateTime   @db.Date
restaurant   Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)

@@unique([restaurantId, date])
}

model Visit {
id              String      @id @default(uuid())
restaurantId    String
userId          String
coupleLinkId    String?
groupId         String?

status          VisitStatus @default(PENDING)
totalSpent      Decimal     @default(0.00) @db.Decimal(10, 2)
notes           String?
photoUrl        String?

verifiedAt      DateTime?
createdAt       DateTime    @default(now())

restaurant      Restaurant  @relation(fields: [restaurantId], references: [id])
user            User        @relation(fields: [userId], references: [id])
coupleLink      CoupleLink? @relation(fields: [coupleLinkId], references: [id])
group           GroupRoom?  @relation(fields: [groupId], references: [id])
items           VisitItem[]
review          Review?     // Una visita verificada puede originar una reseña
}

model VisitItem {
id          String    @id @default(uuid())
visitId     String
menuItemId  String
quantity    Int       @default(1)
unitPrice   Decimal   @db.Decimal(10, 2)

visit       Visit     @relation(fields: [visitId], references: [id], onDelete: Cascade)
menuItem    MenuItem  @relation(fields: [menuItemId], references: [id])
}

model Review {
id              String      @id @default(uuid())
restaurantId    String
userId          String
coupleLinkId    String?     // Opcional: si la reseña fue en pareja
visitId         String?     @unique // Si está enlazada a una visita verificada

rating          Float       // Puntuación de 1.0 a 5.0
comment         String?     @db.VarChar(500)
photos          String[]    // URLs de fotos de la visita
isVerifiedVisit Boolean     @default(false) // true si validó el PIN

createdAt       DateTime    @default(now())
updatedAt       DateTime    @updatedAt

restaurant      Restaurant  @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
coupleLink      CoupleLink? @relation(fields: [coupleLinkId], references: [id])
visit           Visit?      @relation(fields: [visitId], references: [id])

@@index([restaurantId])
}
5. Endpoints de NestJS (Módulo de Reseñas y Cafeterías)
Cafeterías & Búsqueda
GET /api/v1/cafes: Lista paginada con filtros por tags (#con-wifi, #para-el-frio) y orden por averageRating.
GET /api/v1/cafes/:slug: Información detallada, menú organizado por categorías y últimas reseñas.
GET /api/v1/search/cravings?q=submarino: Búsqueda textual sobre ítems de café y postres.
Reseñas & Calificaciones (/api/v1/reviews)
POST /reviews: Crea una reseña. Si se envía el visitId verificado previamente, asigna automáticamente isVerifiedVisit = true.
Payload:
code
JSON
{
"restaurantId": "uuid-del-cafe",
"visitId": "uuid-visita-opcional",
"rating": 5.0,
"comment": "El submarino con churros estuvo increíble para el frío. Excelente ambiente.",
"photos": ["https://storage.../foto1.jpg"]
}
GET /cafes/:id/reviews: Obtiene reseñas del café paginadas, priorizando en primer orden las que tienen isVerifiedVisit: true.
DELETE /reviews/:id: Permite al usuario borrar su reseña o al SuperAdmin moderarla si infringe normas.
6. Sprints de Desarrollo Actualizados
Sprint	Enfoque	Entregables Clave
Sprint 1	 Arquitectura & Seed de Cafés	Setup NestJS + Prisma v7. Modelo de datos. Seed de 15 cafeterías reales de Oruro con sus menús de café/repostería.
Sprint 2	 UI de Exploración & Buscador	Front en Next.js con diseño acogedor. Buscador por antojo ("jugo", "frappé", "waffle"). Ficha completa de la cafetería.
Sprint 3 	Modo Dúo & Matcher de Café	Enlace de parejas por QR. Algoritmo Swipe "Tinder de Cafés" con WebSockets para decidir a qué café ir.
Sprint 4	 Check-in con PIN Diario & Bitácora	Cron de PIN diario. Formulario de registro de consumo. Geolocalización con Capacitor. Métricas de citas para la pareja.
Sprint 5 	Sistema de Reseñas y Estrellas	Calificación de 1 a 5 estrellas, subida de fotos y badge de ✓ Visita Verificada. Recálculo automático de averageRating.
Sprint 6 	Compilación APK & Pruebas en Oruro	Empaquetado con Capacitor para Android. Validación de escáner QR y geolocalización en cafeterías reales de Oruro.
