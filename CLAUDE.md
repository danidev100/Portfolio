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
- El texto va en DOM; el 3D se renderiza en un Canvas persistente con `View` de drei.

## No tocar

- `entradas-3d.html`: prototipo de referencia para cámara, órbita y grafo. No es código a portar.
- `claude/`: copia local de `~/.claude`, fuera de git.
- El bloque `nextjs-agent-rules` de `AGENTS.md` lo gestiona `next dev`.
