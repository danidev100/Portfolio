# Dani OS en el teléfono, entrega 1 (base + iOS): plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que un iPhone que abre Dani OS vea una interfaz de teléfono con sabor iOS (inicio, dock, Guía y apps con navegación nativa y contenido simple), decidida en el servidor y navegada por la URL, sin cambiar nada del escritorio.

**Architecture:**

- El registro de apps y la regla de enlaces pasan a `src/shared/util`; un dominio nuevo `src/phone` (hermano de `desktop`, sin importar otros dominios) recibe su contenido desde `src/app/_components/phoneAppContent.tsx`.
- Las páginas leen el perfil del dispositivo en el servidor (`userAgent()` + `?device=`) y renderizan `Desktop`/`StandalonePage` o `Phone`. En esta entrega solo `ios` llega al teléfono; Android sigue en escritorio.
- El teléfono deriva la app abierta de `usePathname()` y reutiliza las rutas interceptadas de `@window`. El detalle de proyecto se empuja con `?project=<id>` vía `history.pushState`.

**Tech Stack:** Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind v4 (tokens de `globals.css`) · `cva` · Jest + Testing Library · Playwright + axe · pnpm.

**Spec:** `docs/superpowers/specs/2026-10-29-dani-os-movil-design.md` (entrega 1 de §5).

## Global Constraints

