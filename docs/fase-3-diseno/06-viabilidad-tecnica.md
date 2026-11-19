# 3.2. Estudio de la viabilidad técnica

## 3.2.1. Alternativas de solución

Se comparan **tres soluciones completas** que podrían resolver el problema. No son combinaciones arbitrarias de tecnologías: cada una es un stack coherente, desplegable y defendible.

### Alternativa A · SPA React + Express + MongoDB Atlas

Es la propuesta del documento de análisis, sin cambios.

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite (SPA), TypeScript |
| Backend | Node.js + Express |
| Datos | MongoDB Atlas + Mongoose |
| Autenticación | JWT |
| Archivos | Cloudinary |
| Despliegue | Vercel + Atlas |
| CI/CD | GitHub Actions |

**Ventajas:** máxima fidelidad al análisis, ecosistema conocido por el equipo, Atlas gratuito con réplica, esquema flexible.
**Inconvenientes:** sin integridad referencial nativa; la regla «una sola solicitud aprobada por animal» exige lógica y transacciones manuales; las conexiones desde *serverless* al plan gratuito de Atlas son un punto débil conocido; el modelo del análisis ya era relacional.

### Alternativa B · SPA React + Express + PostgreSQL + Prisma

Propuesta seleccionada.

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite (SPA), TypeScript |
| Backend | Node.js + Express, TypeScript |
| Datos | PostgreSQL gestionado (Prisma Postgres / Neon / Supabase) + **Prisma ORM** |
| Autenticación | Sesión opaca en cookie `HttpOnly` |
| Archivos | Cloudinary |
| Despliegue | Vercel (frontend) + PaaS para la API + PostgreSQL gestionado |
| CI/CD | GitHub Actions |

**Ventajas:** integridad referencial y transacciones reales; índices únicos parciales; migraciones versionadas; tipado generado; separación front/API; coste cero en planes gratuitos; mantiene React y Express del análisis.
**Inconvenientes:** requiere un servidor PostgreSQL (gestionado, no local en producción); una consulta adicional por sesión autenticada; el equipo debe aprender Prisma (curva baja).

### Alternativa C · Next.js full-stack + PostgreSQL + Prisma

| Capa | Tecnología |
|---|---|
| Frontend y API | Next.js (App Router), React, TypeScript |
| Datos | PostgreSQL + Prisma |
| Autenticación | Sesión en cookie `HttpOnly` con *server actions* |
| Archivos | Cloudinary |
| Despliegue | Vercel (todo) |
| CI/CD | GitHub Actions |

**Ventajas:** HTML renderizado en servidor, mejor SEO y LCP sin prerender manual; un solo despliegue; menos configuración de CORS.
**Inconvenientes:** se aleja del análisis (que fija Express); el App Router exige aprender un modelo mental nuevo; las funciones *serverless* con PostgreSQL requieren agrupación de conexiones; la lógica de negocio queda acoplada al framework.

### Alternativas descartadas sin desarrollo completo

| Alternativa | Motivo del descarte |
|---|---|
| BaaS (Supabase) con frontend React | Reduce infraestructura, pero la lógica de aprobación transaccional quedaría en funciones y se depende fuertemente del proveedor; además se aleja de Express |
| Monolito Laravel + MySQL + Blade | Válido técnicamente, pero el equipo no lo domina y el análisis fija Node |
| Microservicios | Complejidad de comunicación, observabilidad y despliegue injustificable para tres personas y un dominio pequeño |

## 3.2.2. Comparación entre alternativas

### Criterios y pesos

| Criterio | Peso | Por qué ese peso |
|---|---|---|
| Coste | 15 % | El proyecto debe funcionar con planes gratuitos; un coste alto lo hace inviable |
| Curva de aprendizaje | 20 % | Equipo de tres personas con tiempo acotado; aprender demasiado retrasa el MVP |
| Mantenibilidad e integridad | 20 % | El dominio tiene reglas de negocio que no pueden quedar inconsistentes |
| Rendimiento | 10 % | El catálogo debe cargar en menos de 2 s, pero el volumen es moderado |
| Seguridad | 10 % | Hay datos personales y roles; no es negociable, pero los tres stacks permiten hacerlo bien |
| SEO | 10 % | La parte pública necesita indexación; es un requisito real, aunque no bloqueante |
| Despliegue y DevOps | 10 % | El proyecto debe poder demostrarse desplegado y ser reproducible |
| Escalabilidad | 5 % | El crecimiento esperado es bajo; se valora no cerrarse puertas |

