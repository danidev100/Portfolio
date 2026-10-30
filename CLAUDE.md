@AGENTS.md

# Dani OS

Portafolio personal de Daniel Jaramillo (Frontend Tech Lead, perfil AI App Developer) presentado como un sistema operativo navegable en 3D con IA integrada. Contexto, decisiones y plan de entregas en `HANDOFF.md`.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript strict · pnpm
- 3D: React Three Fiber + drei (Three.js directo solo si R3F no alcanza)
- Estado: Zustand · Estilos: Tailwind v4 · Animación: Motion
- Tests: Jest + Testing Library · Playwright
- Backend/API: un Route Handler, `POST /api/ask`, que responde con Claude (`@anthropic-ai/sdk`) por SSE

## Comandos

| Tarea      | Comando          |
| ---------- | ---------------- |
| Dev        | `pnpm dev`       |
| Lint       | `pnpm lint`      |
| Typecheck  | `pnpm typecheck` |
| Unit tests | `pnpm test`      |
| E2E        | `pnpm e2e`       |
| Build      | `pnpm build`     |

## Dominios

| Dominio    | Responsabilidad                                               |
| ---------- | ------------------------------------------------------------- |
| `desktop`  | Shell Dani OS: window manager, ventanas, barra superior, dock |
| `scene`    | Canvas único, CameraRig y primitivas 3D (solo `ui` y `util`)  |
| `terminal` | «Pregúntale a mi IA»: chat con Claude y grafo de experiencia  |
| `projects` | Órbita de proyectos                                           |
| `profile`  | Contenido de «Perfil y CV» (CV en pantalla y PDF) y Contacto  |
| `phone`    | Shell de teléfono: inicio, dock, Guía y apps con navegación nativa |

Los dominios viven en `src/<dominio>/{feature,ui,data-access,util}`. `src/app` contiene solo rutas delgadas que renderizan un `feature`; `src/core` contiene tokens, fuentes y providers.

## Decisiones y convenciones del proyecto

- Dentro de un dominio se importa con rutas relativas. El alias `@/` es solo para cruzar dominios, y siempre por su `index.ts` (`@/desktop`); `shared` es la excepción. ESLint lo hace cumplir.
- La URL nombra la ventana enfocada y `/` es el escritorio sin ventanas visibles. `useDesktopWindows` mantiene en sincronía el store y el router; el store es la fuente de verdad de qué está abierto.
- **Nunca se navega a la ruta en la que ya está el router** (ni `push`, ni `replace`, ni un `Link`): desde una ruta interceptada, Next deja la página vacía. Los enlaces a apps hacen `preventDefault` cuando apuntan a `currentHref`.
- El store cambia al instante y su navegación llega después. `useDesktopWindows` lleva la cuenta de las navegaciones que pidió la app (`routeLandings.ts`): si la última aterriza en una ruta que el visitante ya dejó atrás, corrige la URL en vez de arrastrar el store. Solo las rutas que la app no pidió (botón atrás) mueven el store.
- El icono del dock alterna su ventana: la abre o restaura, y la minimiza si ya es la enfocada.
- Las rutas de `src/app/@window` no renderizan nada: solo interceptan para que el escritorio siga montado. Entrar directo a `/projects` renderiza la página completa.
- `desktop` no importa otros dominios: `src/app/_components/appContent.tsx` le pasa el contenido de cada app.
- Una app nueva se registra en `shared/util/apps.ts`, `appContent.tsx` y `phoneAppContent.tsx`, y necesita su página y su ruta interceptada en `src/app`.
- Todo enlace que abre una app (dock, bienvenida, Ventanas, recorrido, inicio y Guía del teléfono) decide su clic con `shouldActivateFromClick` (`shared/util/appLinks.ts`).
- Cada app tiene `title` (ventana, tooltip, Ventanas) y `shortTitle` (bajo el icono del dock); el título completo contiene al corto para cumplir «label in name».
- El recorrido de bienvenida (`OnboardingTour`) se ancla a elementos del dock por `id`, se recuerda en `localStorage` (`dani-os:onboarding:v1`) y se relanza desde «Guía». Los e2e arrancan con él marcado como visto salvo que usen `test.use({ hasSeenTour: false })` (`e2e/support.ts`).
- Los e2e abren el escritorio con `openDesktop(page)`, que espera a la hidratación: un clic anterior es una navegación de enlace normal y la siguiente navegación del cliente la cancela. El teléfono se abre con `openPhone(page, path)`, que espera a `data-hydrated`. Los specs `phone*.spec.ts` corren solo en el proyecto `iphone` de Playwright (Chromium con UA y pantalla de iPhone 15).
- Cada proyecto tiene `status`: `live` (trabajo publicado, con `url` y etiqueta «En producción») o `idea` (etiqueta «Idea NN», numerada solo entre las ideas). Los `live` van primero en `PROJECTS`, porque la órbita abre en el primero.
- El CV publicado es `public/cv/daniel-jaramillo-bustamante-cv.pdf`; un test comprueba que existe y que su enlace de LinkedIn es el actual. El original está fuera de git.