- **El escritorio no cambia:** mismos e2e de escritorio y `e2e/mobile.spec.ts` (Pixel 7, escritorio encogido) en verde sin tocarlos, salvo imports.
- **Rollout:** solo `ios` es sabor de teléfono en esta entrega. Android, tablets, iPadOS (se anuncia como Mac), bots y desconocidos → `desktop`. `?device=ios|desktop` fuerza el perfil; cualquier otro valor se ignora.
- **Sin WebGL ni CSS 3D en el teléfono:** el árbol de `Phone` y los contenidos del teléfono no importan `@/scene`, `TerminalGraph`, `ProjectOrbit` ni `ProjectDetail`.
- **Sin barras falsas:** ni barra de estado ni indicador de inicio dibujados.
- **Nunca se navega a la ruta actual:** todo enlace que abre una app decide su clic con `shouldActivateFromClick`.
- **Mi IA:** un único intercambio, como hoy; `askStore` no cambia.
- **Estilos:** solo tokens semánticos; nada de esquinas rectas; `motion-reduce:` en toda transición; valores arbitrarios solo para `env(safe-area-inset-*)`.
- **Arquitectura:** dominio × tipo; dentro de un dominio, rutas relativas; entre dominios, `@/<dominio>`; `shared` es la excepción. `phone` no importa otros dominios.
- **TypeScript:** `interface` para objetos, sin `any`, sin `as` injustificado, tipos de retorno explícitos en lo exportado.
- **Textos en español; código, comentarios y commits en inglés.** Conventional Commits terminados en `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Rama `feat/phone-shell`.
- **Cada tarea termina con** `pnpm typecheck && pnpm lint && pnpm test` en verde.

## Review Focus

1. **Gesto atrás tras abrir una app desde el inicio:** vuelve al inicio con el teléfono montado, nunca una página vacía (ruta interceptada). Test e2e en Task 5.
2. **Gesto atrás en el detalle de un proyecto:** cierra el detalle y deja la lista en `/projects`, sin salir de la app. Tests en Task 4 (unit) y Task 5 (e2e).
3. **Toque en un enlace cuya ruta es la actual, o doble toque:** no navega (la regla de `shouldActivateFromClick`). Test en Task 5 (`HomeScreen`).
4. **`?device=` basura, iPad y Android:** caen en escritorio o en la detección por UA, nunca en un sabor inexistente. Tests en Task 2.
5. **Abrir y cerrar apps muchas veces:** sin errores en consola ni `canvas` en el teléfono. Tests en Task 5 (sin canvas) y Task 7 (20 ciclos).

---

### Task 1: Registro de apps y glifos en `shared`

Refactor sin cambio de comportamiento: las dos interfaces necesitan el registro, y `phone` no puede importar `@/desktop`.

**Files:**

- Create: `src/shared/util/apps.ts`, `src/shared/util/apps.test.ts` (movido de `src/desktop/util/apps.test.ts`)
- Create: `src/shared/util/appLinks.ts` (movido de `src/desktop/util/appLinks.ts`, con su test si existe)
- Create: `src/desktop/util/domIds.ts`
- Create: `src/shared/ui/AppGlyph.tsx`, `src/shared/ui/AppGlyph.test.tsx`
- Delete: `src/desktop/util/apps.ts`, `src/desktop/util/appLinks.ts`
- Modify: `src/desktop/ui/AppIcon.tsx`, `src/desktop/index.ts`, todos los importadores listados por `grep -rn "util/apps'\|util/appLinks'\|from '@/desktop'" src e2e`
- Modify: `src/app/{about,contact,projects,terminal}/page.tsx`, `src/app/_components/{appContent,StandaloneAppPage}.tsx`

**Interfaces:**

- Produces (`@/shared/util/apps`): `APP_IDS`, `type AppId`, `type AppTone`, `interface AppDefinition`, `APPS`, `getAppIdByPathname(pathname: string): AppId | null` (sin cambios) y `HOME_HREF = '/'` (renombrado desde `DESKTOP_HREF`: ahora es el inicio de las dos interfaces).
- Produces (`@/shared/util/appLinks`): `shouldActivateFromClick(click: AppLinkClick, href: string, currentHref: string): boolean`, `interface AppLinkClick` (sin cambios).
- Produces (`desktop/util/domIds.ts`): `getDockItemId`, `getWindowId`, `DOCK_ID` (sin cambios; solo el escritorio los usa).
- Produces (`@/shared/ui/AppGlyph`): `type AppGlyphId = AppId | 'guide' | 'cv'`; `AppGlyph({ glyph, className }: { glyph: AppGlyphId; className?: string }): ReactNode`, un `<svg viewBox="0 0 24 24" aria-hidden="true">` con trazo `currentColor`. Los cuatro glifos de `AppIcon` se mueven aquí; `guide` es una brújula (círculo r 9 + rombo `M15.5 8.5l-2 5-5 2 2-5z`), `cv` un documento (`M7 3h7l5 5v13H7z`, `M14 3v5h5`, `M10 13h6M10 17h6`).
- `@/desktop` deja de exportar `APPS` y `AppId`; exporta `Desktop` y `StandalonePage`.

- [ ] **Step 1: Write the failing test** `AppGlyph.test.tsx`: `it.each(['projects','terminal','about','contact','guide','cv'])('draws the %s glyph', …)`: el `svg` existe, tiene `aria-hidden="true"` y al menos un hijo.
- [ ] **Step 2: Run** `pnpm test src/shared/ui/AppGlyph.test.tsx`. Expected: FAIL, el módulo no existe.
- [ ] **Step 3: Move** el registro, la regla de enlaces y los ids de DOM; crea `AppGlyph`; `AppIcon` lo usa; actualiza imports.
- [ ] **Step 4: Run** `pnpm typecheck && pnpm lint && pnpm test`. Expected: PASS, mismo número de tests más los nuevos.
- [ ] **Step 5: Run** `pnpm e2e`. Expected: PASS sin cambios.
- [ ] **Step 6: Commit** `refactor(shared): share the app registry and glyphs between shells`

---

### Task 2: Perfil del dispositivo

**Files:**

- Create: `src/shared/util/deviceProfile.ts`, `src/shared/util/deviceProfile.test.ts`
- Create: `src/app/_components/getDeviceProfile.ts`

**Interfaces:**

- Produces (`@/shared/util/deviceProfile`):
  - `PHONE_FLAVORS = ['ios'] as const` (la entrega 2 añade `'android'`); `type PhoneFlavor = (typeof PHONE_FLAVORS)[number]`; `type DeviceProfile = 'desktop' | PhoneFlavor`.
  - `DEVICE_PARAM = 'device'`.
  - `interface DeviceHints { deviceType: string | undefined; osName: string | undefined }` (los campos `device.type` y `os.name` de `userAgent()`).
  - `resolveDeviceProfile(hints: DeviceHints, override: string | undefined): DeviceProfile`. Un `override` válido (`'desktop'` o un `PHONE_FLAVORS`) gana; si no, `deviceType === 'mobile'` con `osName === 'iOS'` → `'ios'`; todo lo demás → `'desktop'`.
  - `isPhoneFlavor(profile: DeviceProfile): profile is PhoneFlavor`.
- Produces (`src/app/_components/getDeviceProfile.ts`, solo servidor): `getDeviceProfile(searchParams: Promise<Record<string, string | string[] | undefined>>): Promise<DeviceProfile>`. Lee `userAgent({ headers: await headers() })` de `next/server` y el primer valor de `DEVICE_PARAM`.

- [ ] **Step 1: Write the failing tests** en `deviceProfile.test.ts`:
  - `{ deviceType: 'mobile', osName: 'iOS' }`, sin override → `'ios'`.
  - `{ 'mobile', 'Android' }` → `'desktop'` (Android llega en la entrega 2).
  - `{ 'tablet', 'iOS' }` → `'desktop'`; `{ undefined, 'Mac OS' }` (iPadOS) → `'desktop'`; `{ undefined, undefined }` → `'desktop'`.
  - override `'ios'` en escritorio → `'ios'`; override `'desktop'` en iPhone → `'desktop'`.
  - override `'android'` o `'foo'` en iPhone → `'ios'` (se ignora y decide el UA).
  - `isPhoneFlavor('ios')` es `true`; `isPhoneFlavor('desktop')` es `false`.
- [ ] **Step 2: Run** `pnpm test src/shared/util/deviceProfile.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** `deviceProfile.ts` y `getDeviceProfile.ts`.
- [ ] **Step 4: Run** `pnpm test src/shared/util/deviceProfile.test.ts && pnpm typecheck`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(shared): resolve the device profile from the user agent`

---

### Task 3: Mi IA para el teléfono

**Files:**

- Modify: `src/terminal/ui/AskPanel.tsx`, `src/terminal/ui/AskPanel.test.tsx`
- Modify: `src/terminal/feature/TerminalAsk.tsx`, `src/terminal/feature/TerminalApp.tsx`
- Create: `src/terminal/feature/TerminalPhoneApp.tsx`, `src/terminal/feature/TerminalPhoneApp.test.tsx`
- Modify: `src/terminal/index.ts`

**Interfaces:**

- `AskPanelProps` gana `hasOverview: boolean`: el chip «Vista general» solo se renderiza si es `true`.
- `TerminalAsk({ hasGraph }: { hasGraph: boolean })` pasa `hasOverview={hasGraph}`; `TerminalApp` usa `hasGraph`.
- Produces (`@/terminal`): `TerminalPhoneApp(): ReactNode`, solo `TerminalAsk hasGraph={false}` en una columna a todo el alto. No importa `TerminalGraph`.

- [ ] **Step 1: Write the failing tests**
  - `AskPanel.test.tsx`: `it('leaves out the overview chip without a graph')`: con `hasOverview={false}` no existe `button` «Vista general».
  - `TerminalPhoneApp.test.tsx`: `it('asks without the graph')`: está el `textbox` de la pregunta y el botón «¿Sabes de microfrontends?»; no hay botón «Vista general» ni `list` «Nodos del grafo».
- [ ] **Step 2: Run** `pnpm test src/terminal`. Expected: los dos tests nuevos FAIL.
- [ ] **Step 3: Implement** la prop, `TerminalPhoneApp` y su export.
- [ ] **Step 4: Run** `pnpm test src/terminal`. Expected: PASS, incluidos los tests existentes de `TerminalApp`.
- [ ] **Step 5: Commit** `feat(terminal): add a graphless ask app for the phone`

---

### Task 4: Proyectos para el teléfono

Lista agrupada y detalle empujado con `?project=<id>`. El detalle cubre toda la pantalla del teléfono (`fixed inset-0`), así que tapa la barra «‹ Inicio» como un push nativo y trae su propia barra «‹ Proyectos».

**Files:**

- Create: `src/projects/ui/ProjectFacts.tsx` (extraído de `ProjectDetail`)
- Modify: `src/projects/ui/ProjectDetail.tsx`
- Create: `src/projects/ui/ProjectList.tsx`, `src/projects/ui/ProjectScreen.tsx`
- Create: `src/projects/feature/ProjectsPhoneApp.tsx`, `src/projects/feature/ProjectsPhoneApp.test.tsx`
- Modify: `src/projects/index.ts`

**Interfaces:**

- `ProjectFacts({ project }: { project: Project }): ReactNode`: el resumen, el enlace «visitar» si hay `url` y la `dl` de audiencia, papel de la IA, stack y valor, tal como hoy en `ProjectDetail`, que pasa a usarlo.
- `ProjectList({ projects, onOpen }: { projects: readonly Project[]; onOpen: (id: string) => void }): ReactNode`: secciones con `h2` «En producción» e «Ideas» (sin la sección si está vacía). Cada fila es un `button` con `id={`project-row-${id}`}`, el nombre, el resumen y `getProjectLabel(project, projects)`.
- `ProjectScreen({ project, label, onBack }: { project: Project; label: string; onBack: () => void }): ReactNode`: `section` con `aria-labelledby` en el `h2` del nombre, botón «Proyectos» con chevron (recibe el foco al montarse), etiqueta y `ProjectFacts`.
- Produces (`@/projects`): `ProjectsPhoneApp(): ReactNode`.
  - El proyecto abierto es `PROJECTS.find(id === useSearchParams().get('project'))`; un id desconocido muestra la lista.
  - Abrir: `window.history.pushState(null, '', `?project=${id}`)` y recuerda en una ref que lo abrió aquí.
  - Volver: con esa ref, `window.history.back()`; sin ella (entrada directa), `window.history.replaceState(null, '', usePathname())`.
  - Al cerrar, el foco vuelve a `project-row-<id>`.
  - No importa `ProjectOrbit`, `ProjectDetail` ni `reveal`.

- [ ] **Step 1: Write the failing tests** en `ProjectsPhoneApp.test.tsx` (con `next/navigation` mockeado):
  - `it('groups live work before ideas')`: «NEXA» con «En producción» bajo el `h2` «En producción»; «Factura Lens» con «Idea 01» bajo «Ideas».
  - `it('pushes the project into the history')`: tocar NEXA llama a `history.pushState` con `'?project=nexa'`.
  - `it('shows the project named in the url')`: con `?project=nexa`, `region` «NEXA» con enlace a `https://nexa-landing.onrender.com` y botón «Proyectos».
  - `it('ignores an unknown project')`: con `?project=foo`, la lista.
  - `it('goes back in the history after opening here')`: abrir y luego «Proyectos» → `history.back` llamado.
  - `it('replaces the url on a direct entry')`: con `?project=nexa` de inicio, «Proyectos» → `history.replaceState` con `'/projects'` y `history.back` no llamado.
