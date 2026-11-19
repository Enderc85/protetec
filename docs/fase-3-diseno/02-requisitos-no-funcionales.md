# 3.1.2. Requisitos no funcionales

Los requisitos de calidad se expresan como **objetivos medibles** con un método de comprobación explícito. Las cifras no se presentan como garantías universales: son umbrales definidos para un entorno de pruebas descrito, y se revisan si el contexto cambia (la propia guía advierte de este matiz).

## Entorno de medida

| Elemento | Definición |
|---|---|
| **Datos de prueba** | Semilla reproducible: 20 protectoras, 5.000 animales, 12.000 solicitudes, 40.000 registros sanitarios |
| **Entorno** | API local o *staging* con PostgreSQL gestionado, mismas variables que producción salvo secretos |
| **Cliente de carga** | k6, 50 usuarios virtuales, 2 minutos, sin pensar entre peticiones |
| **Cliente de auditoría** | Lighthouse 12 (móvil simulado), axe DevTools, WAVE, navegación manual con teclado |
| **Navegadores** | Chrome y Firefox actuales, Safari iOS y Chrome Android en pruebas manuales |

## Resumen

| ID | Categoría | Requisito | Cómo se comprueba |
|---|---|---|---|
| RNF-01 | Rendimiento | Catálogo p95 &lt; 800 ms y LCP &lt; 2,5 s en móvil | k6 contra *staging* + Lighthouse móvil |
| RNF-02 | Accesibilidad | WCAG 2.2 AA en las seis pantallas principales | axe (0 críticos), contraste medido, recorrido manual con teclado |
| RNF-03 | Seguridad | Permisos y validaciones en servidor, sesión revocable, sin secretos en el repositorio | Pruebas de acceso con cada rol + revisión de configuración |
| RNF-04 | SEO | Títulos, metadatos, semántica y sitemap en las páginas públicas | Revisión técnica + auditoría Lighthouse SEO |
| RNF-05 | i18n | Español (es-ES) centralizado y fechas con `Intl` | Revisión de código: cero textos literales en componentes |
| RNF-06 | Mantenibilidad | Capas separadas, TypeScript estricto, errores centralizados | Revisión de arquitectura + `tsc --noEmit` + lint |
| RNF-07 | Escalabilidad | Índices, paginación obligatoria y límites documentados | Revisión del esquema + prueba de carga con 5.000 registros |
| RNF-08 | Observabilidad | Logs estructurados con identificador de petición y sin datos personales | Provocar un error controlado y revisar el log |

---

## RNF-01 · Rendimiento

**Objetivo:** que el catálogo, que es la pantalla más visitada, responda rápido incluso con un volumen de datos realista y en un móvil de gama media.

| Métrica | Umbral | Condición |
|---|---|---|
| Latencia del listado (`GET /api/v1/animales`) | **p95 &lt; 800 ms** | 5.000 animales, 50 usuarios virtuales, 2 minutos |
| Latencia del detalle (`GET /api/v1/animales/:id`) | **p95 &lt; 300 ms** | Incluye imágenes y resumen de cartilla |
| LCP en móvil (inicio y ficha) | **&lt; 2,5 s** | Lighthouse móvil, red simulada "Slow 4G" |
| CLS | **&lt; 0,1** | Lighthouse móvil |
| Lighthouse Performance | **≥ 85** | Móvil, pantalla de catálogo |
| JS inicial (gzip) | **&lt; 200 kB** | Build de producción, ruta de entrada |
| Imágenes | **&lt; 200 kB por imagen de tarjeta** | WebP/AVIF con `srcset` |

**Cómo se comprueba**

1. `npm run seed` carga el conjunto de datos de prueba.
2. k6 ejecuta el escenario `catalog.js` y registra `http_req_duration`.
3. Lighthouse se ejecuta tres veces sobre la URL de *staging* y se toma la mediana.
4. Los resultados se guardan en [09-anexos.md](09-anexos.md) con fecha y commit.

**Decisiones que lo sostienen:** paginación obligatoria en todos los listados, índices compuestos (`especie, estado, publicado`), selección de campos con `select` en Prisma, imágenes servidas desde CDN externa y *lazy loading* de las tarjetas fuera del primer viewport.

---

## RNF-02 · Accesibilidad (WCAG 2.2 nivel AA)

**Objetivo:** que una persona mayor, con baja visión o que solo usa teclado pueda completar una solicitud de adopción sin ayuda.

