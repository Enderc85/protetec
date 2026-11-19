# 3.4. Conclusiones del diseño

## Qué solución se ha definido

Protetec se implementará como una **aplicación web con frontend y API separados**:

- **Frontend:** React + Vite (SPA) con TypeScript, responsive y accesible (WCAG 2.2 AA).
- **API:** Node.js + Express con TypeScript, organizada en capas y con validación Zod.
- **Datos:** PostgreSQL gestionado con **Prisma ORM** y migraciones versionadas.
- **Autenticación:** sesión opaca revocable en cookie `HttpOnly`.
- **Archivos:** imágenes en Cloudinary.
- **Despliegue:** Vercel para el frontend y un PaaS para la API, con CI en GitHub Actions.

El producto cubre el MVP definido en el análisis: catálogo público filtrable, Cartilla Digital, solicitud de adopción con seguimiento y panel de gestión por roles, con **RF-01 a RF-12** especificados y priorizados.

## Decisiones fundamentales

| Decisión | Por qué condiciona todo lo demás |
|---|---|
| **PostgreSQL + Prisma** (ADR-02) | Determina el modelo relacional, las migraciones y la forma de garantizar la regla de una sola adopción aprobada |
| **Sesión opaca revocable** (ADR-10) | Cambia el modelo de datos (tabla `Sesion`) y el flujo de autenticación |
| **Multi-protectora desde el inicio** (ADR-04) | Añade `protectoraId` a usuarios y animales y obliga a probar el aislamiento en cada endpoint |
| **Solicitud con cuenta** (ADR-06) | Hace posible "Mis solicitudes" y el historial de estados |
| **Cartilla en tablas 1:N** (ADR-03) | Permite historial, próximas dosis y futuros recordatorios |
| **React SPA** (ADR-01) | Mantiene la fidelidad al análisis a cambio de asumir una limitación de SEO mitigada con prerender |

## Riesgos que siguen abiertos

| Riesgo | Estado | Seguimiento |
|---|---|---|
| Límites de los planes gratuitos de PostgreSQL y del PaaS | Abierto | Medir consumo tras el despliegue y documentar el plan B |
| Prerender del catálogo para SEO | Abierto | Verificar en CI que el HTML contiene la ficha y sus metadatos |
| Aprovechamiento concurrente de solicitudes | Mitigado por diseño | Verificar con PoC-03 y CP-04 |
| Envío de correo para recuperación de contraseña | Abierto | Elegir proveedor y verificar el dominio; en desarrollo se registra en log |
| Recordatorios sanitarios | Fuera del MVP | Planificados en fase 2 con la entidad `Recordatorio` ya prevista |
| Dependencia de Cloudinary | Abierto | Límites de subida y plan B documentado |
| Alineación con el apartado 4.2 de la planificación | No aplica todavía | El 4.2 se elaborará más adelante; el listado queda preparado para contrastarse entonces |

## Aspectos pendientes

1. **Ejecutar las cinco PoC** y registrar resultados con fecha y commit en los anexos.
2. **Contrastar el listado de tareas con el apartado 4.2** cuando se elabore la planificación general; hoy no existe y no bloquea esta entrega.
3. **Revisar las maquetas HTML navegables** ya construidas (quince pantallas) y capturarlas para la memoria.
4. **Validar los textos legales** (política de privacidad, consentimiento y retención) antes de la entrega.
5. **Verificar los límites y precios** de los planes gratuitos en la fecha de consulta.
6. **Cerrar la asignación de responsables y duraciones** con el calendario real del módulo.

## Cómo se utilizará este diseño durante el desarrollo

- Cada tarea de la planificación referencia un requisito y una prueba; ninguna funcionalidad se implementa sin esa trazabilidad.
- Los contratos de la API son la frontera entre frontend y backend: se pueden desarrollar en paralelo sin improvisar.
- El esquema Prisma del apartado 3.1.3 es directamente utilizable como punto de partida de la implementación.
- La guía de estilos y las maquetas evitan decisiones visuales improvisadas y sirven de referencia en la revisión de cada pantalla.
- Los ADR se actualizan cuando cambia una decisión; un cambio no registrado se considera un defecto de documentación.

## Criterio de cierre

El diseño está suficientemente definido cuando otra persona puede empezar a implementar sin tener que inventar las decisiones fundamentales. Tras este documento, quedan claras las funcionalidades y sus criterios, los requisitos de calidad, el modelo de datos, los contratos, las pantallas, la identidad visual, el stack, las alternativas descartadas, los riesgos y las tareas.

Las lagunas restantes están identificadas y acotadas: no afectan a la arquitectura ni al modelo, y tienen responsable y siguiente paso.
