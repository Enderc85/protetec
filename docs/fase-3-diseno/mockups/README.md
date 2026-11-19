# Maquetas navegables · Fase 3

Quince pantallas HTML que representan el diseño de interfaz de Protetec. No son la aplicación: no hay backend, ni base de datos, ni lógica de negocio. Sirven para **validar la estructura, los estados y los textos** antes de escribir el frontend real y como referencia visual durante la implementación.

## Cómo abrirlas

No hace falta servidor ni instalar nada.

1. Abre `index.html` con doble clic (se abre en el navegador por defecto).
2. Navega con la cabecera, los enlaces internos o la barra **«Maquetas · 15 pantallas»** del pie de cada página.
3. Para revisarlas en móvil, abre las herramientas de desarrollo del navegador (F12) y activa la vista responsive.

> En Windows, si el navegador bloquea algún recurso local, abre la carpeta desde el explorador de archivos o sirve la carpeta con `npx serve docs/fase-3-diseno/mockups`.

## Qué es real y qué es simulado

| Real | Simulado |
| --- | --- |
| HTML semántico, CSS y estructura responsive | Datos de animales, personas y protectoras |
| Navegación entre pantallas y estados | Envío de formularios (muestra el estado de carga y un aviso) |
| Foco visible, `aria-*`, enlace «saltar al contenido» | Autenticación, permisos y sesión |
| Menú móvil, modales y cierre de avisos | Llamadas a la API |

Los formularios llevan `data-demo-form`: al enviarlos se muestra el estado de carga y un mensaje de simulación, sin salir de la página. Las fotos son marcadores de posición CSS (`.photo`) con `role="img"` y `aria-label`: en la implementación serán `<img>` reales con `alt` obligatorio.

## Mapa de pantallas

| # | Pantalla | Archivo | Ruta prevista en la SPA | Requisito |
| --- | --- | --- | --- | --- |
| 1 | Inicio | `index.html` | `/` | RF-01 |
| 2 | Catálogo | `catalogo.html` | `/animales` | RF-01 |
| 3 | Ficha del animal | `ficha.html` | `/animales/:id` | RF-01, RF-02 |
| 4 | Solicitud de adopción | `solicitud.html` | `/solicitud/:animalId` | RF-03 |
| 5 | Acceso y registro | `acceso.html` | `/acceder` | RF-06 |
| 6 | Confirmación | `confirmacion.html` | `/solicitud/:id/confirmada` | RF-03 |
| 7 | Mis solicitudes | `mis-solicitudes.html` | `/mis-solicitudes` | RF-04 |
| 8 | Panel · inicio | `panel.html` | `/panel` | RF-04, RF-05 |
| 9 | Panel · animales | `panel-animales.html` | `/panel/animales` | RF-05, RF-07 |
| 10 | Cartilla digital | `cartilla.html` | `/panel/animales/:id/cartilla` | RF-02 |
| 11 | Panel · solicitudes | `panel-solicitudes.html` | `/panel/solicitudes` | RF-04 |
| 12 | Administración | `admin.html` | `/admin` | RF-09, RF-10 |
| 13 | Errores (404 · 500 · 403 · 401) | `error.html` | `*` y rutas protegidas | RNF-11, RNF-12 |
| 14 | Perfil del adoptante | `perfil.html` | `/mi-perfil` | RF-04, RF-06 |
| 15 | Mi cartilla (lectura) | `mi-cartilla.html` | `/mi-perfil/mascotas/:id` | RF-02, RF-04 |

Las pantallas 14 y 15 cierran el recorrido del adoptante: el perfil reúne la cuenta y las mascotas adoptadas y cada tarjeta abre la cartilla en modo lectura. Las tres mascotas del perfil enlazan a la misma plantilla (`mi-cartilla.html`), que muestra el caso de Kira por ser el único con una dosis pendiente; en la aplicación real el identificador del animal selecciona el registro. La cabecera del perfil usa el logotipo vectorizado en negro y el pie en blanco (`assets/logo-protetec-negro.svg` y `logo-protetec-blanco.svg`).

## Estructura de archivos

```
mockups/
├── README.md            ← este archivo
├── assets/
│   ├── estilos.css      ← sistema de diseño en CSS (tokens de 05-ux-ui.md)
│   ├── app.js           ← menú móvil, envío simulado, modales, avisos
│   ├── logo-protetec-negro.svg  ← marca vectorizada para fondos claros
│   └── logo-protetec-blanco.svg ← marca vectorizada para el pie
├── index.html
├── catalogo.html
├── ficha.html
├── solicitud.html
├── acceso.html
├── confirmacion.html
├── mis-solicitudes.html
├── panel.html
├── panel-animales.html
├── cartilla.html
├── panel-solicitudes.html
├── admin.html
├── error.html
├── perfil.html
└── mi-cartilla.html
```

## Convenciones que la implementación debe respetar

- **Un solo sistema de estilos.** Los colores, espacios y tamaños salen de los tokens de `assets/estilos.css`, que coinciden con la guía de `05-ux-ui.md`. No se inventan valores sueltos.
- **Estados, no solo el caso ideal.** Cada pantalla documenta carga, vacío y error. En el catálogo, la tabla de animales y la bandeja de solicitudes están dibujados explícitamente.
- **Los estados se leen, no solo se colorean.** Las etiquetas de estado llevan texto («Pendiente», «En revisión»), no dependen del color y no usan solo un punto.
- **Formularios accesibles.** Etiqueta siempre visible, error junto al campo con `aria-describedby`, resumen de errores al principio con enlaces a cada campo, y `aria-invalid` cuando corresponde.
- **Tablas que se convierten en tarjetas.** Por debajo de 768 px la tabla usa `data-label` para mostrar el nombre de cada columna; no se produce desplazamiento horizontal.
- **Nada de dependencias externas.** Sin fuentes, iconos ni CDN: las maquetas funcionan sin red.
- **Los datos son inventados.** Nombres, correos, teléfonos y cifras son ficticios y no corresponden a personas reales.

## Diferencias deliberadas respecto al documento de análisis

Estas decisiones están razonadas en `docs/adr/README.md` y afectan a lo que se ve en las maquetas:

- **ADR-05 · Roles.** El registro público solo crea adoptantes. Las cuentas de personal las crea la administración; por eso `acceso.html` no ofrece elegir rol y `admin.html` lo explica.
- **ADR-06 · Cuenta obligatoria.** Para solicitar una adopción hay que tener cuenta, así que la ficha lleva a `acceso.html` antes del formulario.
- **ADR-07 · Cartilla pública resumida.** `ficha.html` muestra indicadores (vacunada, esterilizada, chip, alergia grave); el detalle clínico con lote y veterinario solo aparece en `cartilla.html`, dentro del panel.
- **ADR-08 · Recordatorios en fase 2.** No hay pantalla de notificaciones; en su lugar, el panel muestra «Próximas dosis» como aviso útil.
- **RF-12 · Supresión de cuenta.** `admin.html` incluye una cuenta anonimizada para dejar claro que el historial se conserva sin datos personales.
