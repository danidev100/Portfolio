# Onboarding, «Perfil y CV» y «Pregúntale a mi IA»: plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que un visitante sin experiencia en Linux llegue solo a tu perfil y CV, y entienda que la app de IA está para preguntarle.

**Architecture:**

- El escritorio gana una bienvenida con botones, nombres visibles en el dock y un recorrido de 3 globos.
- El recorrido vive en el dominio `desktop`: pasos y posición como funciones puras, persistencia tolerante a fallos, un globo presentacional y un componente que lo orquesta.
- La app de IA pasa a ser un chat con burbujas que lleva la jerarquía visual; el grafo apunta al chat.
- «Sobre mí» pasa a ser «Perfil y CV», con el CV traducido y el PDF corregido.

**Tech Stack:** Next.js 16 (App Router) · React 19 · TypeScript 6 strict · Tailwind v4 · Motion · Zustand · Jest + Testing Library · Playwright + axe · pnpm.

**Spec:** `docs/superpowers/specs/2026-10-03-onboarding-y-ia-design.md`

## Global Constraints

- **Idiomas:** textos visibles en español, exactamente como los fija este plan; código, identificadores, comentarios y commits en inglés.
- **URLs y `AppId` sin cambios:** `/about`, `/projects`, `/terminal`, `/contact`; `about`, `projects`, `terminal`, `contact`.
- **Nombres visibles:** `about` → «Perfil y CV» (dock «Perfil»); `terminal` → «Pregúntale a mi IA» (dock «Mi IA»); `projects` → «Proyectos»; `contact` → «Contacto». El botón «Actividades» pasa a «Ventanas».
- **Sin dependencias nuevas de producto.** `pikepdf` solo se usa en un entorno virtual temporal del scratchpad para corregir el PDF, nunca en el repo.
- **Nunca se navega a la ruta actual.** Todo enlace a una app decide su clic con `shouldActivateFromClick` (Task 2).
- **Estilos:** solo tokens semánticos y clases literales completas; nada con esquinas rectas (`rounded-control`, `rounded-card`, `rounded-window`, `rounded-full`); toda transición con `motion-reduce:transition-none` o respetando `MotionProvider`.
- **TypeScript:** `interface` para objetos, sin `any`, sin aserciones `as` salvo justificadas, tipos de retorno explícitos en lo exportado.
- **Imports:** dentro de un dominio, rutas relativas; entre dominios, solo `@/<dominio>`; `@/shared/...` está permitido.
- **TDD:** cada función o componente con lógica empieza por un test que falla.
- **Commits:** Conventional Commits en inglés, terminados en `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Clave de persistencia del recorrido:** `dani-os:onboarding:v1`, con valor `seen`.
- **PDF publicado:** `public/cv/daniel-jaramillo-bustamante-cv.pdf`, con el teléfono y con LinkedIn `linkedin.com/in/daniel-jaramillo-bustamante`.

## Review Focus

1. **`localStorage` lanza (Safari privado, cookies bloqueadas):** el recorrido sale, se puede saltar y nada se rompe. Test en Task 3 (`onboardingStorage`) y Task 5 (`useOnboardingTour` con almacenamiento que lanza).
2. **Pantalla muy estrecha (320 px):** el globo cabe entero dentro de la pantalla y su flecha sigue apuntando al ancla. Test en Task 3 (`getBalloonPosition` a 320 px) y Task 5 (e2e móvil).
3. **El visitante abre una app antes de que aparezca el recorrido:** no debe aparecer después en mitad del uso. Test en Task 5 (`end()` cancela el temporizador pendiente y marca visto).
4. **Pulsar una sugerencia mientras la bienvenida aún se escribe:** la bienvenida queda legible y la pregunta y su respuesta aparecen después. Test en Task 7 (`TerminalApp`).
5. **Volver a abrir la IA en la misma visita:** la bienvenida no se vuelve a escribir. Test en Task 6 (store) y Task 7 (`TerminalApp` remontado).

---

## Mapa de archivos

| Archivo                                        | Acción    | Responsabilidad                                                    |
| ---------------------------------------------- | --------- | ------------------------------------------------------------------ |
| `src/desktop/util/apps.ts`                     | Modificar | `shortTitle`, renombres, `DOCK_ID`                                 |
| `src/desktop/util/appLinks.ts`                 | Crear     | `shouldActivateFromClick`: regla única de clic en enlaces a apps   |
| `src/desktop/util/tourSteps.ts`                | Crear     | Pasos del recorrido y avance o retroceso                           |
| `src/desktop/util/balloonPosition.ts`          | Crear     | Ancho y posición del globo respecto a su ancla                     |
| `src/desktop/data-access/onboardingStorage.ts` | Crear     | «Visto» en `localStorage`, tolerante a fallos                      |
| `src/desktop/ui/Dock.tsx`                      | Modificar | Nombre corto visible, `id` del dock, usa `shouldActivateFromClick` |
| `src/desktop/ui/ActivitiesOverview.tsx`        | Modificar | Usa `shouldActivateFromClick`                                      |
| `src/desktop/ui/TopBar.tsx`                    | Modificar | «Ventanas» y botón «Guía»                                          |
| `src/desktop/ui/DesktopGreeting.tsx`           | Modificar | Bienvenida con tres botones                                        |
| `src/desktop/ui/TourBalloon.tsx`               | Crear     | Globo presentacional                                               |
| `src/desktop/feature/useOnboardingTour.ts`     | Crear     | Cuándo se abre y se cierra el recorrido                            |
| `src/desktop/feature/OnboardingTour.tsx`       | Crear     | Paso actual, medida del ancla, resaltado y foco                    |
| `src/desktop/feature/Desktop.tsx`              | Modificar | Integra bienvenida, recorrido y «Guía»                             |
| `src/core/styles/globals.css`                  | Modificar | Anillo `[data-tour-highlight]`                                     |
| `src/terminal/util/askAnswers.ts`              | Modificar | `WELCOME_MESSAGE`, `describeNode` con pregunta                     |
| `src/terminal/data-access/askStore.ts`         | Modificar | `hasInteracted`, `hasWelcomed`, `markWelcomed`, pregunta del nodo  |
| `src/terminal/ui/Caret.tsx`                    | Crear     | Cursor parpadeante compartido                                      |
| `src/terminal/ui/TypewriterText.tsx`           | Crear     | Texto que se escribe palabra a palabra                             |
| `src/terminal/ui/AskPanel.tsx`                 | Modificar | Chat con burbujas, cabecera con «Demo» y sugerencias               |
| `src/terminal/feature/TerminalAsk.tsx`         | Modificar | Bienvenida una vez por visita y foco en el campo                   |
| `src/terminal/feature/TerminalGraph.tsx`       | Modificar | Píldora que apunta al chat                                         |
| `src/terminal/feature/TerminalApp.tsx`         | Modificar | El chat va primero                                                 |
| `src/profile/util/cvPdf.ts`                    | Crear     | Ruta pública del PDF                                               |
| `public/cv/daniel-jaramillo-bustamante-cv.pdf` | Crear     | PDF corregido                                                      |
| `src/profile/util/profile.ts`                  | Modificar | Datos del CV en español                                            |
| `src/profile/ui/ProfileCv.tsx`                 | Crear     | CV presentacional                                                  |
| `src/profile/feature/AboutApp.tsx`             | Modificar | Pasa los datos a `ProfileCv`                                       |
| `e2e/support.ts`                               | Crear     | `dockLink` y fixture `hasSeenTour`                                 |
| `e2e/tour.spec.ts`                             | Crear     | Recorrido de punta a punta                                         |
| `e2e/*.spec.ts`                                | Modificar | Renombres y fixture                                                |
| `CLAUDE.md`, spec                              | Modificar | Convenciones y ajuste del spec                                     |

---

### Task 1: Nombres visibles (dock con nombre, renombres y «Ventanas»)

**Files:**

- Modify: `src/desktop/util/apps.ts`
- Modify: `src/desktop/ui/Dock.tsx`
- Modify: `src/desktop/ui/TopBar.tsx`
- Create: `e2e/support.ts`
- Test: `src/desktop/ui/Dock.test.tsx`, `src/desktop/ui/TopBar.test.tsx`, `src/desktop/ui/ActivitiesOverview.test.tsx`, `src/desktop/feature/Desktop.test.tsx`, `e2e/desktop.spec.ts`, `e2e/mobile.spec.ts`, `e2e/terminal.spec.ts`, `e2e/accessibility.spec.ts`, `e2e/projects.spec.ts`

**Interfaces:**

- Produces: `AppDefinition.shortTitle: string`; `DOCK_ID = 'dock'` (id del `<ul>` del dock); `dockLink(page: Page, name: string): Locator` en `e2e/support.ts`.

- [ ] **Step 1: Write the failing tests for the dock**

En `src/desktop/ui/Dock.test.tsx`, reemplaza `{ name: 'Terminal' }` por `{ name: 'Pregúntale a mi IA' }` y `{ name: 'Terminal, abierta' }` por `{ name: 'Pregúntale a mi IA, abierta' }` en todo el archivo. Añade antes del cierre final del `describe('Dock', …)`:

```tsx
it('shows the short name of the app under its icon', () => {
  render(<Dock currentHref="/" items={buildItems()} onActivate={jest.fn()} />);

  expect(screen.getByText('Mi IA')).toBeVisible();
});

it('names each link with the full name of its app, which contains the short one', () => {
  render(<Dock currentHref="/" items={buildItems()} onActivate={jest.fn()} />);

  expect(screen.getByRole('link', { name: 'Pregúntale a mi IA' })).toHaveTextContent('Mi IA');
});

it('gives the tour an anchor on the whole dock', () => {
  render(<Dock currentHref="/" items={buildItems()} onActivate={jest.fn()} />);

  expect(document.getElementById(DOCK_ID)).toBe(screen.getByRole('list'));
});
```

Añade `DOCK_ID` al import de `'../util/apps'` (`import { APPS, DOCK_ID } from '../util/apps';`).

En `src/desktop/ui/TopBar.test.tsx`, reemplaza las dos apariciones de `{ name: 'Actividades' }` por `{ name: 'Ventanas' }`.

En `src/desktop/ui/ActivitiesOverview.test.tsx`, reemplaza `'Terminal, minimizada'` por `'Pregúntale a mi IA, minimizada'`.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm exec jest src/desktop/ui`
Expected: FAIL. No encuentra «Pregúntale a mi IA», «Mi IA», «Ventanas» ni `DOCK_ID`.

- [ ] **Step 3: Update the app definitions**

En `src/desktop/util/apps.ts`, reemplaza la interfaz y el registro por:

```ts
export interface AppDefinition {
  id: AppId;
  /** Full name: window title, tooltip, overview and page title. */
  title: string;
  /** Fits under the dock icon. The full title must contain it (label in name). */
  shortTitle: string;
  href: string;
  tone: AppTone;
}

export const APPS: Readonly<Record<AppId, AppDefinition>> = {
  projects: {
    id: 'projects',
    title: 'Proyectos',
    shortTitle: 'Proyectos',
    href: '/projects',
    tone: 'highlight',
  },
  terminal: {
    id: 'terminal',
    title: 'Pregúntale a mi IA',
    shortTitle: 'Mi IA',
    href: '/terminal',
    tone: 'ai',
  },
  about: {
    id: 'about',
    title: 'Perfil y CV',
    shortTitle: 'Perfil',
    href: '/about',
    tone: 'primary',
  },
  contact: {
    id: 'contact',
    title: 'Contacto',
    shortTitle: 'Contacto',
    href: '/contact',
    tone: 'positive',
  },
};
```

Y añade al final del archivo:

```ts
/** DOM id of the dock itself, where the onboarding tour points to. */
export const DOCK_ID = 'dock';
```

- [ ] **Step 4: Show the short name in the dock**

En `src/desktop/ui/Dock.tsx`:

1. Cambia el import de `'../util/apps'` a `import { DOCK_ID, getDockItemId, type AppDefinition, type AppId } from '../util/apps';`.
2. Reemplaza el `<ul …>` de apertura por:

```tsx
      <ul
        id={DOCK_ID}
        className="flex items-start gap-1 rounded-full border border-border bg-surface/90 px-3 py-2 backdrop-blur sm:gap-2"
      >
```

3. Reemplaza el `motion.span` de la placa para que mida lo mismo que el icono, aunque el elemento crezca con el nombre:

```tsx
{
  /* The window grows out of this plate and shrinks back into it. */
}
<motion.span
  aria-hidden="true"
  layoutId={getWindowLayoutId(app.id)}
  style={{ borderRadius: RADIUS_PX.control }}
  className="absolute inset-x-0 top-0 mx-auto size-12 bg-surface-raised"
/>;
```

4. En el `Link`, cambia `className` a `"group relative flex w-16 flex-col items-center gap-1 rounded-control"` y, justo después de `<AppIcon … />`, añade:

```tsx
<span
  aria-hidden="true"
  className="max-w-full truncate text-xs text-muted group-aria-[current=page]:text-foreground"
>
  {app.shortTitle}
</span>
```

El `span.sr-only` con `{app.title}{isRunning ? ', abierta' : ''}`, el tooltip y el punto de «abierta» se quedan como están.

- [ ] **Step 5: Rename the overview button**

En `src/desktop/ui/TopBar.tsx`, cambia el texto del botón `Actividades` por `Ventanas`.

- [ ] **Step 6: Run the unit tests to verify they pass**

Run: `pnpm exec jest src/desktop/ui`
Expected: PASS.

- [ ] **Step 7: Update the Desktop tests to the new names**

En `src/desktop/feature/Desktop.test.tsx`:

1. Cambia el import de Testing Library a `import { render, screen, waitFor, within } from '@testing-library/react';`.
2. Añade bajo `renderDesktop`:

```tsx
/** A link in the dock. Scoped, because the desktop greeting links to the same apps. */
const dockLink = (name: string): HTMLElement =>
  within(screen.getByRole('navigation', { name: 'Dock' })).getByRole('link', { name });
```

3. Reemplaza cada `screen.getByRole('link', { name: X })` por `dockLink(X)`, y aplica estos renombres en todo el archivo:
   - `'Sobre mí'` → `'Perfil y CV'` (enlace y diálogo)
   - `'Terminal'` → `'Pregúntale a mi IA'`
   - `'Terminal, abierta'` → `'Pregúntale a mi IA, abierta'`
   - `'Cerrar Terminal'` → `'Cerrar Pregúntale a mi IA'`
   - `{ name: 'Actividades' }` → `{ name: 'Ventanas' }`

   Las aserciones sobre el `h1` «Dani OS» se quedan como están en esta tarea.

Run: `pnpm exec jest src/desktop`
Expected: PASS.

- [ ] **Step 8: Create the e2e support module and update the specs**

Crea `e2e/support.ts`:

```ts
import type { Locator, Page } from '@playwright/test';

/** A link in the dock. Scoped, because the desktop greeting links to the same apps. */
export const dockLink = (page: Page, name: string): Locator =>
  page.getByRole('navigation', { name: 'Dock' }).getByRole('link', { name });
