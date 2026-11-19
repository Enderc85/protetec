# 3.1.1. Requisitos funcionales

Cada requisito responde a una necesidad del análisis, tiene criterios de aceptación verificables, una prioridad y una prueba asociada. Los identificadores **RF-01 a RF-04 se conservan del documento de análisis** para mantener la trazabilidad; el resto se añaden en esta fase porque el MVP los exige implícitamente.

## Actores del sistema

| Actor | Descripción | Autenticación |
|---|---|---|
| **Visitante** | Persona sin sesión. Consulta el catálogo público. | No |
| **Adoptante** | Usuario registrado que puede solicitar adopciones y seguir su estado. | Sí (`ADOPTANTE`) |
| **Personal de protectora** | Voluntario o trabajador que gestiona animales, cartillas y solicitudes de **su** centro. | Sí (`PROTECTORA`) |
| **Administrador** | Superadministrador de la plataforma: cuentas, roles y protectoras. | Sí (`ADMIN`) |

## Convenciones

- **Prioridad:** MoSCoW (`Must`, `Should`, `Could`, `Won't`).
- **Criterios:** formato *Dado / Cuando / Entonces*. Cada criterio tiene identificador `CA-xx.n`.
- **Pruebas:** `CP-xx` es el caso de prueba que verifica el requisito completo.
- **Estado de la solicitud:** `PENDIENTE`, `EN_REVISION`, `APROBADA`, `RECHAZADA`, `CANCELADA`.
- **Estado del animal:** `DISPONIBLE`, `RESERVADO`, `EN_ACOGIDA`, `ADOPTADO`, `NO_ADOPTABLE`.

## Resumen

| ID | Requisito | Prioridad | Actor principal | Depende de | Prueba |
|---|---|---|---|---|---|
| RF-01 | Catálogo público de animales | Must | Visitante | RF-05 | CP-01 |
| RF-02 | Cartilla Digital: consulta y edición | Must | Personal | RF-05 | CP-02 |
| RF-03 | Enviar solicitud de adopción | Must | Adoptante | RF-07 | CP-03 |
| RF-04 | Cambiar el estado de una solicitud | Must | Personal | RF-03 | CP-04 |
| RF-05 | Gestión de animales e imágenes | Must | Personal | RF-10 | CP-05 |
| RF-06 | Registro de adoptante | Must | Visitante | — | CP-06 |
| RF-07 | Inicio y cierre de sesión | Must | Todos | RF-06 | CP-07 |
| RF-08 | Consultar mis solicitudes | Must | Adoptante | RF-03 | CP-08 |
| RF-09 | Cancelar una solicitud | Should | Adoptante | RF-03 | CP-09 |
| RF-10 | Administrar usuarios, roles y protectoras | Must | Administrador | RF-07 | CP-10 |
| RF-11 | Recuperar la contraseña | Should | Visitante | RF-06 | CP-11 |
| RF-12 | Supresión de cuenta (RGPD) | Could | Adoptante | RF-07 | CP-12 |

---

## RF-01 · Catálogo público de animales

**Prioridad:** Must · **Actor:** Visitante · **Depende de:** RF-05 · **Prueba:** CP-01

> **Como** visitante, **quiero** explorar los animales en adopción y filtrarlos por especie, edad, tamaño y protectora, **para** encontrar uno compatible con mi hogar sin tener que registrarme.

