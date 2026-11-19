# 3. Diseño

**Proyecto:** Protetec
**Integrantes:** Guillermo Morcillo Carmona, Iker Valls Jiménez, Xavi Roca Bisbal
**Curso y grupo:** 2.º Ciclo Formativo de Grado Superior en Desarrollo de Aplicaciones Web (DAW)
**Módulo:** Proyecto Intermodular
**Fecha:** Noviembre de 2026
**Versión del documento:** 1.0

> Este documento continúa la numeración del documento de análisis: la fase de diseño ocupa el capítulo **3**, con los apartados 3.1, 3.2 y 3.3 exigidos por la guía de la fase.

---

## 3.0. Introducción al diseño

### 3.0.1. Objetivo de la fase

La fase de análisis identificó un problema (fragmentación de la información en las protectoras) y unas necesidades. Esta fase transforma esas necesidades en una **propuesta técnica y visual concreta**: qué se construye, cómo funciona, con qué tecnologías, con qué datos, con qué pantallas y en qué orden.

El objetivo no es diseñar la aplicación más compleja, sino una solución **coherente con las necesidades, el alcance, el tiempo disponible y las capacidades del equipo**. Por eso se descartan explícitamente alternativas que, siendo técnicamente superiores, no aportan valor al problema o no son asumibles en 9 horas de trabajo de diseño y el calendario de desarrollo del módulo.

### 3.0.2. Relación con el análisis

Toda decisión de este documento se apoya en una necesidad del análisis. La cadena de trazabilidad que se conserva es:

```text
PROBLEMA → EVIDENCIA → NECESIDAD → REQUISITO → DECISIÓN DE DISEÑO → TAREA → IMPLEMENTACIÓN → PRUEBA
```

| Problema (análisis 1.3) | Evidencia (análisis 2.1.5) | Necesidad | Requisito | Decisión de diseño |
|---|---|---|---|---|
| Fichas sanitarias en papel y hojas de cálculo | 74 % detecta seguimiento sanitario insuficiente | Trazabilidad clínica centralizada | RF-02 | Cartilla Digital en tablas 1:N (ADR-03) |
| Publicaciones desactualizadas en redes | Procesamiento manual de 3 a 5 días | Catálogo fiable y filtrable | RF-01 | Catálogo público paginado con filtros en URL |
| Solicitudes por teléfono y correo | 90 % sufre dispersión documental | Estado de la solicitud visible | RF-03, RF-04, RF-08 | Solicitud con cuenta y máquina de estados (ADR-06) |
| Sin control de accesos | Datos personales de adoptantes (RGPD) | Permisos verificados en servidor | RF-10, RNF-03 | Roles enum + sesión opaca (ADR-05, ADR-10) |
| Interfaz inaccesible para voluntariado sénior | Perfil tecnológico diverso (Nielsen) | Uso sin barreras | RNF-02 | WCAG 2.2 AA desde los wireframes |

### 3.0.3. Alcance del diseño

**Se diseña:**

- Los requisitos funcionales del MVP y los de segunda prioridad, con criterios verificables.
- Los requisitos no funcionales con objetivos medibles y su método de comprobación.
- El modelo de datos relacional completo y sus reglas de integridad.
- Los contratos de la API: operaciones, permisos y errores.
- La arquitectura de información, los wireframes y la guía de estilos.
- La comparación de alternativas técnicas y la justificación de la elegida.
- La descomposición en tareas con dependencias y resultados esperados.

**No se diseña en esta fase** (queda para implementación): el código de la aplicación, el contenido definitivo de textos legales, la integración real con un proveedor de correo y los recordatorios automáticos (fuera del MVP, ver ADR-08).

### 3.0.4. Decisiones principales de la fase

| ADR | Decisión | Consecuencia |
|---|---|---|
| [ADR-01](../../adr/README.md#adr-01) | React + Vite (SPA) + Express + TypeScript, fiel al análisis | SEO se cubre con metadatos, sitemap y prerender de rutas públicas |
| [ADR-02](../../adr/README.md#adr-02) | PostgreSQL + Prisma ORM en lugar de MongoDB Atlas | Modelo relacional con migraciones, transacciones e índices únicos |
| [ADR-03](../../adr/README.md#adr-03) | Cartilla en tablas `Vacuna`, `Alergia`, `Tratamiento` | Historial trazable y posibilidad futura de recordatorios |
| [ADR-04](../../adr/README.md#adr-04) | Multi-protectora desde el inicio | `protectoraId` en `Usuario` y `Animal`; aislamiento por consulta |
| [ADR-05](../../adr/README.md#adr-05) | Roles enum; el registro público solo crea `ADOPTANTE` | No hay escalada de privilegios desde el cliente |
| [ADR-06](../../adr/README.md#adr-06) | La solicitud de adopción exige cuenta | Se cumple el "estado en tiempo real" del adoptante |
| [ADR-07](../../adr/README.md#adr-07) | Cartilla pública resumida, completa solo para personal | Minimización de datos (RGPD) frente a transparencia |
| [ADR-08](../../adr/README.md#adr-08) | Recordatorios automáticos en fase 2, con `proximaDosis` ya modelado | No bloquea el MVP y lo hace posible después |
| [ADR-10](../../adr/README.md#adr-10) | Sesión opaca en cookie `HttpOnly` en lugar de JWT en `localStorage` | Revocación inmediata y protección frente a XSS |

### 3.0.5. Estructura de la entrega

| Apartado | Documento |
|---|---|
| 3.1.1 Requisitos funcionales | [01-requisitos-funcionales.md](01-requisitos-funcionales.md) |
| 3.1.2 Requisitos no funcionales | [02-requisitos-no-funcionales.md](02-requisitos-no-funcionales.md) |
| 3.1.3 Modelo de datos | [03-modelo-de-datos.md](03-modelo-de-datos.md) |
| 3.1.4 Contratos de API | [04-contratos-api.md](04-contratos-api.md) |
| 3.1.5 Diseño UX/UI | [05-ux-ui.md](05-ux-ui.md) |
| Maquetas navegables (15 pantallas) | [mockups/README.md](mockups/README.md) |
| 3.2 Viabilidad técnica | [06-viabilidad-tecnica.md](06-viabilidad-tecnica.md) |
| 3.3 Fases, tareas y planificación | [07-planificacion-tareas.md](07-planificacion-tareas.md) |
| 3.4 Conclusiones | [08-conclusiones.md](08-conclusiones.md) |
| Anexos (PoC, matriz, referencias) | [09-anexos.md](09-anexos.md) |
| Registro de decisiones | [../adr/README.md](../adr/README.md) |

### 3.0.6. Criterio de cierre de la fase

La fase se considera cerrada cuando se cumplen los doce puntos de la entrega mínima de la guía:

1. Documento de diseño con los apartados obligatorios.
2. Historias de usuario y criterios de aceptación.
3. Requisitos no funcionales relevantes.
4. Modelo de datos.
5. Contratos principales de API.
6. Wireframes y guía de estilos.
7. Comparación de alternativas técnicas.
8. Matriz de decisión justificada.
9. Elección técnica con riesgos y mitigaciones.
10. Listado de tareas propuesto, preparado para contrastarse con la planificación general cuando se elabore el apartado 4.2.
11. Diagramas pertinentes.
12. Referencias a fuentes técnicas y pruebas realizadas.

El estado de cada punto se mantiene en la [lista de comprobación de la entrega](09-anexos.md#lista-de-comprobacion-de-la-entrega).
