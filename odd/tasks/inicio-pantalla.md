# Feature: Pantalla de Inicio — CofiRutas Coffee Brutalism UI

## Specs

S1: El usuario ve una pantalla llamada "Inicio" con el título "COFI RUTAS" en neobrutalismo.
- Fuente: `PRD-visual.md` Vista 1: Home / Explorador de Antojos.
- Título principal: `COFI<span>RUTAS</span>` con "RUTAS" en color `#DE7C5A` (Terracotta Cinnamon).
- Fondo crema `#FFFDF5` / `#FAF4EC`.
- Texto base en `#1A0F0A` (Structural Ink / espresso-ink).

S2: Header superior con logotipo a la izquierda y badge CofiDúo a la derecha.
- Badge: píldora fondo `#FF85A1`, borde negro 2px, texto `CofiDúo: Carlos & Laura ❤️`.
- Fuente: Space Grotesk, uppercase, tracking-wider.

S3: Buscador de Antojos con input rectangular blanco, borde 3px, sombra dura 4px.
- Placeholder: `¿Qué café o postre se te antoja hoy? (ej. Submarino, Waffle...)`.
- Botón integrado de lupa en amarillo `#E59840` (Crema Gold) — usando `#FFDE59` del PRD-visual como primario de acción.
- Input: `#FFFFFF` bg, texto `#1A0F0A`, placeholder `#1A0F0A` al 50% opacidad, `3px solid #1A0F0A`, sombra `2px 2px 0px 0px #1A0F0A`.

S4: Carrusel horizontal de chips/filtros neobrutalistas con borde negro y sombra de 2px.
- Chips: `#ParaElFrío` (fondo amarillo), `#JugosYFrappés` (fondo cian `#70D6FF`), `#AntojoDulce` (fondo rosa `#FF85A1`), `#ParaEstudiar` (fondo blanco).

S5: Feed de cafeterías en Oruro con cards neobrutalistas.
- Card: fondo `#FFFFFF`, borde `3px solid #1A0F0A`, sombra `4px 4px 0px 0px #1A0F0A`, radius `8px`.
- Foto superior con badge flotante `★ 4.9 (42 reseñas)` en amarillo.
- Nombre en negrita (Space Grotesk).
- Zona y distancia: `Plaza 10 de Febrero • 350 m`.
- Precios estrella en recuadros: `Submarino [ 18 Bs ]` • `Waffle Nutella [ 22 Bs ]`.

S6: Sincronización backend ↔ frontend.
- Backend expone `GET /api/v1/cafes` y `GET /api/v1/cafes/:id` (o similar).
- Frontend consume esos endpoints mediante un servicio tipado con Zod.
- Datos de cafeterías, productos y precios provienen del backend (PostgreSQL via Prisma).

S7: Tipado estricto compartido para CoffeeShop y Product en el frontend.
- Archivo `types/cafes.ts` con interfaces Zod + TypeScript.
- Servicio `services/cafes.service.ts` para llamadas HTTP con manejo de errores.

## Tasks

| ID | Tarea | Specs | Route | Commit |
|----|-------|-------|-------|--------|
| T1 | Crear feature document | S1–S7 | docs | feat(docs): iniciar tracking de pantalla de inicio |
| T2 | Backend: agregar modelos CoffeeShop/Product a schema.prisma + migración | S6 | backend | feat(backend): modelos de cafeterías y productos |
| T3 | Backend: CafesModule (controller, service, DTOs Zod) | S6 | backend | feat(backend): endpoints de cafeterías |
| T4 | Backend: registrar CafesModule en AppModule | S6 | backend | feat(backend): registrar CafesModule |
| T5 | Frontend: tipos de cafes en types/cafes.ts | S7 | frontend | feat(frontend): tipos tipados para cafeterías |
| T6 | Frontend: servicio de cafes en services/cafes.service.ts | S6,S7 | frontend | feat(frontend): servicio API de cafeterías |
| T7 | Frontend: componentes neobrutalistas (SearchBar, FilterChip, CafeCard, CafeFeed) | S2–S5 | frontend | feat(frontend): componentes UI de inicio |
| T8 | Frontend: página app/inicio/page.tsx llamada 'Inicio' | S1–S5 | frontend | feat(frontend): página de inicio |
| T9 | Frontend: integrar página de inicio en navegación | S1 | frontend | feat(frontend): integrar inicio en flujo de navegación |
| T10 | Stitch: subir/crear diseño de la pantalla de inicio al proyecto | S1–S5 | stitch | feat(stitch): diseñar pantalla de inicio en Stitch |
| T11 | Verificación: build, tests y revisión de sincronización backend-UI | S6,S7 | both | test: verificar build y sincronización |

## Log

L1: Usuario pide pantalla de inicio llamada "Inicio", componentes y tipado, backend sincronizado con UI, usando Engram y CodeGraph.