| Criterio | Dado | Cuando | Entonces |
|---|---|---|---|
| **CA-01.1** | Un visitante sin sesión | Abre `/animales` | Ve solo animales publicados con estado `DISPONIBLE` o `RESERVADO`, 12 por página, ordenados por fecha de publicación descendente |
| **CA-01.2** | El listado visible | Aplica filtros de especie, rango de edad, tamaño y protectora | La lista se actualiza y los filtros quedan reflejados en la URL, de modo que el enlace es compartible y recargable |
| **CA-01.3** | Una combinación de filtros | No devuelve resultados | Se muestra un estado vacío con el texto "No hay animales con estos filtros" y la acción "Limpiar filtros" |
| **CA-01.4** | Un animal publicado y disponible | El visitante abre su ficha | Ve imágenes con texto alternativo, datos básicos, resumen de cartilla (vacunado al día, esterilizado, chip, alergias graves, apto para piso) y la acción "Solicitar adopción". Nunca ve el detalle clínico ni datos de otras personas |
| **CA-01.5** | Un animal adoptado, no publicado o de una protectora inactiva | Se solicita su ficha por URL | La API responde 404 y no revela su existencia |
| **CA-01.6** | Un animal con `fechaNacimiento` | Se muestra su edad o se filtra por rango | La edad se calcula en la fecha de la consulta; no existe ningún campo `edad` almacenado |
| **CA-01.7** | Un conjunto de pruebas de 5.000 animales | Se mide el listado con 50 usuarios concurrentes | El percentil 95 es inferior a 800 ms (RNF-01) |

**Reglas de negocio**

- Rangos de edad: **cachorro** &lt; 1 año, **joven** 1–3, **adulto** 4–7, **sénior** &gt; 7.
- `RESERVADO` se muestra con una etiqueta textual ("Reservado"), no solo con color (WCAG 1.4.1).
- La paginación por defecto es 12 y el máximo permitido es 48.

---

## RF-02 · Cartilla Digital: consulta y edición

**Prioridad:** Must · **Actor:** Personal de protectora (propietaria del animal) y Administrador · **Depende de:** RF-05 · **Prueba:** CP-02

> **Como** personal de protectora, **quiero** consultar y actualizar la cartilla de cada animal, **para** mantener una trazabilidad sanitaria fiable que sustituya al papel y a las hojas de cálculo.

| Criterio | Dado | Cuando | Entonces |
|---|---|---|---|
| **CA-02.1** | Personal autenticado de la protectora propietaria | Abre la cartilla de un animal | Ve vacunas (tipo, fecha, próxima dosis, veterinario, lote), alergias (descripción, gravedad), tratamientos (medicamento, dosis, inicio, fin, motivo), esterilización y observaciones, ordenados por fecha descendente |
| **CA-02.2** | El formulario de vacuna | Guarda un registro | Se exige tipo y fecha no futura; si se indica próxima dosis, debe ser posterior a la fecha de administración; en caso contrario, 422 con el error junto al campo |
| **CA-02.3** | Un animal con vacunas registradas | Se calcula su estado sanitario | Se marca "vacunado al día" solo si ninguna próxima dosis está vencida; si no hay próxima dosis registrada, el estado es "sin datos suficientes" |
| **CA-02.4** | Personal de otra protectora | Solicita la cartilla por identificador | La API responde 403 y no devuelve ningún dato clínico |
| **CA-02.5** | Un visitante sin sesión | Consulta la ficha pública del animal | Solo recibe el resumen de CA-01.4; vacunas, tratamientos y observaciones no se serializan en la respuesta pública |
| **CA-02.6** | Un registro sanitario existente | Se elimina | Se exige confirmación explícita y la operación queda registrada en el log de aplicación sin incluir datos clínicos |
| **CA-02.7** | Un animal sin cartilla creada | El personal abre su cartilla | Se crea una cartilla vacía asociada al animal y se muestra el estado vacío con la acción "Añadir primer registro" |

**Reglas de negocio**

- La cartilla es **1:1** con el animal y se crea junto con él.
- Solo se puede editar la cartilla del animal propio; el `ADMIN` puede hacerlo en modo soporte.
- El campo `proximaDosis` se guarda desde el MVP aunque los recordatorios automáticos sean de fase 2 (ADR-08).

---

## RF-03 · Enviar solicitud de adopción

**Prioridad:** Must · **Actor:** Adoptante · **Depende de:** RF-07 · **Prueba:** CP-03