- [ ] **Step 2: Run** `pnpm test src/projects`. Expected: los nuevos FAIL.
- [ ] **Step 3: Extract** `ProjectFacts`. **Run** `pnpm test src/projects/feature/ProjectsApp.test.tsx`. Expected: PASS sin cambios.
- [ ] **Step 4: Implement** `ProjectList`, `ProjectScreen` y `ProjectsPhoneApp`, y el export.
- [ ] **Step 5: Run** `pnpm test src/projects`. Expected: PASS.
- [ ] **Step 6: Commit** `feat(projects): add a list and pushed detail for the phone`

---

### Task 5: Interfaz del teléfono y páginas

**Files:**

- Create: `src/phone/index.ts`
- Create: `src/phone/feature/Phone.tsx`, `src/phone/feature/Phone.test.tsx`, `src/phone/feature/usePhoneNavigation.ts`, `src/phone/feature/useIsHydrated.ts`
- Create: `src/phone/ui/HomeScreen.tsx`, `src/phone/ui/HomeScreen.test.tsx`, `src/phone/ui/AppScreen.tsx`, `src/phone/ui/PhoneAppIcon.tsx`
- Create: `src/phone/util/home.ts`
- Create: `src/app/_components/phoneAppContent.tsx`
- Modify: `src/app/page.tsx`, `src/app/_components/StandaloneAppPage.tsx`, `src/app/{about,contact,projects,terminal}/page.tsx`, `src/app/layout.tsx`
- Modify: `playwright.config.ts`, `e2e/support.ts`
- Create: `e2e/phone.spec.ts`

