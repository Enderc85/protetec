# Registro de decisiones de arquitectura (ADR)

Cada decisión relevante se registra aquí con su contexto, las alternativas consideradas y sus consecuencias. El objetivo es que cualquier persona del equipo (o quien evalúe el proyecto) entienda **por qué** se eligió algo, y no solo **qué** se eligió.

**Formato:** `ADR-xx · Título` — Estado · Fecha · Contexto · Alternativas · Decisión · Consecuencias · Riesgos.

| ID | Decisión | Estado | Sustituye a |
|---|---|---|---|
| [ADR-01](#adr-01) | React + Vite (SPA) + Express, fiel al análisis | Aceptada | — |
| [ADR-02](#adr-02) | PostgreSQL + Prisma ORM en lugar de MongoDB Atlas | Aceptada | Análisis 2.7.2 |
| [ADR-03](#adr-03) | Cartilla en tablas `Vacuna`, `Alergia`, `Tratamiento` | Aceptada | Análisis 2.7.1 (`Cartilla_Digital` como entidad única) |
| [ADR-04](#adr-04) | Multi-protectora desde el inicio | Aceptada | — |
| [ADR-05](#adr-05) | Roles enum y registro público solo de adoptantes | Aceptada | Análisis 2.7.1 (entidad `Rol`) |
| [ADR-06](#adr-06) | La solicitud de adopción exige cuenta | Aceptada | Ambigüedad del análisis (RF-03) |
| [ADR-07](#adr-07) | Cartilla pública resumida; detalle clínico para personal y adoptante | Aceptada | — |
| [ADR-08](#adr-08) | Recordatorios automáticos en fase 2 | Aceptada | Análisis 2.2.4 (*Should have*) |
| [ADR-09](#adr-09) | `fechaNacimiento` en lugar de `edad` | Aceptada | Análisis 2.7.1 (`edad` como atributo) |
| [ADR-10](#adr-10) | Sesión opaca en cookie `HttpOnly` | Aceptada | — |
| [ADR-11](#adr-11) | Imágenes en almacenamiento externo (Cloudinary) | Aceptada | — |
| [ADR-12](#adr-12) | Documentación de diseño en Markdown + Mermaid | Aceptada | — |

---

## ADR-01

**Título:** Frontend React + Vite (SPA) con API Express separada
**Estado:** Aceptada · **Fecha:** noviembre de 2026 · **Responsables:** equipo completo

### Contexto

El documento de análisis fija React como SPA y Express como backend. La guía de diseño exige comparar alternativas y justificar la elección, y advierte de que el SEO puede verse afectado por el renderizado en cliente. El producto tiene una parte pública (catálogo) que sí necesita indexación y una parte privada (panel) que no.

### Alternativas consideradas

| Alternativa | Ventajas | Inconvenientes |
|---|---|---|
| **A. React + Vite SPA + Express** | Máxima fidelidad al análisis; curva de aprendizaje baja para el equipo; despliegue estático sencillo; separación clara front/API | SEO limitado: el HTML inicial no contiene la ficha; requiere prerender y metadatos gestionados |
| **B. Next.js (React con SSR/SSG) + Express** | HTML renderizado en servidor, mejor SEO y LCP; metadatos por ruta sin trucos | Curva de aprendizaje del App Router; dos despliegues con configuración distinta; el equipo tarda más en arrancar |
| **C. Next.js full-stack (API routes)** | Un solo despliegue y un solo repositorio | Se aleja del análisis (Express) y mezcla la lógica con el runtime serverless; conexión a base de datos más frágil |

### Decisión

**Alternativa A.** Se mantiene React + Vite como SPA y Express como API separada, tal como fija el análisis.

### Justificación

La fidelidad al análisis es un requisito de coherencia del proyecto (la guía penaliza documentar un stack y usar otro). Además, el equipo ya conoce React y el tiempo de diseño y desarrollo es acotado. El SEO, siendo relevante, se resuelve con medidas proporcionadas: metadatos por ruta, `sitemap.xml`, `robots.txt` y **prerender de las rutas públicas en el build**.

### Consecuencias

- **Positivas:** desarrollo más rápido, despliegue del frontend estático y gratuito en Vercel, separación de responsabilidades real, API reutilizable por otros clientes.
- **Negativas:** el SEO depende de un paso de prerender que hay que configurar y verificar; el primer render en cliente añade latencia frente a SSR.
- **Riesgo:** que el prerender se rompa y las fichas dejen de indexarse. Mitigación: comprobar en CI que el HTML generado contiene el nombre y los metadatos de cada ficha, y documentar la limitación en RNF-04.
- **Coste de cambiar a B:** alto en la capa de rutas y metadatos; el modelo, la API y los contratos no cambian.

---

## ADR-02

**Título:** PostgreSQL gestionado con Prisma ORM en lugar de MongoDB Atlas
**Estado:** Aceptada · **Fecha:** noviembre de 2026 · **Responsables:** equipo completo

### Contexto

El análisis proponía MongoDB Atlas «para un almacenamiento flexible de fichas», pero el modelo descrito usaba identificadores y relaciones propias de una base relacional. Durante el diseño se decide usar **Prisma** como capa de acceso a datos.

> **Aclaración necesaria:** Prisma es un **ORM**, no un motor de base de datos. Necesita un PostgreSQL, MySQL, SQLite o MongoDB detrás. La decisión es, por tanto, doble: **motor PostgreSQL** + **Prisma como ORM**.

### Alternativas consideradas

| Alternativa | Ventajas | Inconvenientes |
|---|---|---|
| **A. MongoDB Atlas + Mongoose** | Flexible; el análisis ya lo citaba; Atlas gratuito con réplica | Sin integridad referencial; la regla «una sola solicitud aprobada» exige lógica y transacciones manuales; menos natural para el modelo real |
| **B. PostgreSQL + Prisma** | Integridad referencial, transacciones, índices únicos parciales, migraciones versionadas, tipado generado | Requiere servidor PostgreSQL; el equipo debe aprender Prisma (curva baja) |
| **C. PostgreSQL + SQL a mano (`pg`)** | Control total, sin capa extra | Más código repetitivo, migraciones manuales, más superficie de error |

### Decisión

**Alternativa B:** PostgreSQL gestionado (Prisma Postgres, Neon o Supabase, todos compatibles) y **Prisma ORM**.

### Justificación

1. **Integridad:** RF-04 exige que solo exista una solicitud aprobada por animal y que la aprobación actualice varias tablas. Con PostgreSQL esto es una transacción y un índice único parcial; con MongoDB es lógica distribuida en la aplicación.
2. **Coherencia con el modelo:** las entidades del análisis ya eran relacionales (`id_usr`, `id_rol`, `id_prot`).
3. **Mantenibilidad:** Prisma genera tipos y migraciones, lo que reduce errores y sirve como evidencia documental del modelo.
4. **Coste:** los planes gratuitos de PostgreSQL gestionado cubren de sobra el volumen del proyecto.

### Consecuencias

- **Positivas:** reglas de integridad garantizadas por el motor; migraciones reproducibles; consultas tipadas; mejor defensa del modelo ante el tribunal.
- **Negativas:** se modifica una decisión del análisis y hay que documentarlo (este ADR); se depende de un proveedor de PostgreSQL.
- **Riesgos:** límites del plan gratuito y latencia de arranque en frío. Mitigación: medir consumo, elegir región europea, documentar el plan B (Neon ↔ Supabase ↔ PostgreSQL local en Docker).
- **Reversibilidad:** media. Cambiar a MongoDB obligaría a rehacer migraciones y las restricciones parciales; el modelo conceptual se mantendría.

---

## ADR-03

**Título:** Cartilla Digital en tablas relacionadas, no como campo único
**Estado:** Aceptada · **Fecha:** noviembre de 2026

### Contexto

El análisis describe `Cartilla_Digital: vacunas, alergias, tratamientos, esterilizado` como si fueran campos sueltos. Eso impide construir un historial, saber cuándo toca la siguiente dosis y auditar cambios.

### Alternativas

| Alternativa | Valoración |
|---|---|
| **A. Un campo de texto o JSON por tipo** | Rápido de crear, imposible de filtrar, ordenar o recordar |
| **B. Tablas `Vacuna`, `Alergia`, `Tratamiento` con fecha y relación 1:N** | Modelo correcto, consultas por fecha, base para recordatorios |
| **C. Documento embebido en Mongo** | Válido en documental, pero se descartó el motor en ADR-02 |

### Decisión

**Alternativa B**, con `Cartilla` como entidad 1:1 con `Animal` que agrupa las tres colecciones.

### Consecuencias

- **Positivas:** trazabilidad real, `proximaDosis` consultable, historial ordenado, posibilidad de estadísticas.
- **Negativas:** más tablas y más operaciones en la API (una por tipo de registro).
- **Riesgo:** formularios largos. Mitigación: la cartilla se edita por secciones y con acciones independientes, no en un único formulario gigante.

---

## ADR-04

**Título:** Multi-protectora desde la primera versión
**Estado:** Aceptada · **Fecha:** noviembre de 2026

### Contexto

El análisis incluye la entidad `Protectora`, pero no la relaciona con `Usuario` ni con `Animal`. Sin esa relación no se puede construir el panel de gestión ni aislar los datos entre centros.

### Alternativas

| Alternativa | Coste ahora | Coste después |
|---|---|---|
| **A. Una sola protectora** (sin relación) | Nulo | Migración y revisión de todas las consultas; riesgo de fuga de datos si se añade mal |
| **B. `protectoraId` en `Usuario` y `Animal` desde el inicio** | Bajo | Nulo |

### Decisión

**Alternativa B.** El MVP se demostrará con una protectora sembrada, pero el aislamiento existe desde el primer día.

### Consecuencias

- **Positivas:** el panel filtra siempre por `protectoraId`; el producto puede crecer a varias protectoras sin rehacer el modelo; es un argumento de venta frente a una hoja de cálculo.
- **Negativas:** cada consulta del personal necesita el filtro; hay que probar el aislamiento (CA-02.4, CA-04.7, CA-10.7).
- **Riesgo:** olvidar el filtro en una consulta. Mitigación: el `protectoraId` se inyecta en el repositorio a partir de la sesión y las pruebas de acceso indebido son obligatorias.

---

## ADR-05

**Título:** Roles como enumeración y registro público limitado a adoptantes
**Estado:** Aceptada · **Fecha:** noviembre de 2026

### Contexto

El análisis define la entidad `Rol` con tres valores cerrados (`Admin`, `Protectora`, `Adoptante`) y, a la vez, un registro público. Si el rol se pudiera enviar desde el formulario, cualquiera podría registrarse como administrador.

### Alternativas

| Alternativa | Valoración |
|---|---|
| **A. Colección `Rol` editable por el administrador** | Complejidad de permisos granulares que el producto no necesita |
| **B. Enum en `Usuario`** | Simple, tipado, suficiente para tres roles fijos |
| **C. Enum + permisos por acción** | Solo si aparecieran roles nuevos; hoy sería sobreingeniería |

### Decisión

**Alternativa B.** El registro público crea siempre `ADOPTANTE`. Las cuentas `PROTECTORA` las crea un administrador y las `ADMIN` se crean por semilla o por otro administrador de forma explícita.

### Consecuencias

- **Positivas:** elimina la escalada de privilegios desde el cliente; el modelo es claro; menos consultas al no necesitar `join` con una tabla de roles.
- **Negativas:** añadir un rol nuevo exige migración.
- **Riesgo:** que un administrador se equivoque al asignar rol. Mitigación: registro de acciones privilegiadas (CA-10.8) y prohibición de quedarse sin administradores (CA-10.6).

---

## ADR-06

**Título:** La solicitud de adopción exige cuenta
**Estado:** Aceptada · **Fecha:** noviembre de 2026

### Contexto

El análisis se contradice: describe al adoptante como alguien que «inicia la solicitud», pero RF-03 habla de «usuarios registrados», y la persona 2 (Carlos) quiere «conocer el estado de su solicitud en tiempo real».

### Alternativas

| Alternativa | Ventajas | Inconvenientes |
|---|---|---|
| **A. Solicitud sin cuenta** (solo datos de contacto) | Menos fricción | Imposible mostrar el estado; consentimiento RGPD difícil de probar; spam |
| **B. Solicitud con cuenta** | Estado en tiempo real, consentimiento registrado, historial, antispam | Un paso más antes de solicitar |

### Decisión

**Alternativa B.** El catálogo es público; la solicitud requiere sesión iniciada.

### Consecuencias

- **Positivas:** se cumple el objetivo de la persona 2; el adoptante tiene historial; la protectora puede identificar a quien solicita.
- **Negativas:** se pierden solicitudes de personas que no quieren registrarse.
- **Mitigación:** el registro es de tres campos y, si el visitante pulsa «Solicitar», se le redirige al registro conservando el animal elegido (CA-03.1).

---

## ADR-07

**Título:** Cartilla pública resumida; detalle clínico para personal y adoptante
**Estado:** Aceptada · **Fecha:** noviembre de 2026

### Contexto

La Cartilla Digital es el elemento diferencial y debe verse en el catálogo, pero contiene datos clínicos y el RGPD exige minimización.

### Alternativas

| Alternativa | Valoración |
|---|---|
| **A. Publicar la cartilla completa** | Transparencia máxima, pero expone tratamientos y observaciones internas sin necesidad |
| **B. Publicar solo un resumen** (vacunado al día, esterilizado, chip, alergias graves, apto para piso) | Cubre la necesidad del adoptante y respeta la minimización |
| **C. No publicar nada** | Debilita el elemento diferencial del producto |

### Decisión

**Alternativa B.** El detalle clínico se reserva al personal de la protectora y al administrador, que lo editan, y al adoptante del animal, que lo consulta en modo lectura desde su perfil (pantallas 14 y 15).

### Consecuencias

- **Positivas:** cumple minimización; la ficha pública sigue siendo informativa; se evita exponer datos que podrían estigmatizar al animal.
- **Negativas:** el público general no ve el historial completo; solo lo ve quien ya ha adoptado al animal.
- **Riesgo:** que el resumen se implemente como una proyección manual y se olvide un campo. Mitigación: la respuesta pública se construye con un `select` explícito y una prueba que verifica la ausencia de campos clínicos (CA-02.5); el acceso del adoptante se autoriza por la solicitud aprobada y es de solo lectura.

---

## ADR-08

**Título:** Recordatorios sanitarios automáticos en fase 2
**Estado:** Aceptada · **Fecha:** noviembre de 2026

### Contexto

El análisis los marca como *Should have* y los menciona en la descripción, pero no están en el MVP. Implementarlos exige un proceso programado, un proveedor de correo, plantillas y gestión de rebotes.

### Alternativas

| Alternativa | Valoración |
|---|---|
| **A. Incluirlos en el MVP con correo** | Añade infraestructura y dependencias externas a un alcance ya ajustado |
| **B. Dejarlos para fase 2, guardando `proximaDosis` desde ya** | No bloquea el MVP y deja el dato listo |
| **C. No modelarlos** | Cierra la puerta a una funcionalidad diferencial |

### Decisión

**Alternativa B.** Se guarda `proximaDosis` y `Vacuna` se indexa por esa fecha. La fase 2 añadirá la entidad `Recordatorio` y el envío.

### Consecuencias

- **Positivas:** el MVP se centra en lo *Must*; la cartilla ya aporta valor mostrando la próxima dosis.
- **Negativas:** se pierde temporalmente una funcionalidad que el análisis considera importante.
- **Riesgo:** que no se implemente nunca. Mitigación: queda como tarea planificada en la fase 2 con su entidad ya prevista.

---

## ADR-09

**Título:** Almacenar `fechaNacimiento` en lugar de `edad`
**Estado:** Aceptada · **Fecha:** noviembre de 2026

### Contexto

El análisis define `Animal.edad` como atributo. Un número almacenado se queda obsoleto y hace que los filtros del catálogo mientan con el tiempo.

### Alternativas

| Alternativa | Valoración |
|---|---|
| **A. `edad` entero** | Simple, pero incorrecto a los pocos meses |
| **B. `fechaNacimiento` y edad calculada** | Correcto y filtrable; requiere calcular rangos |
| **C. Ambos** | Duplica la fuente de verdad |

### Decisión

**Alternativa B.** Se almacena `fechaNacimiento` (aproximada cuando no se conoce) y la edad se calcula siempre. Los rangos se traducen a intervalos de fechas en la consulta.

### Consecuencias

- **Positivas:** el catálogo nunca muestra una edad falsa; los filtros son coherentes.
- **Negativas:** las consultas por rango son algo más complejas y necesitan índice.
- **Mitigación:** el filtro por edad se construye en un único módulo reutilizable y se prueba con fechas límite (cumpleaños el mismo día).

---

## ADR-10

**Título:** Sesión opaca en cookie `HttpOnly` en lugar de JWT en `localStorage`
**Estado:** Aceptada · **Fecha:** noviembre de 2026

### Contexto

El análisis pide «tokens seguros» sin concretar. Hay que decidir dónde vive el token y cómo se revoca.

### Alternativas

| Alternativa | Ventajas | Inconvenientes |
|---|---|---|
| **A. JWT en `localStorage`** | Sencillo; el cliente lo envía en cada petición | Vulnerable a XSS; no se puede revocar antes de caducar sin lista negra |
| **B. JWT en cookie `HttpOnly`** | Protegido frente a XSS | Revocación compleja; si se añade lista negra, se pierde la ventaja de stateless |
| **C. Token opaco en cookie `HttpOnly` con sesión en base de datos** | Revocación inmediata, cierre de sesión real, cambio de contraseña invalida todo | Una consulta por petición autenticada |

### Decisión

**Alternativa C.** Token de 32 bytes aleatorios, guardado **hasheado** (SHA-256) en `sesiones`, cookie `HttpOnly`, `Secure`, `SameSite=Lax`, 7 días de duración.

### Consecuencias

- **Positivas:** el cierre de sesión es real (CA-07.5); cambiar la contraseña revoca todas las sesiones; el token no es legible por JavaScript; no hay que gestionar firmas ni rotaciones.
- **Negativas:** una consulta adicional por petición autenticada; la tabla de sesiones crece (se limpia por caducidad).
- **Riesgo:** latencia. Mitigación: índice único sobre `tokenHash` y borrado periódico de sesiones caducadas.

---

## ADR-11

**Título:** Imágenes en almacenamiento externo (Cloudinary)
**Estado:** Aceptada · **Fecha:** noviembre de 2026

### Contexto

El catálogo necesita fotos y las fotos pesan. Guardarlas en el sistema de archivos de la API no es viable en un despliegue *serverless* o con disco efímero, y servirlas desde la API consume ancho de banda y complica el borrado.

### Alternativas

| Alternativa | Valoración |
|---|---|
| **A. Disco local de la API** | Se pierde en cada despliegue; no escala |
| **B. Objeto en base de datos (`bytea`)** | Hincha la base de datos y empeora las copias |
| **C. Servicio externo con CDN (Cloudinary)** | Transformaciones, CDN y borrado por `publicId`; plan gratuito suficiente |

### Decisión

**Alternativa C.** Se guarda solo la URL y el `publicId`; el archivo vive en Cloudinary.

### Consecuencias

- **Positivas:** la API no sirve binarios; imágenes optimizadas y responsivas; borrado limpio.
- **Negativas:** dependencia de un proveedor externo y de su plan gratuito.
- **Riesgo:** superar la cuota. Mitigación: límite de 6 imágenes por animal y 5 MB por archivo (CA-05.3, CA-05.4); plan B: Cloudflare R2 o Supabase Storage.

---

## ADR-12

**Título:** Documentación de diseño en Markdown con diagramas Mermaid
**Estado:** Aceptada · **Fecha:** noviembre de 2026

### Contexto

La entrega debe ser revisable por una persona externa y coherente con el repositorio. La guía recomienda mantener la documentación junto al código y usar diagramas como código.

### Alternativas

| Alternativa | Valoración |
|---|---|
| **A. Documento Word/PDF suelto** | Formato de entrega habitual, pero se desincroniza del repositorio |
| **B. Markdown + Mermaid en el repositorio** | Versionado, revisable en *pull request*, se renderiza en GitHub y VS Code, exportable a PDF |
| **C. Herramienta de wiki externa** | Más fricción y menos portable |

### Decisión

**Alternativa B**, con exportación a PDF para la entrega formal.

### Consecuencias

- **Positivas:** trazabilidad de cambios, diagramas actualizables con el código, revisión por pares sencilla.
- **Negativas:** el formato final exige una conversión y un repaso de maquetación.
- **Riesgo:** diagramas desactualizados. Mitigación: los diagramas viven en el mismo repositorio y se revisan en cada cambio de modelo o de API.