> **Como** adoptante registrado, **quiero** enviar una solicitud estructurada para un animal concreto, **para** iniciar el proceso sin llamadas telefónicas ni correos y poder seguir su estado.

| Criterio | Dado | Cuando | Entonces |
|---|---|---|---|
| **CA-03.1** | Un visitante sin sesión | Pulsa "Solicitar adopción" | Se le pide iniciar sesión y, tras hacerlo, vuelve al formulario del mismo animal sin perder la selección |
| **CA-03.2** | Un adoptante autenticado y un animal `DISPONIBLE` | Envía el formulario completo con el consentimiento RGPD marcado | Se crea una solicitud `PENDIENTE`, se registra la fecha de consentimiento en servidor y se muestra una confirmación con el identificador de la solicitud |
| **CA-03.3** | Un animal `RESERVADO` o `ADOPTADO` | Intenta enviar la solicitud | 409 con el mensaje "Este animal ya no está disponible" y enlace al catálogo |
| **CA-03.4** | Una solicitud activa (`PENDIENTE`, `EN_REVISION` o `APROBADA`) del mismo usuario para el mismo animal | Intenta enviar otra | 409 con enlace a "Mis solicitudes" |
| **CA-03.5** | Un usuario que pertenece a la protectora propietaria del animal | Intenta solicitarlo | 403 por conflicto de interés |
| **CA-03.6** | Un envío sin consentimiento o con valores fuera de rango (horas solo negativas, motivación de menos de 50 caracteres) | Se valida en el servidor | 422 con errores por campo y conservación de los datos introducidos en el formulario |
| **CA-03.7** | Una solicitud recién creada | Se consulta su historial | Existe una entrada inicial `PENDIENTE` con fecha y autor |

**Campos obligatorios del formulario**

| Campo | Tipo | Regla |
|---|---|---|
| `vivienda` | Enum `PISO`, `CASA`, `OTRO` | Obligatorio |
| `viviendaAlquilada` | Booleano | Obligatorio si `vivienda = PISO` |
| `permiteAnimales` | Booleano | Obligatorio si `viviendaAlquilada = true` |
| `conviveConNinos` | Booleano | Obligatorio |
| `otrasMascotas` | Texto libre | Opcional, máximo 500 caracteres |
| `horasSolo` | Entero | Entre 0 y 24 |
| `experienciaPrevia` | Texto libre | Opcional, máximo 1.000 caracteres |
| `motivacion` | Texto libre | Entre 50 y 1.000 caracteres |
| `consentimientoRgpd` | Booleano | Debe ser `true`; la fecha la fija el servidor |

---

## RF-04 · Cambiar el estado de una solicitud

**Prioridad:** Must · **Actor:** Personal de protectora y Administrador · **Depende de:** RF-03 · **Prueba:** CP-04

> **Como** personal de protectora, **quiero** revisar las solicitudes recibidas y cambiar su estado, **para** dar transparencia al adoptante y evitar que dos personas adopten al mismo animal.

| Criterio | Dado | Cuando | Entonces |
|---|---|---|---|
| **CA-04.1** | Personal autenticado | Abre el panel de solicitudes | Solo ve solicitudes de animales de su protectora, filtrables por estado y animal, y paginadas |
| **CA-04.2** | Una solicitud `PENDIENTE` | La pasa a `EN_REVISION` | Se guarda el estado nuevo, el anterior, el usuario que lo cambió y la fecha; el adoptante lo ve en "Mis solicitudes" |
| **CA-04.3** | Una solicitud `PENDIENTE` o `EN_REVISION` | Se rechaza | Es obligatorio un motivo de al menos 10 caracteres, visible para el adoptante |
| **CA-04.4** | Una solicitud `EN_REVISION` | Se aprueba | En una única transacción: el animal pasa a `ADOPTADO`, las demás solicitudes activas de ese animal pasan a `RECHAZADA` con motivo automático y se añaden las entradas de historial |
| **CA-04.5** | Dos personas aprueban simultáneamente sendas solicitudes del mismo animal | Se ejecuta la segunda transacción | Falla con 409 y no pueden quedar dos solicitudes aprobadas (índice único parcial) |
| **CA-04.6** | Una transición no permitida (`RECHAZADA → APROBADA`, `APROBADA → CANCELADA`) | Se intenta | 409 y el estado no cambia |
| **CA-04.7** | Personal de otra protectora | Intenta cambiar el estado por identificador | 403 |
| **CA-04.8** | Cualquier cambio de estado | Se completa | La respuesta incluye el estado resultante y el adoptante lo ve reflejado en su siguiente consulta (RF-08) |