- **Teléfono** (spec `docs/superpowers/specs/2026-10-29-dani-os-movil-design.md`):
  - Las páginas deciden la interfaz en el servidor con `getDeviceProfile` (`userAgent()` + `?device=ios|desktop`), así que son dinámicas. Decidir en el cliente haría parpadear el escritorio antes del teléfono.
  - Solo los sabores de `PHONE_FLAVORS` llegan al teléfono (hoy `ios`); Android, tablets e iPadOS reciben el escritorio.
  - `phone` no importa otros dominios: `src/app/_components/phoneAppContent.tsx` le pasa contenido simple, sin WebGL ni CSS 3D (`ProjectsPhoneApp`, `TerminalPhoneApp`, `AboutApp`, `ContactApp`).
  - La URL es el estado del teléfono: no hay store. «Inicio» hace `router.back()` si la app abierta se lanzó desde el inicio; si no, navega a `/`.
  - El detalle de proyecto en el teléfono se empuja con `?project=<id>` vía `history.pushState`, para que el gesto atrás lo cierre.
  - La Guía es un `<dialog>` modal sobre el inicio, sin URL; reemplaza al recorrido de bienvenida, que el teléfono no tiene.
  - Sin barra de estado ni indicador de inicio dibujados: el teléfono ya tiene los suyos. El layout usa `viewport-fit=cover` y `env(safe-area-inset-*)`.