| Requisito | Criterio | Comprobación |
|---|---|---|
| Navegación por teclado | Todo el recorrido principal se completa con `Tab`, `Enter` y `Esc` | Prueba manual pantalla a pantalla |
| Foco visible y orden lógico | El foco se ve en todo momento y sigue el orden del contenido | Inspección visual + teclado |
| Contraste | Texto normal ≥ 4,5:1; texto grande ≥ 3:1; componentes ≥ 3:1 | Medición con herramienta de contraste sobre los tokens de la guía de estilos |
| Formularios | Etiqueta visible asociada, `aria-describedby` para ayudas, `aria-invalid` y error junto al campo | Revisión con lector de pantalla (NVDA) y teclado |
| Semántica | Un `h1` por página, jerarquía de encabezados sin saltos, `main`/`nav`/`footer` | axe + revisión del DOM |
| Imágenes | Texto alternativo descriptivo obligatorio en las fotos de animales | Validación en el formulario de alta (CA-05.1) |
| Estados | Ningún estado se comunica solo por color: siempre color + texto o icono con nombre accesible | Revisión de badges de estado |
| Errores | Se identifican, se explican y se sugiere cómo corregirlos | Prueba de envío con datos inválidos |
| Objetivos táctiles | Mínimo 24 × 24 px (WCAG 2.5.8) | Medición en móvil |
| Reflujo y zoom | Sin desplazamiento horizontal a 320 px de ancho y 200 % de zoom | Chrome DevTools + navegador |
| Autenticación accesible | Sin pruebas cognitivas; se permite pegar la contraseña y usar gestores (WCAG 3.3.8) | Prueba manual del login |
| Movimiento | Sin animaciones automáticas de más de 5 s; se respeta `prefers-reduced-motion` | Revisión de CSS |

**Herramientas:** axe DevTools (0 incidencias *serious* o *critical* en las seis pantallas principales), WAVE como segunda opinión, Lighthouse como orientación y **prueba manual obligatoria**: ninguna herramienta demuestra por sí sola el cumplimiento.

**Pantallas auditadas:** inicio, catálogo, ficha del animal, formulario de solicitud, panel de solicitudes y formulario de alta de animal.

---

## RNF-03 · Seguridad

**Objetivo:** que ningún usuario pueda leer ni modificar datos de otra persona o de otra protectora, aunque manipule las peticiones sin usar la interfaz.

| Control | Implementación | Comprobación |
|---|---|---|
| Hash de contraseñas | Argon2id (memoria 19 MB, `t=2`, `p=1`) | Revisar que la base de datos no contiene contraseñas en claro |
| Sesión | Token opaco de 32 bytes, guardado **hasheado**, cookie `HttpOnly`, `Secure`, `SameSite=Lax`, 7 días | Inspección de la cookie y revocación en base de datos |
| Autorización | Middleware por rol **y** verificación de pertenencia (`protectoraId`) en el servicio | Matriz de permisos probada con los tres roles |
| Validación | Esquemas Zod en el servidor, independientes del formulario | Enviar peticiones inválidas con `fetch` directo |
| Inyección | Consultas parametrizadas mediante Prisma; nunca SQL concatenado | Revisión de código |
| XSS | React escapa por defecto; prohibido `dangerouslySetInnerHTML` con datos de usuario | Revisión + CSP |
| CSRF | `SameSite=Lax` + comprobación del encabezado `Origin` en peticiones mutables | Petición desde origen distinto debe fallar |
| Fuerza bruta | Límite de 5 intentos/15 min en login y 5/h en recuperación | Prueba automatizada de 429 |
| Cabeceras | `helmet`: CSP, `X-Content-Type-Options`, `Referrer-Policy`, HSTS en producción | Escaneo de cabeceras |
| Secretos | Solo en variables de entorno; `.env` en `.gitignore`; `.env.example` sin valores | Revisión del repositorio |
| Dependencias | `npm audit` sin vulnerabilidades altas o críticas en la entrega | Ejecución en CI |
| HTTPS | Obligatorio en producción; cookies `Secure` | Comprobación del despliegue |
| Copias de seguridad | Copia diaria del PostgreSQL gestionado, retención ≥ 7 días y **prueba de restauración** documentada | Restaurar en una base de datos auxiliar |
| Minimización | La API pública no devuelve datos personales ni detalle clínico | Revisión de la respuesta de RF-01 |