**Transiciones permitidas**

| Estado actual | Estado siguiente | Quién |
|---|---|---|
| `PENDIENTE` | `EN_REVISION`, `APROBADA`, `RECHAZADA` | Personal |
| `PENDIENTE` | `CANCELADA` | Adoptante (RF-09) |
| `EN_REVISION` | `APROBADA`, `RECHAZADA` | Personal |
| `EN_REVISION` | `CANCELADA` | Adoptante (RF-09) |
| `APROBADA` | — | Terminal |
| `RECHAZADA` | — | Terminal |
| `CANCELADA` | — | Terminal |

---

## RF-05 · Gestión de animales e imágenes

**Prioridad:** Must · **Actor:** Personal de protectora · **Depende de:** RF-10 · **Prueba:** CP-05

> **Como** personal de protectora, **quiero** dar de alta y editar los animales del refugio con sus fotos, **para** que el catálogo público refleje la realidad del centro.

| Criterio | Dado | Cuando | Entonces |
|---|---|---|---|
| **CA-05.1** | El formulario de alta | Se envía sin nombre, sin especie, sin fecha de nacimiento o sin al menos una imagen con texto alternativo | 422 con errores por campo y no se crea el animal |
| **CA-05.2** | Un animal existente | Personal de otra protectora intenta editarlo | 403 |
| **CA-05.3** | Un animal con 6 imágenes | Se intenta subir otra | 422 con el límite indicado |
| **CA-05.4** | Un archivo de imagen | Se sube | Debe ser JPG, PNG o WebP y pesar 5 MB o menos; se guarda en almacenamiento externo y se registra su URL y texto alternativo |
| **CA-05.5** | Un animal con solicitudes o historial | Se archiva | Pasa a `publicado = false`: desaparece del catálogo, pero sus datos y solicitudes se conservan |
| **CA-05.6** | Un animal | Se intenta fijar manualmente el estado `ADOPTADO` | 422: ese estado solo lo produce la aprobación de una solicitud (RF-04) |
| **CA-05.7** | Un animal con `chip` | Se guarda un chip ya existente en otro animal | 409 |
| **CA-05.8** | Una `fechaNacimiento` futura | Se guarda | 422 |

**Reglas de negocio**

- La protectora del animal se toma de la sesión; **nunca** del cuerpo de la petición.
- Cada animal tiene exactamente una imagen principal.
- El borrado es lógico; no existe borrado físico de animales con historial.

---

## RF-06 · Registro de adoptante

**Prioridad:** Must · **Actor:** Visitante · **Prueba:** CP-06

> **Como** visitante, **quiero** crear una cuenta de adoptante, **para** solicitar adopciones y consultar el estado de mis solicitudes.

| Criterio | Dado | Cuando | Entonces |
|---|---|---|---|
| **CA-06.1** | Datos válidos y política de privacidad aceptada | Se envía el registro | Se crea la cuenta con rol `ADOPTANTE` y la sesión queda iniciada |
| **CA-06.2** | Un correo ya registrado | Se envía el registro | 409 con un mensaje genérico, sin revelar el rol ni datos de la cuenta existente |
| **CA-06.3** | Una contraseña de menos de 8 caracteres o sin letras y números | Se envía | 422 con la política indicada |
| **CA-06.4** | La contraseña | Se almacena | Se guarda un hash Argon2id; la contraseña nunca se devuelve ni se registra en logs |
| **CA-06.5** | El cuerpo de la petición incluye `rol: "ADMIN"` | Se procesa | El campo se ignora y la cuenta se crea como `ADOPTANTE` |
| **CA-06.6** | La misma IP | Realiza más de 10 registros en una hora | 429 |

