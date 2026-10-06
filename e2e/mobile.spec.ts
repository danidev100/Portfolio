import { devices, expect, test, type Page } from '@playwright/test';

import { dockLink } from './support';

const { viewport, userAgent, deviceScaleFactor, isMobile, hasTouch } = devices['Pixel 7'];

test.use({ viewport, userAgent, deviceScaleFactor, isMobile, hasTouch });

const hasHorizontalOverflow = (page: Page): Promise<boolean> =>
  page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

async function openApp(page: Page, name: string): Promise<void> {
  await page.goto('/');
  await dockLink(page, name).tap();
  await expect(page.getByRole('dialog', { name })).toBeVisible();
}

test.describe('on a phone', () => {
  test('a window takes the whole work area, between the top bar and the dock', async ({ page }) => {
    await openApp(page, 'Perfil y CV');
    const window = page.getByRole('dialog', { name: 'Perfil y CV' });
    await expect(window.getByText('Home Power Colombia')).toBeVisible();

    const dockBox = await page.getByRole('navigation', { name: 'Dock' }).boundingBox();
    const screenWidth = page.viewportSize()?.width ?? 0;

    // The window grows out of the dock: its box is only final once it settles.
    await expect(async () => {
      const windowBox = await window.boundingBox();

      expect(windowBox?.width).toBeGreaterThan(screenWidth * 0.9);
      expect((windowBox?.y ?? 0) + (windowBox?.height ?? 0)).toBeLessThanOrEqual(dockBox?.y ?? 0);
    }).toPass();
    expect(await hasHorizontalOverflow(page)).toBe(false);
  });

  test('the projects orbit turns and opens a case', async ({ page }) => {
    await openApp(page, 'Proyectos');

    await page.getByRole('button', { name: 'Proyecto siguiente' }).tap();
    const solarScout = page.getByRole('button', { name: /Solar Scout/ });
    await expect(solarScout).toHaveAttribute('aria-current', 'true');

    await solarScout.tap();
    await expect(page.getByRole('region', { name: 'Solar Scout' })).toBeVisible();
    expect(await hasHorizontalOverflow(page)).toBe(false);
  });

  test('the terminal answers and only labels what there is room for', async ({ page }) => {
    await openApp(page, 'Pregúntale a mi IA');
    const node = (name: string) =>
      page.getByRole('list', { name: 'Nodos del grafo' }).getByText(name, { exact: true });

    await expect(node('Home Power · Tech Lead')).toBeVisible();
    await expect(node('Angular')).toBeHidden();

    await page.getByRole('button', { name: '¿Sabes de microfrontends?' }).tap();

    await expect(page.getByRole('status')).toContainText('estado compartido.', {
      timeout: 15_000,
    });
    await expect(node('Angular')).toBeVisible();
    expect(await hasHorizontalOverflow(page)).toBe(false);
  });

  test('the windows overview lists the open windows', async ({ page }) => {
    await openApp(page, 'Contacto');

    await page.getByRole('button', { name: 'Ventanas' }).tap();

    await expect(
      page.getByRole('region', { name: 'Ventanas abiertas' }).getByRole('link', {
        name: 'Contacto',
      }),
    ).toBeVisible();
  });
});
