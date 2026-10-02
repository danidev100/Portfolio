@AGENTS.md

# Dani OS

Portafolio personal de Daniel Jaramillo (Frontend Tech Lead, perfil AI App Developer) presentado como un sistema operativo navegable en 3D con IA integrada. Contexto, decisiones y plan de entregas en `HANDOFF.md`.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript strict · pnpm
- 3D: React Three Fiber + drei (Three.js directo solo si R3F no alcanza)
- Estado: Zustand · Estilos: Tailwind v4 · Animación: Motion
- Tests: Jest + Testing Library · Playwright
- Backend/API: ninguno en V1 (IA simulada tras el contrato `AskService`)

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
| `terminal` | Grafo IA y respuesta simulada por streaming                   |
| `projects` | Órbita de proyectos                                           |
| `profile`  | Contenido de las apps Sobre mí y Contacto                     |

Los dominios viven en `src/<dominio>/{feature,ui,data-access,util}`. `src/app` contiene solo rutas delgadas que renderizan un `feature`; `src/core` contiene tokens, fuentes y providers.

## Decisiones y convenciones del proyecto

- Dentro de un dominio se importa con rutas relativas. El alias `@/` es solo para cruzar dominios, y siempre por su `index.ts` (`@/desktop`); `shared` es la excepción. ESLint lo hace cumplir.
- La URL nombra la ventana enfocada y `/` es el escritorio sin ventanas visibles. `useDesktopWindows` mantiene en sincronía el store y el router; el store es la fuente de verdad de qué está abierto.
- Las rutas de `src/app/@window` no renderizan nada: solo interceptan para que el escritorio siga montado. Entrar directo a `/projects` renderiza la página completa.
- `desktop` no importa otros dominios: `src/app/_components/appContent.tsx` le pasa el contenido de cada app.
- Una app nueva se registra en `desktop/util/apps.ts` y `appContent.tsx`, y necesita su página y su ruta interceptada en `src/app`.

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
- La Terminal habla con `AskService` (`shared/types/ask.ts`). V1 lo simula; V2 solo cambia el servicio que se crea en `terminal/data-access/useAskStore.ts`. `zod` se instala entonces, con el cliente SSE.
- Los componentes se suscriben al store con selectores estrechos: `TerminalGraph` solo al foco y `TerminalAsk` al texto, para que cada token no re-renderice la escena.
- Los materiales leen los colores de los tokens CSS con `readThemeColor`; no hay hex en la escena.
- La matemática de cámara y layout vive en `scene/util` como funciones puras con tests; lo que necesita WebGL se verifica en e2e.

## Accesibilidad y calidad

- `e2e/accessibility.spec.ts` pasa axe (WCAG 2.2 AA) por cada estado: escritorio, cada ventana, caso de proyecto, Terminal con foco, Actividades y páginas directas. Una ventana o estado nuevo añade ahí su caso.
- Única excepción a axe: `target-size` en las etiquetas del grafo, que se solapan porque su posición es el dato (como pines de un mapa). Cada etiqueta mide al menos 24 px.
- El texto atenuado nunca usa opacidad: cambia a `text-muted`, que mantiene el contraste. En la órbita, la tarjeta frontal y sus vecinas son opacas; las demás son invisibles e `inert`.
- Al cerrar o minimizar una ventana sin otra visible, el foco vuelve a su icono del dock. Además se reasienta la ruta actual para cancelar una navegación aún en curso, que reabriría la ventana.
- En contenedores estrechos el grafo solo etiqueta los nodos `isLandmark` y los que están en foco.
- `e2e/mobile.spec.ts` corre los flujos críticos con viewport y toque de teléfono.
- CI (`.github/workflows/ci.yml`): `quality` → `e2e` y `lighthouse` en paralelo. Los presupuestos de `lighthouserc.json` están ajustados al baseline medido (rendimiento ≥ 0.85, LCP ≤ 3.5 s simulado en móvil).
- Las tres fuentes se precargan a propósito: quitar la precarga de la mono subió el FCP de 756 a 1059 ms en la medición.

## No tocar

- `entradas-3d.html`: prototipo de referencia para cámara, órbita y grafo. No es código a portar.
- `claude/`: copia local de `~/.claude`, fuera de git.
- El bloque `nextjs-agent-rules` de `AGENTS.md` lo gestiona `next dev`.