---

## RF-07 · Inicio y cierre de sesión

**Prioridad:** Must · **Actor:** Todos · **Depende de:** RF-06 · **Prueba:** CP-07

> **Como** usuario registrado, **quiero** iniciar y cerrar sesión de forma segura, **para** acceder a las funciones de mi rol sin exponer mis datos.

| Criterio | Dado | Cuando | Entonces |
|---|---|---|---|
| **CA-07.1** | Credenciales válidas y cuenta activa | Se inicia sesión | Se crea una sesión en base de datos y se envía una cookie `HttpOnly`, `Secure` y `SameSite=Lax`; la respuesta incluye el usuario sin el hash |
| **CA-07.2** | Credenciales inválidas | Se intenta entrar | 401 con un mensaje genérico que no distingue entre correo inexistente y contraseña incorrecta |
| **CA-07.3** | El mismo correo o IP | Acumula 5 fallos en 15 minutos | 429 |
| **CA-07.4** | Una cuenta desactivada | Intenta entrar | 403 con indicación de contactar con la protectora |
| **CA-07.5** | Una sesión iniciada | Se cierra sesión | La sesión se marca como revocada en base de datos; reutilizar la cookie anterior devuelve 401 |
| **CA-07.6** | Una sesión válida | Se consulta `/api/v1/auth/me` | Devuelve identificador, nombre, correo, rol y protectora (si procede) |
| **CA-07.7** | Una sesión sin actividad | Pasan 7 días | Caduca y obliga a volver a iniciar sesión |

---

## RF-08 · Consultar mis solicitudes

**Prioridad:** Must · **Actor:** Adoptante · **Depende de:** RF-03 · **Prueba:** CP-08

> **Como** adoptante, **quiero** consultar mis solicitudes y su estado, **para** saber en qué punto está el proceso sin tener que llamar.

| Criterio | Dado | Cuando | Entonces |
|---|---|---|---|
| **CA-08.1** | Un adoptante autenticado | Abre "Mis solicitudes" | Solo ve sus propias solicitudes, con el animal, la fecha, el estado actual y la línea de tiempo de cambios |
| **CA-08.2** | Ninguna solicitud | Abre la sección | Se muestra un estado vacío con enlace al catálogo |
| **CA-08.3** | Una solicitud aprobada | Consulta el detalle | Ve los datos de contacto de la protectora y los siguientes pasos |
| **CA-08.4** | Una solicitud rechazada | Consulta el detalle | Ve el motivo indicado por la protectora |
| **CA-08.5** | Un adoptante | Manipula la URL con el identificador de otra persona | 403/404, nunca los datos de la solicitud ajena (prueba IDOR) |

---

## RF-09 · Cancelar una solicitud

**Prioridad:** Should · **Actor:** Adoptante · **Depende de:** RF-03 · **Prueba:** CP-09

> **Como** adoptante, **quiero** retirar una solicitud que ya no deseo, **para** no bloquear al animal ni al equipo de la protectora.

| Criterio | Dado | Cuando | Entonces |
|---|---|---|---|
| **CA-09.1** | Una solicitud propia `PENDIENTE` o `EN_REVISION` | Se cancela y se confirma | Pasa a `CANCELADA` con entrada de historial y el animal vuelve a estar disponible si lo estaba |
| **CA-09.2** | Una solicitud `APROBADA` | Se intenta cancelar | 409 con indicación de contactar con la protectora |
| **CA-09.3** | Una solicitud ajena | Se intenta cancelar | 403 |
| **CA-09.4** | Una solicitud cancelada | El adoptante vuelve a solicitarla | Se permite, porque ya no hay solicitud activa para ese animal |