```

En cada spec de `e2e/`, importa `dockLink` desde `'./support'` y aplica:

| Archivo                 | Antes                                                              | Después                                                          |
| ----------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------- |
| todos                   | `page.getByRole('link', { name: X })` cuando X es una app del dock | `dockLink(page, X)`                                              |
| todos                   | `'Sobre mí'` (enlace, diálogo, región de Ventanas)                 | `'Perfil y CV'`                                                  |
| todos                   | `'Terminal'` (enlace o diálogo de la app)                          | `'Pregúntale a mi IA'`                                           |
| todos                   | `'Terminal, abierta'`                                              | `'Pregúntale a mi IA, abierta'`                                  |
| todos                   | `'Minimizar Terminal'` / `'Cerrar Terminal'`                       | `'Minimizar Pregúntale a mi IA'` / `'Cerrar Pregúntale a mi IA'` |
| todos                   | `{ name: 'Actividades' }`                                          | `{ name: 'Ventanas' }`                                           |
| `accessibility.spec.ts` | `['Proyectos', 'Terminal', 'Sobre mí', 'Contacto']`                | `['Proyectos', 'Pregúntale a mi IA', 'Perfil y CV', 'Contacto']` |
| `accessibility.spec.ts` | `test('activities overview'`                                       | `test('windows overview'`                                        |
| `mobile.spec.ts`        | `openApp(page, 'Terminal')`                                        | `openApp(page, 'Pregúntale a mi IA')`                            |
| `mobile.spec.ts`        | `test('the activities overview lists the open windows'`            | `test('the windows overview lists the open windows'`             |

En `mobile.spec.ts` y `accessibility.spec.ts`, el helper `openApp` pasa a usar `dockLink(page, name)` en vez de `page.getByRole('link', { name })`. En `projects.spec.ts` y `terminal.spec.ts`, los helpers `openProjectsWindow` y `openTerminalWindow` también.

Los enlaces dentro de la región «Ventanas abiertas» siguen con `page.getByRole('region', { name: 'Ventanas abiertas' }).getByRole('link', { name })`.

- [ ] **Step 9: Run lint, typecheck and the e2e suite**

Run: `pnpm lint && pnpm typecheck && pnpm e2e`
Expected: todo en verde. Si `pnpm dev` ya ocupa el puerto 3000, Playwright lo reutiliza.

- [ ] **Step 10: Commit**

```bash
git add src/desktop e2e
git commit -m "feat(desktop): show app names in the dock and drop linux jargon

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Bienvenida con botones

**Files:**

- Create: `src/desktop/util/appLinks.ts`, `src/desktop/util/appLinks.test.ts`
- Modify: `src/desktop/ui/Dock.tsx`, `src/desktop/ui/ActivitiesOverview.tsx`, `src/desktop/ui/DesktopGreeting.tsx`, `src/desktop/feature/Desktop.tsx`
- Create: `src/desktop/ui/DesktopGreeting.test.tsx`
- Test: `src/desktop/feature/Desktop.test.tsx`, `e2e/desktop.spec.ts`

**Interfaces:**

- Consumes: `APPS`, `AppId` (Task 1).
- Produces: `shouldActivateFromClick(click: AppLinkClick, href: string, currentHref: string): boolean`; `interface AppLinkClick { detail: number; preventDefault: () => void }`; `DesktopGreeting` con props `{ currentHref: string; onOpen: (id: AppId) => void }`.

- [ ] **Step 1: Write the failing test for the link rule**

Crea `src/desktop/util/appLinks.test.ts`:

```ts
import { shouldActivateFromClick, type AppLinkClick } from './appLinks';

function buildClick(detail = 1): AppLinkClick & { isPrevented: () => boolean } {
  let isPrevented = false;

  return {
    detail,
    preventDefault: () => {
      isPrevented = true;
    },
    isPrevented: () => isPrevented,
  };
}

describe('shouldActivateFromClick', () => {
  it('activates the app and lets the link navigate to another route', () => {
    const click = buildClick();

    expect(shouldActivateFromClick(click, '/projects', '/')).toBe(true);
    expect(click.isPrevented()).toBe(false);
  });

  it('activates the app without navigating to the route it is already on', () => {
    const click = buildClick();

    expect(shouldActivateFromClick(click, '/projects', '/projects')).toBe(true);
    expect(click.isPrevented()).toBe(true);
  });

  it('ignores the second click of a double click', () => {
    const click = buildClick(2);

    expect(shouldActivateFromClick(click, '/projects', '/')).toBe(false);
    expect(click.isPrevented()).toBe(true);
  });

  it('treats a keyboard activation, which has no click count, as a single click', () => {
    const click = buildClick(0);

    expect(shouldActivateFromClick(click, '/projects', '/')).toBe(true);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm exec jest src/desktop/util/appLinks`
Expected: FAIL con «Cannot find module './appLinks'».

- [ ] **Step 3: Implement the rule**

Crea `src/desktop/util/appLinks.ts`:

```ts
/** The part of a click on a link that decides what the link does. */
export interface AppLinkClick {
  /** Clicks in a row: 2 on the second click of a double click, 0 from the keyboard. */
  detail: number;
  preventDefault: () => void;
}

/**
 * The single rule for every link that opens an app (dock, greeting, windows
 * overview, tour). It never navigates to the route the router is on, because
 * from an intercepted route that leaves the page empty, and it ignores the
 * second click of a double click, which would undo what the first one did.
 * Returns whether the app should be activated.
 */
export function shouldActivateFromClick(
  click: AppLinkClick,
  href: string,
  currentHref: string,
): boolean {
  if (href === currentHref) click.preventDefault();

  if (click.detail > 1) {
    click.preventDefault();

    return false;
  }

  return true;
}
```

Run: `pnpm exec jest src/desktop/util/appLinks`
Expected: PASS.

- [ ] **Step 4: Use the rule in the dock and the windows overview**

En `src/desktop/ui/Dock.tsx`, borra la función local `activate` y su import `MouseEvent`, importa `import { shouldActivateFromClick } from '../util/appLinks';` y deja el `onClick` del `Link` así:

```tsx
              onClick={(event) => {
                if (shouldActivateFromClick(event, app.href, currentHref)) onActivate(app.id);
              }}
```

En `src/desktop/ui/ActivitiesOverview.tsx`, importa `shouldActivateFromClick` y deja el `onClick` del `Link` así:

```tsx
                onClick={(event) => {
                  if (shouldActivateFromClick(event, app.href, currentHref)) onSelect(app.id);
                }}
```

Run: `pnpm exec jest src/desktop`
Expected: PASS. Los tests de doble clic y de ruta actual de `Dock` y `ActivitiesOverview` siguen en verde.

- [ ] **Step 5: Write the failing test for the greeting**

Crea `src/desktop/ui/DesktopGreeting.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DesktopGreeting } from './DesktopGreeting';

describe('DesktopGreeting', () => {
  it('introduces Daniel with his role', () => {
    render(<DesktopGreeting currentHref="/" onOpen={jest.fn()} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Daniel Jaramillo' })).toBeInTheDocument();
    expect(screen.getByText('Frontend Tech Lead · AI App Developer')).toBeInTheDocument();
  });

  it('explains the desktop metaphor without jargon', () => {
    render(<DesktopGreeting currentHref="/" onOpen={jest.fn()} />);

    expect(
      screen.getByText(
        'Este portafolio funciona como un escritorio: cada sección se abre en su propia ventana.',
      ),
    ).toBeInTheDocument();
  });

  it('links to the profile first, then to the projects and the AI', () => {
    render(<DesktopGreeting currentHref="/" onOpen={jest.fn()} />);

    const links = screen.getAllByRole('link');

    expect(links.map((link) => link.textContent)).toEqual([
      'Ver mi perfil y CV',
      'Ver proyectos',
      'Pregúntale a mi IA',
    ]);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/about',
      '/projects',
      '/terminal',
    ]);
  });

  it('opens the app of the link that was clicked', async () => {
    const user = userEvent.setup();
    const onOpen = jest.fn();
    render(<DesktopGreeting currentHref="/" onOpen={onOpen} />);

    await user.click(screen.getByRole('link', { name: 'Ver mi perfil y CV' }));

    expect(onOpen).toHaveBeenCalledWith('about');
  });
});
```

Run: `pnpm exec jest src/desktop/ui/DesktopGreeting`
Expected: FAIL. El componente actual no tiene props ni enlaces.

- [ ] **Step 6: Implement the greeting**

Reemplaza `src/desktop/ui/DesktopGreeting.tsx`:

```tsx
import { cva } from 'class-variance-authority';
import Link from 'next/link';
import { useId, type ReactNode } from 'react';

import { APPS, type AppId } from '../util/apps';
import { shouldActivateFromClick } from '../util/appLinks';

/** In order of importance: a recruiter comes for the profile first. */
const GREETING_ACTIONS: readonly { appId: AppId; label: string }[] = [
  { appId: 'about', label: 'Ver mi perfil y CV' },
  { appId: 'projects', label: 'Ver proyectos' },
  { appId: 'terminal', label: 'Pregúntale a mi IA' },
];

const action = cva(
  'inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-200 motion-reduce:transition-none',
  {
    variants: {
      emphasis: {
        primary: 'bg-primary text-on-primary hover:opacity-90',
        secondary: 'border border-border bg-surface/80 hover:bg-surface-raised',
      },
    },
  },
);

interface DesktopGreetingProps {
  /** The route the router is on: a link to it does not navigate. */
  currentHref: string;
  onOpen: (id: AppId) => void;
}

export function DesktopGreeting({ currentHref, onOpen }: DesktopGreetingProps): ReactNode {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center"
    >
      <h1 id={headingId} className="font-display text-4xl font-bold sm:text-6xl">
        Daniel Jaramillo
      </h1>
      <p className="text-lg text-muted">Frontend Tech Lead · AI App Developer</p>
      <p className="max-w-md text-sm text-muted">
        Este portafolio funciona como un escritorio: cada sección se abre en su propia ventana.
      </p>
      <ul className="mt-3 flex flex-wrap justify-center gap-3">
        {GREETING_ACTIONS.map(({ appId, label }, index) => (
          <li key={appId}>
            <Link
              href={APPS[appId].href}
              onClick={(event) => {
                if (shouldActivateFromClick(event, APPS[appId].href, currentHref)) onOpen(appId);
              }}
              className={action({ emphasis: index === 0 ? 'primary' : 'secondary' })}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

Run: `pnpm exec jest src/desktop/ui/DesktopGreeting`
Expected: PASS.

- [ ] **Step 7: Wire the greeting in the desktop and update the heading tests**

En `src/desktop/feature/Desktop.tsx`, cambia `<DesktopGreeting />` por:

```tsx
<DesktopGreeting currentHref={currentHref} onOpen={select} />
```

En `src/desktop/feature/Desktop.test.tsx`, cambia la aserción del `h1` del primer test a `{ level: 1, name: 'Daniel Jaramillo' }` y añade:

```tsx
it('opens the profile from the greeting', async () => {
  const user = renderDesktop();

  await user.click(screen.getByRole('link', { name: 'Ver mi perfil y CV' }));

  expect(screen.getByRole('dialog', { name: 'Perfil y CV' })).toBeInTheDocument();
});
```

En `e2e/desktop.spec.ts`, cambia las dos apariciones de `{ level: 1, name: 'Dani OS' }` por `{ level: 1, name: 'Daniel Jaramillo' }` y añade dentro de `test.describe('desktop shell', …)`:

```ts
test('opens the profile from the greeting', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Ver mi perfil y CV' }).click();

  await expect(page).toHaveURL('/about');
  await expect(page.getByRole('dialog', { name: 'Perfil y CV' })).toBeVisible();
});
```

- [ ] **Step 8: Run the suites**

Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm e2e`
Expected: todo en verde.

- [ ] **Step 9: Commit**

```bash
git add src/desktop e2e
git commit -m "feat(desktop): greet visitors with direct links to the profile, projects and ai

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Recorrido — lógica pura y persistencia

**Files:**

- Create: `src/desktop/util/tourSteps.ts`, `src/desktop/util/tourSteps.test.ts`
- Create: `src/desktop/util/balloonPosition.ts`, `src/desktop/util/balloonPosition.test.ts`
- Create: `src/desktop/data-access/onboardingStorage.ts`, `src/desktop/data-access/onboardingStorage.test.ts`

**Interfaces:**

- Consumes: `DOCK_ID`, `getDockItemId` (Task 1).
- Produces:
  - `interface TourStep { id: string; anchorId: string; title: string; body: string }`
  - `TOUR_STEPS: readonly TourStep[]`
  - `getNextStepIndex(index: number, count: number): number | null`
  - `getPreviousStepIndex(index: number): number`
  - `interface Rect { top: number; left: number; width: number; height: number }`
  - `interface ViewportSize { width: number; height: number }`
  - `interface BalloonPosition { left: number; bottom: number; arrowLeft: number }`
  - `getBalloonWidth(viewportWidth: number): number`
  - `getBalloonPosition(anchor: Rect, viewport: ViewportSize, width: number): BalloonPosition`
  - `ONBOARDING_STORAGE_KEY = 'dani-os:onboarding:v1'`
  - `interface OnboardingStorage { hasSeenTour: () => boolean; markTourSeen: () => void }`
  - `createOnboardingStorage(getStorage?: () => Storage): OnboardingStorage`
  - `browserOnboardingStorage: OnboardingStorage`

- [ ] **Step 1: Write the failing tests**

Crea `src/desktop/util/tourSteps.test.ts`:

```ts
import { DOCK_ID, getDockItemId } from './apps';
import { getNextStepIndex, getPreviousStepIndex, TOUR_STEPS } from './tourSteps';

describe('TOUR_STEPS', () => {
  it('points at the profile, then the dock, then the ai', () => {
    expect(TOUR_STEPS.map((step) => step.anchorId)).toEqual([
      getDockItemId('about'),
      DOCK_ID,
      getDockItemId('terminal'),
    ]);
  });

  it('carries the copy agreed in the spec', () => {
    expect(TOUR_STEPS.map((step) => step.body)).toEqual([
      'Empieza aquí: mi perfil, experiencia y CV para descargar.',
      'Cada icono abre una sección en su propia ventana. Ciérrala con ✕ o vuelve a pulsar su icono para minimizarla.',
      'Pregúntale a mi IA por mi experiencia: responde y te muestra en un grafo de qué está hablando.',
    ]);
  });
});

describe('getNextStepIndex', () => {
  it('moves to the following step', () => {
    expect(getNextStepIndex(0, 3)).toBe(1);
  });

  it('is null after the last step, which ends the tour', () => {
    expect(getNextStepIndex(2, 3)).toBeNull();
  });
});

describe('getPreviousStepIndex', () => {
  it('moves to the step before', () => {
    expect(getPreviousStepIndex(2)).toBe(1);
  });

  it('never goes before the first step', () => {
    expect(getPreviousStepIndex(0)).toBe(0);
  });
});
```

Crea `src/desktop/util/balloonPosition.test.ts`:

```ts
import { getBalloonPosition, getBalloonWidth } from './balloonPosition';

const VIEWPORT = { width: 1280, height: 800 };

describe('getBalloonWidth', () => {
  it('is 20rem where there is room', () => {
    expect(getBalloonWidth(1280)).toBe(320);
  });

  it('leaves a margin on each side of a narrow screen', () => {
    expect(getBalloonWidth(320)).toBe(288);
  });
});

describe('getBalloonPosition', () => {
  const anchor = { top: 720, left: 600, width: 64, height: 68 };

  it('centers the balloon over its anchor', () => {
    const position = getBalloonPosition(anchor, VIEWPORT, 320);

    expect(position.left + 320 / 2).toBe(anchor.left + anchor.width / 2);
  });

  it('sits above the anchor, with a gap', () => {
    const position = getBalloonPosition(anchor, VIEWPORT, 320);

    expect(VIEWPORT.height - position.bottom).toBeLessThan(anchor.top);
  });

  it('stays inside the screen when the anchor is near an edge', () => {
    const nearLeft = getBalloonPosition({ ...anchor, left: 0 }, VIEWPORT, 320);
    const nearRight = getBalloonPosition({ ...anchor, left: 1250 }, VIEWPORT, 320);

    expect(nearLeft.left).toBeGreaterThanOrEqual(16);
    expect(nearRight.left + 320).toBeLessThanOrEqual(VIEWPORT.width - 16);
  });

  it('points the arrow at the anchor when the balloon is pushed aside', () => {
    const nearEdge = { ...anchor, left: 40 };

    const position = getBalloonPosition(nearEdge, VIEWPORT, 320);

    expect(position.left + position.arrowLeft).toBe(nearEdge.left + nearEdge.width / 2);
  });

  it('keeps the arrow off the rounded corner when the anchor is right at the edge', () => {
    const position = getBalloonPosition({ ...anchor, left: 0 }, VIEWPORT, 320);

    expect(position.arrowLeft).toBe(24);
  });

  it('fits a 320px phone', () => {
    const phone = { width: 320, height: 640 };
    const width = getBalloonWidth(phone.width);

    const position = getBalloonPosition(
      { top: 570, left: 230, width: 64, height: 68 },
      phone,
      width,
    );

    expect(position.left).toBeGreaterThanOrEqual(16);
    expect(position.left + width).toBeLessThanOrEqual(phone.width - 16);
  });
});
```

Crea `src/desktop/data-access/onboardingStorage.test.ts`:

```ts
import { createOnboardingStorage, ONBOARDING_STORAGE_KEY } from './onboardingStorage';

const failingStorage = (): Storage => {
  throw new Error('Storage is blocked');
};

describe('createOnboardingStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('has not seen the tour on a first visit', () => {
    expect(createOnboardingStorage().hasSeenTour()).toBe(false);
  });

  it('remembers that the tour was seen', () => {
    createOnboardingStorage().markTourSeen();

    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe('seen');
    expect(createOnboardingStorage().hasSeenTour()).toBe(true);
  });

  describe('when the storage is blocked', () => {
    let warn: jest.SpyInstance;

    beforeEach(() => {
      warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
      warn.mockRestore();
    });

    it('treats the tour as not seen, and says why', () => {
      expect(createOnboardingStorage(failingStorage).hasSeenTour()).toBe(false);
      expect(warn).toHaveBeenCalled();
    });

    it('does not break when saving, and says why', () => {
      expect(() => {
        createOnboardingStorage(failingStorage).markTourSeen();
      }).not.toThrow();
      expect(warn).toHaveBeenCalled();
    });
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm exec jest src/desktop/util/tourSteps src/desktop/util/balloonPosition src/desktop/data-access/onboardingStorage`
Expected: FAIL con «Cannot find module» en los tres.

- [ ] **Step 3: Implement the three modules**

Crea `src/desktop/util/tourSteps.ts`:

```ts
import { DOCK_ID, getDockItemId } from './apps';

export interface TourStep {
  id: string;
  /** DOM id of the element the balloon points at. Always in the dock, which is always visible. */
  anchorId: string;
  title: string;
  body: string;
}

export const TOUR_STEPS: readonly TourStep[] = [
  {
    id: 'profile',
    anchorId: getDockItemId('about'),
    title: 'Empieza por aquí',
    body: 'Empieza aquí: mi perfil, experiencia y CV para descargar.',
  },
  {
    id: 'dock',
    anchorId: DOCK_ID,
    title: 'Una ventana por sección',
    body: 'Cada icono abre una sección en su propia ventana. Ciérrala con ✕ o vuelve a pulsar su icono para minimizarla.',
  },
  {
    id: 'ai',
    anchorId: getDockItemId('terminal'),
    title: 'Habla con mi IA',
    body: 'Pregúntale a mi IA por mi experiencia: responde y te muestra en un grafo de qué está hablando.',
  },
];

/** The step after `index`, or `null` once the last one is done. */
export function getNextStepIndex(index: number, count: number): number | null {
  return index + 1 < count ? index + 1 : null;
}

export function getPreviousStepIndex(index: number): number {
  return Math.max(0, index - 1);
}
```

Crea `src/desktop/util/balloonPosition.ts`:

```ts
/** A box on screen, like a `DOMRect`. */
export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface ViewportSize {
  width: number;
  height: number;
}

export interface BalloonPosition {
  /** Distance from the left edge of the screen. */
  left: number;
  /** Distance from the bottom edge of the screen: the balloon sits above its anchor. */
  bottom: number;
  /** Where the arrow goes, from the left edge of the balloon. */
  arrowLeft: number;
}

const MAX_WIDTH_PX = 320;
const VIEWPORT_MARGIN_PX = 16;
const ANCHOR_GAP_PX = 12;
/** Keeps the arrow off the rounded corners of the balloon. */
const ARROW_INSET_PX = 24;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getBalloonWidth(viewportWidth: number): number {
  return Math.min(MAX_WIDTH_PX, viewportWidth - VIEWPORT_MARGIN_PX * 2);
}

/** Centers the balloon above its anchor, pushed back inside the screen near an edge. */
export function getBalloonPosition(
  anchor: Rect,
  viewport: ViewportSize,
  width: number,
): BalloonPosition {
  const anchorCenter = anchor.left + anchor.width / 2;
  const maxLeft = Math.max(VIEWPORT_MARGIN_PX, viewport.width - VIEWPORT_MARGIN_PX - width);
  const left = clamp(anchorCenter - width / 2, VIEWPORT_MARGIN_PX, maxLeft);

  return {
    left,
    bottom: viewport.height - anchor.top + ANCHOR_GAP_PX,
    arrowLeft: clamp(anchorCenter - left, ARROW_INSET_PX, width - ARROW_INSET_PX),
  };
}
```

Crea `src/desktop/data-access/onboardingStorage.ts`:

```ts
/** Versioned, so a tour that changes a lot can be shown again to everyone. */
export const ONBOARDING_STORAGE_KEY = 'dani-os:onboarding:v1';
const SEEN = 'seen';

export interface OnboardingStorage {
  hasSeenTour: () => boolean;
  markTourSeen: () => void;
}

/**
 * Remembers whether the visitor has seen the onboarding tour. Storage can be
 * blocked (private browsing, disabled cookies): then the tour shows on every
 * visit, which is the safe side, and the reason is logged.
 */
export function createOnboardingStorage(
  getStorage: () => Storage = () => window.localStorage,
): OnboardingStorage {
  return {
    hasSeenTour: () => {
      try {
        return getStorage().getItem(ONBOARDING_STORAGE_KEY) === SEEN;
      } catch (error) {
        console.warn('Could not read whether the onboarding tour was seen', error);

        return false;
      }
    },
    markTourSeen: () => {
      try {
        getStorage().setItem(ONBOARDING_STORAGE_KEY, SEEN);
      } catch (error) {
        console.warn('Could not remember that the onboarding tour was seen', error);
      }
    },
  };
}

export const browserOnboardingStorage: OnboardingStorage = createOnboardingStorage();
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm exec jest src/desktop/util/tourSteps src/desktop/util/balloonPosition src/desktop/data-access/onboardingStorage`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/desktop/util/tourSteps.ts src/desktop/util/tourSteps.test.ts src/desktop/util/balloonPosition.ts src/desktop/util/balloonPosition.test.ts src/desktop/data-access/onboardingStorage.ts src/desktop/data-access/onboardingStorage.test.ts
git commit -m "feat(desktop): add onboarding tour steps, balloon layout and storage

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Recorrido — el globo

**Files:**

- Create: `src/desktop/ui/TourBalloon.tsx`, `src/desktop/ui/TourBalloon.test.tsx`
- Modify: `src/core/styles/globals.css`

**Interfaces:**

- Consumes: `TourStep`, `BalloonPosition` (Task 3).
- Produces: `TourBalloon` con props:

```ts
interface TourBalloonProps {
  step: TourStep;
  stepNumber: number; // 1-based
  stepCount: number;
  position: BalloonPosition;
  width: number;
  /** Shown on the last step: a link that ends the tour and opens an app. */
  finalAction: {
    label: string;
    href: string;
    onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  };
  onNext: () => void;
  onPrevious: () => void;
  /** «Saltar guía», «Terminar» and Escape. */
  onClose: () => void;
}
```

- [ ] **Step 1: Write the failing test**

Crea `src/desktop/ui/TourBalloon.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';

import { TOUR_STEPS } from '../util/tourSteps';
import { TourBalloon } from './TourBalloon';

type TourBalloonProps = ComponentProps<typeof TourBalloon>;

function renderBalloon(
  stepIndex: number,
  overrides: Partial<TourBalloonProps> = {},
): TourBalloonProps {
  const step = TOUR_STEPS[stepIndex];
  if (!step) throw new Error(`There is no step ${String(stepIndex)}`);

  const props: TourBalloonProps = {
    step,
    stepNumber: stepIndex + 1,
    stepCount: TOUR_STEPS.length,
    position: { left: 100, bottom: 120, arrowLeft: 160 },
    width: 320,
    finalAction: { label: 'Ver mi perfil y CV', href: '/about', onClick: jest.fn() },
    onNext: jest.fn(),
    onPrevious: jest.fn(),
    onClose: jest.fn(),
    ...overrides,
  };
  render(<TourBalloon {...props} />);

  return props;
}

describe('TourBalloon', () => {
  it('is a non-modal dialog named after its step', () => {
    renderBalloon(0);

    const balloon = screen.getByRole('dialog', { name: 'Empieza por aquí' });

    expect(balloon).toHaveAttribute('aria-modal', 'false');
    expect(balloon).toHaveAccessibleDescription(
      'Empieza aquí: mi perfil, experiencia y CV para descargar.',
    );
  });

  it('says where the visitor is in the tour', () => {
    renderBalloon(1);

    expect(screen.getByText('Paso 2 de 3')).toBeInTheDocument();
  });

  it('takes the focus when it shows a step', () => {
    renderBalloon(0);

    expect(screen.getByRole('dialog', { name: 'Empieza por aquí' })).toHaveFocus();
  });

  it('moves forward and lets the visitor skip from the first step', async () => {
    const user = userEvent.setup();
    const { onNext, onClose } = renderBalloon(0);

    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    await user.click(screen.getByRole('button', { name: 'Saltar guía' }));

    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Anterior' })).not.toBeInTheDocument();
  });

  it('goes back from a later step', async () => {
    const user = userEvent.setup();
    const { onPrevious } = renderBalloon(1);

    await user.click(screen.getByRole('button', { name: 'Anterior' }));

    expect(onPrevious).toHaveBeenCalledTimes(1);
  });

  it('ends on the last step with a way to the profile and a way out', async () => {
    const user = userEvent.setup();
    const { finalAction, onClose } = renderBalloon(2);

    expect(screen.queryByRole('button', { name: 'Siguiente' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver mi perfil y CV' })).toHaveAttribute(
      'href',
      '/about',
    );

    await user.click(screen.getByRole('link', { name: 'Ver mi perfil y CV' }));
    await user.click(screen.getByRole('button', { name: 'Terminar' }));

    expect(finalAction.onClick).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes with Escape', async () => {
    const user = userEvent.setup();
    const { onClose } = renderBalloon(0);

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('sits where its position says, with the given width', () => {
    renderBalloon(0);

    expect(screen.getByRole('dialog', { name: 'Empieza por aquí' })).toHaveStyle({
      left: '100px',
      bottom: '120px',
      width: '320px',
    });
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm exec jest src/desktop/ui/TourBalloon`
Expected: FAIL con «Cannot find module './TourBalloon'».

- [ ] **Step 3: Implement the balloon**

Crea `src/desktop/ui/TourBalloon.tsx`:

```tsx
'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';

import { FADE_TRANSITION } from '@/shared/util/motion';

import type { BalloonPosition } from '../util/balloonPosition';
import type { TourStep } from '../util/tourSteps';

const BUTTON =
  'rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 motion-reduce:transition-none';
const PRIMARY_BUTTON = `${BUTTON} bg-primary text-on-primary hover:opacity-90`;
const SECONDARY_BUTTON = `${BUTTON} border border-border hover:bg-surface`;
const QUIET_BUTTON =
  'rounded-full px-2 py-2 text-sm text-muted underline-offset-4 hover:text-foreground hover:underline';
/** Half the side of the rotated square that draws the arrow. */
const ARROW_HALF_SIZE_PX = 6;

interface TourBalloonProps {
  step: TourStep;
  /** 1-based. */
  stepNumber: number;
  stepCount: number;
  position: BalloonPosition;
  width: number;
  /** Shown on the last step: a link that ends the tour and opens an app. */
  finalAction: {
    label: string;
    href: string;
    onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  };
  onNext: () => void;
  onPrevious: () => void;
  /** «Saltar guía», «Terminar» and Escape. */
  onClose: () => void;
}

/** One step of the onboarding tour, pointing down at its anchor. Never blocks the page. */
export function TourBalloon({
  step,
  stepNumber,
  stepCount,
  position,
  width,
  finalAction,
  onNext,
  onPrevious,
  onClose,
}: TourBalloonProps): ReactNode {
  const titleId = useId();
  const bodyId = useId();
  const balloonRef = useRef<HTMLDivElement>(null);
  const isFirstStep = stepNumber === 1;
  const isLastStep = stepNumber === stepCount;

  // Each step is announced and reachable by keyboard as soon as it shows.
  useEffect(() => {
    balloonRef.current?.focus({ preventScroll: true });
  }, [step.id]);

  const closeOnEscape = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape') return;

    // The desktop closes the windows overview on Escape too.
    event.stopPropagation();
    onClose();
  };

  return (
    <motion.div
      ref={balloonRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      tabIndex={-1}
      onKeyDown={closeOnEscape}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={FADE_TRANSITION}
      style={{ left: position.left, bottom: position.bottom, width }}
      className="fixed z-50 flex flex-col gap-2 rounded-card border border-border bg-surface-raised p-4 shadow-window"
    >
      <p className="text-xs text-muted">
        Paso {stepNumber} de {stepCount}
      </p>
      <h2 id={titleId} className="font-display text-lg font-bold">
        {step.title}
      </h2>
      <p id={bodyId} className="text-sm">
        {step.body}
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={onClose} className={QUIET_BUTTON}>
          {isLastStep ? 'Terminar' : 'Saltar guía'}
        </button>
        <div className="flex flex-wrap gap-2">
          {isFirstStep ? null : (
            <button type="button" onClick={onPrevious} className={SECONDARY_BUTTON}>
              Anterior
            </button>
          )}
          {isLastStep ? (
            <Link href={finalAction.href} onClick={finalAction.onClick} className={PRIMARY_BUTTON}>
              {finalAction.label}
            </Link>
          ) : (
            <button type="button" onClick={onNext} className={PRIMARY_BUTTON}>
              Siguiente
            </button>
          )}
        </div>
      </div>
      <span
        aria-hidden="true"
        style={{ left: position.arrowLeft - ARROW_HALF_SIZE_PX }}
        className="absolute -bottom-1.5 size-3 rotate-45 border-r border-b border-border bg-surface-raised"
      />
    </motion.div>
  );
}
```

- [ ] **Step 4: Add the highlight ring**

En `src/core/styles/globals.css`, dentro de `@layer base { … }` y tras la regla `:focus-visible`, añade:

```css
/* The element the onboarding tour points at. */
[data-tour-highlight] {
  outline: 2px solid var(--color-primary);
  outline-offset: 4px;
  animation: tour-highlight 1.6s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  [data-tour-highlight] {
    animation: none;
  }
}
```

Y fuera de `@layer base`, al final del archivo:

```css
@keyframes tour-highlight {
  50% {
    outline-color: color-mix(in oklab, var(--color-primary) 35%, transparent);
  }
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm exec jest src/desktop/ui/TourBalloon && pnpm lint`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/desktop/ui/TourBalloon.tsx src/desktop/ui/TourBalloon.test.tsx src/core/styles/globals.css
git commit -m "feat(desktop): add the onboarding tour balloon

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Recorrido — integración en el escritorio

**Files:**

- Create: `src/desktop/feature/useOnboardingTour.ts`, `src/desktop/feature/useOnboardingTour.test.ts`
- Create: `src/desktop/feature/OnboardingTour.tsx`
- Modify: `src/desktop/ui/TopBar.tsx`, `src/desktop/ui/TopBar.test.tsx`
- Modify: `src/desktop/feature/Desktop.tsx`, `src/desktop/feature/Desktop.test.tsx`
- Modify: `e2e/support.ts` y todos los `e2e/*.spec.ts`
- Create: `e2e/tour.spec.ts`
- Modify: `e2e/accessibility.spec.ts`, `e2e/mobile.spec.ts`
- Modify: `docs/superpowers/specs/2026-10-03-onboarding-y-ia-design.md`

**Interfaces:**

- Consumes: Tasks 2, 3 y 4.
- Produces:
  - `useOnboardingTour(storage?: OnboardingStorage, startDelayMs?: number): OnboardingTourControls`, con `interface OnboardingTourControls { isOpen: boolean; start: () => void; end: () => void }`
  - `TopBar` gana la prop `onOpenGuide: () => void`
  - En `e2e/support.ts`: `test` (con opción `hasSeenTour`, por defecto `true`), `expect` y `dockLink`

- [ ] **Step 1: Write the failing test for the hook**

Crea `src/desktop/feature/useOnboardingTour.test.ts`:

```ts
import { act, renderHook } from '@testing-library/react';

import type { OnboardingStorage } from '../data-access/onboardingStorage';
import { useOnboardingTour } from './useOnboardingTour';

const START_DELAY_MS = 700;

function buildStorage(hasSeen: boolean): OnboardingStorage & { markTourSeen: jest.Mock } {
  return { hasSeenTour: () => hasSeen, markTourSeen: jest.fn() };
}

describe('useOnboardingTour', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('opens a moment after a first visit', () => {
    const { result } = renderHook(() => useOnboardingTour(buildStorage(false), START_DELAY_MS));
    expect(result.current.isOpen).toBe(false);

    act(() => {
      jest.advanceTimersByTime(START_DELAY_MS);
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('stays closed once seen', () => {
    const { result } = renderHook(() => useOnboardingTour(buildStorage(true), START_DELAY_MS));

    act(() => {
      jest.advanceTimersByTime(START_DELAY_MS);
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('opens on demand even once seen', () => {
    const { result } = renderHook(() => useOnboardingTour(buildStorage(true), START_DELAY_MS));

    act(() => {
      result.current.start();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('closes and remembers it was seen', () => {
    const storage = buildStorage(false);
    const { result } = renderHook(() => useOnboardingTour(storage, START_DELAY_MS));
    act(() => {
      jest.advanceTimersByTime(START_DELAY_MS);
    });

    act(() => {
      result.current.end();
    });

    expect(result.current.isOpen).toBe(false);
    expect(storage.markTourSeen).toHaveBeenCalledTimes(1);
  });

  it('does not appear later when the visitor got going before it showed', () => {
    const storage = buildStorage(false);
    const { result } = renderHook(() => useOnboardingTour(storage, START_DELAY_MS));

    act(() => {
      result.current.end();
      jest.advanceTimersByTime(START_DELAY_MS);
    });

    expect(result.current.isOpen).toBe(false);
    expect(storage.markTourSeen).toHaveBeenCalledTimes(1);
  });

  it('does nothing when ended while it is not active', () => {
    const storage = buildStorage(true);
    const { result } = renderHook(() => useOnboardingTour(storage, START_DELAY_MS));

    act(() => {
      result.current.end();
    });

    expect(storage.markTourSeen).not.toHaveBeenCalled();
  });

  it('still opens, and can be closed, when the storage is blocked', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const blocked: OnboardingStorage = {
      hasSeenTour: () => false,
      markTourSeen: () => {
        console.warn('blocked');
      },
    };
    const { result } = renderHook(() => useOnboardingTour(blocked, START_DELAY_MS));

    act(() => {
      jest.advanceTimersByTime(START_DELAY_MS);
    });
    act(() => {
      result.current.end();
    });

    expect(result.current.isOpen).toBe(false);
    warn.mockRestore();
  });
});
```

Run: `pnpm exec jest src/desktop/feature/useOnboardingTour`
Expected: FAIL con «Cannot find module './useOnboardingTour'».

- [ ] **Step 2: Implement the hook**

Crea `src/desktop/feature/useOnboardingTour.ts`:

```ts
'use client';

import { useEffect, useRef, useState } from 'react';

import { browserOnboardingStorage, type OnboardingStorage } from '../data-access/onboardingStorage';

/** Lets the desktop paint and settle before the first balloon points at it. */
const TOUR_START_DELAY_MS = 700;

export interface OnboardingTourControls {
  isOpen: boolean;
  start: () => void;
  /** Closes the tour, or cancels it before it shows, and remembers it was seen. */
  end: () => void;
}

/** Shows the tour on a first visit, and on demand from «Guía». */
export function useOnboardingTour(
  storage: OnboardingStorage = browserOnboardingStorage,
  startDelayMs: number = TOUR_START_DELAY_MS,
): OnboardingTourControls {
  const [isOpen, setIsOpen] = useState(false);
  const pendingStartRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (storage.hasSeenTour()) return;

    pendingStartRef.current = setTimeout(() => {
      pendingStartRef.current = null;
      setIsOpen(true);
    }, startDelayMs);

    return () => {
      if (pendingStartRef.current) clearTimeout(pendingStartRef.current);
    };
  }, [storage, startDelayMs]);

  return {
    isOpen,
    start: () => {
      setIsOpen(true);
    },
    end: () => {
      const isPending = pendingStartRef.current !== null;
      if (pendingStartRef.current) {
        clearTimeout(pendingStartRef.current);
        pendingStartRef.current = null;
      }
      if (!isOpen && !isPending) return;

      setIsOpen(false);
      storage.markTourSeen();
    },
  };
}
```

Run: `pnpm exec jest src/desktop/feature/useOnboardingTour`
Expected: PASS.

- [ ] **Step 3: Implement the tour component**

Crea `src/desktop/feature/OnboardingTour.tsx`:

```tsx
'use client';

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';

import { TourBalloon } from '../ui/TourBalloon';
import {
  getBalloonPosition,
  getBalloonWidth,
  type Rect,
  type ViewportSize,
} from '../util/balloonPosition';
import { getNextStepIndex, getPreviousStepIndex, TOUR_STEPS } from '../util/tourSteps';

const HIGHLIGHT_ATTRIBUTE = 'data-tour-highlight';

interface AnchorLayout {
  anchor: Rect;
  viewport: ViewportSize;
}

function measureAnchor(anchorId: string): AnchorLayout | null {
  const element = document.getElementById(anchorId);
  if (!element) return null;

  const { top, left, width, height } = element.getBoundingClientRect();

  return {
    anchor: { top, left, width, height },
    viewport: { width: window.innerWidth, height: window.innerHeight },
  };
}

/** Where the anchor is on screen, measured again when the window resizes. */
function useAnchorLayout(anchorId: string): AnchorLayout | null {
  const [layout, setLayout] = useState<AnchorLayout | null>(null);

  useEffect(() => {
    const update = (): void => {
      setLayout(measureAnchor(anchorId));
    };
    // Measured on the next frame, once the dock has its final layout.
    const frame = requestAnimationFrame(update);
    window.addEventListener('resize', update);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', update);
    };
  }, [anchorId]);

  return layout;
}

/** Rings the element the current step points at. */
function useHighlight(anchorId: string): void {
  useEffect(() => {
    const element = document.getElementById(anchorId);
    element?.setAttribute(HIGHLIGHT_ATTRIBUTE, '');

    return () => {
      element?.removeAttribute(HIGHLIGHT_ATTRIBUTE);
    };
  }, [anchorId]);
}

interface OnboardingTourProps {
  /** Ends the tour: «Saltar guía», «Terminar», Escape. */
  onClose: () => void;
  /** The link on the last step. It ends the tour itself, through the app it opens. */
  finalAction: {
    label: string;
    href: string;
    onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  };
}

export function OnboardingTour({ onClose, finalAction }: OnboardingTourProps): ReactNode {
  const [stepIndex, setStepIndex] = useState(0);
  const step = TOUR_STEPS[stepIndex] ?? TOUR_STEPS[0];
  const anchorId = step?.anchorId ?? '';
  const layout = useAnchorLayout(anchorId);
  // Where the focus was before the tour took it, to give it back on close. Read
  // on the first render: the balloon takes the focus in its own effect, which
  // runs before any effect of this component. The tour only renders in the
  // browser (it opens after mount), so `document` exists here.
  const returnFocusRef = useRef<Element | null>(document.activeElement);
  useHighlight(anchorId);

  if (!step || !layout) return null;

  /** Closing gives the focus back; opening an app leaves it to the new window. */
  const close = (): void => {
    const returnFocus = returnFocusRef.current;
    onClose();
    if (returnFocus instanceof HTMLElement && returnFocus.isConnected) returnFocus.focus();
  };

  const width = getBalloonWidth(layout.viewport.width);

  return (
    <TourBalloon
      step={step}
      stepNumber={stepIndex + 1}
      stepCount={TOUR_STEPS.length}
      position={getBalloonPosition(layout.anchor, layout.viewport, width)}
      width={width}
      finalAction={finalAction}
      onNext={() => {
        const nextIndex = getNextStepIndex(stepIndex, TOUR_STEPS.length);
        if (nextIndex === null) close();
        else setStepIndex(nextIndex);
      }}
      onPrevious={() => {
        setStepIndex(getPreviousStepIndex(stepIndex));
      }}
      onClose={close}
    />
  );
}
```

> `react-hooks/set-state-in-effect` está activo en este proyecto. `useAnchorLayout` no lo dispara porque solo fija estado dentro de `requestAnimationFrame` y del listener de `resize`, nunca de forma síncrona en el efecto.

- [ ] **Step 4: Add «Guía» to the top bar (test first)**

En `src/desktop/ui/TopBar.test.tsx`, añade `onOpenGuide={jest.fn()}` a los dos `render` existentes y añade:

```tsx
it('relaunches the guide from its button', async () => {
  const user = userEvent.setup();
  const onOpenGuide = jest.fn();
  render(
    <TopBar
      isOverviewOpen={false}
      overviewId="overview"
      onToggleOverview={jest.fn()}
      onOpenGuide={onOpenGuide}
    />,
  );

  await user.click(screen.getByRole('button', { name: 'Guía' }));

  expect(onOpenGuide).toHaveBeenCalledTimes(1);
});
```

Run: `pnpm exec jest src/desktop/ui/TopBar`
Expected: FAIL. No existe el botón «Guía».

En `src/desktop/ui/TopBar.tsx`, añade `onOpenGuide: () => void;` a `TopBarProps`, desestructúralo y reemplaza el `<p className="hidden justify-self-end …">Daniel Jaramillo</p>` por:

```tsx
<div className="flex items-center gap-1 justify-self-end">
  <p className="hidden px-3 text-muted sm:block">Daniel Jaramillo</p>
  <button
    type="button"
    onClick={onOpenGuide}
    className="rounded-full px-4 py-1.5 font-semibold transition-colors duration-200 hover:bg-surface-raised motion-reduce:transition-none"
  >
    Guía
  </button>
</div>
```

Run: `pnpm exec jest src/desktop/ui/TopBar`
Expected: PASS.

- [ ] **Step 5: Write the failing Desktop tests for the tour**

En `src/desktop/feature/Desktop.test.tsx`:

1. Importa `import { ONBOARDING_STORAGE_KEY } from '../data-access/onboardingStorage';`.
2. En el `beforeEach` existente añade `window.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'seen');`. Así los tests existentes no ven el recorrido.
3. Añade al final del `describe('Desktop', …)`:

```tsx
describe('onboarding tour', () => {
  const FIRST_STEP = 'Empieza por aquí';

  it('greets a first visit with the tour', async () => {
    window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    renderDesktop();

    expect(
      await screen.findByRole('dialog', { name: FIRST_STEP }, { timeout: 2000 }),
    ).toBeInTheDocument();
  });

  it('relaunches the tour from «Guía»', async () => {
    const user = renderDesktop();

    await user.click(screen.getByRole('button', { name: 'Guía' }));

    expect(await screen.findByRole('dialog', { name: FIRST_STEP })).toBeInTheDocument();
  });

  it('closes the windows overview to make room for the tour', async () => {
    const user = renderDesktop();
    await user.click(screen.getByRole('button', { name: 'Ventanas' }));

    await user.click(screen.getByRole('button', { name: 'Guía' }));

    await waitFor(() => {
      expect(screen.queryByRole('region', { name: 'Ventanas abiertas' })).not.toBeInTheDocument();
    });
  });

  it('ends the tour when an app is opened from the dock', async () => {
    const user = renderDesktop();
    await user.click(screen.getByRole('button', { name: 'Guía' }));
    await screen.findByRole('dialog', { name: FIRST_STEP });

    await user.click(dockLink('Perfil y CV'));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: FIRST_STEP })).not.toBeInTheDocument();
    });
    expect(screen.getByRole('dialog', { name: 'Perfil y CV' })).toBeInTheDocument();
  });

  it('opens the profile from the last step', async () => {
    const user = renderDesktop();
    await user.click(screen.getByRole('button', { name: 'Guía' }));
    await screen.findByRole('dialog', { name: FIRST_STEP });

    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    const lastStep = await screen.findByRole('dialog', { name: 'Habla con mi IA' });
    await user.click(within(lastStep).getByRole('link', { name: 'Ver mi perfil y CV' }));

    expect(screen.getByRole('dialog', { name: 'Perfil y CV' })).toBeInTheDocument();
  });
});
```

Run: `pnpm exec jest src/desktop/feature/Desktop`
Expected: FAIL. El escritorio no monta el recorrido y `TopBar` exige `onOpenGuide`.

- [ ] **Step 6: Mount the tour in the desktop**

En `src/desktop/feature/Desktop.tsx`:

1. Imports: `import { OnboardingTour } from './OnboardingTour';`, `import { useOnboardingTour } from './useOnboardingTour';` y `import { shouldActivateFromClick } from '../util/appLinks';`.
2. Tras `const [isOverviewOpen, setIsOverviewOpen] = useState(false);` añade `const tour = useOnboardingTour();`.
3. Haz que abrir una app termine el recorrido:

```tsx
const select = (id: AppId): void => {
  tour.end();
  open(id);
  setIsOverviewOpen(false);
};

/**
 * The dock icon of an app toggles its window: it opens or restores it, and
 * minimizes it when it is already the one in focus on its own route.
 */
const toggleFromDock = (id: AppId): void => {
  tour.end();
  const isFocusedOnItsRoute = focusedId === id && APPS[id].href === currentHref;

  if (isFocusedOnItsRoute) minimize(id);
  else open(id);
  setIsOverviewOpen(false);
};
```

4. En `<TopBar …>` añade:

```tsx
        onOpenGuide={() => {
          setIsOverviewOpen(false);
          tour.start();
        }}
```

5. Justo antes de `<Dock … />` añade:

```tsx
<AnimatePresence>
  {tour.isOpen ? (
    <OnboardingTour
      onClose={tour.end}
      finalAction={{
        label: 'Ver mi perfil y CV',
        href: APPS.about.href,
        onClick: (event) => {
          if (shouldActivateFromClick(event, APPS.about.href, currentHref)) select('about');
        },
      }}
    />
  ) : null}
</AnimatePresence>
```

Run: `pnpm exec jest src/desktop`
Expected: PASS.

- [ ] **Step 7: Add the e2e fixture and move every spec to it**

Reemplaza `e2e/support.ts`:

```ts
import { test as base, expect, type Locator, type Page } from '@playwright/test';

import { ONBOARDING_STORAGE_KEY } from '../src/desktop/data-access/onboardingStorage';

interface SupportOptions {
  /**
   * Starts the visit as if the onboarding tour had been seen, so it does not
   * get in the way of tests about something else. Tour tests set it to false.
   */
  hasSeenTour: boolean;
}

export const test = base.extend<SupportOptions>({
  hasSeenTour: [true, { option: true }],
  page: async ({ page, hasSeenTour }, use) => {
    if (hasSeenTour) {
      await page.addInitScript((key) => {
        window.localStorage.setItem(key, 'seen');
      }, ONBOARDING_STORAGE_KEY);
    }
    await use(page);
  },
});

export { expect };

/** A link in the dock. Scoped, because the desktop greeting links to the same apps. */
export const dockLink = (page: Page, name: string): Locator =>
  page.getByRole('navigation', { name: 'Dock' }).getByRole('link', { name });
```

En cada `e2e/*.spec.ts`, cambia `import { … expect, test … } from '@playwright/test';` para que `test` y `expect` vengan de `'./support'`. Los tipos (`Page`, `Locator`) y `devices` siguen viniendo de `'@playwright/test'`. Ejemplo para `e2e/mobile.spec.ts`:

```ts
import { devices, type Page } from '@playwright/test';

import { dockLink, expect, test } from './support';
```

- [ ] **Step 8: Write the tour e2e**

Crea `e2e/tour.spec.ts`:

```ts
import type { Locator, Page } from '@playwright/test';

import { ONBOARDING_STORAGE_KEY } from '../src/desktop/data-access/onboardingStorage';
import { dockLink, expect, test } from './support';

test.use({ hasSeenTour: false });

const step = (page: Page, name: string): Locator => page.getByRole('dialog', { name });

test.describe('onboarding tour', () => {
  test('greets a first visit and remembers it was skipped', async ({ page }) => {
    await page.goto('/');

    await expect(step(page, 'Empieza por aquí')).toBeVisible();
    await expect(page.getByText('Paso 1 de 3')).toBeVisible();
    await page.getByRole('button', { name: 'Saltar guía' }).click();

    await expect(step(page, 'Empieza por aquí')).toHaveCount(0);
    expect(
      await page.evaluate((key) => window.localStorage.getItem(key), ONBOARDING_STORAGE_KEY),
    ).toBe('seen');
  });

  test('walks through the three steps and opens the profile at the end', async ({ page }) => {
    await page.goto('/');
    await expect(step(page, 'Empieza por aquí')).toBeVisible();

    await page.getByRole('button', { name: 'Siguiente' }).click();
    await expect(step(page, 'Una ventana por sección')).toBeVisible();
    await page.getByRole('button', { name: 'Siguiente' }).click();
    await step(page, 'Habla con mi IA').getByRole('link', { name: 'Ver mi perfil y CV' }).click();

    await expect(page).toHaveURL('/about');
    await expect(page.getByRole('dialog', { name: 'Perfil y CV' })).toBeVisible();
    await expect(step(page, 'Habla con mi IA')).toHaveCount(0);
  });

  test('ends when the visitor opens the app it points at', async ({ page }) => {
    await page.goto('/');
    await expect(step(page, 'Empieza por aquí')).toBeVisible();

    await dockLink(page, 'Perfil y CV').click();

    await expect(page.getByRole('dialog', { name: 'Perfil y CV' })).toBeVisible();
    await expect(step(page, 'Empieza por aquí')).toHaveCount(0);
  });

  test('closes with Escape and gives the focus back', async ({ page }) => {
    await page.goto('/');
    await expect(step(page, 'Empieza por aquí')).toBeFocused();

    await page.keyboard.press('Escape');

    await expect(step(page, 'Empieza por aquí')).toHaveCount(0);
  });
});

test.describe('onboarding tour once seen', () => {
  test.use({ hasSeenTour: true });

  test('comes back from «Guía»', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Guía' }).click();

    await expect(step(page, 'Empieza por aquí')).toBeVisible();
  });
});
```

En `e2e/accessibility.spec.ts`, añade al final:

```ts
test.describe('accessibility of the onboarding tour (WCAG 2.2 AA)', () => {
  test.use({ hasSeenTour: false });

  for (const [index, title] of [
    'Empieza por aquí',
    'Una ventana por sección',
    'Habla con mi IA',
  ].entries()) {
    test(`tour step ${String(index + 1)}`, async ({ page }) => {
      await page.goto('/');
      for (let next = 0; next < index; next += 1) {
        await page.getByRole('button', { name: 'Siguiente' }).click();
      }
      await expect(page.getByRole('dialog', { name: title })).toBeVisible();

      await expectNoViolations(page);
    });
  }
});
```

En `e2e/mobile.spec.ts`, añade dentro de `test.describe('on a phone', …)`:

```ts
test.describe('first visit', () => {
  test.use({ hasSeenTour: false });

  test('the tour fits on the screen and points at the dock', async ({ page }) => {
    await page.goto('/');
    const balloon = page.getByRole('dialog', { name: 'Empieza por aquí' });
    await expect(balloon).toBeVisible();

    const box = await balloon.boundingBox();
    const screenWidth = page.viewportSize()?.width ?? 0;
    const dockBox = await page.getByRole('navigation', { name: 'Dock' }).boundingBox();

    expect(box?.x).toBeGreaterThanOrEqual(0);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(screenWidth);
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(dockBox?.y ?? 0);
    expect(await hasHorizontalOverflow(page)).toBe(false);
  });
});
```

- [ ] **Step 9: Align the spec with what was built**

En `docs/superpowers/specs/2026-10-03-onboarding-y-ia-design.md`, sección 4.2, cambia «Si durante el recorrido el visitante abre cualquier app (dock, bienvenida o rutas), el recorrido termina y se marca como visto.» por «Si durante el recorrido el visitante abre cualquier app desde el dock, la bienvenida o «Ventanas», el recorrido termina y se marca como visto. Una navegación del navegador (atrás o adelante) no lo cierra.»

- [ ] **Step 10: Run everything**

Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm e2e`
Expected: todo en verde.

- [ ] **Step 11: Commit**

```bash
git add src/desktop e2e docs/superpowers/specs/2026-10-03-onboarding-y-ia-design.md
git commit -m "feat(desktop): guide first visits with a three-step onboarding tour

The tour points at the dock, which is always visible, is skippable and
remembered, and comes back from the new «Guía» button.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: IA — estado de la conversación

**Files:**

- Modify: `src/terminal/util/askAnswers.ts`, `src/terminal/util/askAnswers.test.ts`
- Modify: `src/terminal/data-access/askStore.ts`, `src/terminal/data-access/askStore.test.ts`

**Interfaces:**

- Produces:
  - `WELCOME_MESSAGE: string`
  - `interface NodeDescription extends Answer { question: string }`
  - `describeNode(nodeId: string): NodeDescription`
  - En `AskStore`: `hasInteracted: boolean`, `hasWelcomed: boolean`, `markWelcomed: () => void`; `selectNode` fija `question`

- [ ] **Step 1: Write the failing tests**

En `src/terminal/util/askAnswers.test.ts`, en `describe('describeNode', …)`:

- Al primer test añade `expect(answer.question).toBe('¿Con qué se conecta Design System?');`.
- Cambia el segundo a `expect(describeNode('missing')).toEqual({ nodeIds: [], text: '', question: '' });`.

Añade al final:

```ts
describe('WELCOME_MESSAGE', () => {
  it('introduces the ai in the voice agreed in the spec', () => {
    expect(WELCOME_MESSAGE).toBe(
      'Hola, soy la IA de Daniel. Pregúntame por mi experiencia, mis proyectos o cómo trabajo.',
    );
  });
});
```

Y añade `WELCOME_MESSAGE` al import.

En `src/terminal/data-access/askStore.test.ts`, en el test `'focuses a node picked by hand together with its connections'`, cambia `question: null` por `question: '¿Con qué se conecta Design System?'`. Añade al final del `describe`:

```ts
it('has not been interacted with until something is asked or picked', async () => {
  const asked = createAskStore(serviceThatYields(HELLO_WORLD));
  const picked = createAskStore(serviceThatYields([]));
  expect(asked.getState().hasInteracted).toBe(false);

  await asked.getState().ask('¿Hola?');
  picked.getState().selectNode('ds');

  expect(asked.getState().hasInteracted).toBe(true);
  expect(picked.getState().hasInteracted).toBe(true);
});

it('remembers the interaction after going back to the overview', async () => {
  const store = createAskStore(serviceThatYields(HELLO_WORLD));
  await store.getState().ask('¿Hola?');

  store.getState().reset();

  expect(store.getState().hasInteracted).toBe(true);
});

it('welcomes the visitor once per visit', () => {
  const store = createAskStore(serviceThatYields([]));
  expect(store.getState().hasWelcomed).toBe(false);

  store.getState().markWelcomed();
  store.getState().reset();

  expect(store.getState().hasWelcomed).toBe(true);
});
```

Run: `pnpm exec jest src/terminal/util/askAnswers src/terminal/data-access/askStore`
Expected: FAIL.

- [ ] **Step 2: Implement**

En `src/terminal/util/askAnswers.ts`, añade tras `SUGGESTED_QUESTIONS`:

```ts
export const WELCOME_MESSAGE =
  'Hola, soy la IA de Daniel. Pregúntame por mi experiencia, mis proyectos o cómo trabajo.';

/** A node picked by hand, told as the question the visitor would have asked. */
export interface NodeDescription extends Answer {
  question: string;
}
```

Y reemplaza `describeNode`:

```ts
/** What the graph shows and says when a node is picked by hand. */
export function describeNode(nodeId: string): NodeDescription {
  const [label] = getLabels([nodeId]);
  if (label === undefined) return { nodeIds: [], text: '', question: '' };

  const connectedIds = getConnectedNodeIds(nodeId, GRAPH_EDGES);

  return {
    nodeIds: [nodeId, ...connectedIds],
    text: `${label} se conecta con: ${getLabels(connectedIds).join(', ')}.`,
    question: `¿Con qué se conecta ${label}?`,
  };
}
```

En `src/terminal/data-access/askStore.ts`:

```ts
export interface AskStore extends AskState {
  ask: (question: string) => Promise<void>;
  /** Focuses a node picked by hand, with the nodes it connects to. */
  selectNode: (nodeId: string) => void;
  reset: () => void;
  /** The visitor has asked or picked something at least once in this visit. */
  hasInteracted: boolean;
  /** The welcome message has been typed once in this visit. */
  hasWelcomed: boolean;
  markWelcomed: () => void;
}
```

En el objeto del store: añade `hasInteracted: false,` y `hasWelcomed: false,` tras `...INITIAL_ASK_STATE,`. En `ask`, cambia `set((state) => startAsk(state, question));` por `set((state) => ({ ...startAsk(state, question), hasInteracted: true }));`. Reemplaza `selectNode` y añade `markWelcomed`:

```ts
    selectNode: (nodeId) => {
      startRequest();
      const { nodeIds, text, question } = describeNode(nodeId);
      set({ status: 'idle', question, answer: text, focusNodeIds: nodeIds, hasInteracted: true });
    },

    markWelcomed: () => {
      set({ hasWelcomed: true });
    },
```

`reset` sigue haciendo `set(INITIAL_ASK_STATE)`, que no toca `hasInteracted` ni `hasWelcomed`.

Run: `pnpm exec jest src/terminal`
Expected: PASS, salvo `TerminalApp.test.tsx`, que se actualiza en Task 7. Si falla solo ese archivo, continúa.

- [ ] **Step 3: Commit**

```bash
git add src/terminal/util src/terminal/data-access
git commit -m "feat(terminal): tell graph picks as questions and track the welcome

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: IA — el chat como protagonista

**Files:**

- Create: `src/terminal/ui/Caret.tsx`, `src/terminal/ui/TypewriterText.tsx`, `src/terminal/ui/TypewriterText.test.tsx`
- Modify: `src/terminal/ui/AskPanel.tsx`, `src/terminal/ui/AskPanel.test.tsx`
- Modify: `src/terminal/feature/TerminalAsk.tsx`, `src/terminal/feature/TerminalGraph.tsx`, `src/terminal/feature/TerminalApp.tsx`, `src/terminal/feature/TerminalApp.test.tsx`
- Modify: `e2e/terminal.spec.ts`, `e2e/accessibility.spec.ts`

**Interfaces:**

- Consumes: Task 6.
- Produces:
  - `TypewriterText({ text: string; isTyping: boolean }): ReactNode`
  - `AskPanel` gana `welcome: { text: string; isTyping: boolean }` y `autoFocusInput: boolean`

- [ ] **Step 1: Write the failing test for the typewriter**

Crea `src/terminal/ui/TypewriterText.test.tsx`:

```tsx
import { act, render, screen } from '@testing-library/react';

import { TypewriterText } from './TypewriterText';

const TEXT = 'Hola, soy la IA de Daniel.';

describe('TypewriterText', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('types the text word by word', () => {
    render(<TypewriterText text={TEXT} isTyping />);
    expect(screen.queryByText(TEXT)).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.getByText(TEXT)).toBeInTheDocument();
  });

  it('shows the whole text at once when it is not typing', () => {
    render(<TypewriterText text={TEXT} isTyping={false} />);

    expect(screen.getByText(TEXT)).toBeInTheDocument();
  });
});
```

Run: `pnpm exec jest src/terminal/ui/TypewriterText`
Expected: FAIL con «Cannot find module».

- [ ] **Step 2: Implement the caret and the typewriter**

Crea `src/terminal/ui/Caret.tsx`:

```tsx
import type { ReactNode } from 'react';

/** Blinks while text is on its way. Decorative. */
export function Caret(): ReactNode {
  return (
    <span
      aria-hidden="true"
      className="rounded-sm ml-0.5 inline-block h-4 w-2 animate-pulse bg-ai align-text-bottom motion-reduce:animate-none"
    />
  );
}
```

Crea `src/terminal/ui/TypewriterText.tsx`:

```tsx
'use client';

import { useReducedMotion } from 'motion/react';
import { useEffect, useState, type ReactNode } from 'react';

import { toTokens } from '../util/tokens';
import { Caret } from './Caret';

/** Same pace as a streamed answer, so the welcome reads like one. */
const WORD_DELAY_MS = 35;

interface TypewriterTextProps {
  text: string;
  /** Types the text in; otherwise, and with reduced motion, shows it whole. */
  isTyping: boolean;
}

export function TypewriterText({ text, isTyping }: TypewriterTextProps): ReactNode {
  const isMotionReduced = useReducedMotion() ?? false;
  const words = toTokens(text);
  const [shownWords, setShownWords] = useState(isTyping && !isMotionReduced ? 0 : words.length);
  const isDone = shownWords >= words.length;

  useEffect(() => {
    if (isDone) return;

    const timeout = setTimeout(() => {
      setShownWords((count) => count + 1);
    }, WORD_DELAY_MS);

    return () => {
      clearTimeout(timeout);
    };
  }, [isDone, shownWords]);

  return (
    <>
      {words.slice(0, shownWords).join('')}
      {isDone ? null : <Caret />}
    </>
  );
}
```

Run: `pnpm exec jest src/terminal/ui/TypewriterText`
Expected: PASS.

- [ ] **Step 3: Write the failing tests for the chat panel**

Reemplaza `src/terminal/ui/AskPanel.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';

import { AskPanel } from './AskPanel';

type AskPanelProps = ComponentProps<typeof AskPanel>;

const SUGGESTIONS = ['¿Has liderado equipos?', '¿Qué haces con IA?'];
const WELCOME = 'Hola, soy la IA de Daniel.';

function renderPanel(overrides: Partial<AskPanelProps> = {}): AskPanelProps {
  const props: AskPanelProps = {
    status: 'idle',
    question: null,
    answer: '',
    suggestions: SUGGESTIONS,
    hasFocus: false,
    welcome: { text: WELCOME, isTyping: false },
    autoFocusInput: false,
    onAsk: jest.fn(),
    onReset: jest.fn(),
    ...overrides,
  };
  render(<AskPanel {...props} />);

  return props;
}

const getConversation = (): HTMLElement => screen.getByRole('status');

describe('AskPanel', () => {
  it('is titled after what it is for, and says it is a demo', () => {
    renderPanel();

    expect(screen.getByRole('heading', { name: 'Pregúntale a mi IA' })).toBeInTheDocument();
    expect(screen.getByText('Demo')).toBeInTheDocument();
    expect(
      screen.getByText('Respondo sobre mi experiencia, proyectos y stack a partir de mi CV.'),
    ).toBeInTheDocument();
  });

  it('explains what «Demo» means to assistive technology', () => {
    renderPanel();

    expect(
      screen.getByText(/Respuestas de demostración; la versión con IA real llega pronto/),
    ).toBeInTheDocument();
  });

  it('greets the visitor', () => {
    renderPanel();

    expect(screen.getByText(WELCOME)).toBeInTheDocument();
  });

  it('shows the question and its answer as a conversation', () => {
    renderPanel({ question: '¿Qué haces con IA?', answer: 'Introduje flujos AI-native.' });

    expect(getConversation()).toHaveTextContent('¿Qué haces con IA?');
    expect(getConversation()).toHaveTextContent('Introduje flujos AI-native.');
  });

  it('holds the announcement of the answer until it has finished streaming', () => {
    renderPanel({ status: 'streaming', question: '¿Hola?', answer: 'Introduje' });

    expect(getConversation()).toHaveAttribute('aria-busy', 'true');
  });

  it('announces the answer once it is complete', () => {
    renderPanel({ status: 'idle', question: '¿Hola?', answer: 'Introduje flujos.' });

    expect(getConversation()).toHaveAttribute('aria-busy', 'false');
  });

  it('labels the suggestions as something to try', () => {
    renderPanel();

    expect(screen.getByText('Prueba con:')).toBeInTheDocument();
  });

  it('asks a suggested question from its chip', async () => {
    const user = userEvent.setup();
    const { onAsk } = renderPanel();

    await user.click(screen.getByRole('button', { name: '¿Qué haces con IA?' }));

    expect(onAsk).toHaveBeenCalledWith('¿Qué haces con IA?');
  });

  it('asks the question typed in the field and clears it', async () => {
    const user = userEvent.setup();
    const { onAsk } = renderPanel();
    const field = screen.getByRole('textbox', { name: 'Pregunta al portafolio' });

    await user.type(field, '¿Sabes de AWS?{Enter}');

    expect(onAsk).toHaveBeenCalledWith('¿Sabes de AWS?');
    expect(field).toHaveValue('');
  });

  it('does not ask when the field is blank', async () => {
    const user = userEvent.setup();
    const { onAsk } = renderPanel();

    await user.type(screen.getByRole('textbox', { name: 'Pregunta al portafolio' }), '   ');
    await user.click(screen.getByRole('button', { name: 'Preguntar' }));

    expect(onAsk).not.toHaveBeenCalled();
  });

  it('puts the cursor in the field when asked to', () => {
    renderPanel({ autoFocusInput: true });

    expect(screen.getByRole('textbox', { name: 'Pregunta al portafolio' })).toHaveFocus();
  });

  it('offers the way back to the overview while the graph is focused', async () => {
    const user = userEvent.setup();
    const { onReset } = renderPanel({ hasFocus: true });

    await user.click(screen.getByRole('button', { name: 'Vista general' }));

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('disables the way back when there is nothing in focus', () => {
    renderPanel({ hasFocus: false });

    expect(screen.getByRole('button', { name: 'Vista general' })).toBeDisabled();
  });
});
```

Run: `pnpm exec jest src/terminal/ui/AskPanel`
Expected: FAIL.

- [ ] **Step 4: Implement the chat panel**

Reemplaza `src/terminal/ui/AskPanel.tsx`:

```tsx
'use client';

import { useEffect, useId, useRef, useState, type ReactNode, type SyntheticEvent } from 'react';

import { cn } from '@/shared/util/cn';

import type { AskStatus } from '../util/askState';
import { Caret } from './Caret';
import { TypewriterText } from './TypewriterText';

const CHIP_CLASSES =
  'rounded-full border border-ai/50 bg-surface-raised px-3 py-1.5 text-sm transition-colors duration-200 hover:border-ai motion-reduce:transition-none';

interface BubbleProps {
  from: 'ai' | 'visitor';
  isError?: boolean;
  children: ReactNode;
}

function Bubble({ from, isError = false, children }: BubbleProps): ReactNode {
  return (
    <p
      className={cn(
        'max-w-5/6 rounded-card px-4 py-2 text-sm',
        from === 'visitor' ? 'self-end bg-ai text-on-ai' : 'self-start bg-surface-raised',
        isError && 'text-highlight',
      )}
    >
      {children}
    </p>
  );
}

interface AskPanelProps {
  status: AskStatus;
  question: string | null;
  /** The answer so far, or the error message when `status` is `error`. */
  answer: string;
  suggestions: readonly string[];
  /** The graph is focused on some nodes, so there is an overview to go back to. */
  hasFocus: boolean;
  welcome: { text: string; isTyping: boolean };
  /** Puts the cursor in the field on mount: only where it will not pop up a keyboard. */
  autoFocusInput: boolean;
  onAsk: (question: string) => void;
  onReset: () => void;
}

/** The chat with the AI: what it is, a welcome, the exchange and where to ask. */
export function AskPanel({
  status,
  question,
  answer,
  suggestions,
  hasFocus,
  welcome,
  autoFocusInput,
  onAsk,
  onReset,
}: AskPanelProps): ReactNode {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState('');
  const isAnswering = status === 'thinking' || status === 'streaming';

  useEffect(() => {
    if (autoFocusInput) inputRef.current?.focus({ preventScroll: true });
  }, [autoFocusInput]);

  const askDraft = (event: SyntheticEvent): void => {
    event.preventDefault();
    if (!draft.trim()) return;

    onAsk(draft);
    setDraft('');
  };

  return (
    <section
      aria-labelledby={titleId}
      className="flex h-full flex-col gap-3 rounded-card bg-canvas p-4"
    >
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {/* Level 2 under the window title and under the standalone page title alike. */}
          <h2 id={titleId} className="font-display text-xl font-bold">
            Pregúntale a mi IA
          </h2>
          <span className="rounded-full bg-ai/15 px-2 py-0.5 text-xs font-semibold text-ai">
            Demo
            <span className="sr-only">
              : Respuestas de demostración; la versión con IA real llega pronto
            </span>
          </span>
        </div>
        <p className="text-sm text-muted">
          Respondo sobre mi experiencia, proyectos y stack a partir de mi CV.
        </p>
      </header>
      <div className="flex min-h-24 flex-1 flex-col gap-3 overflow-auto">
        <Bubble from="ai">
          <TypewriterText text={welcome.text} isTyping={welcome.isTyping} />
        </Bubble>
        {/* `aria-busy` makes screen readers wait for the whole answer instead of
            reading it out token by token. */}
        <div role="status" aria-busy={isAnswering} className="flex flex-col gap-3">
          {question ? <Bubble from="visitor">{question}</Bubble> : null}
          {answer || isAnswering ? (
            <Bubble from="ai" isError={status === 'error'}>
              {answer}
              {isAnswering ? <Caret /> : null}
            </Bubble>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted">Prueba con:</p>
        <ul aria-label="Preguntas sugeridas" className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <li key={suggestion}>
              <button
                type="button"
                onClick={() => {
                  onAsk(suggestion);
                }}
                className={CHIP_CLASSES}
              >
                {suggestion}
              </button>
            </li>
          ))}
          {/* Always there, so the chips do not shift when the focus comes and goes. */}
          <li>
            <button
              type="button"
              onClick={onReset}
              disabled={!hasFocus}
              className={cn(
                CHIP_CLASSES,
                'border-border text-muted disabled:opacity-40 disabled:hover:border-border',
              )}
            >
              Vista general
            </button>
          </li>
        </ul>
      </div>
      <form
        onSubmit={askDraft}
        className="flex gap-2 rounded-full border border-border bg-surface-raised p-1.5"
      >
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
          }}
          aria-label="Pregunta al portafolio"
          placeholder="Ej.: ¿qué experiencia tienes en móvil?"
          autoComplete="off"
          className="min-w-0 flex-1 rounded-full bg-transparent px-3 text-sm placeholder:text-muted"
        />
        <button
          type="submit"
          className="rounded-full bg-ai px-4 py-2 text-sm font-semibold text-on-ai transition-opacity duration-200 hover:opacity-90 motion-reduce:transition-none"
        >
          Preguntar
        </button>
      </form>
    </section>
  );
}
```

Run: `pnpm exec jest src/terminal/ui`
Expected: PASS.

- [ ] **Step 5: Wire the welcome, the autofocus, the pill and the new layout**

Reemplaza `src/terminal/feature/TerminalAsk.tsx`:

```tsx
'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { useAskStore } from '../data-access/useAskStore';
import { AskPanel } from '../ui/AskPanel';
import { SUGGESTED_QUESTIONS, WELCOME_MESSAGE } from '../util/askAnswers';

const FINE_POINTER_QUERY = '(pointer: fine)';

/** Only with a mouse or trackpad: on a phone, focusing would pop up the keyboard. */
function hasFinePointer(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(FINE_POINTER_QUERY).matches;
}

/** The conversation: where the visitor asks and the answer streams in. */
export function TerminalAsk(): ReactNode {
  const status = useAskStore((state) => state.status);
  const question = useAskStore((state) => state.question);
  const answer = useAskStore((state) => state.answer);
  const hasFocus = useAskStore((state) => state.focusNodeIds.length > 0);
  const hasWelcomed = useAskStore((state) => state.hasWelcomed);
  const ask = useAskStore((state) => state.ask);
  const reset = useAskStore((state) => state.reset);
  const markWelcomed = useAskStore((state) => state.markWelcomed);
  // Read once: the welcome is typed on the first opening of the visit only.
  const [isTypingWelcome] = useState(!hasWelcomed);
  // Decided after hydration: the server has no pointer to ask about.
  const [autoFocusInput, setAutoFocusInput] = useState(false);

  useEffect(() => {
    markWelcomed();
  }, [markWelcomed]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs with a browser media query, which only exists after hydration
    setAutoFocusInput(hasFinePointer());
  }, []);

  return (
    <AskPanel
      status={status}
      question={question}
      answer={answer}
      suggestions={SUGGESTED_QUESTIONS}
      hasFocus={hasFocus}
      welcome={{ text: WELCOME_MESSAGE, isTyping: isTypingWelcome }}
      autoFocusInput={autoFocusInput}
      onAsk={(nextQuestion) => {
        void ask(nextQuestion);
      }}
      onReset={reset}
    />
  );
}
```

En `src/terminal/feature/TerminalGraph.tsx`, añade `const hasInteracted = useAskStore((state) => state.hasInteracted);` y, justo antes de `<GraphLegend />`:

```tsx
{
  /* Points at the chat until the visitor has used it once. */
}
{
  hasInteracted ? null : (
    <p className="pointer-events-none absolute top-3 right-3 left-3 mx-auto w-fit rounded-full border border-ai/40 bg-canvas/90 px-3 py-1.5 text-center text-xs">
      <span aria-hidden="true" className="@3xl:hidden">
        ↑{' '}
      </span>
      <span aria-hidden="true" className="hidden @3xl:inline">
        ←{' '}
      </span>
      Pregunta en el chat y aquí verás de qué hablo
    </p>
  );
}
```

Reemplaza `src/terminal/feature/TerminalApp.tsx`:

```tsx
import type { ReactNode } from 'react';

import { TerminalAsk } from './TerminalAsk';
import { TerminalGraph } from './TerminalGraph';

export function TerminalApp(): ReactNode {
  return (
    <div className="@container h-full min-h-112">
      {/* The chat comes first, left or on top: it is what the app is for. */}
      <div className="flex h-full flex-col gap-3 @3xl:flex-row">
        <div className="@3xl:w-96 @3xl:shrink-0">
          <TerminalAsk />
        </div>
        <TerminalGraph />
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Update the app test**

En `src/terminal/feature/TerminalApp.test.tsx`:

1. En `beforeEach`, tras `askStore.getState().reset();`, añade `askStore.setState({ hasInteracted: false, hasWelcomed: false });`.
2. Reemplaza el test `'starts on the overview, inviting to ask'` por:

```tsx
it('welcomes the visitor and points the graph at the chat', async () => {
  await renderApp();
  await waitForTheAnswer();

  expect(
    screen.getByText(
      'Hola, soy la IA de Daniel. Pregúntame por mi experiencia, mis proyectos o cómo trabajo.',
    ),
  ).toBeInTheDocument();
  expect(screen.getByText('Pregunta en el chat y aquí verás de qué hablo')).toBeInTheDocument();
  expect(screen.queryAllByRole('button', { pressed: true })).toEqual([]);
});

it('does not type the welcome again when the app is opened again in the same visit', async () => {
  const { unmount } = render(<TerminalApp />);
  await waitForTheAnswer();
  unmount();

  render(<TerminalApp />);

  expect(
    screen.getByText(
      'Hola, soy la IA de Daniel. Pregúntame por mi experiencia, mis proyectos o cómo trabajo.',
    ),
  ).toBeInTheDocument();
});

it('keeps the welcome readable when a question comes in while it is typing', async () => {
  const user = await renderApp();

  await user.click(screen.getByRole('button', { name: '¿Sabes de microfrontends?' }));
  await waitForTheAnswer();

  expect(screen.getByText(/Hola, soy la IA de Daniel\./)).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('¿Sabes de microfrontends?');
  expect(screen.getByRole('status')).toHaveTextContent('estado compartido.');
});

it('hides the pointer to the chat once the visitor has used it', async () => {
  const user = await renderApp();

  await user.click(screen.getByRole('button', { name: 'Design System' }));

  expect(
    screen.queryByText('Pregunta en el chat y aquí verás de qué hablo'),
  ).not.toBeInTheDocument();
});
```

3. En `'focuses a node picked in the graph together with its connections'`, añade `expect(screen.getByRole('status')).toHaveTextContent('¿Con qué se conecta Design System?');`.
4. En `'goes back to the overview'`, cambia la última aserción por `expect(screen.getByRole('status')).toBeEmptyDOMElement();`.

Run: `pnpm exec jest src/terminal`
Expected: PASS.

- [ ] **Step 7: Update the e2e**

En `e2e/terminal.spec.ts`, añade dentro de `test.describe('terminal', …)`:

```ts
test('welcomes the visitor and points the graph at the chat', async ({ page }) => {
  await openTerminalWindow(page);

  await expect(page.getByRole('heading', { name: 'Pregúntale a mi IA' })).toBeVisible();
  await expect(page.getByText(/Hola, soy la IA de Daniel/)).toBeVisible();
  await expect(page.getByText('Pregunta en el chat y aquí verás de qué hablo')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Pregunta al portafolio' })).toBeFocused();
});

test('tells a picked node as a question in the chat', async ({ page }) => {
  await openTerminalWindow(page);

  await node(page, 'Design System').click();

  await expect(answer(page)).toContainText('¿Con qué se conecta Design System?');
  await expect(page.getByText('Pregunta en el chat y aquí verás de qué hablo')).toHaveCount(0);
});
```

En `e2e/accessibility.spec.ts`, el test `'terminal with an answer in focus'` ya cubre el chat nuevo. No hace falta añadir nada.

- [ ] **Step 8: Run everything and look at it**

Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm e2e`
Expected: todo en verde.

Haz capturas de la ventana de la IA a 1280×800 y con viewport Pixel 7, antes y después de preguntar. Comprueba que el chat va a la izquierda (o arriba), que la píldora no tapa la leyenda y que la etiqueta «Demo» se lee.

- [ ] **Step 9: Commit**

```bash
git add src/terminal e2e
git commit -m "feat(terminal): lead with the ai chat and point the graph at it

The chat comes first with a typed welcome, a demo label and suggestions,
and picking a node shows up in the chat as a question.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Perfil — PDF del CV corregido

**Files:**

- Create: `public/cv/daniel-jaramillo-bustamante-cv.pdf`
- Create: `src/profile/util/cvPdf.ts`, `src/profile/util/cvPdf.test.ts`
- Herramienta temporal (no se commitea): `$SCRATCHPAD/fix-cv-pdf.py` y `$SCRATCHPAD/pdf-venv/`

**Interfaces:**

- Produces: `CV_PDF_HREF = '/cv/daniel-jaramillo-bustamante-cv.pdf'`.

Contexto medido al escribir este plan:

- La fuente está en la raíz del proyecto, fuera de git: `CV_Daniel_Jaramillo_AI_Native.pdf`.
- El enlace es una anotación con `/URI(https://www.linkedin.com/in/daniel-jaramillobustamante/)`.
- El texto visible está en un content stream comprimido, como códigos hexadecimales de un subconjunto TrueType (LiberationSerif) con tabla `/ToUnicode`.
- El guion `-` ya existe en ese subconjunto (aparece en `daniel-` y en `UTC-5`), así que la corrección solo inserta su código; no añade glifos.

- [ ] **Step 1: Write the failing test**

Crea `src/profile/util/cvPdf.test.ts`:

```ts
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { CV_PDF_HREF } from './cvPdf';

const pdfPath = join(process.cwd(), 'public', CV_PDF_HREF);

describe('the published CV', () => {
  it('is served from the public folder, so the download link is never broken', () => {
    expect(existsSync(pdfPath)).toBe(true);
  });

  it('links to the current LinkedIn profile', () => {
    const bytes = readFileSync(pdfPath).toString('latin1');

    expect(bytes).toContain('linkedin.com/in/daniel-jaramillo-bustamante');
    expect(bytes).not.toContain('linkedin.com/in/daniel-jaramillobustamante');
  });
});
```

Crea `src/profile/util/cvPdf.ts`:

```ts
/** Public path of the CV, in `public/`. A test checks that the file is there. */
export const CV_PDF_HREF = '/cv/daniel-jaramillo-bustamante-cv.pdf';
```

Run: `pnpm exec jest src/profile/util/cvPdf`
Expected: FAIL; el archivo no existe.

- [ ] **Step 2: Prepare a throwaway tool**

```bash
S=/tmp/claude-1000/-home-djaramillo-Documentos-dani-os/<session>/scratchpad   # the session scratchpad
python3 -m venv "$S/pdf-venv"
"$S/pdf-venv/bin/pip" install --quiet pikepdf
```

- [ ] **Step 3: Write the fix script**

Crea `$S/fix-cv-pdf.py`:

```python
"""Fixes the LinkedIn handle of the CV: the link target and the visible text.

The visible text is drawn with a subset TrueType font as one-byte glyph
codes, mapped to Unicode by the font's /ToUnicode CMap. The fix inserts the
code of '-' between 'jaramillo' and 'bustamante' in the text operator that
draws the handle. Nothing else in the document changes.
"""

import re
import sys

import pikepdf

SOURCE = 'CV_Daniel_Jaramillo_AI_Native.pdf'
TARGET = 'public/cv/daniel-jaramillo-bustamante-cv.pdf'
OLD_HANDLE = 'daniel-jaramillobustamante'
NEW_HANDLE = 'daniel-jaramillo-bustamante'
SPLIT_AFTER = 'jaramillo'


def read_to_unicode(font) -> dict[int, str]:
    """Glyph code -> character, from the bfchar and bfrange sections of the CMap."""
    cmap = font.ToUnicode.read_bytes().decode('latin1')
    mapping: dict[int, str] = {}
    for block in re.findall(r'beginbfchar(.*?)endbfchar', cmap, re.S):
        for code, uni in re.findall(r'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>', block):
            mapping[int(code, 16)] = bytes.fromhex(uni).decode('utf-16-be')
    for block in re.findall(r'beginbfrange(.*?)endbfrange', cmap, re.S):
        for start, end, uni in re.findall(
            r'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>', block
        ):
            first = int(uni, 16)
            for offset, code in enumerate(range(int(start, 16), int(end, 16) + 1)):
                mapping[code] = chr(first + offset)
    return mapping


def fix_link_annotations(pdf) -> int:
    fixed = 0
    for page in pdf.pages:
        for annot in page.get('/Annots', []):
            action = annot.get('/A')
            if action is None or '/URI' not in action:
                continue
            uri = str(action.URI)
            if OLD_HANDLE in uri:
                action.URI = pikepdf.String(uri.replace(OLD_HANDLE, NEW_HANDLE))
                fixed += 1
    return fixed


def fix_visible_text(pdf) -> int:
    page = pdf.pages[0]
    fonts = {name: read_to_unicode(font) for name, font in page.Resources.Font.items()}
    instructions = pikepdf.parse_content_stream(page)
    current_font = None
    fixed = 0

    for index, (operands, operator) in enumerate(instructions):
        if operator == pikepdf.Operator('Tf'):
            current_font = str(operands[0])
            continue
        if operator not in (pikepdf.Operator('TJ'), pikepdf.Operator('Tj')) or current_font is None:
            continue

        to_unicode = fonts[current_font]
        parts = list(operands[0]) if operator == pikepdf.Operator('TJ') else [operands[0]]
        # Every drawn character, with where it lives: (part index, byte index, char).
        chars = [
            (part_index, byte_index, to_unicode.get(byte, '?'))
            for part_index, part in enumerate(parts)
            if isinstance(part, pikepdf.String)
            for byte_index, byte in enumerate(bytes(part))
        ]
        text = ''.join(char for _, _, char in chars)
        start = text.find(OLD_HANDLE)
        if start == -1:
            continue

        hyphen_code = next(code for code, char in to_unicode.items() if char == '-')
        split_at = start + OLD_HANDLE.index(SPLIT_AFTER) + len(SPLIT_AFTER)
        part_index, byte_index, _ = chars[split_at]
        part_bytes = bytes(parts[part_index])
        parts[part_index] = pikepdf.String(
            part_bytes[:byte_index] + bytes([hyphen_code]) + part_bytes[byte_index:]
        )
        new_operands = [pikepdf.Array(parts)] if operator == pikepdf.Operator('TJ') else [parts[0]]
        instructions[index] = pikepdf.ContentStreamInstruction(new_operands, operator)
        fixed += 1

    page.Contents = pdf.make_stream(pikepdf.unparse_content_stream(instructions))
    return fixed


def main() -> int:
    with pikepdf.open(SOURCE) as pdf:
        links = fix_link_annotations(pdf)
        texts = fix_visible_text(pdf)
        if links != 1 or texts != 1:
            print(f'Expected one link and one text to fix, found {links} and {texts}. Stopping.')
            return 1
        # Uncompressed objects keep the link readable for the test in src/profile/util.
        pdf.save(TARGET, object_stream_mode=pikepdf.ObjectStreamMode.disable)
    print(f'Fixed the link and the visible text in {TARGET}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
```

- [ ] **Step 4: Run it and verify the result**

```bash
mkdir -p public/cv
"$S/pdf-venv/bin/python" "$S/fix-cv-pdf.py"
pdftotext -l 1 public/cv/daniel-jaramillo-bustamante-cv.pdf - | grep linkedin
pdftoppm -f 1 -l 1 -r 110 -png public/cv/daniel-jaramillo-bustamante-cv.pdf "$S/cv-fixed"
pdftoppm -f 1 -l 1 -r 110 -png CV_Daniel_Jaramillo_AI_Native.pdf "$S/cv-original"
```

Expected:

- El script imprime «Fixed the link and the visible text…».
- `pdftotext` muestra `linkedin.com/in/daniel-jaramillo-bustamante`.

Abre `$S/cv-fixed-1.png` y `$S/cv-original-1.png` y compara la línea de contacto. Solo debe cambiar el guion añadido; la línea puede quedar unos 3 pt descentrada.

**Regla de parada (spec, sección 4.4):** si el script se detiene, si `pdftotext` no muestra el handle nuevo, o si la captura muestra cualquier otro cambio (texto corrido, glifos rotos, subrayado desalineado de forma visible), no publiques el PDF. Borra `public/cv/` y consulta con Daniel.

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm exec jest src/profile/util/cvPdf`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add public/cv/daniel-jaramillo-bustamante-cv.pdf src/profile/util/cvPdf.ts src/profile/util/cvPdf.test.ts
git commit -m "feat(profile): publish the cv with the current linkedin profile

The link target and its visible text are corrected; the rest of the
document is unchanged.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Perfil — CV en pantalla

**Files:**

- Modify: `src/profile/util/profile.ts`
- Create: `src/profile/ui/ProfileCv.tsx`, `src/profile/ui/ProfileCv.test.tsx`
- Modify: `src/profile/feature/AboutApp.tsx`
- Test: `e2e/desktop.spec.ts`, `e2e/mobile.spec.ts`

**Interfaces:**

- Consumes: `CV_PDF_HREF` (Task 8).
- Produces:
  - `interface ProfileCvData { name; role; location; summary; experience: readonly Experience[]; skillGroups: readonly SkillGroup[]; education: readonly Education[]; courses: readonly Course[]; languages: readonly SpokenLanguage[] }`
  - `PROFILE_CV: ProfileCvData`
  - `ProfileCv({ cv: ProfileCvData; cvPdfHref: string; contactHref: string }): ReactNode`

- [ ] **Step 1: Write the failing test**

Crea `src/profile/ui/ProfileCv.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react';

import { PROFILE_CV, type ProfileCvData } from '../util/profile';
import { ProfileCv } from './ProfileCv';

function renderCv(cv: ProfileCvData = PROFILE_CV): void {
  render(<ProfileCv cv={cv} cvPdfHref="/cv/cv.pdf" contactHref="/contact" />);
}

describe('ProfileCv', () => {
  it('opens with who Daniel is', () => {
    renderCv();

    expect(screen.getByText('Daniel Jaramillo Bustamante')).toBeInTheDocument();
    expect(screen.getByText(/más de 9 años construyendo frontends escalables/)).toBeInTheDocument();
  });

  it('offers the CV as a download and a way to get in touch', () => {
    renderCv();

    const download = screen.getByRole('link', { name: 'Descargar CV (PDF)' });

    expect(download).toHaveAttribute('href', '/cv/cv.pdf');
    expect(download).toHaveAttribute('download');
    expect(screen.getByRole('link', { name: 'Contactar' })).toHaveAttribute('href', '/contact');
  });

  it('lists the experience with what was achieved in each job', () => {
    renderCv();

    const experience = screen.getByRole('region', { name: 'Experiencia' });

    expect(within(experience).getAllByRole('article')).toHaveLength(3);
    expect(experience).toHaveTextContent('60% de adopción en producción');
  });

  it('shows skills, education, courses and languages', () => {
    renderCv();

    expect(screen.getByRole('region', { name: 'Skills' })).toHaveTextContent('Angular');
    expect(screen.getByRole('region', { name: 'Formación' })).toHaveTextContent(
      'Politécnico Grancolombiano',
    );
    expect(screen.getByRole('region', { name: 'Cursos y certificaciones' })).toHaveTextContent(
      'RxJS',
    );
    expect(screen.getByRole('region', { name: 'Idiomas' })).toHaveTextContent('Inglés (B2)');
  });

  it('leaves out a section without data', () => {
    renderCv({ ...PROFILE_CV, courses: [] });

    expect(
      screen.queryByRole('region', { name: 'Cursos y certificaciones' }),
    ).not.toBeInTheDocument();
  });
});
```

Run: `pnpm exec jest src/profile/ui/ProfileCv`
Expected: FAIL con «Cannot find module».

- [ ] **Step 2: Replace the profile data**

Reemplaza en `src/profile/util/profile.ts` todo lo anterior a `export interface ContactLink` (las interfaces y constantes `Experience`, `EXPERIENCE` y `ACHIEVEMENTS`) por:

```ts
export interface Experience {
  company: string;
  role: string;
  period: string;
  highlights: readonly string[];
  stack: readonly string[];
}

export interface Skill {
  name: string;
  level: string;
}

export interface SkillGroup {
  name: string;
  skills: readonly Skill[];
}

export interface Education {
  degree: string;
  institution: string;
  period: string;
}

export interface Course {
  provider: string;
  name: string;
  year: string;
}

export interface SpokenLanguage {
  name: string;
  level: string;
}

export interface ProfileCvData {
  name: string;
  role: string;
  location: string;
  summary: string;
  experience: readonly Experience[];
  skillGroups: readonly SkillGroup[];
  education: readonly Education[];
  courses: readonly Course[];
  languages: readonly SpokenLanguage[];
}

/** The CV, translated from `CV_Daniel_Jaramillo_AI_Native.pdf`. */
export const PROFILE_CV: ProfileCvData = {
  name: 'Daniel Jaramillo Bustamante',
  role: 'Frontend Tech Lead · AI App Developer',
  location: 'Colombia · UTC−5',
  summary:
    'Frontend Tech Lead con más de 9 años construyendo frontends escalables y liderando equipos. Llevo a producción arquitecturas de microfrontends con Angular, Nx y Native Federation, y design systems que los equipos adoptan de verdad. Introduje flujos de desarrollo AI-native (Claude CLI, MCP) en un equipo en producción y hoy profundizo en AI SDKs con streaming y tool-calling.',
  experience: [
    {
      company: 'Home Power Colombia',
      role: 'Frontend Tech Lead',
      period: 'nov 2024 – sep 2026',
      highlights: [
        'Introduje flujos de desarrollo AI-native en el equipo, integrando Claude CLI y Claude Design en entornos MCP para acotar e implementar MVPs, con visibilidad para negocio sobre lo que venía a partir de la librería de componentes.',
        'Lideré un equipo frontend de 7 desarrolladores y definí los estándares de arquitectura Angular y las buenas prácticas del equipo.',
        'Diseñé y construí el design system corporativo: 60% de adopción en producción y mucho menos tiempo de desarrollo de UI.',
        'Estandaricé quality gates automáticos (SonarQube, Husky) en CI/CD, que priorizan y validan los problemas antes de que lleguen a QA.',
        'Construí los pipelines de CI/CD para entregar la app móvil a QA (TestFlight): −90% de esfuerzo manual de entrega y ciclos de release más rápidos.',
      ],
      stack: [
        'Angular',
        'React Native',
        'Claude CLI',
        'Claude Design',
        'MCP',
        'Tailwind',
        'Native Federation',
        'Signals',
        'RxJS',
        'Nx',
        'Node.js',
        'Express',
        'AWS',
        'GitHub Actions',
        'Jest',
      ],
    },
    {
      company: 'Globant',
      role: 'Web UI Developer Ssr',
      period: 'mar 2022 – nov 2024',
      highlights: [
        'Mantuve y evolucioné bases de código Angular legadas mientras entregaba funcionalidades nuevas en plataformas de clientes enterprise.',
        'Apliqué metodologías estándar de desarrollo y despliegue para mejorar la eficiencia y la integridad del código en cada release.',
        'Cumplí los objetivos de cada sprint dentro de los plazos comprometidos.',
        'Facilité la comunicación entre los equipos técnicos y de procesos para mejorar el diseño y el desarrollo del producto.',
      ],
      stack: ['Angular', 'Kendo UI', 'Node.js', 'SASS', 'AWS', 'Dynamics 365'],
    },
    {
      company: 'ARUS',
      role: 'Automation Analyst',
      period: 'mar 2017 – 2022',
      highlights: [
        'Entregué plataformas web que ampliaron el acceso de los clientes a información crítica, dando soporte a las mesas de servicio de cerca del 30% de la base de clientes.',
        'Llevé el 50% de los algoritmos de IA de la organización a interfaces web intuitivas, con retorno medible: mi primer contacto con IA en producción.',
        'Lideré sesiones de colaboración entre equipos multidisciplinarios aplicando prácticas técnicas de referencia.',
        'Facilité la comunicación entre los equipos técnicos y de procesos para mejorar el diseño del producto.',
      ],
      stack: ['Electron', 'Angular', 'Node.js', 'AWS', 'MySQL', 'MongoDB'],
    },
  ],
  skillGroups: [
    {
      name: 'Lenguajes',
      skills: [
        { name: 'JavaScript', level: 'avanzado' },
        { name: 'TypeScript', level: 'avanzado' },
        { name: 'Node.js', level: 'avanzado' },
        { name: 'Python', level: 'básico' },
      ],
    },
    {
      name: 'Ingeniería AI-native',
      skills: [
        { name: 'Claude CLI', level: 'medio-avanzado, en producción' },
        { name: 'MCP', level: 'medio-avanzado' },
        { name: 'Claude Design', level: 'medio' },
        { name: 'Implementación, testing y code review asistidos por IA', level: 'medio' },
        { name: 'AI SDK con streaming y tool-calling', level: 'en progreso' },
      ],
    },
    {
      name: 'Frameworks frontend',
      skills: [
        { name: 'Angular', level: 'avanzado' },
        { name: 'React Native', level: 'avanzado' },
        { name: 'React', level: 'en progreso hacia nivel de producción' },
        { name: 'Electron', level: 'medio' },
      ],
    },
    {
      name: 'Arquitectura y design systems',
      skills: [
        { name: 'Microfrontends con Nx y Native Federation', level: 'medio-avanzado' },
        { name: 'Librerías de componentes y design systems', level: 'avanzado' },
        { name: 'RxJS', level: 'avanzado' },
        { name: 'Signals', level: 'medio-avanzado' },
        { name: 'CSR', level: 'avanzado' },
        { name: 'SSR', level: 'medio' },
        { name: 'Accesibilidad', level: 'en progreso' },
      ],
    },
    {
      name: 'Backend y cloud',
      skills: [
        { name: 'Node.js y Express', level: 'avanzado, APIs en producción' },
        { name: 'AWS: Lambda, S3, API Gateway, CodeCommit, RDS, SQS', level: 'medio' },
      ],
    },
    {
      name: 'Calidad, testing y CI/CD',
      skills: [
        { name: 'Git y GitHub', level: 'avanzado' },
        { name: 'GitHub Actions', level: 'medio-avanzado' },
        { name: 'SonarQube, Husky, Jest, unit testing y Lighthouse', level: 'medio' },
      ],
    },
  ],
  education: [
    {
      degree: 'Ingeniería de Software (último ciclo)',
      institution: 'Politécnico Grancolombiano, Medellín',
      period: 'jul 2021 – actualidad',
    },
  ],
  courses: [
    { provider: 'Udemy', name: 'JavaScript Master', year: '2020' },
    { provider: 'Udemy', name: 'Desarrollo web con Angular', year: '2022' },
    { provider: 'LinkedIn Learning', name: 'GitHub para desarrolladores', year: '2022' },
    { provider: 'Udemy', name: 'PowerApps, guía completa', year: '2022' },
    { provider: 'Platzi', name: 'Programación reactiva con RxJS', year: '2023' },
    { provider: 'Platzi', name: 'Web Components con JavaScript', year: '2023' },
  ],
  languages: [
    { name: 'Español', level: 'nativo' },
    { name: 'Inglés', level: 'B2' },
  ],
};
```

`CONTACT_LINKS` y `LOCATION` se quedan como están, porque los usa `ContactApp`.

- [ ] **Step 3: Implement the CV component**

Crea `src/profile/ui/ProfileCv.tsx`:

```tsx
import Link from 'next/link';
import { useId, type ReactNode } from 'react';

import type { ProfileCvData } from '../util/profile';

const BUTTON =
  'inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-200 motion-reduce:transition-none';

interface CvSectionProps {
  title: string;
  isEmpty: boolean;
  children: ReactNode;
}

/** A titled part of the CV. A part without data is left out, title included. */
function CvSection({ title, isEmpty, children }: CvSectionProps): ReactNode {
  const titleId = useId();
  if (isEmpty) return null;

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-3">
      {/* Level 2 under the window title and under the standalone page title alike. */}
      <h2 id={titleId} className="font-display text-xl font-bold">
        {title}
      </h2>
      {children}
    </section>
  );
}

interface ProfileCvProps {
  cv: ProfileCvData;
  cvPdfHref: string;
  contactHref: string;
}

export function ProfileCv({ cv, cvPdfHref, contactHref }: ProfileCvProps): ReactNode {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="font-display text-2xl font-bold">{cv.name}</p>
        <p className="text-muted">
          {cv.role} · {cv.location}
        </p>
        <p className="max-w-prose">{cv.summary}</p>
        <div className="mt-2 flex flex-wrap gap-3">
          <a
            href={cvPdfHref}
            download
            className={`${BUTTON} bg-primary text-on-primary hover:opacity-90`}
          >
            Descargar CV (PDF)
          </a>
          <Link
            href={contactHref}
            className={`${BUTTON} border border-border hover:bg-surface-raised`}
          >
            Contactar
          </Link>
        </div>
      </header>

      <CvSection title="Experiencia" isEmpty={cv.experience.length === 0}>
        <div className="flex flex-col gap-3">
          {cv.experience.map((job) => (
            <article
              key={job.company}
              className="rounded-card border border-border bg-surface-raised p-4"
            >
              <p className="font-semibold">{job.company}</p>
              <p className="text-sm text-muted">
                {job.role} · {job.period}
              </p>
              <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-sm">
                {job.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted">{job.stack.join(' · ')}</p>
            </article>
          ))}
        </div>
      </CvSection>

      <CvSection title="Skills" isEmpty={cv.skillGroups.length === 0}>
        <dl className="grid gap-4 sm:grid-cols-2">
          {cv.skillGroups.map((group) => (
            <div key={group.name} className="flex flex-col gap-1">
              <dt className="font-mono text-xs tracking-wider text-muted uppercase">
                {group.name}
              </dt>
              {group.skills.map((skill) => (
                <dd key={skill.name} className="text-sm">
                  {skill.name} <span className="text-muted">({skill.level})</span>
                </dd>
              ))}
            </div>
          ))}
        </dl>
      </CvSection>

      <CvSection title="Formación" isEmpty={cv.education.length === 0}>
        <ul className="flex flex-col gap-1 text-sm">
          {cv.education.map((entry) => (
            <li key={entry.degree}>
              <span className="font-semibold">{entry.degree}</span> — {entry.institution}{' '}
              <span className="text-muted">({entry.period})</span>
            </li>
          ))}
        </ul>
      </CvSection>

      <CvSection title="Cursos y certificaciones" isEmpty={cv.courses.length === 0}>
        <ul className="flex flex-col gap-1 text-sm">
          {cv.courses.map((course) => (
            <li key={`${course.provider}-${course.name}`}>
              {course.provider} · {course.name} <span className="text-muted">({course.year})</span>
            </li>
          ))}
        </ul>
      </CvSection>

      <CvSection title="Idiomas" isEmpty={cv.languages.length === 0}>
        <ul className="flex flex-wrap gap-2 text-sm">
          {cv.languages.map((language) => (
            <li key={language.name} className="rounded-full bg-border px-3 py-1">
              {language.name} ({language.level})
            </li>
          ))}
        </ul>
      </CvSection>
    </div>
  );
}
```

Reemplaza `src/profile/feature/AboutApp.tsx`:

```tsx
import type { ReactNode } from 'react';

import { ProfileCv } from '../ui/ProfileCv';
import { CV_PDF_HREF } from '../util/cvPdf';
import { PROFILE_CV } from '../util/profile';

/** The route of the contact app; the profile domain does not import the desktop. */
const CONTACT_HREF = '/contact';

export function AboutApp(): ReactNode {
  return <ProfileCv cv={PROFILE_CV} cvPdfHref={CV_PDF_HREF} contactHref={CONTACT_HREF} />;
}
```

Run: `pnpm exec jest src/profile`
Expected: PASS.

- [ ] **Step 4: Update the e2e**

En `e2e/mobile.spec.ts`, el primer test busca `window.getByText('Home Power Colombia')`, que ahora sale en la experiencia. Comprueba que sigue en verde sin cambios.

Añade en `e2e/desktop.spec.ts`, dentro de `test.describe('direct entry', …)`:

```ts
test('serves the CV to download from the profile', async ({ page, request }) => {
  await page.goto('/about');

  const href = await page.getByRole('link', { name: 'Descargar CV (PDF)' }).getAttribute('href');
  const response = await request.get(href ?? '');

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/pdf');
});
```

- [ ] **Step 5: Run everything**

Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm e2e`
Expected: todo en verde, incluido axe sobre «Perfil y CV» (ventana y `/about`).

- [ ] **Step 6: Commit**

```bash
git add src/profile e2e
git commit -m "feat(profile): turn the about app into the full cv with a pdf download

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Cierre — documentación y verificación completa

**Files:**

- Modify: `CLAUDE.md`

- [ ] **Step 1: Record the new conventions**

En `CLAUDE.md`:

- En la tabla de dominios, cambia la fila de `profile` por `| \`profile\` | Contenido de «Perfil y CV» (CV en pantalla y PDF) y Contacto |`y la de`terminal`por`| \`terminal\` | «Pregúntale a mi IA»: chat con la IA simulada y grafo de experiencia |`.
- En «Decisiones y convenciones del proyecto», añade:
  - `- Todo enlace que abre una app (dock, bienvenida, Ventanas, recorrido) decide su clic con \`shouldActivateFromClick\` (\`desktop/util/appLinks.ts\`).`
  - `- Cada app tiene \`title\` (ventana, tooltip, Ventanas) y \`shortTitle\` (bajo el icono del dock); el título completo contiene al corto para cumplir «label in name».`
  - `- El recorrido de bienvenida (\`OnboardingTour\`) se ancla a elementos del dock por \`id\`, se recuerda en \`localStorage\` (\`dani-os:onboarding:v1\`) y se relanza desde «Guía». Los e2e arrancan con él marcado como visto salvo que usen \`test.use({ hasSeenTour: false })\` (\`e2e/support.ts\`).`
  - `- El CV publicado es \`public/cv/daniel-jaramillo-bustamante-cv.pdf\`; un test comprueba que existe y que su enlace de LinkedIn es el actual. El original está fuera de git.`

- [ ] **Step 2: Full verification**

Run, en este orden:

```bash
pnpm lint && pnpm format:check && pnpm typecheck && pnpm test
pnpm e2e
PORT=3200 CI=1 pnpm e2e
pnpm build && pnpm dlx @lhci/cli@0.15.1 autorun --upload.target=filesystem
```

Expected: todo en verde y Lighthouse CI dentro de los presupuestos de `lighthouserc.json`. Si el puerto 3000 está ocupado por un `pnpm dev`, la corrida de producción va en el 3200.

- [ ] **Step 3: Visual review**

Haz capturas a 1280×800 y con Pixel 7 de:

- escritorio vacío con la bienvenida
- cada paso del recorrido
- «Perfil y CV»
- la IA antes y después de preguntar

Revisa que la bienvenida no choque con las siluetas 3D en móvil, que el dock con nombres quepa sin desbordar y que el globo no tape el ancla.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: record onboarding, app naming and cv conventions

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