**Interfaces:**

- `phone/util/home.ts`: `OWNER = { name: 'Daniel Jaramillo', role: 'Frontend Tech Lead · AI App Developer', status: 'Disponible · Colombia UTC−5' } as const`; `type LauncherTone = AppTone | 'neutral'`.
- `PhoneAppIcon({ glyph, tone }: { glyph: AppGlyphId; tone: LauncherTone }): ReactNode`: decorativo (`aria-hidden`), `cva` con tile `size-15 rounded-control`. Los tonos usan los mismos pares `bg-*/text-on-*` de `AppIcon`; `neutral` es `bg-surface-raised text-foreground`.
- `HomeScreen({ currentHref, onOpenApp, grid }: { currentHref: string; onOpenApp: (id: AppId) => void; grid?: ReactNode }): ReactNode`, un `main` con:
  - widget `section` «Perfil» con `OWNER` y `Link` «Ver CV» a `APPS.about.href`;
  - `nav` «Apps» con el lanzador «CV» (enlace a `/about`, tono `neutral`) más el slot `grid` (Task 6 pone Guía);
  - píldora `Link` «Pregúntale a mi IA» a `/terminal`;
  - `nav` «Dock» con un `Link` por `APP_IDS`, con nombre accesible `APPS[id].title`.
  - Todos los enlaces que abren una app pasan su clic por `shouldActivateFromClick(event, href, currentHref)` y, si es `true`, llaman a `onOpenApp(id)`.
