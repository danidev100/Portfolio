import type { Locator, Page } from '@playwright/test';

import { answerWithStream, expect, openPhone, test } from './support';

const PHONE_APPS = [
  { title: 'Proyectos', href: '/projects' },
  { title: 'Pregúntale a mi IA', href: '/terminal' },
  { title: 'Perfil y CV', href: '/about' },
  { title: 'Contacto', href: '/contact' },
] as const;

const dock = (page: Page): Locator => page.getByRole('navigation', { name: 'Dock' });

async function openFromDock(page: Page, title: string): Promise<void> {
  await dock(page).getByRole('link', { name: title }).tap();
  await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
}

test.describe('on an iphone', () => {
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
    await expect(page.getByRole('region', { name: 'NEXA' })).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL('/projects');
    await expect(page.getByRole('region', { name: 'NEXA' })).toBeHidden();
    await expect(page.getByRole('button', { name: /Factura Lens/ })).toBeVisible();
  });

  test('a direct link opens a project', async ({ page }) => {
    await openPhone(page, '/projects?project=nexa');

    await expect(page.getByRole('region', { name: 'NEXA' })).toBeVisible();
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
});
