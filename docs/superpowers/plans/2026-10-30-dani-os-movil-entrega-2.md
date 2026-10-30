# Dani OS móvil — Entrega 2 (Android) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Android phones get the Dani OS phone in its Android flavor, covered by e2e and axe on a Pixel 7, and Lighthouse measures the desktop and the phone in separate passes.

**Architecture:** Detection adds `'android'` to `PHONE_FLAVORS`. Where only the look changes, it comes from two Tailwind variants (`ios:` and `android:`) keyed on the `data-flavor` attribute that `Phone` already renders. Those variants reach the `projects` content without that domain knowing about the phone. Where the structure changes (the order of the home screen, the app bar), `phone` components take a `flavor` prop. Lighthouse splits into one config per pass and the CI job runs both as a matrix.

**Tech Stack:** Next.js 16 `userAgent()`, Tailwind v4 `@custom-variant`, Jest + Testing Library, Playwright (`devices['Pixel 7']`), `@lhci/cli@0.15.1`.

**Spec:** `docs/superpowers/specs/2026-10-29-dani-os-movil-design.md` (§3.4, §4.3, §4.9, §5 entrega 2)

## Global Constraints

- Only the semantic tokens in `src/core/styles/globals.css`; no new colors, no straight corners (`rounded-control|card|window|full`).
- No WebGL or CSS 3D on the phone; `phone` does not import other domains.
- Android: circular icons on a `surface-raised` background with the stroke in the app's tone; back arrow with the title in the top bar; lists as separate cards. iOS stays as it is.
- Tablets, iPadOS, bots and unknown devices → `desktop`. Any other phone (not iOS and not Android) → `android` (spec §4.3).
- `?device=ios|android|desktop` forces the profile.
- The desktop Lighthouse pass keeps today's budgets: performance ≥ 0.8 `/`, ≥ 0.85 `/projects`, ≥ 0.7 `/terminal`; LCP ≤ 3.5 s; CLS ≤ 0.1; accessibility ≥ 0.95.
- Code in English, Conventional Commits ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Bots with a phone UA** (Googlebot Smartphone, which also exists as an iPhone): the spec sends them to the desktop. Delivery 1 never read `isBot`. → test in Task 1.
2. **The Lighthouse mobile pass really measures the phone**: if its user agent fell to the desktop, the phone budgets would be judging the desktop. → verification step in Task 5.
3. **DOM order = visual order** on the Android home (WCAG 2.4.3): reordering with CSS `order` would scramble the keyboard focus. → order test in Task 4.
4. **Landscape and 320 px**: the Android home has more at the bottom (grid, dock with labels, bar) and must not clip or scroll sideways. → e2e in Task 4.
5. **System back button on Android with a project open**: Chrome closes the modal `<dialog>` with a CloseWatcher, which triggers `cancel` → `history.back()`. It should pop a single entry. Playwright cannot simulate it, so it goes on the manual list in the PR.

---

### Task 1: Detection activates Android and the Pixel replaces `mobile.spec.ts`

**Files:**

- Modify: `src/shared/util/deviceProfile.ts`, `src/shared/util/deviceProfile.test.ts`, `src/app/_components/getDeviceProfile.ts`
- Modify: `playwright.config.ts`, `e2e/device-preview.spec.ts`, `e2e/phone.spec.ts`
- Delete: `e2e/mobile.spec.ts`

**Interfaces:**

- Produces: `PHONE_FLAVORS = ['ios', 'android'] as const`; `DeviceHints { deviceType: string | undefined; osName: string | undefined; isBot: boolean }`; Playwright project `android`.

- [ ] **Step 1: Failing tests in `deviceProfile.test.ts`.** The hints gain `isBot: false`, and `ANDROID_PHONE` changes its expectation to `'android'`. Add:
  - `it('gives other phones the android phone')`, where `{ deviceType: 'mobile', osName: 'KaiOS', isBot: false }` → `'android'`.
  - `it('keeps android tablets on the desktop')`, where `{ deviceType: 'tablet', osName: 'Android', isBot: false }` → `'desktop'`.
  - `it('keeps crawlers with a phone user agent on the desktop')`, where `{ ...IPHONE, isBot: true }` → `'desktop'`.
  - `it('previews the android phone on a computer')`, where `(COMPUTER, 'android')` → `'android'`.
  - The `it.each` for invalid overrides keeps `['foo', '']`.