- `AppScreen({ title, onHome, children }: { title: string; onHome: (event: MouseEvent<HTMLAnchorElement>) => void; children: ReactNode }): ReactNode`: barra con `Link` «Inicio» a `HOME_HREF` (chevron, color `primary`, `onClick={onHome}`), `h1` grande en `font-display` y `main` desplazable con `children`.
- `usePhoneNavigation(): { openAppId: AppId | null; currentHref: string; markOpenedFromHome: () => void; goHome: (event: MouseEvent<HTMLAnchorElement>) => void }`.
  - `openAppId` sale de `getAppIdByPathname(usePathname())`.
  - `markOpenedFromHome` marca una ref; `goHome`, si la ref está marcada, hace `preventDefault()` y `router.back()`, para que el inicio sea la entrada anterior del historial y no una nueva. Sin marca, deja navegar al `Link`.
- `useIsHydrated(): boolean` con `useSyncExternalStore` (servidor `false`, cliente `true`), sin efectos.
- Produces (`@/phone`): `Phone({ flavor, appContent }: { flavor: PhoneFlavor; appContent: Readonly<Record<AppId, ReactNode>> }): ReactNode`.
  - Raíz con `data-flavor`, `data-hydrated={isHydrated}`, `h-dvh bg-wallpaper` y padding de `env(safe-area-inset-*)`.
  - Renderiza `AppScreen` con `APPS[openAppId].title` y `appContent[openAppId]`, o `HomeScreen`.
- `PHONE_APP_CONTENT: Readonly<Record<AppId, ReactNode>>` = `{ projects: <ProjectsPhoneApp />, terminal: <TerminalPhoneApp />, about: <AboutApp />, contact: <ContactApp /> }`.
- Páginas:
  - `src/app/page.tsx` pasa a `async ({ searchParams }: PageProps<'/'>)` y renderiza `Phone` si `isPhoneFlavor(profile)`; si no, `Desktop`.
  - `StandaloneAppPage({ appId, searchParams })` pasa a `async` y hace lo mismo con `StandalonePage`. Cada página de app le pasa sus `searchParams`.
  - Las rutas `@window` no cambian.
- `layout.tsx`: `viewport` gana `viewportFit: 'cover'`.
- Playwright:
  - proyecto `chromium` con `testIgnore: /phone.*\.spec\.ts/`;
  - proyecto nuevo `iphone` con `{ ...devices['iPhone 15'], browserName: 'chromium' }` y `testMatch: /phone.*\.spec\.ts/`. CI solo instala Chromium: esto prueba el UA y el viewport del iPhone, no WebKit.
  - `e2e/support.ts` exporta `openPhone(page: Page, path = '/'): Promise<void>`: `goto` y espera `[data-hydrated="true"]`.

