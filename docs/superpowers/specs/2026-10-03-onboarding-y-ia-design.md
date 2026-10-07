# Onboarding, «Perfil y CV» y «Pregúntale a mi IA»

- **Fecha:** 2026-10-03
- **Estado:** diseño aprobado por secciones en conversación; pendiente de revisión del spec escrito.
- **Origen:** feedback de pruebas con usuarios del portafolio.

## 1. Contexto y problema

Dos hallazgos de pruebas con usuarios:

1. **Escritorio.** Un visitante que no conoce Linux llega al escritorio y no sabe dónde está el contenido. Causas observadas en la versión actual:
   - El dock son cuatro iconos sin texto; el nombre solo aparece al pasar el ratón.
   - La única instrucción («Abre una app desde el dock para empezar») es la línea más pequeña y tenue de la pantalla, y usa la palabra «dock».
   - Las siluetas 3D del fondo parecen ventanas clicables y no lo son.
   - «Actividades» es jerga de GNOME.
2. **Terminal.** Un usuario de prueba solo jugó con el grafo: no vio el panel de la IA ni entendió que puede preguntar. Causas:
   - El grafo ocupa dos tercios de la ventana, se mueve y es lo primero que responde al clic.
   - El panel de la IA es estrecho, con texto tenue, y su invitación parece una descripción, no una llamada a actuar.
   - Al pulsar un nodo cambia el texto del panel, pero nada lleva la vista hacia allí.
   - El nombre «Terminal» no dice «pregúntale a la IA».

## 2. Objetivo y criterios de éxito

**Visitante objetivo:** un reclutador o líder técnico con un par de minutos, sin experiencia en Linux.

**Prioridad en los primeros 30 segundos:** ver el perfil y el CV. La IA y los proyectos son el siguiente paso.

**Criterios de éxito:**

- Sin ayuda externa, el visitante llega a «Perfil y CV» y puede descargar el CV.
- Quien abre la app de IA entiende de inmediato que puede preguntar, y la mayoría hace al menos una pregunta.
- Quien salta el recorrido guiado tampoco se pierde: la pantalla se explica sola.
- Nada de lo anterior rompe la accesibilidad (axe WCAG 2.2 AA en verde), el rendimiento ni el comportamiento actual de ventanas, rutas y foco.

## 3. Decisiones tomadas

| Decisión                   | Elegido                                                       | Descartado                                              |
| -------------------------- | ------------------------------------------------------------- | ------------------------------------------------------- |
| Enfoque del onboarding     | A: señales claras + recorrido corto de 3 globos               | B: solo recorrido; C: recorrido interactivo paso a paso |
| Destino prioritario        | Perfil y CV                                                   | IA, proyectos, recorrido por las tres                   |
| Contenido del CV           | «Sobre mí» ampliado a CV en pantalla + descarga en PDF        | Solo uno de los dos; dejarlo como está                  |
| Nombre de la app de IA     | «Pregúntale a mi IA» (dock: «Mi IA»)                          | «Asistente IA», «Terminal · Asistente IA», «Terminal»   |
| Nombre de «Sobre mí»       | «Perfil y CV» (dock: «Perfil»)                                | —                                                       |
| Nombre de «Actividades»    | «Ventanas»                                                    | —                                                       |
| Etiqueta de la IA simulada | Etiqueta «Demo» visible                                       | Ocultar que es simulada                                 |
| PDF publicado              | Tal cual, con teléfono, y con el enlace de LinkedIn corregido | Versión sin teléfono                                    |
| Siluetas 3D del fondo      | Siguen decorativas                                            | Hacerlas clicables                                      |

Las URLs no cambian: `/about`, `/projects`, `/terminal` y `/contact`. Los `AppId` internos tampoco (`about`, `terminal`…); solo cambia lo que ve el visitante.

## 4. Diseño

### 4.1 Escritorio legible

**Bienvenida.** Reemplaza al saludo actual en el centro del escritorio y se ve cuando no hay ventanas encima.

