PRD Visual — CofiRutas
Aplicación: CofiRutas (Guía & Matcher de Cafeterías en Oruro)
Estilo Visual: Neobrutalismo (neobrutalism.dev)
Target: Mobile First (PWA / Capacitor APK)
Herramienta de Destino: Google Stitch / Prototipado Visual
1. Design System Tokens (Neobrutalismo)
Bordes: Todos los contenedores, inputs, botones, tarjetas e imágenes tienen trazo negro sólido: border-[3px] border-black.
Sombras (Hard Drop Shadows - Blur 0):
Componentes y Tarjetas: shadow-[4px_4px_0px_0px_#000000]
Modales y Tarjeta de Swipe: shadow-[8px_8px_0px_0px_#000000]
Estados Activos / Pressed: active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000000]
Radios de Esquina: Ligeramente redondeados para ergonomía móvil: rounded-lg (8px).
Paleta Cromática Oficial:
Lienzo / Background Base: #FFFDF5 (Crema papel cálido)
Primario CofiRutas (Café/Sol): #FFDE59 (Amarillo vibrante)
CofiDúo (Parejas/Match): #FF85A1 (Rosa chicle neobrutalista)
Verificado / Éxito: #7AE582 (Verde menta eléctrico)
Frío / Bebidas: #70D6FF (Cian eléctrico)
Líneas y Textos: #000000 (Negro absoluto)
Superficies Cards: #FFFFFF (Blanco puro sobre fondo crema)
Tipografía:
Títulos y Display: Sans-serif geométrica pesada (font-black / font-extrabold).
Textos y Precios: font-bold para montos en Bs y font-medium para ingredientes.
2. Mapa de Vistas del MVP
code
Code
[ Vista 1: Home / Antojos ] ─────► [ Vista 2: Ficha del Café ] ─────► [ Vista 4: Check-in PIN ]
            │                                                                  ▲
            ▼                                                                  │
[ Vista 3: CofiMatcher ] ───────────────────────────────────────────────────────┘
            │
            ▼
[ Vista 5: Perfil Dúo & Diario ]
3. Especificación Visual de Pantallas
Vista 1: Home / Explorador de Antojos (/explore)
Header Superior:
Logotipo a la izquierda: CofiRutas con tipografía en negrita y marco decorativo.
Badge superior derecho (CofiDúo activo): Píldora en fondo #FF85A1, borde negro de 2px con texto: CofiDúo: Carlos & Laura ❤️.
Buscador de Antojos:
Input rectangular blanco con borde de 3px y sombra dura de 4px.
Placeholder: "¿Qué café o postre se te antoja hoy? (ej. Submarino, Waffle...)".
Botón integrado de lupa en amarillo #FFDE59.
Carrusel Horizontal de Tags (Chips Neobrutalistas):
Píldoras con borde negro y sombra de 2px:
☕ #ParaElFrío (Fondo amarillo)
🍓 #JugosYFrappés (Fondo cian)
🧇 #AntojoDulce (Fondo rosa)
📶 #ParaEstudiar (Fondo blanco)
Feed de Cafeterías en Oruro (Cards):
Contenedor blanco con borde de 3px y sombra negra dura de 5px.
Foto superior del local con badge flotante: ★ 4.9 (42 reseñas) en amarillo.
Nombre en negrita: Café del Socavón.
Zona y distancia: Plaza 10 de Febrero • 350 m.
Precios destacados de productos estrella en recuadros: Submarino [ 18 Bs ] • Waffle Nutella [ 22 Bs ].
Vista 2: Ficha de Cafetería & Reseñas Verificadas (/cafe/[slug])
Hero Banner:
Foto de portada con borde inferior negro de 3px.
Badge de estado en esquina: ABIERTO AHORA (Fondo verde #7AE582).
Botón flotante: CÓMO LLEGAR (MAPA) con fondo amarillo y sombra dura.
Pestañas de Menú (Estilo Carpetas Neobrutalistas):
Pestañas rectangulares con borde negro:
[Cafés Calientes] (Pestaña activa en #FFDE59) | [Frappés] | [Repostería] | [Salados]
Lista de Productos:
Filas divididas por líneas negras gruesas.
Foto cuadrada miniatura a la izquierda con borde negro.
Nombre, descripción breve de insumos y precio en bloque: [ 24.00 Bs ].
Sección de Reseñas de la Comunidad:
Promedio general grande con estrellas neobrutalistas: ★ 4.8 / 5.0.
Card de Reseña:
Encabezado con nombres de pareja: Carlos & Laura.
Insignia Obligatoria: ✓ VISITA VERIFICADA CON PIN (Fondo verde menta #7AE582, texto en mayúsculas negritas).
Texto de opinión y fotos estilo polaroid con marco blanco y borde negro.
Vista 3: CofiMatcher ("Tinder de Cafés") (/matcher)
Header de Estado:
Píldora de sincronización: Sesión CofiDúo con Laura ✨ | Buscando coincidencia...
Card Central de Swipe:
Superficie blanca con borde de 3px y sombra profunda de 8px: shadow-[8px_8px_0px_0px_#000000].
Foto en gran formato del café o combo (ej. Capuchino con canela y porción de tarta de manzana).
Badge superior: 24 Bs en fondo amarillo.
Título: Combo Tarde Fría @ Café Central Oruro.
Tags asociados: #ParaElFrío • #AmbienteAcogedor.
Botones de Control Inferiores:
Botón circular blanco con X negra y sombra dura (Paso).
Botón circular rosa #FF85A1 con corazón negro y sombra dura (Me antoja).
Modal Overlay "¡HAY COFIMATCH!":
Fondo amarillo #FFDE59 con borde de 4px y sombra de 10px.
Título: ¡HOY MERIENDAN JUNTOS! 🎉
Muestra el café ganador y botón verde: VER CÓMO LLEGAR.
Vista 4: Check-in con PIN & Bitácora (/check-in)
Paso 1: Selección de Consumo:
Lista con checkboxes neobrutalistas de los ítems de la carta:
[✓] 2x Submarino con Churros (36 Bs)
[✓] 1x Waffle con Frutas (22 Bs)
Banner inferior amarillo: TOTAL ESTIMADO: 58.00 BOB.
Paso 2: Foto de la Cita (Opcional):
Contenedor con borde discontinuo (dashed): + SUBIR FOTO DEL RECUERDO.
Paso 3: Input de PIN Diario del Cajero:
Subtítulo: "Pide al cajero de [Nombre del Café] el PIN de 4 dígitos".
4 casillas cuadradas grandes independientes (código OTP) con fondo blanco, bordes negros de 3px y sombra dura de 4px.
Botón de Acción Final:
Botón de ancho completo en verde #7AE582 con texto en mayúsculas: CERTIFICAR VISITA CON PIN.
Vista 5: Perfil CofiDúo & Diario de Citas ("Wrapped") (/profile/duo)
Cabecera de Pareja:
Dos avatares circulares solapados con borde negro de 3px.
Título: Carlos & Laura.
Píldora de estado: VÍNCULO ACTIVO (124 Días juntos).
Bento Grid de Estadísticas (Cards con sombras duras):
Card 1 (Rosa #FF85A1): 14 Salidas por Café.
Card 2 (Amarillo #FFDE59): Gasto Total Aprox: 420 Bs.
Card 3 (Cian #70D6FF): Antojo Favorito: Submarino con Churros (5 veces).
Línea de Tiempo del Diario:
Tarjetas cronológicas de visitas pasadas:
Fecha y Café: 📅 24 de Octubre — Café del Socavón.
Foto miniatura de la merienda.
Calificación otorgada: ★★★★★.
4. Prompts Directos para Generación en Stitch
Copia y pega estos bloques en Stitch o herramientas de UI para obtener el diseño exacto:
Prompt 1: Home de CofiRutas (/explore)
code
Text
Mobile app home screen for "CofiRutas", a coffee and snacks discovery app in Oruro. High-contrast Neobrutalism design style with thick 3px solid black outlines, hard drop shadows with zero blur (shadow-[4px_4px_0px_0px_#000000]), cream background #FFFDF5, and bold black typography. Top header shows "CofiRutas" logo alongside a couple status badge in pastel pink #FF85A1 reading "CofiDúo: Carlos & Laura ❤️". Prominent white search bar with placeholder "¿Qué café o postre se te antoja hoy?" and a bright yellow #FFDE59 search button. Horizontal pill filter tags with black borders: #ParaElFrío, #Submarinos, #Waffles, #ConWiFi. Vertical feed of coffee shop cards displaying café photos, rating badge ★ 4.9, prices in Bolivianos (Bs), and popular items.
Prompt 2: CofiMatcher (/matcher)
code
Text
Mobile app screen for "CofiMatcher", a Tinder-style swipe interface for coffee cravings within the "CofiRutas" app. Neobrutalist design with 3px solid black outlines and 8px hard drop shadows. Large central card showing a high-resolution photo of a cappuccino and dessert with a bold yellow badge "24 Bs" and café name "Café Central Oruro". Below the card are two chunky circular action buttons: a white discard button with a black "X", and a vibrant hot-pink #FF85A1 button with a heart icon. Session status pill at the top: "CofiDúo con Laura ✨ | Buscando coincidencia...".
Prompt 3: Check-in con PIN Diario (/check-in)
code
Text
Mobile UI screen for "CofiRutas" visit verification and food diary. Clean neobrutalism aesthetic with cream canvas #FFFDF5. Top section has an interactive checklist of ordered coffee drinks and pastries with counter buttons and a summary banner in yellow #FFDE59 showing "TOTAL ESTIMADO: 58.00 BOB". Below is a 4-digit OTP PIN verification section featuring 4 individual square input boxes with thick 3px black borders and hard drop shadows for the cashier's daily PIN. Bottom button in mint green #7AE582 with bold uppercase text: "CERTIFICAR VISITA CON PIN".
Prompt 4: Perfil CofiDúo y Estadísticas (/profile/duo)
code
Text
Mobile app screen for "CofiRutas" couple profile and metrics diary ("Wrapped"). Neobrutalist style with thick 3px black strokes and hard shadows. Header shows two overlapping user profile avatars with a pink badge "CofiDúo: Carlos & Laura". A Bento Grid layout with 3 colorful stat cards: pink #FF85A1 card for "14 Salidas por Café", yellow #FFDE59 card for "420 Bs Gastados", and cyan #70D6FF card for "Favorito: Submarino". Below is a timeline list of previous visits with polaroid-style photos and 5-star rating