- [ ] **Step 1: Write the failing unit tests**
  - `HomeScreen.test.tsx`: `it('docks the four apps')`, cuatro enlaces del `nav` «Dock» con nombres «Proyectos», «Pregúntale a mi IA», «Perfil y CV», «Contacto» y sus `href`. `it('opens an app from the dock')`, clic en «Proyectos» → `onOpenApp('projects')`. `it('does not open the app the router is on')`, con `currentHref='/terminal'`, clic en la píldora → `defaultPrevented` y `onOpenApp('terminal')` (la ventana no navega, el estado sí). `it('ignores the second click of a double click')`, `detail: 2` → `onOpenApp` no llamado.
  - `Phone.test.tsx` (con `next/navigation` mockeado): `it('shows the home screen on /')`, `nav` «Dock». `it('opens the app named by the route')`, en `/projects`, `h1` «Proyectos» y el contenido pasado. `it('goes back to the home screen it came from')`, abrir desde el dock y luego «Inicio» → `router.back` llamado. `it('navigates home on a direct entry')`, en `/projects` sin abrir desde el inicio, «Inicio» → `router.back` no llamado y el clic no tiene `defaultPrevented`.
- [ ] **Step 2: Run** `pnpm test src/phone`. Expected: FAIL.
- [ ] **Step 3: Implement** `src/phone`, `phoneAppContent.tsx`, las páginas y el viewport.
- [ ] **Step 4: Run** `pnpm typecheck && pnpm lint && pnpm test`. Expected: PASS. ESLint confirma que `phone` no importa otros dominios.
- [ ] **Step 5: Write the e2e** en `e2e/phone.spec.ts` (proyecto `iphone`):
  - `the home screen docks the apps without any canvas`: `openPhone`, `nav` «Dock» visible y `locator('canvas')` con 0 elementos.
  - `each app opens from the dock and «Inicio» returns home`: para las cuatro apps, `h1` con su título, URL con su `href`, sin `canvas`; «Inicio» → URL `/` y «Dock» visible.
  - `the system back gesture closes an app` (Review Focus 1): abrir «Proyectos», `page.goBack()` → URL `/` y «Dock» visible.
  - `a direct link opens the app`: `openPhone(page, '/contact')` → `h1` «Contacto»; «Inicio» → «Dock».
  - `a project detail is pushed and popped` (Review Focus 2): en Proyectos, tocar NEXA → URL `/projects?project=nexa` y `region` «NEXA»; `page.goBack()` → URL `/projects`, `h1` «Proyectos» y fila «Factura Lens» visibles. `openPhone(page, '/projects?project=nexa')` → `region` «NEXA».
  - `the AI answers on the phone`: `answerWithStream` y pregunta escrita → `status` con el texto simulado.
  - en un `test.describe` con `test.use({ ...devices['Desktop Chrome'] })`: `?device=ios previews the phone on a computer`, `goto('/?device=ios')` → «Dock» de teléfono con «Pregúntale a mi IA» como enlace y sin barra superior del escritorio.
- [ ] **Step 6: Run** `pnpm e2e`. Expected: PASS en `chromium` (escritorio y `mobile.spec.ts` intactos) y en `iphone`.
- [ ] **Step 7: Commit** `feat(phone): render an ios phone shell on iphones`

---

### Task 6: Guía

**Files:**

- Create: `src/phone/util/guide.ts`
- Create: `src/phone/ui/GuideSheet.tsx`, `src/phone/ui/GuideSheet.test.tsx`
- Modify: `src/phone/feature/Phone.tsx`, `e2e/phone.spec.ts`

**Interfaces:**

- `GUIDE_ENTRIES: readonly { appId: AppId; description: string }[]` con el texto del canvas:
  - `projects`: «Mi trabajo publicado y mis ideas.»
  - `terminal`: «Pregunta lo que quieras sobre mi experiencia.»
  - `about`: «Mi experiencia, en pantalla y en PDF.»
  - `contact`: «Cómo escribirme.»