- Encabezado `h1`: «Daniel Jaramillo». Debajo: «Frontend Tech Lead · AI App Developer». «Dani OS» se queda en el título de la pestaña.
- Una línea: «Este portafolio funciona como un escritorio: cada sección se abre en su propia ventana.»
- Tres botones:
  - «Ver mi perfil y CV» (principal, en color)
  - «Ver proyectos»
  - «Pregúntale a mi IA»
- Los botones son enlaces a las rutas de cada app y abren las ventanas con la misma lógica que el dock. Comparten la regla de no navegar a la ruta actual y funcionan sin JavaScript (llevan a las páginas directas).

**Dock con nombres visibles.** Cada icono muestra su nombre debajo, siempre, también en móvil. Cada app tiene dos nombres:

| `AppId`    | Nombre corto (dock) | Nombre completo (ventana, tooltip, Ventanas, título de página) |
| ---------- | ------------------- | -------------------------------------------------------------- |
| `about`    | Perfil              | Perfil y CV                                                    |
| `projects` | Proyectos           | Proyectos                                                      |
| `terminal` | Mi IA               | Pregúntale a mi IA                                             |
| `contact`  | Contacto            | Contacto                                                       |

`AppDefinition` gana un campo `shortTitle`. El nombre accesible del enlace del dock sigue siendo el nombre completo (más «, abierta» cuando corresponde). El nombre corto visible queda dentro del nombre accesible, así que se cumple «label in name».

**Barra superior.**

- «Actividades» pasa a «Ventanas». El panel que abre ya se titula «Ventanas abiertas».
- Botón nuevo «Guía», que relanza el recorrido.

### 4.2 Recorrido de globos

**Cuándo aparece:**

- En la primera visita al escritorio, un momento después de la primera pintura (no antes de hidratar).
- Nunca en las páginas directas.
- Se marca como visto al terminarlo o saltarlo (`localStorage`, clave versionada `dani-os:onboarding:v1`).
- El botón «Guía» lo relanza siempre.
- Si `localStorage` no está disponible o falla, el recorrido sale en cada visita y se puede saltar igual. El error no se silencia: se trata como «no visto».

**Pasos.** Todos anclados al dock, que siempre está visible aunque haya ventanas abiertas:

| Paso   | Ancla          | Texto                                                                                                           |
| ------ | -------------- | --------------------------------------------------------------------------------------------------------------- |
| 1 de 3 | Icono «Perfil» | «Empieza aquí: mi perfil, experiencia y CV para descargar.»                                                     |
| 2 de 3 | Dock completo  | «Cada icono abre una sección en su propia ventana. Ciérrala con ✕ o vuelve a pulsar su icono para minimizarla.» |
| 3 de 3 | Icono «Mi IA»  | «Pregúntale a mi IA por mi experiencia: responde y te muestra en un grafo de qué está hablando.»                |

**Controles y fin:**

- «Siguiente», «Anterior» (desde el paso 2) y «Saltar guía».
- El paso 3 cierra con «Ver mi perfil y CV», que termina el recorrido y abre esa ventana, y con «Terminar».
- Si durante el recorrido el visitante abre cualquier app desde el dock, la bienvenida o «Ventanas», el recorrido termina y se marca como visto. Una navegación del navegador (atrás o adelante) no lo cierra.
- Escape equivale a «Saltar guía».

**Presentación:**

- Globo `rounded-card` encima del dock, con flecha hacia el ancla y un anillo que resalta el ancla.
- Sin capa que oscurezca ni bloquee la página.
- Aparece con un fundido corto y respeta «reducir movimiento».
- El ancho es `min(20rem, ancho de pantalla − márgenes)` y el globo se ajusta en horizontal para no salirse en móvil.
- Se recoloca cuando cambia el tamaño de la ventana del navegador.

**Accesibilidad:**

- El globo es `role="dialog"` no modal, con título y la posición «Paso N de 3».
- Al abrirse recibe el foco; al cerrarse, el foco vuelve al elemento que lo tenía.
- Escape lo cierra.