---

## RF-10 · Administrar usuarios, roles y protectoras

**Prioridad:** Must · **Actor:** Administrador · **Depende de:** RF-07 · **Prueba:** CP-10

> **Como** administrador de la plataforma, **quiero** gestionar protectoras y cuentas de personal, **para** que cada centro acceda solo a sus datos.

| Criterio | Dado | Cuando | Entonces |
|---|---|---|---|
| **CA-10.1** | Datos válidos | Se crea una protectora | Se guarda con CIF único; un CIF repetido devuelve 409 |
| **CA-10.2** | Una protectora existente | Se crea una cuenta de personal | Se asocia obligatoriamente a esa protectora, se marca `debeCambiarPassword` y se le entrega una contraseña temporal |
| **CA-10.3** | El listado de usuarios | Se filtra por rol, protectora o estado | Devuelve solo los campos necesarios (nunca el hash) y está paginado |
| **CA-10.4** | Una cuenta de personal | Se desactiva | No puede iniciar sesión (CA-07.4) y sus datos se conservan para el historial |
| **CA-10.5** | El propio administrador | Intenta desactivar su cuenta | 409 |
| **CA-10.6** | El último administrador activo | Intenta degradar su rol | 409 |
| **CA-10.7** | Un usuario sin rol `ADMIN` | Intenta usar cualquier ruta `/api/v1/admin/*` | 403 |
| **CA-10.8** | Cualquier acción privilegiada | Se completa | Queda registrada con actor, acción, objetivo y fecha, sin contraseñas ni tokens |

---

## RF-11 · Recuperar la contraseña

**Prioridad:** Should · **Actor:** Visitante · **Depende de:** RF-06 · **Prueba:** CP-11

> **Como** usuario, **quiero** recuperar el acceso a mi cuenta, **para** no quedarme bloqueado si olvido la contraseña.

| Criterio | Dado | Cuando | Entonces |
|---|---|---|---|
| **CA-11.1** | Un correo cualquiera | Se solicita la recuperación | La API responde siempre 202 en el mismo tiempo aproximado, exista o no la cuenta (no se enumera usuarios) |
| **CA-11.2** | Una cuenta existente | Se genera el token | Se crea un token aleatorio de 32 bytes, se guarda **hasheado**, caduca en 1 hora y solo puede usarse una vez |
| **CA-11.3** | Un token válido | Se establece la nueva contraseña | Se actualiza el hash y se revocan todas las sesiones abiertas del usuario |
| **CA-11.4** | Un token caducado o ya usado | Se intenta usar | 400 con un mensaje genérico y enlace para solicitar otro |
| **CA-11.5** | La misma IP | Solicita más de 5 recuperaciones en una hora | 429 |

> El envío del correo se documenta como dependencia externa: en desarrollo se registra en el log y en producción se usará un proveedor transaccional (ver riesgos).

---

## RF-12 · Supresión de cuenta (RGPD)

**Prioridad:** Could · **Actor:** Adoptante · **Depende de:** RF-07 · **Prueba:** CP-12

> **Como** adoptante, **quiero** solicitar la supresión de mi cuenta y mis datos personales, **para** ejercer mi derecho de supresión.

| Criterio | Dado | Cuando | Entonces |
|---|---|---|---|
| **CA-12.1** | Un adoptante autenticado | Solicita la supresión y confirma con su contraseña | Se anonimizan nombre, correo, teléfono y contraseña; la cuenta queda inutilizable |
| **CA-12.2** | Una cuenta anonimizada | Se intenta iniciar sesión | 401, sin revelar que la cuenta existió |
| **CA-12.3** | Solicitudes del usuario suprimido | Se consultan desde el panel de la protectora | Se conservan por trazabilidad legal, asociadas a un usuario anonimizado y sin datos personales |
| **CA-12.4** | Un administrador | Ejecuta la supresión a petición del usuario | La acción queda registrada con actor, fecha y base de la solicitud |

