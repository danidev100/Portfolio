# «Pregúntale a mi IA» con Claude real (V2)

- **Fecha:** 2026-10-20
- **Estado:** propuesta aprobada por Daniel en conversación; pendiente de revisión del spec escrito.
- **Origen:** segunda etapa de `HANDOFF.md` (decisión 5: contrato de IA estable entre V1 y V2).
- **Propuesta visual:** canvas «Dani OS · IA real (V2)» (flujo, estados de la Terminal y plan).

## 1. Intención

Un reclutador o líder técnico abre la Terminal y pregunta lo que quiera sobre Daniel. Hoy contesta un guion de tres respuestas y un buscador por palabras clave. V2 contesta con Claude, en streaming, **solo con lo que dice la base de conocimiento de Daniel** (su CV), ilumina en el grafo los nodos que cita y, si el dato no está, lo dice y ofrece Contacto.

Es también una pieza del portafolio en sí: Daniel se presenta como AI App Developer, y esta función es la prueba. Un fallo visible (inventar un dato, responder sobre cualquier tema, una factura inesperada) daña más de lo que suma.

## 2. Objetivos, no-objetivos y anti-objetivos

**Objetivos**

- Respuestas concretas y verificables sobre experiencia, logros, skills, proyectos y forma de trabajar, basadas en la base de conocimiento.
- El grafo sigue a la respuesta: cada pasaje citado enciende su nodo.
- Gasto acotado: **$5 USD/mes**, con un tope duro que nadie puede saltarse.
- La UI no cambia: mismo contrato `AskEvent`, mismo `AskPanel`, mismo grafo.

**No-objetivos (V2)**

- Conversación con memoria: cada pregunta va sola, sin historial.
- Búsqueda vectorial o embeddings (ver §4.1).
- Panel de analítica de preguntas.
- Herramientas, navegación web o acciones de la IA dentro de Dani OS.

**Anti-objetivos (fallaría aunque funcione)**

- Que invente o exagere un dato que no está en la base.
- Que sirva de chatbot gratis para cualquier tema (código, tareas, otros temas).
- Que el gasto supere lo acordado o que la key llegue al navegador.
- Que la IA entre en la carga inicial y baje Lighthouse.
- Que los e2e o CI llamen a Claude y gasten dinero.

## 3. Decisiones tomadas

| Decisión        | Elegido                                                                        | Descartado y por qué                                                                        |
| --------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| Acceso a Claude | API key de Claude Console (pago por uso) con límite de gasto mensual           | Suscripción Pro/Max: es para uso personal y no puede servir a visitantes de una web pública |
| Presupuesto     | $5 USD/mes                                                                     | —                                                                                           |
| Modelo          | `claude-sonnet-5-5` (elección de Daniel), configurable por variable de entorno | —                                                                                           |
| Hosting         | Render, servicio existente `Portfolio` (`srv-db33bjid0e5s73f01d3g`)            | Mudarse a otro hosting                                                                      |
| Recuperación    | Toda la base en contexto, cacheada                                             | RAG vectorial: la base cabe entera y una búsqueda que falla es peor que ninguna             |
| Foco del grafo  | Derivado de las citas de Claude                                                | Pedir ids en el texto o con una herramienta: frágil o con una vuelta extra                  |
| Transporte      | SSE desde un Route Handler de Next, validado con `zod` en el cliente           | Ya decidido en `CLAUDE.md`                                                                  |

## 4. Diseño

### 4.1 Base de conocimiento

- Un pasaje por nodo del grafo (`GRAPH_NODES` en `terminal/util/graph.ts`) más un pasaje general (resumen, contacto, cómo trabaja).
- Tipado contra los ids del grafo, de modo que un nodo sin pasaje sea un error de tipos o un test fallido.
- Se envía a Claude como **documento de contenido propio con citas activadas**: un bloque de contenido por pasaje, en orden estable. Una cita devuelve el índice del bloque, y ese índice se traduce a `nodeId`.
- Tamaño esperado: 4–6 mil tokens. Si un día la base crece mucho (casos de estudio, posts), entonces se evalúa recuperación; el cambio queda dentro del servidor.
- El texto lo redacta o aprueba Daniel desde su CV (ver §8).

### 4.2 Petición a Claude

En este orden, para que la caché funcione (lo estable primero, lo que cambia al final):

1. `system`: identidad («la IA de Daniel», habla en primera persona como Daniel), reglas de alcance, tono breve y concreto, responder en el idioma de la pregunta, y el comportamiento ante un dato ausente: decirlo sin inventar y ofrecer Contacto.
2. Documento de la base de conocimiento, con `cache_control`.
3. La pregunta del visitante.

Parámetros: streaming; `max_tokens` bajo, suficiente para 2–4 párrafos cortos; effort `low` (es chat); `fallbacks: "default"` con la beta `server-side-fallback-2026-07-01` para que un rechazo del clasificador no deje la respuesta vacía. El modelo se lee de `ANTHROPIC_MODEL` con `claude-sonnet-5-5` por defecto.