> Un error frecuente que el documento evita expresamente: **ocultar un botón no es un control de seguridad**. Cada regla se comprueba en el servidor, y las pruebas incluyen tanto el acceso autorizado como el intento no autorizado (CA-02.4, CA-04.7, CA-08.5, CA-10.7).

---

## RNF-04 · SEO

**Objetivo:** que el catálogo público sea indexable y compartible, a pesar de ser una SPA (limitación conocida y documentada en ADR-01).

| Requisito | Criterio | Comprobación |
|---|---|---|
| Títulos únicos | Cada página tiene un `<title>` descriptivo y distinto | Revisión de las rutas públicas |
| Metadescripción | Presente en inicio, catálogo y ficha de animal | Revisión del HTML renderizado |
| Estructura semántica | `h1` único, encabezados jerárquicos, enlaces con texto comprensible | axe + revisión manual |
| URLs | Legibles y estables: `/animales/perro-luna-a1b2c3` | Revisión de rutas |
| Contenido indexable | Rutas públicas prerenderizadas en el build con contenido y metadatos | Comparar `curl` sin JavaScript con el HTML generado |
| Sitemap y `robots.txt` | `sitemap.xml` generado en el build con las fichas públicas; `robots.txt` bloquea el panel privado | Revisión de los archivos publicados |
| Metadatos sociales | Open Graph y Twitter Card con imagen del animal | Validador de metadatos |
| Errores y redirecciones | 404 con contenido útil; sin cadenas de redirecciones | Prueba de URL inexistente |
| Rendimiento móvil | Cubierto por RNF-01 | Lighthouse |

**Limitación asumida:** al ser una SPA, la interacción ocurre en cliente. Se mitiga con **prerender de las rutas públicas en el build**; el panel privado no necesita SEO y no se prerenderiza. Esta decisión y su alternativa (Next.js con SSR) se comparan en [06-viabilidad-tecnica.md](06-viabilidad-tecnica.md).

---

## RNF-05 · Internacionalización (i18n)

**Decisión:** la primera versión es **monolingüe en español (es-ES)**. No se traduce a otros idiomas, pero se prepara la estructura para no bloquear una ampliación.

| Requisito | Criterio |
|---|---|
| Textos centralizados | Todos los literales visibles viven en `src/i18n/es.json`; los componentes no contienen texto de interfaz |
| Fechas y números | Formateados con `Intl.DateTimeFormat('es-ES')` y `Intl.NumberFormat('es-ES')`; nunca concatenados a mano |
| Zona horaria | Fechas almacenadas en UTC y mostradas en la zona del usuario (`Europe/Madrid` por defecto) |
| Mensajes de validación | Provienen del mismo catálogo de textos que el resto de la interfaz |
| Longitud de textos | Los componentes no fijan anchos que rompan con textos un 30 % más largos |
| Caracteres | UTF-8 en base de datos, API y HTML (incluye eñes y acentos en nombres de animales) |

**Cómo se comprueba:** búsqueda de literales en los componentes (`grep` de texto entre etiquetas JSX), revisión de que no hay `toLocaleDateString()` sin configuración explícita y prueba con un nombre de animal con acentos y `ñ`.

---

## RNF-06 · Mantenibilidad

| Requisito | Criterio | Comprobación |
|---|---|---|
| Separación de responsabilidades | Capas `routes → controllers → services → repositories`; la lógica de negocio no vive en el controlador ni en el componente | Revisión de arquitectura |
| Tipado | TypeScript en modo `strict` en frontend y backend | `tsc --noEmit` sin errores |
| Validación compartida | Esquemas Zod reutilizados por API y formularios | Revisión del paquete `shared` |
| Errores centralizados | Un middleware único traduce excepciones a respuestas `{ error: { code, message } }` | Provocar un error y comprobar el formato |
| Convenciones | ESLint + Prettier, nombres en inglés para código y español para contenido de dominio | `npm run lint` |
| Pruebas | Vitest para servicios y Supertest para endpoints; cobertura ≥ 60 % en `services` | `npm run test -- --coverage` |
| Documentación | README de instalación, ADR por decisión y contratos de API | Revisión de la carpeta `docs/` |
| Dependencias | Versiones fijadas en `package-lock.json`; dependencias justificadas | Revisión del `package.json` |
| Entorno reproducible | Un solo comando de arranque (`docker compose up` para PostgreSQL local) y `.env.example` | Prueba en máquina limpia |

**Ejemplo de criterio aplicado:** la regla "solo una solicitud aprobada por animal" vive en un servicio transaccional, no en el controlador ni en la interfaz, para poder probarla de forma aislada.