- [ ] **Step 2:** `pnpm test src/shared/util/deviceProfile` → FAIL (android → desktop, KaiOS → desktop, bot → ios).
- [ ] **Step 3: Implement.** `PHONE_FLAVORS` = `['ios', 'android']`. Resolve in this order: valid override first, then `isBot` → `desktop`, then anything not `mobile` → `desktop`, then `iOS` → `ios`, and everything else → `android`. Update the module's doc comment (it no longer says "Delivery 2 adds"). `getDeviceProfile` passes `isBot` from `userAgent()`.
- [ ] **Step 4:** `pnpm test src/shared/util/deviceProfile` → PASS; `pnpm typecheck` → clean.
- [ ] **Step 5: Playwright.** Add the project `{ name: 'android', use: { ...devices['Pixel 7'] }, testMatch: PHONE_SPECS }` after `iphone`. Delete `e2e/mobile.spec.ts`: a Pixel no longer sees the desktop.
- [ ] **Step 6: e2e of the flavor.**
  - In `e2e/phone.spec.ts`, the describe changes to `'on a phone'`.
  - Add `test('the phone speaks the visitor's system')`. It maps `test.info().project.name` with `{ iphone: 'ios', android: 'android' }` and asserts `page.locator('[data-flavor]')` `toHaveAttribute('data-flavor', expected)`.
  - In `e2e/device-preview.spec.ts`, add `'?device=android previews the android phone on a computer'`, which asserts `data-flavor="android"` and that there is no canvas.
- [ ] **Step 7:** `pnpm e2e --project=iphone --project=android --project=chromium e2e/phone.spec.ts e2e/phone-accessibility.spec.ts e2e/device-preview.spec.ts` → all PASS. The Android phone still looks like iOS; that is expected until Tasks 2–4.
- [ ] **Step 8: Commit** `feat(phone): send android phones to the phone shell`.

### Task 2: Flavor variants, Android icons and lists

**Files:**

- Modify: `src/core/styles/globals.css`, `src/phone/ui/PhoneAppIcon.tsx`, `src/projects/ui/ProjectList.tsx`
- Create: `e2e/phone-android.spec.ts`

**Interfaces:**

- Produces: the Tailwind variants `ios:` and `android:`. Any element under `[data-flavor]`, including `<dialog>`s in the top layer (they are still its DOM descendants), can use them.