**Estructura (todo en el dominio `desktop`):**

| Pieza                              | Tipo        | Responsabilidad                                                                                       |
| ---------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------- |
| `util/tourSteps.ts`                | util        | Los pasos como datos (ancla, título, texto) y el avance o retroceso entre pasos, como funciones puras |
| `data-access/onboardingStorage.ts` | data-access | Leer y guardar «visto» de forma tolerante a fallos de `localStorage`                                  |
| `ui/TourBalloon.tsx`               | ui          | Globo presentacional: contenido, botones y posición calculada a partir del rectángulo del ancla       |
| `feature/OnboardingTour.tsx`       | feature     | Decide si se muestra, avanza los pasos, escucha la apertura de apps y lo cierra                       |

Los anclas se localizan por `id` del DOM: los iconos del dock ya tienen `getDockItemId(id)` y el dock completo recibe un `id` estable. No hay dependencias nuevas.

### 4.3 «Pregúntale a mi IA»

**Disposición:**

- Ventana ancha (contenedor ≥ `@3xl`): el chat va a la izquierda, con 24 rem de ancho, y el grafo a la derecha.
- Estrecha: el chat va arriba y el grafo debajo.

**Chat:**

- Cabecera: título «Pregúntale a mi IA» con la etiqueta «Demo», y la línea «Respondo sobre mi experiencia, proyectos y stack a partir de mi CV».
- La etiqueta «Demo» lleva el texto accesible «Respuestas de demostración; la versión con IA real llega pronto».
- Formato de burbujas: la pregunta del visitante a la derecha y la respuesta de la IA a la izquierda. Se quita la caja de consola y el prompt `dani@fedora`.
- Mensaje de bienvenida: la primera vez que se abre la app en cada carga de página (estado en memoria, no persistido) llega escribiéndose, como una respuesta en streaming: «Hola, soy la IA de Daniel. Pregúntame por mi experiencia, mis proyectos o cómo trabajo.» Las siguientes veces se muestra completo. Con «reducir movimiento» aparece completo desde el principio.
- Sugerencias bajo la bienvenida, con el rótulo «Prueba con:», como botones bien visibles en color de IA.
- El campo de texto recibe el foco al abrir la ventana solo con puntero fino (escritorio), para no sacar el teclado en móvil.
- Se mantienen `aria-busy` durante el streaming y el estado de error.
- El store sigue guardando un único intercambio, no un historial.

**Grafo como respuesta visual:**

- Antes de la primera pregunta, una píldora sobre el grafo: «← Pregunta en el chat y aquí verás de qué hablo». En la disposición apilada, la flecha apunta hacia arriba. La píldora se oculta tras la primera interacción.
- Al pulsar un nodo, el chat muestra el intercambio como pregunta y respuesta: «¿Con qué se conecta Design System?» y la descripción de sus conexiones. `selectNode` del store pasa a fijar también `question`.

**Lo que no cambia:** el contrato `AskService`, el servicio simulado, el streaming, el grafo 3D y su encuadre.

### 4.4 «Perfil y CV»

Contenido estático en `profile/util/profile.ts`, traducido al español desde el CV. El componente de la app (`AboutApp`) lo pinta en este orden.

1. **Cabecera:** «Daniel Jaramillo Bustamante», «Frontend Tech Lead · AI App Developer», «Colombia · UTC−5». Resumen:
   > Frontend Tech Lead con más de 9 años construyendo frontends escalables y liderando equipos. Llevo a producción arquitecturas de microfrontends con Angular, Nx y Native Federation, y design systems que los equipos adoptan de verdad. Introduje flujos de desarrollo AI-native (Claude CLI, MCP) en un equipo en producción y hoy profundizo en AI SDKs con streaming y tool-calling.