### 4.3 Servidor: `POST /api/ask`

- Route Handler delgado en `src/app/api/ask/route.ts`, sin `Edge`: runtime Node, que es lo que corre en Render.
- La lógica (armar la petición y traducir el stream) vive en el dominio `terminal`, en `data-access`, marcada `server-only` y expuesta por una entrada pública solo de servidor, para que nunca entre en el bundle del cliente.
- Entrada: `{ question: string }`, validada (no vacía, ≤ 500 caracteres).
- Salida: `text/event-stream`, un evento `AskEvent` por mensaje:
  - texto de Claude → `token`;
  - cada cita nueva → `focus_nodes` con el **conjunto acumulado** (`applyAskEvent` ya reemplaza el foco);
  - fin → `done`;
  - fallo, rechazo o límite → `error` con un mensaje para el visitante, nunca detalles internos.
- Si el visitante cancela (`AbortSignal` de la petición), se aborta la llamada a Claude.
- Sin `ANTHROPIC_API_KEY`: responde con un error controlado, no se cae.

### 4.4 Cliente

- Un `AskService` SSE en `terminal/data-access` que hace `POST /api/ask`, lee el stream y valida cada evento con `zod`; un evento inválido se convierte en `error`.
- `useAskStore.ts` crea este servicio en lugar del simulado. Es el único cambio de cableado.
- El simulado se conserva para tests unitarios y desarrollo.
- Las preguntas sugeridas siguen respondiendo desde el guion local (`askAnswers.ts`), instantáneas y sin gasto. Una pregunta escrita a mano que coincide exactamente con una sugerida (sin distinguir mayúsculas ni tildes) también usa el guion. El clic en un nodo no cambia. _(Decisión del implementador.)_
- «Ofrecer Contacto» es texto dentro de la respuesta, no un enlace: la UI no cambia en V2. Un botón que abra la app Contacto queda como mejora posterior. _(Decisión del implementador.)_

### 4.5 Protección del gasto

Render no permite reglas de firewall ni rate limit configurables por el cliente (su protección DDoS no es configurable). La protección se hace en capas:

1. **Tope duro: Claude Console.** Límite de gasto mensual de $5. Si se alcanza, la API rechaza y la Terminal muestra el mensaje de límite. Es la garantía real.
2. **Límite en la app (obligatorio).** El servicio corre en **una sola instancia** (`numInstances: 1`), así que un limitador en memoria es exacto sin Redis:
   - por IP: 10 preguntas cada 10 minutos (la IP del visitante sale de `x-forwarded-for`, que pone el proxy de Render);
   - global por día: un tope blando que frena ráfagas. El plan gratuito duerme la instancia tras 15 minutos y el contador vuelve a cero, así que **no reparte el presupuesto a lo largo del mes**: eso solo lo garantiza el tope de Console. No se añade almacenamiento persistente en V2. _(Decisión del implementador.)_
   - Al superarlo: HTTP 429 y un evento `error` con el texto de límite de §4.8.
3. **Borde con Cloudflare (opcional, ver §8).** Si Daniel mueve los nameservers del dominio de Hostinger a Cloudflare (gratis) y lo proxifica, una regla gratuita de rate limiting sobre `/api/ask` frena el abuso antes de llegar a Render. No sustituye a la capa 2.

### 4.6 Render

Estado actual verificado por MCP (2026-10-20):

| Campo         | Valor                                                                                  |
| ------------- | -------------------------------------------------------------------------------------- |
| Servicio      | `Portfolio`, web service Node, región Virginia                                         |
| Plan          | `free`, 1 instancia                                                                    |
| Build / start | `pnpm install --frozen-lockfile --prod=false && pnpm build` / `pnpm start`             |
| Deploy        | automático en cada commit a `main` (`autoDeployTrigger: commit`); último live: 947a55a |
| Health check  | ninguno                                                                                |
| URL           | `https://portfolio-ysa4.onrender.com`                                                  |

Cambios propuestos (los hace Daniel desde el dashboard o se aplican por MCP con su visto bueno):

1. Variables de entorno: `ANTHROPIC_API_KEY` (secreto; la pega Daniel, no pasa por el chat) y `ANTHROPIC_MODEL=claude-sonnet-5-5`. **Antes** del merge, porque el deploy es automático.
2. `autoDeployTrigger: checksPass`, para que un `main` con CI en rojo no se despliegue.
3. Health check en una ruta barata (`/` o una dedicada) para que Render no dé por bueno un deploy roto.

Limitación conocida del plan gratuito: la instancia se duerme tras 15 minutos sin tráfico y la primera visita tarda ~30–50 s en despertar. Afecta a todo el sitio, no solo a la IA; no se resuelve en V2.

