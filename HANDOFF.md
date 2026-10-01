# Dani OS — Traspaso a Claude Code

Portafolio personal de Daniel Jaramillo (Frontend Tech Lead, perfil AI App Developer).
Objetivo: un portafolio que genere impacto en procesos de selección bien remunerados, con navegación 3D fluida e IA integrada.

## Decisiones ya tomadas

- **Stack**: Next.js (App Router) + React Three Fiber + drei. Three.js directo solo si R3F no alcanza.
- **IA**: simulada en V1. IA real en V2, cuando la UI, el renderizado y la fluidez estén pulidos.
- **Concepto**: Dani OS como shell, el grafo IA dentro de la ventana Terminal y la órbita de proyectos dentro de la ventana Proyectos.
- **Referencias visuales**: kevinbarrios.dev (navegación tipo SO, estética GNOME/Fedora) y david-hckh.com (3D, transiciones suaves, interactividad).
- **Prototipo de referencia**: `entradas-3d.html` (Three.js r128, adjunto). Sirve para el comportamiento de cámara, la órbita y el grafo. No es código a portar tal cual.

## Requisitos de diseño

- Todo redondeado: ventanas, tarjetas, botones. Radios de 14 a 28 px y píldoras para controles. Nada de esquinas rectas ni vistas cortadas.
- Cero saltos: cámara con amortiguación exponencial, transiciones de elemento compartido y nada que aparezca de golpe.
- No quiere: una SPA plana con el CV ni links que solo saltan a anclas de la misma página.
- Simple pero funcional.

## Arquitectura (dominio × tipo, según CLAUDE.md)

```
src/
  app/                      # / (escritorio) + /projects, /terminal, /about, /contact
  core/                     # tokens (@theme Tailwind v4), fuentes, providers
  shared/types/
  desktop/   feature · ui · data-access · util   # shell Dani OS
  scene/     ui · util                           # Canvas único, CameraRig, primitivas 3D
  terminal/  feature · ui · data-access · util   # grafo IA + respuesta simulada
  projects/  feature · ui · data-access · util   # órbita de proyectos
```

## Decisiones técnicas

1. **Un Canvas persistente y ventanas en HTML.** El texto va en DOM (accesible, nítido, indexable). El grafo y la órbita se renderizan dentro de su ventana con `View` de drei sobre el mismo contexto WebGL.
2. **Ventanas como rutas interceptadas.** `/projects` abre la ventana sobre el escritorio con una URL compartible; si se entra directo, renderiza la página completa en el servidor.
3. **Window manager en Zustand** (`desktop/data-access`): open, focus, minimize, z-order. Lógica pura con tests unitarios.
4. **Transiciones.** La ventana se expande desde el icono del dock con `layoutId` de Motion, sincronizado con el dolly de cámara.
5. **Contrato de IA estable entre V1 y V2.**
   ```ts
   type AskEvent =
     | { type: 'focus_nodes'; nodeIds: string[] }
     | { type: 'token'; text: string }
     | { type: 'done' }
     | { type: 'error'; message: string };

   interface AskService {
     ask(question: string, signal?: AbortSignal): AsyncIterable<AskEvent>;
   }
   ```
   V1: `SimulatedAskService` con latencia realista. V2: cliente SSE validado con Zod; la UI no cambia.
6. **Rendimiento.** Canvas con import dinámico sin SSR, `frameloop="demand"` en reposo, DPR limitado, `PerformanceMonitor` para degradar calidad y respeto a reducir movimiento.
7. **Móvil.** Ventanas a pantalla completa apiladas (estilo GNOME móvil) en lugar de un escritorio miniatura.
8. **Sin shadcn.** Componentes `ui` propios con `cva` + `tailwind-merge`.

## Entregas (commits convencionales)

1. Scaffold, tooling (ESLint, Prettier, Jest, Playwright) y tokens.
2. Shell: window manager con tests, ventana, barra superior, dock y vista de Actividades.
3. Capa 3D del escritorio y CameraRig. **← primera revisión con Dani**
4. Ventana Proyectos con la órbita.
5. Ventana Terminal con el grafo y el streaming simulado.
6. Pulido: móvil, accesibilidad, Lighthouse y e2e de los flujos críticos.

## Dependencias propuestas (pendientes de aprobación, `pnpm add` está en "ask")

- **Producción:** `next react react-dom three @react-three/fiber @react-three/drei zustand motion zod class-variance-authority tailwind-merge clsx`
- **Desarrollo:** `typescript @types/three tailwindcss @tailwindcss/postcss eslint prettier prettier-plugin-tailwindcss jest jest-environment-jsdom @testing-library/react @testing-library/user-event @playwright/test`

## Contenido real

### Datos del grafo (del CV)

- **Experiencia:**
  - Home Power Colombia, Tech Lead (nov 2024 – sep 2026).
  - Globant, Web UI Developer Ssr (2022–2024).
  - ARUS, Automation Analyst (2017–2022).
- **Logros:** lideró un equipo de 7 devs; design system con 60% de adopción en producción; −90% de esfuerzo de handoff a QA con CI/CD a TestFlight; 50% de los algoritmos de IA de ARUS llevados a interfaces web.
- **Skills:** Angular, React Native, TypeScript, Node/Express, RxJS + Signals, Nx + Native Federation, design systems, GitHub Actions + SonarQube + Husky, AWS (Lambda, S3, API Gateway), Claude CLI + MCP, AI SDK (streaming y tool-calling, en progreso), accesibilidad.

### Ideas de proyecto para la órbita

| Proyecto | Qué hace |
|---|---|
| Factura Lens | Fotos de facturas convertidas en JSON contable validado con Zod; dirigido a PYMES. |
| Solar Scout | Estima el ahorro solar desde una factura de energía; conecta con su experiencia en energía renovable. |
| DS Copilot | Genera pantallas Angular usando solo el design system, a través de un servidor MCP. |
| Release Radar | Convierte PRs en notas de versión para cada audiencia. |
| A11y Pilot | Audita accesibilidad y propone el diff con el arreglo. |
| MFE Atlas | Mapa 3D de microfrontends Nx con preguntas de impacto. |
| Ask Dani | El CV como RAG conversacional con citas. |
| Interview Forge | Simulador de entrevista técnica con rúbrica. |

## Primer paso en Claude Code

Lee este archivo y las reglas de `~/.claude`. Pide aprobación de las dependencias y arranca la entrega 1.