> Se aplica **anonimización**, no borrado en cascada, para no destruir el historial de adopciones. La justificación está en el modelo de datos (regla RI-09).

---

## Priorización MoSCoW

| Funcionalidad | Prioridad | Motivo |
|---|---|---|
| Catálogo público (RF-01) | **Must** | Es la puerta de entrada del producto y el problema de visibilidad del análisis |
| Cartilla Digital (RF-02) | **Must** | Elemento diferencial y requisito legal de trazabilidad (Ley 7/2023) |
| Solicitud de adopción (RF-03) | **Must** | Sustituye el proceso manual de 3 a 5 días |
| Estados de la solicitud (RF-04) | **Must** | Da transparencia y evita duplicidades |
| Gestión de animales (RF-05) | **Must** | Sin datos reales no hay catálogo |
| Registro (RF-06) y sesión (RF-07) | **Must** | Base del control de acceso por roles |
| Mis solicitudes (RF-08) | **Must** | Es el "estado en tiempo real" que motiva la cuenta obligatoria |
| Administración de usuarios (RF-10) | **Must** | Sin ella no se pueden crear cuentas de protectora de forma segura |
| Cancelar solicitud (RF-09) | **Should** | Mejora la operativa, pero el personal puede gestionarlo |
| Recuperación de contraseña (RF-11) | **Should** | Evita cuentas bloqueadas, pero no impide la demo |
| Supresión de cuenta (RF-12) | **Could** | Obligación legal, pero puede resolverse manualmente en la primera versión |
| Recordatorios automáticos por correo | **Won't** (fase 2) | Requiere cron, proveedor de correo y gestión de rebotes; el dato ya se modela (ADR-08) |
| Exportación del contrato en PDF | **Won't** (fase 2) | Valor añadido, no imprescindible para demostrar el objetivo |
| Recomendación con IA | **Won't** | Fuera de alcance declarado en el análisis |

## Trazabilidad requisito → prueba

| Requisito | Necesidad del análisis | Decisión de diseño | Prueba | Tipo |
|---|---|---|---|---|
| RF-01 | Catálogo actualizado y filtrable | Paginación + filtros en URL + 404 en no públicos | CP-01 | Integración + E2E |
| RF-02 | Trazabilidad sanitaria | Tablas 1:N + resumen público | CP-02 | Integración |
| RF-03 | Sustituir el trámite manual | Solicitud con cuenta + consentimiento | CP-03 | Integración |
| RF-04 | Transparencia y no duplicidad | Máquina de estados + transacción | CP-04 | Integración + concurrencia |
| RF-05 | Datos reales en el catálogo | CRUD con aislamiento por protectora | CP-05 | Integración |
| RF-06 | Acceso de adoptantes | Registro solo `ADOPTANTE` | CP-06 | Integración |
| RF-07 | Seguridad (RNF-01 del análisis) | Sesión opaca revocable | CP-07 | Integración + manual |
| RF-08 | Estado en tiempo real | Consulta propia con línea de tiempo | CP-08 | Integración |
| RF-09 | No bloquear animales | Cancelación con reglas | CP-09 | Integración |
| RF-10 | Control de acceso por roles | Admin de plataforma + multi-protectora | CP-10 | Integración |
| RF-11 | Usabilidad | Token de un solo uso | CP-11 | Integración |
| RF-12 | RGPD (derecho de supresión) | Anonimización con historial | CP-12 | Integración |

## Comprobación de calidad de los requisitos

- [x] Cada requisito responde a una necesidad real del análisis.
- [x] Está redactado de forma clara y sin ambigüedades.
- [x] Tiene criterios de aceptación comprobables.
- [x] Se conoce qué perfil lo necesita.
- [x] Está priorizado con MoSCoW.
- [x] Se han identificado sus dependencias.
- [x] Se puede relacionar con una tarea de implementación y una prueba.
- [x] No se han añadido funcionalidades solo por interés tecnológico.