- `GuideSheet({ isOpen, currentHref, onClose, onOpenApp }: { isOpen: boolean; currentHref: string; onClose: () => void; onOpenApp: (id: AppId) => void }): ReactNode`.
  - Es un `<dialog>` nativo abierto con `showModal()` mientras `isOpen`.
  - Lleva `h2` «Guía», el texto «Un recorrido corto por Dani OS.», un enlace por entrada (título de `APPS` y descripción) y un botón «Cerrar».
  - El evento `cancel` (Escape) llama a `onClose`. Elegir una app pasa por `shouldActivateFromClick`, llama a `onOpenApp` y luego a `onClose`.
- `Phone` guarda `isGuideOpen` y pasa a `HomeScreen.grid` un `button` «Guía» con `aria-haspopup="dialog"` y `PhoneAppIcon glyph="guide" tone="neutral"`.

- [ ] **Step 1: Write the failing tests** en `GuideSheet.test.tsx`. Si jsdom no implementa `HTMLDialogElement.prototype.showModal` y `close`, se definen en el archivo de test.
  - `it('presents every app')`: cuatro enlaces con los títulos de `APPS` y sus descripciones.
  - `it('opens the chosen app and closes')`: clic en «Contacto» → `onOpenApp('contact')` y `onClose`.
  - `it('closes from its button')`: «Cerrar» → `onClose`.
- [ ] **Step 2: Run** `pnpm test src/phone/ui/GuideSheet.test.tsx`. Expected: FAIL.
- [ ] **Step 3: Implement** `guide.ts`, `GuideSheet` y su conexión en `Phone`.
- [ ] **Step 4: Add the e2e** `the guide opens over the home screen and Escape closes it`: tocar «Guía» → `dialog` «Guía» visible; `Escape` → oculto y foco en el botón «Guía». Elegir «Mi IA» en la guía → URL `/terminal`.
- [ ] **Step 5: Run** `pnpm test src/phone && pnpm e2e e2e/phone.spec.ts`. Expected: PASS.
- [ ] **Step 6: Commit** `feat(phone): add the guide sheet to the home screen`

---

### Task 7: Accesibilidad, fluidez y documentación

**Files:**

- Create: `e2e/axe.ts` (extrae `findViolations` y `expectNoViolations` de `e2e/accessibility.spec.ts`, que pasa a importarlos)
- Create: `e2e/phone-accessibility.spec.ts`
- Modify: `e2e/phone.spec.ts`, `CLAUDE.md`

- [ ] **Step 1: Write** `phone-accessibility.spec.ts` (proyecto `iphone`): `expectNoViolations` en el inicio, en cada una de las cuatro apps, en el detalle de NEXA y con la Guía abierta.
- [ ] **Step 2: Add** a `phone.spec.ts`: `opening and closing every app 20 times logs no errors` (Review Focus 5). Recoge `page.on('pageerror')` y los mensajes `console` de tipo `error`; por app, 20 ciclos de dock → `h1` → «Inicio» → «Dock»; espera 0 errores y 0 `canvas`.
- [ ] **Step 3: Run** `pnpm e2e`. Expected: PASS. Si axe reporta algo, se corrige el componente, nunca se excluye la regla.
- [ ] **Step 4: Update** `CLAUDE.md`:
  - fila `phone` en Dominios;
  - decisiones: perfil decidido en el servidor con `?device=`, rollout por `PHONE_FLAVORS`, la URL como estado del teléfono, «Inicio» con `router.back()`, detalle con `?project=`, Guía como `<dialog>`, contenidos simples sin WebGL, `shared/util/apps.ts` y `HOME_HREF`;
  - en la regla del CV, añadir `phone/util/home.ts`;
  - `openPhone` en la sección de e2e.
- [ ] **Step 5: Verify** `pnpm typecheck && pnpm lint && pnpm test && pnpm build && CI=1 PORT=3200 pnpm e2e`. Expected: todo PASS.
- [ ] **Step 6: Manual check** (lo hace Daniel o el ejecutor con DevTools): en `/?device=ios` con emulación de iPhone, grabar memoria mientras se abren y cierran apps unos minutos. El heap vuelve a su base tras un GC. Anotar el resultado en el PR.
- [ ] **Step 7: Commit** `test(phone): cover the phone with axe and a smoke run` y `docs: record the phone shell decisions` (dos commits).