---

## RNF-07 · Escalabilidad

El proyecto es académico: **no se diseña una arquitectura distribuida**. Se identifica qué limitaría el crecimiento y qué haría falta si aumentara la demanda.

| Aspecto | Medida en esta versión | Límite conocido | Evolución posible |
|---|---|---|---|
| Consultas | Índices compuestos en los filtros del catálogo y en las claves foráneas | Crecimiento del catálogo | Réplica de lectura |
| Listados | Paginación obligatoria, máximo 48 elementos | Aumento de tráfico | Cacheo de la primera página |
| Conexiones | Pool de Prisma con `connection_limit` configurado, una instancia de PrismaClient | Límite de conexiones del plan gratuito | Agrupar con PgBouncer |
| Archivos | Imágenes fuera de la API (Cloudinary) | Cuota del plan gratuito | Plan de pago o S3 |
| API | Sin estado: cualquier instancia puede atender cualquier petición | Escalado horizontal | Varias instancias tras balanceador |
| Base de datos | PostgreSQL gestionado con copias | Almacenamiento del plan | Ampliar plan |
| Coste | Planes gratuitos con límites revisados y anotados con fecha | Cambio de condiciones del proveedor | Plan B documentado en 3.2.3 |

**Cómo se comprueba:** la prueba de carga de RNF-01 se ejecuta con el volumen de datos de referencia; el esquema se revisa para confirmar que no hay consultas sin índice en los filtros principales.

---

## RNF-08 · Observabilidad

| Requisito | Criterio | Comprobación |
|---|---|---|
| Logs estructurados | JSON con `timestamp`, `level`, `requestId`, `route`, `status`, `durationMs`; sin cuerpos completos de petición | Revisar la salida al provocar un error |
| Sin datos sensibles | Nunca se registran contraseñas, tokens, correos completos ni datos clínicos | Revisión del logger y prueba con un fallo de login |
| Identificador de petición | Cada petición recibe un `requestId` que aparece en la respuesta y en el log | Comparar cabecera y log |
| Errores internos | El cliente recibe un mensaje comprensible; el detalle técnico solo queda en el log | Forzar un 500 y comparar |
| Estado del servicio | `GET /api/v1/health` devuelve estado y comprobación de base de datos | Petición manual |
| Monitorización | *Ping* externo gratuito cada 5 minutos sobre `/health` con aviso por correo | Configuración del servicio |
| Retención | Logs conservados al menos 7 días en el plan gratuito | Revisión del proveedor |

**Decisión:** no se integra una plataforma completa de trazas distribuidas. Para el alcance del proyecto, logs estructurados + *health check* + aviso de caída cubren la necesidad y son defendibles en la memoria (la guía lo admite explícitamente para proyectos pequeños).

---

## Requisitos descartados y su justificación

| Requisito | Decisión | Motivo |
|---|---|---|
| Multi-idioma real (i18n completa) | Fuera de alcance | El análisis fija español como ventaja competitiva; se deja la estructura preparada |
| Alta disponibilidad y tolerancia a fallos | Fuera de alcance | No es un requisito del producto ni del módulo |
| Trazas distribuidas (OpenTelemetry) | Fuera de alcance | Un monolito con logs estructurados es suficiente |
| Caché distribuida (Redis) | Fuera de alcance | El volumen esperado no lo justifica; añade una dependencia y un coste |
| Escalado horizontal automático | Fuera de alcance | La API es stateless y podría escalarse, pero no se configura |
| Pentest externo | Fuera de alcance | Se sustituye por revisión de permisos, `npm audit` y pruebas de acceso indebido |
| Cifrado de la base de datos a nivel de columna | Fuera de alcance | El proveedor cifra en reposo; los datos sensibles se minimizan |
| Cumplimiento formal de RGPD (registro de actividades) | Parcial | Se implementan minimización, consentimiento, supresión y seguridad; la documentación legal completa queda fuera del módulo |

## Lista de comprobación

- [x] Cada RNF tiene un criterio verificable o un método de evaluación concreto.
- [x] Se ha justificado qué aspectos son relevantes para este proyecto y cuáles no.
- [x] Los umbrales indican el entorno y el conjunto de datos con el que se miden.
- [x] Los requisitos de accesibilidad y SEO se incorporan al diseño, no al final.
- [x] Los requisitos de seguridad incluyen la comprobación del acceso no autorizado, no solo del autorizado.