2. **Acciones:** «Descargar CV (PDF)» (principal) y «Contactar» (enlace a `/contact`, que abre la ventana de Contacto desde el escritorio).
3. **Experiencia:**
   - **Home Power Colombia** — Frontend Tech Lead — nov 2024 – sep 2026
     - Introduje flujos de desarrollo AI-native en el equipo, integrando Claude CLI y Claude Design en entornos MCP para acotar e implementar MVPs, con visibilidad para negocio sobre lo que venía a partir de la librería de componentes.
     - Lideré un equipo frontend de 7 desarrolladores y definí los estándares de arquitectura Angular y las buenas prácticas del equipo.
     - Diseñé y construí el design system corporativo: 60% de adopción en producción y mucho menos tiempo de desarrollo de UI.
     - Estandaricé quality gates automáticos (SonarQube, Husky) en CI/CD, que priorizan y validan los problemas antes de que lleguen a QA.
     - Construí los pipelines de CI/CD para entregar la app móvil a QA (TestFlight): −90% de esfuerzo manual de entrega y ciclos de release más rápidos.
     - Stack: Angular, React Native, Claude CLI, Claude Design, MCP, Tailwind, Native Federation, Signals, RxJS, Nx, Node.js, Express, AWS, GitHub Actions, Jest.
   - **Globant** — Web UI Developer Ssr — mar 2022 – nov 2024
     - Mantuve y evolucioné bases de código Angular legadas mientras entregaba funcionalidades nuevas en plataformas de clientes enterprise.
     - Apliqué metodologías estándar de desarrollo y despliegue para mejorar la eficiencia y la integridad del código en cada release.
     - Cumplí los objetivos de cada sprint dentro de los plazos comprometidos.
     - Facilité la comunicación entre los equipos técnicos y de procesos para mejorar el diseño y el desarrollo del producto.
     - Stack: Angular, Kendo UI, Node.js, SASS, AWS, Dynamics 365.
   - **ARUS** — Automation Analyst — mar 2017 – 2022
     - Entregué plataformas web que ampliaron el acceso de los clientes a información crítica, dando soporte a las mesas de servicio de cerca del 30% de la base de clientes.
     - Llevé el 50% de los algoritmos de IA de la organización a interfaces web intuitivas, con retorno medible: mi primer contacto con IA en producción.
     - Lideré sesiones de colaboración entre equipos multidisciplinarios aplicando prácticas técnicas de referencia.
     - Facilité la comunicación entre los equipos técnicos y de procesos para mejorar el diseño del producto.
     - Stack: Electron, Angular, Node.js, AWS, MySQL, MongoDB.
4. **Skills**, con los grupos y niveles del CV:
   - **Lenguajes:** JavaScript (avanzado), TypeScript (avanzado), Node.js (avanzado), Python (básico).
   - **Ingeniería AI-native:** Claude CLI (medio-avanzado, en producción), MCP (medio-avanzado), Claude Design (medio), implementación, testing y code review asistidos por IA (medio), AI SDK con streaming y tool-calling (en progreso).
   - **Frameworks frontend:** Angular (avanzado), React Native (avanzado), React (en progreso hacia nivel de producción), Electron (medio).
   - **Arquitectura y design systems:** microfrontends con Nx y Native Federation (medio-avanzado), librerías de componentes y design systems (avanzado), RxJS (avanzado), Signals (medio-avanzado), CSR (avanzado), SSR (medio), accesibilidad (en progreso).
   - **Backend y cloud:** Node.js y Express (avanzado, APIs en producción), AWS: Lambda, S3, API Gateway, CodeCommit, RDS, SQS (medio).
   - **Calidad, testing y CI/CD:** Git y GitHub (avanzado), GitHub Actions (medio-avanzado), SonarQube, Husky, Jest, unit testing y Lighthouse (medio).
5. **Formación:** Ingeniería de Software — Politécnico Grancolombiano (Medellín) — último ciclo, jul 2021 – actualidad.
6. **Cursos y certificaciones:** Udemy · JavaScript Master (2020); Udemy · Desarrollo web con Angular (2022); LinkedIn Learning · GitHub para desarrolladores (2022); Udemy · PowerApps, guía completa (2022); Platzi · Programación reactiva con RxJS (2023); Platzi · Web Components con JavaScript (2023).
7. **Idiomas:** español (nativo), inglés (B2).