- Las dependencias se instalan en la entrega que las usa, no por adelantado.
- Los tokens de `src/core/styles/globals.css` reemplazan las escalas por defecto de color, radio, sombra y fuente de Tailwind: solo existen los tokens semánticos.
- Nada tiene esquinas rectas: `rounded-control`, `rounded-card`, `rounded-window` o `rounded-full`.
- Sin shadcn: componentes `ui` propios con `cva` + `tailwind-merge`.
- ESLint se queda en v9 y TypeScript en v6 hasta que `eslint-config-next` y `typescript-eslint` soporten las versiones siguientes.
- El texto va en DOM. El fondo 3D del escritorio es un Canvas WebGL persistente detrás del shell.
- No se usa `View` de drei para dibujar dentro de las ventanas (cambia la decisión 1 de `HANDOFF.md`): un canvas ocupa una sola capa y las ventanas se solapan. El contenido 3D de una ventana vive en el DOM de esa ventana.
- La órbita de proyectos es CSS 3D sobre DOM, sin WebGL: las tarjetas son botones reales y la página directa se renderiza en servidor. Toda su geometría deriva de `--spacing-orbit-card`.
- Dentro de un contexto 3D de CSS no se usa `layoutId` de Motion: no puede corregir rotaciones ni perspectiva y deforma el contenido. El caso de un proyecto se revela con `clip-path` desde el rectángulo de su tarjeta.
- Duraciones, curvas y radios que Motion necesita como números están en `shared/util/motion.ts`. `MotionProvider` (en el layout raíz) aplica "reducir movimiento" a toda la app.
- El Canvas usa `frameloop="demand"`: quien anime algo llama a `invalidate()` mientras se mueve y deja de hacerlo al llegar. En reposo no se dibuja ningún frame.
- Todo lo que importa `three` se carga con `next/dynamic` y `ssr: false` (`DesktopScene`, `ExperienceGraph`), para que no entre en la carga inicial.
- `scene` solo tiene `ui` y `util`, así que el código `ui` de otros dominios puede importar `@/scene`; ningún otro dominio es importable desde `ui`.
- El grafo de la Terminal tiene su propio canvas dentro de la ventana. Sus etiquetas son botones DOM que `LabelProjector` coloca en cada frame; no se usa `Html` de drei, que crea una raíz de React por etiqueta y da errores al desmontar con React 19.
- `SceneCanvas` mide con `offsetSize`: un canvas montado mientras su ventana se abre escalada se quedaría con el tamaño reducido.
- La Terminal habla con `AskService` (`shared/types/ask.ts`). En el navegador, `useAskStore.ts` crea un servicio compuesto: las preguntas sugeridas usan el guion local, el resto va a `/api/ask`, y si este responde sin stream (429, 503) contesta el buscador local con «(Modo sin conexión)». Una vez que Claude empezó a responder, la respuesta es suya.
- `/api/ask` delega en `src/terminal/server.ts`, la API pública solo de servidor del dominio (`import 'server-only'`, categoría `domain-api` en ESLint). Allí se crean el cliente de Anthropic (`ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`) y un limitador en memoria: Render corre una sola instancia. El tope real de gasto es el límite mensual de Claude Console.
- Lo que sabe la IA está en `terminal/util/knowledge.ts`: bloques transcritos del CV, cada uno con los nodos del grafo que encienden sus citas. Si cambia el CV, se actualizan esos bloques, `profile/util/profile.ts` y `phone/util/home.ts`. Antes de cambiar el prompt, el modelo o la base, se corre a mano `docs/ask-eval.md`.
- `zod` solo se usa en el servidor. El store de la Terminal se crea con el escritorio, así que lo que importa el cliente entra en la carga de todas las páginas: `zod` sumaba 106 KB comprimidos y rompía Lighthouse. El cliente valida los eventos con `isAskEvent`, escrito a mano.
- Los e2e nunca llaman a Claude: `e2e/support.ts` intercepta `/api/ask` con 503, y `answerWithStream` simula una respuesta.
- Los componentes se suscriben al store con selectores estrechos: `TerminalGraph` solo al foco y `TerminalAsk` al texto, para que cada token no re-renderice la escena.
- Los materiales leen los colores de los tokens CSS con `readThemeColor`; no hay hex en la escena.
- La matemática de cámara y layout vive en `scene/util` como funciones puras con tests; lo que necesita WebGL se verifica en e2e.

## Accesibilidad y calidad

- `e2e/accessibility.spec.ts` pasa axe (WCAG 2.2 AA) por cada estado: escritorio, cada ventana, caso de proyecto, la IA con foco, Ventanas, cada paso del recorrido y páginas directas. Una ventana o estado nuevo añade ahí su caso.
- Única excepción a axe: `target-size` en las etiquetas del grafo, que se solapan porque su posición es el dato (como pines de un mapa). Cada etiqueta mide al menos 24 px.
- El texto atenuado nunca usa opacidad: cambia a `text-muted`, que mantiene el contraste. En la órbita, la tarjeta frontal y sus vecinas son opacas; las demás son invisibles e `inert`.
- Al cerrar o minimizar una ventana sin otra visible, el foco vuelve a su icono del dock.
- En contenedores estrechos el grafo solo etiqueta los nodos `isLandmark` y los que están en foco.
- `e2e/mobile.spec.ts` corre los flujos críticos del escritorio en un Pixel 7 (Android aún recibe el escritorio). `e2e/phone.spec.ts` y `e2e/phone-accessibility.spec.ts` cubren el teléfono, con una prueba de 20 ciclos por app sin errores en consola.
- CI (`.github/workflows/ci.yml`): `quality` → `e2e` y `lighthouse` en paralelo. Los presupuestos de `lighthouserc.json` están ajustados a lo que mide el runner de GitHub, que no tiene GPU y dibuja WebGL por software: rendimiento ≥ 0.85 en `/projects`, ≥ 0.8 en `/` y ≥ 0.7 en `/terminal`; LCP ≤ 3.5 s simulado en móvil en las tres. En local las tres páginas pasan de 0.9.
- Las tres fuentes se precargan a propósito: quitar la precarga de la mono subió el FCP de 756 a 1059 ms en la medición.

## No tocar

- `entradas-3d.html`: prototipo de referencia para cámara, órbita y grafo. No es código a portar.
- `claude/`: copia local de `~/.claude`, fuera de git.
- El bloque `nextjs-agent-rules` de `AGENTS.md` lo gestiona `next dev`.
