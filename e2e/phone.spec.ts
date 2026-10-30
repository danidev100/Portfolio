import type { Locator, Page } from '@playwright/test';

import { answerWithStream, expect, openPhone, test } from './support';

const PHONE_APPS = [
  { title: 'Proyectos', href: '/projects' },
  { title: 'Pregúntale a mi IA', href: '/terminal' },
  { title: 'Perfil y CV', href: '/about' },
  { title: 'Contacto', href: '/contact' },
] as const;

/** Rounds of opening and closing each app in the smoke run. */
const SMOKE_CYCLES = 20;

/** Enough presses of Tab to walk past everything in a project and wrap around. */
const FOCUS_PRESSES = 4;

/** The flavor each phone project should get from its user agent. */
const FLAVOR_BY_PROJECT: Readonly<Record<string, string>> = { iphone: 'ios', android: 'android' };

const dock = (page: Page): Locator => page.getByRole('navigation', { name: 'Dock' });

async function openFromDock(page: Page, title: string): Promise<void> {
  await dock(page).getByRole('link', { name: title }).tap();
  await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
}

test.describe('on a phone', () => {
  test("the phone speaks the visitor's system", async ({ page }) => {
    await openPhone(page);

    await expect(page.locator('[data-flavor]')).toHaveAttribute(
      'data-flavor',
      FLAVOR_BY_PROJECT[test.info().project.name] ?? '',
    );
  });

  test('the home screen docks the apps without any canvas', async ({ page }) => {
    await openPhone(page);

    await expect(dock(page).getByRole('link')).toHaveCount(PHONE_APPS.length);
    await expect(page.locator('canvas')).toHaveCount(0);
  });

  test('each app opens from the dock and «Inicio» returns home', async ({ page }) => {
    await openPhone(page);

    for (const app of PHONE_APPS) {
      await openFromDock(page, app.title);
      await expect(page).toHaveURL(app.href);
      await expect(page.locator('canvas')).toHaveCount(0);

      await page.getByRole('link', { name: 'Inicio' }).tap();
      await expect(page).toHaveURL('/');
      await expect(dock(page)).toBeVisible();
    }
  });

  test('the system back gesture closes an app', async ({ page }) => {
    await openPhone(page);
    await openFromDock(page, 'Proyectos');

    await page.goBack();

    await expect(page).toHaveURL('/');
    await expect(dock(page)).toBeVisible();
  });

  test('a direct link opens the app inside the phone', async ({ page }) => {
    await openPhone(page, '/contact');
    await expect(page.getByRole('heading', { level: 1, name: 'Contacto' })).toBeVisible();

    await page.getByRole('link', { name: 'Inicio' }).tap();

    await expect(dock(page)).toBeVisible();
  });

  test('a project is pushed over the list and the back gesture pops it', async ({ page }) => {
    await openPhone(page);
    await openFromDock(page, 'Proyectos');

    await page.getByRole('button', { name: /NEXA/ }).tap();
    await expect(page).toHaveURL('/projects?project=nexa');
    await expect(page.getByRole('dialog', { name: 'NEXA' })).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL('/projects');
    await expect(page.getByRole('dialog', { name: 'NEXA' })).toBeHidden();
    await expect(page.getByRole('button', { name: /Factura Lens/ })).toBeVisible();
  });

  test('a project keeps the focus off the list it covers', async ({ page }) => {
    await openPhone(page);
    await openFromDock(page, 'Proyectos');
    await page.getByRole('button', { name: /NEXA/ }).tap();
    await expect(page.getByRole('button', { name: 'Proyectos' })).toBeFocused();

    for (let press = 0; press < FOCUS_PRESSES; press += 1) {
      await page.keyboard.press('Tab');
      await expect(page.getByRole('link', { name: 'Inicio' })).not.toBeFocused();
      await expect(page.getByRole('button', { name: /Factura Lens/ })).not.toBeFocused();
    }
  });

  test('a direct link opens a project', async ({ page }) => {
    await openPhone(page, '/projects?project=nexa');

    await expect(page.getByRole('dialog', { name: 'NEXA' })).toBeVisible();
  });

  test('the AI answers on the phone', async ({ page }) => {
    await openPhone(page);
    await openFromDock(page, 'Pregúntale a mi IA');
    await answerWithStream(page, [
      { type: 'token', text: 'Lideré un equipo de 7 desarrolladores.' },
      { type: 'done' },
    ]);

    await page.getByRole('textbox', { name: 'Pregunta al portafolio' }).fill('¿Cómo lideras?');
    await page.getByRole('button', { name: 'Preguntar' }).tap();

    await expect(page.getByRole('status')).toContainText('7 desarrolladores.');
  });

  test('the guide opens over the home screen and Escape closes it', async ({ page }) => {
    await openPhone(page);
    const guideButton = page.getByRole('button', { name: 'Guía' });

    await guideButton.tap();
    await expect(page.getByRole('dialog', { name: 'Guía' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Guía' })).toBeHidden();
    await expect(guideButton).toBeFocused();
  });

  test('the guide opens the chosen app', async ({ page }) => {
    await openPhone(page);

    await page.getByRole('button', { name: 'Guía' }).tap();
    await page
      .getByRole('dialog', { name: 'Guía' })
      .getByRole('link', { name: /Pregúntale a mi IA/ })
      .tap();

    await expect(page).toHaveURL('/terminal');
    await expect(page.getByRole('dialog', { name: 'Guía' })).toBeHidden();
  });

  test('opening and closing every app 20 times logs no errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await openPhone(page);

    for (const app of PHONE_APPS) {
      for (let cycle = 0; cycle < SMOKE_CYCLES; cycle += 1) {
        await openFromDock(page, app.title);
        await page.getByRole('link', { name: 'Inicio' }).tap();
        await expect(dock(page)).toBeVisible();
      }
    }

    expect(errors).toEqual([]);
    await expect(page.locator('canvas')).toHaveCount(0);
  });
});

const hasHorizontalOverflow = (page: Page): Promise<boolean> =>
  page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

test.describe('on the narrowest phone', () => {
  test.use({ viewport: { width: 320, height: 640 } });

  test('the home screen and every app fit without scrolling sideways', async ({ page }) => {
    await openPhone(page);
    expect(await hasHorizontalOverflow(page)).toBe(false);

    for (const app of PHONE_APPS) {
      await openFromDock(page, app.title);
      expect(await hasHorizontalOverflow(page)).toBe(false);

      await page.getByRole('link', { name: 'Inicio' }).tap();
      await expect(dock(page)).toBeVisible();
    }
  });
});

test.describe('on a phone turned sideways', () => {
  test.use({ viewport: { width: 915, height: 412 } });

  test('the dock is still within reach', async ({ page }) => {
    await openPhone(page);

    await openFromDock(page, 'Contacto');
  });
});