### Matriz de decisión ponderada

Puntuación de 1 (muy desfavorable) a 5 (muy favorable). La puntuación ponderada se calcula multiplicando por el peso decimal y sumando.

| Criterio | Peso | A · MERN | B · Postgres + Prisma | C · Next full-stack |
|---|---:|---:|---:|---:|
| Coste | 15 % | 5 | 5 | 5 |
| Curva de aprendizaje | 20 % | 5 | 4 | 3 |
| Mantenibilidad e integridad | 20 % | 3 | 5 | 4 |
| Rendimiento | 10 % | 4 | 4 | 5 |
| Seguridad | 10 % | 3 | 4 | 4 |
| SEO | 10 % | 3 | 3 | 5 |
| Despliegue y DevOps | 10 % | 3 | 4 | 3 |
| Escalabilidad | 5 % | 3 | 4 | 4 |
| **Puntuación ponderada** | **100 %** | **3,80** | **4,25** | **4,05** |

### Justificación de las puntuaciones

**Coste (todas 5).** Las tres pueden desplegarse con planes gratuitos: Vercel para el frontend, Render/Railway o Vercel para la API, y PostgreSQL gratuito (Prisma Postgres/Neon/Supabase) o Atlas M0. Los límites se revisan con fecha en el apartado de costes.

**Curva de aprendizaje — A 5, B 4, C 3.** A usa exactamente lo que el equipo ya ha trabajado. B añade Prisma y un motor relacional: la sintaxis es declarativa y la documentación es buena, pero hay que aprender migraciones y transacciones. C exige el modelo de servidor de Next.js (componentes de servidor, *server actions*, caché), que es el salto conceptual mayor.

**Mantenibilidad e integridad — A 3, B 5, C 4.** A no puede garantizar desde el motor que exista una sola solicitud aprobada ni que las referencias sean válidas; esas reglas quedan en código y son frágiles ante concurrencia. B las expresa como índices únicos parciales y transacciones. C también tiene integridad, pero mezcla la lógica de negocio con el framework, lo que dificulta probarla de forma aislada.

**Rendimiento — A 4, B 4, C 5.** A y B sirven el catálogo desde una API con índices; el cuello de botella es la red y las imágenes. C gana porque entrega HTML renderizado y mejora el LCP sin depender del prerender.

**Seguridad — A 3, B 4, C 4.** A suele apoyarse en JWT en `localStorage` y en validaciones manuales de pertenencia; con cuidado puede ser seguro, pero es más fácil equivocarse. B y C permiten cookies `HttpOnly` y sesiones revocables con la misma facilidad. B puntúa igual que C porque la API separada obliga a declarar permisos explícitamente, lo que facilita auditarlos.

**SEO — A 3, B 3, C 5.** A y B comparten la limitación de la SPA y dependen del prerender. C resuelve el problema por diseño. Es la ventaja más clara de C y la razón por la que no se descarta.

**Despliegue y DevOps — A 3, B 4, C 3.** A acumula dos riesgos: conexiones a Atlas desde *serverless* y configuración de CORS. B separa responsabilidades y el PostgreSQL gestionado se despliega con una URL; el coste es gestionar dos servicios. C despliega en un solo sitio, pero las funciones *serverless* con PostgreSQL obligan a usar agrupación de conexiones y a vigilar los límites de ejecución.

**Escalabilidad — A 3, B 4, C 4.** A escala horizontalmente pero arrastra el problema de integridad. B y C pueden crecer con réplicas de lectura y caché; C tiene límites de ejecución por función.

### Lectura de la matriz

B obtiene **4,25** frente a **4,05** de C y **3,80** de A. La diferencia con C es pequeña (0,20) y se explica casi por completo por el SEO. Ese resultado obliga a una decisión razonada y no automática: **C no se descarta por puntuación, se descarta por el criterio de fidelidad al análisis y por el tiempo disponible**, y porque el SEO se puede mitigar en B con prerender. Si el equipo dispusiera de más tiempo, C sería la opción técnicamente superior.

La alternativa A, la del análisis original, queda última: mantener MongoDB obliga a implementar en código reglas que el dominio necesita y que PostgreSQL da gratis. Es exactamente el caso que la guía describe cuando dice que una base documental debe elegirse porque el modelo lo justifica, no por costumbre.

## 3.2.3. Pruebas de concepto y micro-benchmarks

Las PoC se ejecutan en la fase de implementación temprana, con una pregunta concreta cada una. Se documentan con hipótesis, procedimiento, entorno, resultado y consecuencia.