**Otros cambios de contenido:**

- La página directa `/about` toma el título «Perfil y CV».
- Las secciones sin datos no se pintan (regla general del componente).

**PDF publicado:**

- Fuente: `CV_Daniel_Jaramillo_AI_Native.pdf` (raíz del proyecto, fuera de git).
- Se publica en `public/cv/daniel-jaramillo-bustamante-cv.pdf`, con el teléfono incluido por decisión del autor.
- Se corrige el enlace de LinkedIn a `linkedin.com/in/daniel-jaramillo-bustamante`, tanto el texto visible como el destino del enlace. Ninguna otra parte del PDF cambia.
- Si la corrección del texto visible no se puede hacer sin dañar el documento (fuente incrustada sin los glifos necesarios), se para y se consulta antes de publicar. El enlace a LinkedIn de la web ya es el correcto.
- El botón de descarga solo se renderiza si el archivo existe en el build, comprobado por un test. Nunca hay un enlace roto.

## 5. Fuera de alcance

- Hacer clicables las siluetas 3D del fondo.
- Historial de conversación en la IA (sigue siendo un único intercambio).
- Recorridos dentro de cada app o un recorrido interactivo que espere acciones.
- IA real (V2) y validación con `zod`.
- Analítica de uso del recorrido.
- Versión en inglés del contenido.

## 6. Pruebas

**Unitarias (TDD):**

- `tourSteps`: avance, retroceso y límites.
- `onboardingStorage`: lectura y escritura, y tolerancia a `localStorage` que lanza.
- `OnboardingTour`: se muestra si no está visto, se cierra y marca al saltar, terminar, pulsar Escape o abrir una app; «Guía» lo relanza; el último paso abre «Perfil y CV».
- `TourBalloon`: contenido, controles por paso y posición respecto a un rectángulo de ancla dado.
- Chat: bienvenida, burbujas de pregunta y respuesta, etiqueta «Demo», píldora del grafo y que `selectNode` fije la pregunta.
- Perfil: secciones, enlace de descarga y que una sección sin datos no se pinte.

**E2E:**

- Recorrido: aparece en la primera visita; tras «Saltar» y recargar no vuelve; «Guía» lo relanza; el último paso abre «Perfil y CV»; pulsar el icono señalado lo termina; no aparece en las páginas directas.
- Perfil: la descarga del PDF responde 200 con `application/pdf`.
- IA: la bienvenida se ve, la píldora sobre el grafo aparece y se oculta tras preguntar, y pulsar un nodo añade su pregunta al chat.
- Los e2e existentes que no prueban el recorrido arrancan con la guía marcada como vista (se fija la clave en `localStorage` antes de cargar), para no cambiar su comportamiento.

**Accesibilidad:** axe sobre el globo del recorrido (cada paso), el chat nuevo y el perfil ampliado.

**Móvil:** el recorrido completo y el chat apilado con viewport de teléfono, sin desbordamiento horizontal.

**Renombres en los selectores de tests:** «Sobre mí» → «Perfil y CV», «Actividades» → «Ventanas», «Terminal» → «Pregúntale a mi IA».

**Verificación de cierre:** lint, typecheck, unitarias, e2e en dev y contra el build de producción, y Lighthouse CI con los presupuestos actuales.

## 7. Riesgos

- **Que el recorrido moleste en visitas repetidas:** lo cubre la marca de «visto» y el botón «Saltar guía» siempre visible.
- **Que el globo tape el dock en móvil:** va encima del dock y nunca sobre él; el ancla queda visible gracias al anillo.
- **Desplazamiento de la composición al renombrar:** los nombres del dock son cortos a propósito; los largos solo aparecen en ventanas y tooltips.
- **Corrección del PDF:** editar el texto visible depende de la fuente incrustada; si no es posible sin dañarlo, se consulta antes de publicar (ver 4.4).