### 4.7 Costo

Sonnet 5.5: $2 / $10 por millón de tokens; escribir en caché cuesta 1,25× la entrada y leerla $0.20. La caché por defecto dura 5 minutos. Con ~5 mil tokens de base y ~250 de respuesta:

| Caso                                                 | Costo por pregunta |
| ---------------------------------------------------- | ------------------ |
| Caché caliente (otra pregunta en los últimos 5 min)  | ≈ $0.0035          |
| Caché fría (primera pregunta tras 5 min de silencio) | ≈ $0.015           |

Un portafolio tiene tráfico disperso, pero cada visitante suele preguntar varias cosas seguidas: la primera paga la caché y las siguientes la aprovechan. Con 3–4 preguntas por visita, el promedio ronda **$0.006–0.007**, es decir, **unas 700–800 preguntas por $5**, no 1.000. Para acercarse a 1.000, la base debe quedarse lo más corta posible. Hay que medir con `usage.cache_read_input_tokens` y `cache_creation_input_tokens` en la primera semana y ajustar.

### 4.8 Textos fijos

| Estado                          | Texto                                                                                                     |
| ------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Límite (por IP o diario)        | «Ya respondí muchas preguntas seguidas. Dame unos minutos, o explora mientras tanto los nodos del grafo.» |
| Fallo de Claude o sin key       | El mensaje actual de `askStore`: «No pude responder a esa pregunta. Inténtalo de nuevo.»                  |
| Dato ausente (lo genera Claude) | Dice que no está en su CV, no lo inventa y sugiere escribir desde Contacto.                               |

Los estados visuales A (respuesta con citas), B (dato ausente) y C (límite) están en el canvas; los e2e y los casos de axe cubren A y C.

## 5. Calidad y pruebas

- **Unitarios (Jest):** traducción del stream de Claude a `AskEvent` con un stream simulado (texto, citas → nodos acumulados, rechazo, error, cancelación); validación de entrada; limitador (por IP, global, ventana); cliente SSE (eventos válidos, inválidos, corte de conexión); base de conocimiento completa respecto al grafo.
- **E2E (Playwright):** interceptan `/api/ask` y sirven un stream fijo. Nunca llaman a Claude. Se mantiene el caso de axe de la Terminal y se añaden los estados de respuesta con foco y de límite.
- **Set de preguntas de prueba:** ~20 preguntas de reclutador, incluidas fuera de alcance, trampas («inventa un proyecto»), otro idioma y temas delicados. Se corre a mano antes de publicar, fuera de CI, porque gasta.
- **Lighthouse:** sin cambios esperados; nada de la IA entra en la carga inicial.
- Dependencias nuevas, instaladas en la entrega que las usa: `@anthropic-ai/sdk` y `zod`.

## 6. Entregas

1. Base de conocimiento (contenido + tipos + test de cobertura del grafo).
2. Servidor `/api/ask`: petición, traducción del stream, errores, limitador.
3. Cliente SSE y cambio en `useAskStore`; e2e con la ruta interceptada.
4. Render: variables, trigger de deploy, health check; tope en Console; merge y verificación en producción.
5. (Opcional) Cloudflare delante del dominio.

Limpieza del repo (sueltos sin trackear, ramas mergeadas, parches de dependencias) va aparte, fuera de esta funcionalidad.

## 7. Lo que queda al implementador

- Nombres de archivos y funciones dentro de las reglas de dominio × tipo.
- Redacción exacta del prompt de sistema, con el set de preguntas como criterio.
- Forma del limitador y de sus constantes con nombre.
- Formato SSE concreto (`data:` con JSON por evento).

## 8. Pendiente de Daniel

0. **Qué pasa cuando se acaba el presupuesto** (ver §4.7): si el mes se agota antes de tiempo, ¿la Terminal muestra error hasta el día 1, vuelve al buscador local de V1, o se sube el tope?

1. **Fuente del CV:** el PDF publicado (`public/cv/daniel-jaramillo-bustamante-cv.pdf`) o el nuevo `CV_Daniel_Jaramillo_AI_Native.pdf` de la raíz; y si la IA debe saber algo que no esté en el CV. Los hechos se toman de `src/profile/util/profile.ts`, que ya alimenta el CV en pantalla, para que la IA y el CV no se contradigan; los pasajes por nodo añaden solo el relato. _(Decisión del implementador.)_
2. **Temas delicados:** salario, disponibilidad, motivo de salida, ubicación o modalidad. ¿Responde con un dato fijo, o deriva siempre a Contacto?
3. **Cloudflare:** ¿mover los nameservers de Hostinger a Cloudflare para tener rate limit en el borde?
4. **Dominio en Render:** el servicio usa el plan gratuito; hay que confirmar que el dominio de Hostinger apunta a él y cuál es, para la regla de Cloudflare y la verificación final.
