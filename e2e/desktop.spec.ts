import type { Page } from '@playwright/test';

import { dockLink, expect, test } from './support';

test.describe('3d backdrop', () => {
  test('renders behind the shell, hidden from assistive technology', async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));

    await page.goto('/');

    await expect(page.locator('[aria-hidden="true"] canvas')).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test('does not get in the way of the dock', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('canvas')).toBeVisible();

    await dockLink(page, 'Contacto').click();

    await expect(page.getByRole('dialog', { name: 'Contacto' })).toBeVisible();
  });
});

test.describe('desktop shell', () => {
  test('opens an app in a window with its own URL', async ({ page }) => {
    await page.goto('/');

    await dockLink(page, 'Proyectos').click();

    await expect(page).toHaveURL('/projects');
    await expect(page.getByRole('dialog', { name: 'Proyectos' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Dock' })).toBeVisible();
  });

  test('keeps earlier windows open and focuses the last one', async ({ page }) => {
    await page.goto('/');

    await dockLink(page, 'Proyectos').click();
    await dockLink(page, 'Pregúntale a mi IA').click();

    await expect(page).toHaveURL('/terminal');
    await expect(page.getByRole('dialog')).toHaveCount(2);
    await expect(dockLink(page, 'Pregúntale a mi IA, abierta')).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('going back shows the desktop and keeps the app running', async ({ page }) => {
    await page.goto('/');
    await dockLink(page, 'Proyectos').click();
    await expect(page).toHaveURL('/projects');

    await page.goBack();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(dockLink(page, 'Proyectos, abierta')).toBeVisible();
  });

  test('closing a window moves the URL to the next window, then to the desktop', async ({
    page,
  }) => {
    await page.goto('/');
    await dockLink(page, 'Proyectos').click();
    await dockLink(page, 'Pregúntale a mi IA').click();
    await expect(page).toHaveURL('/terminal');

    await page.getByRole('button', { name: 'Cerrar Pregúntale a mi IA' }).click();
    await expect(page).toHaveURL('/projects');
    await expect(page.getByRole('dialog')).toHaveCount(1);

    await page.getByRole('button', { name: 'Cerrar Proyectos' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('lists the open windows in the activities overview', async ({ page }) => {
    await page.goto('/');
    await dockLink(page, 'Perfil y CV').click();
    await expect(page.getByRole('dialog', { name: 'Perfil y CV' })).toBeVisible();

    await page.getByRole('button', { name: 'Ventanas' }).click();

    const overview = page.getByRole('region', { name: 'Ventanas abiertas' });
    await expect(overview.getByRole('link', { name: 'Perfil y CV' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(overview).toHaveCount(0);
  });

  test('minimizes and restores a window when motion is reduced', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await dockLink(page, 'Proyectos').click();
    await expect(page).toHaveURL('/projects');

    await page.getByRole('button', { name: 'Minimizar Proyectos' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await dockLink(page, 'Proyectos, abierta').click();
    await expect(page.getByRole('dialog', { name: 'Proyectos' })).toBeVisible();
  });

  test('opens and closes a window with the keyboard alone, without losing the focus', async ({
    page,
  }) => {
    await page.goto('/');
    const dockIcon = dockLink(page, 'Contacto');

    await dockIcon.focus();
    await page.keyboard.press('Enter');
    const window = page.getByRole('dialog', { name: 'Contacto' });
    await expect(window).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Minimizar Contacto' })).toBeFocused();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(dockIcon).toBeFocused();
  });

  test('opens the profile from the greeting', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Ver mi perfil y CV' }).click();

    await expect(page).toHaveURL('/about');
    await expect(page.getByRole('dialog', { name: 'Perfil y CV' })).toBeVisible();
  });
});

test.describe('direct entry', () => {
  test('renders the app as a full page', async ({ page }) => {
    await page.goto('/projects');

    await expect(page.getByRole('heading', { level: 1, name: 'Proyectos' })).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByText('Factura Lens')).toBeVisible();
  });

  test('leads back to the desktop', async ({ page }) => {
    await page.goto('/contact');

    await page.getByRole('link', { name: 'Ir al escritorio' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { level: 1, name: 'Daniel Jaramillo' })).toBeVisible();
  });
});

// Navigating to the URL the router is already on, from an intercepted route,
// leaves the page empty. These are the ways a visitor could trigger it.
test.describe('staying on the current route', () => {
  const expectDesktop = async (page: Page): Promise<void> => {
    await expect(page.getByRole('navigation', { name: 'Dock' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: 'Daniel Jaramillo' })).toBeAttached();
  };

  test('the dock icon of the focused app minimizes its window', async ({ page }) => {
    await page.goto('/');
    await dockLink(page, 'Proyectos').click();
    await expect(page).toHaveURL('/projects');

    await dockLink(page, 'Proyectos, abierta').click();

    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page).toHaveURL('/');
    await expectDesktop(page);
    await expect(dockLink(page, 'Proyectos, abierta')).toBeVisible();
  });

  test('a double click on a dock icon opens the app and leaves it open', async ({ page }) => {
    await page.goto('/');

    await dockLink(page, 'Pregúntale a mi IA').dblclick();

    await expect(page).toHaveURL('/terminal');
    await expect(page.getByRole('dialog', { name: 'Pregúntale a mi IA' })).toBeVisible();
    await expectDesktop(page);
  });

  test('closing a window in the background keeps the desktop and the focused window', async ({
    page,
  }) => {
    await page.goto('/');
    await dockLink(page, 'Contacto').click();
    await expect(page).toHaveURL('/contact');
    await dockLink(page, 'Proyectos').click();
    await expect(page).toHaveURL('/projects');

    await page.getByRole('button', { name: 'Cerrar Contacto' }).click();

    await expect(page.getByRole('dialog')).toHaveCount(1);
    await expect(page.getByRole('dialog', { name: 'Proyectos' })).toBeVisible();
    await expect(page).toHaveURL('/projects');
    await expectDesktop(page);
  });

  test('picking the focused window in the activities overview keeps it open', async ({ page }) => {
    await page.goto('/');
    await dockLink(page, 'Perfil y CV').click();
    await expect(page).toHaveURL('/about');
    await page.getByRole('button', { name: 'Ventanas' }).click();

    await page
      .getByRole('region', { name: 'Ventanas abiertas' })
      .getByRole('link', { name: 'Perfil y CV' })
      .click();

    await expect(page.getByRole('region', { name: 'Ventanas abiertas' })).toHaveCount(0);
    await expect(page.getByRole('dialog', { name: 'Perfil y CV' })).toBeVisible();
    await expectDesktop(page);
  });

  test('a window reopened right after being minimized stays open', async ({ page }) => {
    await page.goto('/');
    await dockLink(page, 'Contacto').click();
    await expect(page).toHaveURL('/contact');

    await page.getByRole('button', { name: 'Minimizar Contacto' }).click();
    await dockLink(page, 'Contacto, abierta').click();

    await expect(page.getByRole('dialog', { name: 'Contacto' })).toBeVisible();
    await expect(page).toHaveURL('/contact');
    await expectDesktop(page);
  });
});
