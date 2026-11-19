# Protetec

Plataforma web para la gestión integral de protectoras de animales y el fomento de adopciones responsables, con **Cartilla Digital** por animal.

| | |
|---|---|
| **Equipo** | Guillermo Morcillo Carmona · Iker Valls Jiménez · Xavi Roca Bisbal |
| **Curso** | 2.º CFGS Desarrollo de Aplicaciones Web (DAW) |
| **Módulo** | Proyecto Intermodular |
| **Fase actual** | 3 · Diseño |
| **Versión del diseño** | 1.0 — noviembre de 2026 |

## Documentación

| Documento | Contenido |
|---|---|
| [3.1.1 · Requisitos funcionales](docs/fase-3-diseno/01-requisitos-funcionales.md) | Historias de usuario, criterios de aceptación, prioridad MoSCoW |
| [3.1.2 · Requisitos no funcionales](docs/fase-3-diseno/02-requisitos-no-funcionales.md) | Rendimiento, accesibilidad, seguridad, SEO, i18n, mantenibilidad, escalabilidad y observabilidad |
| [3.1.3 · Modelo de datos](docs/fase-3-diseno/03-modelo-de-datos.md) | Entidades, relaciones, reglas de integridad, esquema Prisma |
| [3.1.4 · Contratos de API](docs/fase-3-diseno/04-contratos-api.md) | Endpoints, permisos, errores y transiciones de estado |
| [3.1.5 · Diseño UX/UI](docs/fase-3-diseno/05-ux-ui.md) | Público, arquitectura de información, guía de estilos y componentes |
| [Maquetas navegables](docs/fase-3-diseno/mockups/README.md) | 15 pantallas HTML: catálogo, ficha, solicitud, paneles, cartilla, perfil y errores |
| [3.2 · Viabilidad técnica](docs/fase-3-diseno/06-viabilidad-tecnica.md) | Tres alternativas, matriz ponderada, costes, riesgos y PoC |
| [3.3 · Planificación](docs/fase-3-diseno/07-planificacion-tareas.md) | Fases, tareas T-01 a T-63, dependencias y camino crítico |
| [3.4 · Conclusiones](docs/fase-3-diseno/08-conclusiones.md) | Cierre de la fase y comprobación de la trazabilidad |
| [Anexos](docs/fase-3-diseno/09-anexos.md) | Lista de comprobación, PoC, diagramas y referencias |
| [Registro de decisiones (ADR)](docs/adr/README.md) | Cada decisión técnica con su contexto, alternativas y consecuencias |

## Stack previsto

- **Frontend:** React + Vite (SPA), TypeScript
- **Backend:** Node.js + Express (API REST), TypeScript
- **Datos:** PostgreSQL gestionado + **Prisma ORM**
- **Autenticación:** sesión opaca en cookie `HttpOnly`
- **Imágenes:** almacenamiento externo (Cloudinary)
- **Despliegue:** Vercel (frontend) + PaaS para la API

> El cambio de MongoDB Atlas a PostgreSQL + Prisma respecto al documento de análisis está justificado en [ADR-02](docs/adr/README.md#adr-02).