| ID | Pregunta | Hipótesis | Procedimiento | Decisión que cambia según el resultado |
|---|---|---|---|---|
| **PoC-01** | ¿Puede la API desplegada en un PaaS gratuito conectarse a PostgreSQL gestionado y mantenerse estable? | Sí, con una única instancia de `PrismaClient` y `connection_limit` ajustado | Desplegar un endpoint `/health` que ejecute `SELECT 1`; 200 peticiones en 5 minutos | Si falla por conexiones, se evalúa PgBouncer o cambiar de proveedor |
| **PoC-02** | ¿El catálogo con 5.000 animales cumple p95 &lt; 800 ms con los índices propuestos? | Sí, con índice `(publicado, estado)` y `select` acotado | Semilla de 5.000 animales; k6, 50 VUs, 2 minutos; medir p95 | Si no cumple, se revisan índices, paginación por cursor o caché de primera página |
| **PoC-03** | ¿La transacción de aprobación impide dos aprobaciones simultáneas? | Sí, gracias al índice único parcial | Dos peticiones concurrentes `PATCH /estado` sobre el mismo animal; comprobar 200 + 409 y estado final | Si falla, se añade bloqueo pesimista (`SELECT … FOR UPDATE`) |
| **PoC-04** | ¿La subida a Cloudinary desde la API respeta formato y tamaño y permite borrar por `publicId`? | Sí | Subir JPG, PNG, WebP, un PDF y un archivo de 6 MB; borrar uno | Si hay limitaciones, se cambia a otro almacenamiento |
| **PoC-05** | ¿El modal de confirmación es usable solo con teclado y con lector de pantalla? | Sí, con foco atrapado y `aria-modal` | Recorrido con `Tab`, `Esc` y NVDA | Si falla, se sustituye el modal por una página de confirmación |

**Resultados:** pendientes de ejecución. Se registrarán en [09-anexos.md](09-anexos.md) con fecha, commit y evidencia (captura o salida de consola). Una PoC sin resultado no se presenta como validación.

## 3.2.4. Estimación de costes

| Concepto | Alternativa A | Alternativa B | Alternativa C |
|---|---|---|---|
| Frontend | Vercel Hobby: 0 € | Vercel Hobby: 0 € | Vercel Hobby: 0 € |
| API | Vercel Functions / Render Free: 0 € | Render Free o Railway: 0 € | Incluida en Vercel: 0 € |
| Base de datos | Atlas M0: 0 € (512 MB) | Prisma Postgres / Neon Free: 0 € (límite por confirmar) | Igual que B |
| Imágenes | Cloudinary Free: 0 € (25 GB/mes) | Cloudinary Free: 0 € | Cloudinary Free: 0 € |
| Dominio | Opcional: 10–15 €/año | Opcional: 10–15 €/año | Opcional: 10–15 €/año |
| CI/CD | GitHub Actions Free: 0 € | GitHub Actions Free: 0 € | GitHub Actions Free: 0 € |
| **Total mínimo** | **0 €** | **0 €** | **0 €** |

**Advertencia obligatoria:** los planes gratuitos tienen límites y pueden cambiar. Antes de la entrega se revisan las condiciones y se anota la fecha de consulta. No se asume que el coste será cero de forma indefinida. Los tres escenarios pueden superar el plan gratuito con tráfico real; el plan B está en el apartado de riesgos.

## 3.2.5. Elección de la alternativa y justificación

### Solución seleccionada

**Alternativa B:** React + Vite (SPA) + Express + **PostgreSQL gestionado con Prisma** + Cloudinary + Vercel/PaaS + GitHub Actions.

### Justificación

1. **Arquitectura:** frontend y API separados, monolito modular en la API. Es la arquitectura menos compleja que cumple los requisitos y permite evolucionar (la guía desaconseja microservicios en este contexto).
2. **Tecnologías:** React y Express se mantienen del análisis; TypeScript en ambos lados para RNF-06.
3. **Base de datos:** PostgreSQL por integridad y transacciones, con Prisma como ORM por tipado y migraciones. Es la decisión que más se separa del análisis y por eso está documentada en ADR-02.
4. **Autenticación:** sesión opaca revocable (ADR-10), que resuelve el cierre de sesión real y la invalidación al cambiar contraseña.
5. **Frontend:** Vercel, con prerender de rutas públicas.
6. **Backend:** PaaS con despliegue desde GitHub (Render o Railway), sin servidor que administrar.
7. **Datos y archivos:** PostgreSQL gestionado + Cloudinary; la API no guarda binarios.
8. **Automatización:** GitHub Actions ejecuta lint, tipos, pruebas y build en cada *push*; el despliegue se dispara desde la rama principal.
9. **Alternativas descartadas:** A por integridad y conexiones; C por fidelidad al análisis y tiempo, pese a su ventaja en SEO.
10. **Evidencias:** matriz ponderada, comparación de costes y PoC previstas. Las PoC que aún no se han ejecutado se declaran como pendientes, no como validadas.