- [ ] **Step 1: Failing e2e `e2e/phone-android.spec.ts`.** It runs only on `android`: `test.skip(test.info().project.name !== 'android')`. Since jsdom does not apply Tailwind, the look is verified with `toHaveCSS` on real values:
  - `test('android icons are circles on the raised surface')`: the icon (the `span[aria-hidden]` inside the Dock's «Proyectos» link) has `background-color` `rgb(27, 34, 48)` (`surface-raised`) and `color` `rgb(143, 179, 255)` (`primary`).
  - `test('android lists are separate cards')`: the first `li` under the «En producción» region has `background-color` `rgb(20, 25, 34)` (`surface`), and its `ul` has `row-gap` other than `0px`.
- [ ] **Step 2:** `pnpm e2e --project=android e2e/phone-android.spec.ts` → FAIL (the icon has `primary` as its background).
- [ ] **Step 3: Implement.**
  - In `globals.css`, add `@custom-variant ios (&:where([data-flavor="ios"] *));` and `@custom-variant android (&:where([data-flavor="android"] *));`, with a comment saying why: the look of each flavor reaches content from other domains without a prop.
  - In `PhoneAppIcon`, each tone adds its `android:` version: `android:rounded-full android:bg-surface-raised android:text-<tone>` (`neutral` → `android:text-foreground`).
  - In `ProjectList`, on Android the `ul` drops the divider and the shared background, and becomes `android:gap-1 android:divide-y-0 android:bg-transparent` with `flex flex-col`. Each `li` becomes `android:rounded-card android:bg-surface`. The group title is `android:text-primary android:normal-case`.
- [ ] **Step 4:** the same e2e → PASS; `pnpm e2e --project=iphone e2e/phone.spec.ts` → PASS (iOS unchanged).
- [ ] **Step 5: Commit** `feat(phone): give android its icons and card lists`.

### Task 3: Android app bar (and a `header` landmark in both flavors)

**Files:**

- Create: `src/phone/ui/IosNavigationBar.tsx`, `src/phone/ui/AndroidTopAppBar.tsx`, `src/phone/ui/AppScreen.test.tsx`
- Modify: `src/phone/ui/AppScreen.tsx`, `src/phone/feature/Phone.tsx`, `src/projects/ui/ProjectScreen.tsx`

**Interfaces:**

- Consumes: `PhoneFlavor` (`@/shared/util/deviceProfile`).
- Produces: `AppScreen({ flavor, title, onHome, children })`; `IosNavigationBar({ title, onHome })` and `AndroidTopAppBar({ title, onHome })`, both with `onHome: (event: MouseEvent<HTMLAnchorElement>) => void`.

- [ ] **Step 1: Failing tests `AppScreen.test.tsx`.**
  - `it('puts the android title in the top app bar beside an arrow home')`: with `flavor="android"`, `within(getByRole('banner'))` contains the `h1` «Proyectos» and the link `{ name: 'Inicio' }`, whose `textContent` is empty (arrow only, named with `aria-label`).
  - `it('keeps the ios large title under «‹ Inicio»')`: with `flavor="ios"`, the banner contains the link with visible text «Inicio» and the `h1`.
  - `it('scrolls its content in the main landmark')`: `getByRole('main')` contains the children.
- [ ] **Step 2:** `pnpm test src/phone/ui/AppScreen` → FAIL (there is no `banner` and no `flavor`).
- [ ] **Step 3: Implement.**
  - Move today's iOS bar and large title to `IosNavigationBar`, inside a `<header>`.
  - `AndroidTopAppBar` is a `<header>` with `h-16`, holding:
    - a `Link` to `HOME_HREF` with `aria-label="Inicio"`, `size-12 rounded-full`, and an arrow svg (`M19 12H5M12 19l-7-7 7-7`);
    - an `h1`, `font-display text-xl font-semibold`.
  - `AppScreen` chooses the bar by `flavor` and keeps `main`. `Phone` passes `flavor`.
  - `ProjectScreen`: next to the chevron, add the Android arrow. Each svg hides with `android:hidden` / `ios:hidden`. The text «Proyectos» gets `android:sr-only`, so the name does not change and the e2e keep working.
- [ ] **Step 4:** `pnpm test src/phone src/projects` → PASS; `pnpm e2e --project=iphone --project=android e2e/phone.spec.ts e2e/phone-accessibility.spec.ts` → PASS.
- [ ] **Step 5: Commit** `feat(phone): add the android top app bar`.

### Task 4: Android home screen

**Files:**

- Create: `src/phone/ui/ProfileWidget.tsx`
- Modify: `src/phone/ui/HomeScreen.tsx`, `src/phone/ui/HomeScreen.test.tsx`, `src/phone/feature/Phone.tsx`, `e2e/phone.spec.ts`

**Interfaces:**

- Produces: `HomeScreen({ flavor, currentHref, onOpenApp, grid? })`; `ProfileWidget({ onOpenCv })`, where `onOpenCv: (event: MouseEvent<HTMLAnchorElement>) => void`.

- [ ] **Step 1: Failing tests in `HomeScreen.test.tsx`.** `renderHome` takes `flavor` (`'ios'` by default; the current tests do not change). Add:
  - `it('puts the android apps and dock at the bottom, above the ai bar')`: with `flavor="android"`, the order of the links is the Apps grid («CV»), then the four Dock links, then «Pregúntale a mi IA». Compare with `compareDocumentPosition`, or with the index in `getAllByRole('link')`.
  - `it('labels the android dock with each app's short title')`: the Dock links show `Proyectos`, `Mi IA`, `Perfil`, `Contacto` as text and keep `aria-label` = `title`.
  - `it('keeps the ios pill above the dock')`: with `flavor="ios"`, «Pregúntale a mi IA» comes before the first Dock link.
- [ ] **Step 2:** `pnpm test src/phone/ui/HomeScreen` → FAIL.
- [ ] **Step 3: Implement.**
  - Extract the profile section to `ProfileWidget`, with no changes.
  - `HomeScreen` renders, in DOM order:
    - iOS: widget, Apps, `mt-auto` (pill, Dock).
    - Android: widget, `mt-auto` (Apps, Dock, AI bar).
  - The AI bar on Android is full width (`h-14 w-full rounded-full bg-surface-raised`), with the terminal glyph in `text-ai` and the text in `text-muted`.
  - Dock labels: a `<span>` with `shortTitle`, rendered only on Android.
  - `main` adds `overflow-y-auto` so landscape scrolls instead of clipping.
  - `Phone` passes `flavor`.
- [ ] **Step 4:** `pnpm test src/phone` → PASS.
- [ ] **Step 5: e2e in `phone.spec.ts`.**
  - New describe `'on the narrowest phone'` with `test.use({ viewport: { width: 320, height: 640 } })`. It asserts the home and each app have no horizontal overflow (`scrollWidth <= innerWidth`).
  - Another describe in landscape, with `viewport: { width: 915, height: 412 }`. It taps «Contacto» in the Dock and the `h1` «Contacto» shows up.
  - Both run on both projects.
- [ ] **Step 6:** `pnpm e2e --project=iphone --project=android e2e/phone*.spec.ts` → PASS.
- [ ] **Step 7: Commit** `feat(phone): lay out the android home screen`.

### Task 5: Lighthouse in two passes and project notes

**Files:**

- Create: `lighthouserc.desktop.json`, `lighthouserc.mobile.json`
- Delete: `lighthouserc.json`
- Modify: `.github/workflows/ci.yml`, `CLAUDE.md`

- [ ] **Step 1: Desktop config.** `lighthouserc.desktop.json` is today's `lighthouserc.json` plus `collect.settings.preset: "desktop"`. That preset sends a desktop user agent, so it measures the desktop with today's budgets, unchanged.
- [ ] **Step 2: Mobile config.** `lighthouserc.mobile.json` uses the same URLs, with no preset (Lighthouse's mobile user agent is Android). For all three URLs it sets:
  - performance ≥ 0.9 (`error`)
  - LCP ≤ 2500 (`error`)
  - CLS ≤ 0.1 (`error`)
  - TBT ≤ 200 (`warn`)
  - accessibility ≥ 0.95 (`error`)
  - best-practices and SEO ≥ 0.9 (`warn`)

  Delivery 4 does the final tuning.

- [ ] **Step 3: Verify locally** with `pnpm build`, then for each pass `pnpm dlx @lhci/cli@0.15.1 collect --config=lighthouserc.<pass>.json && pnpm dlx @lhci/cli@0.15.1 assert --config=lighthouserc.<pass>.json`. Use `collect`+`assert` and not `autorun`, so nothing gets uploaded to public storage. Expected: both pass. If the mobile pass is below a budget, rule it in the ledger with the measured value.
- [ ] **Step 4: The mobile pass measures the phone.** Take `environment.networkUserAgent` from a mobile `lhr-*.json` in `.lighthouseci/`, then run `curl -s -A "<that UA>" localhost:3000/ | grep -c 'data-flavor="android"'` with the server up. Expected: `1`. Do the same with the desktop pass's UA, expecting `0`.
- [ ] **Step 5: CI.** The `lighthouse` job gets `strategy.matrix.pass: [desktop, mobile]` and `fail-fast: false`. Its step runs `pnpm dlx @lhci/cli@0.15.1 autorun --config=./lighthouserc.${{ matrix.pass }}.json`.
- [ ] **Step 6: `CLAUDE.md`.**
  - «Teléfono»: `PHONE_FLAVORS` = `ios` and `android`; tablets, iPadOS and bots get the desktop.
  - Add the `ios:`/`android:` variants: the look by flavor, while the structure goes by the `flavor` prop.
  - Playwright projects `iphone` and `android`.
  - Replace the `mobile.spec.ts` line.
  - Lighthouse: two passes, `lighthouserc.desktop.json` with today's budgets and `lighthouserc.mobile.json` with the phone's.
- [ ] **Step 7:** `pnpm typecheck && pnpm lint && pnpm test` → clean; `CI=1 PORT=3200 pnpm e2e` → everything PASS on `chromium`, `iphone` and `android`.
- [ ] **Step 8: Commit** `ci(lighthouse): measure the desktop and the phone in two passes` (with `CLAUDE.md` in a separate `docs:` commit).