### Riesgos técnicos y mitigación

| Riesgo | Consecuencia | Mitigación |
|---|---|---|
| Límites del plan gratuito de PostgreSQL | La aplicación deja de funcionar | Medir consumo, elegir región europea, plan B con otro proveedor compatible (la cadena de conexión es lo único que cambia) |
| Límite de conexiones | Errores 500 intermitentes | Una sola instancia de `PrismaClient`, `connection_limit`, PoC-01 y PgBouncer si hace falta |
| Dependencia de Cloudinary | Pérdida de imágenes o subida de cuota | Límites de 6 imágenes y 5 MB; plan B: Cloudflare R2 o Supabase Storage |
| El prerender de la SPA se rompe | Pérdida de SEO | Comprobación en CI del HTML generado; plan B: prerender manual de las rutas públicas |
| Aprovechamiento incorrecto de transacciones | Dos solicitudes aprobadas | Índice único parcial + PoC-03 + prueba de concurrencia en CP-04 |
| Falta de tiempo | Funcionalidades incompletas | MVP cerrado y priorizado; las tareas *Should* y *Could* son lo primero que se recorta |
| Problemas de despliegue al final | No se puede demostrar | Despliegue de prueba en la primera semana del desarrollo (error nº 13 de la guía) |
| Dependencias vulnerables | Riesgo de seguridad | `npm audit` en CI y revisión de dependencias antes de la entrega |

### Planes alternativos

| Componente crítico | Plan B | Coste del cambio |
|---|---|---|
| PostgreSQL gestionado | Cambiar a otro proveedor compatible (Neon ↔ Supabase ↔ Prisma Postgres) | Bajo: solo cambia `DATABASE_URL` |
| Hosting de la API | Render ↔ Railway ↔ Fly.io | Bajo: mismo `Dockerfile` o `package.json` |
| Almacenamiento de imágenes | Cloudinary ↔ Cloudflare R2 | Medio: adaptar el adaptador de subida |
| SEO | Prerender ↔ migrar a Next.js | Alto en rutas y metadatos; modelo y API intactos |
| Envío de correo (RF-11 y recordatorios) | Proveedor transaccional ↔ log en desarrollo | Bajo, pero requiere cuenta y verificación de dominio |

> Un plan alternativo debe ser realista. «Cambiaremos de hosting» no es un plan si obliga a reescribir la aplicación: en este caso, la API es portable porque no usa servicios propietarios más allá de Prisma y Cloudinary.

## 3.2.6. Decisiones registradas

Todas las decisiones de este apartado están en el [registro de ADR](../adr/README.md), con contexto, alternativas, consecuencias y riesgos. Las más relevantes para la viabilidad son:

- [ADR-01](../adr/README.md#adr-01) — Frontend SPA frente a Next.js.
- [ADR-02](../adr/README.md#adr-02) — PostgreSQL + Prisma frente a MongoDB Atlas.
- [ADR-10](../adr/README.md#adr-10) — Sesión opaca frente a JWT en `localStorage`.
- [ADR-11](../adr/README.md#adr-11) — Imágenes en Cloudinary.

## Lista de comprobación de la viabilidad

- [x] Se han descrito al menos dos alternativas viables y completas (se describen tres).
- [x] Se han concretado las tecnologías relevantes de cada alternativa.
- [x] La matriz utiliza criterios relacionados con el proyecto, con pesos que suman 100 %.
- [x] Las puntuaciones están justificadas una por una.
- [x] Se han revisado los costes y límites importantes, con la advertencia de fecha de consulta.
- [x] Se han definido las PoC necesarias para resolver las dudas críticas.
- [ ] Las PoC están ejecutadas y sus resultados registrados (pendiente de la fase de implementación).
- [x] Se ha seleccionado y justificado una solución.
- [x] Se han identificado riesgos y medidas de mitigación.
- [x] Se han previsto alternativas para los componentes críticos.
