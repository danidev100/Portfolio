import { expect, test } from '@playwright/test';

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

    await page.getByRole('link', { name: 'Contacto' }).click();

    await expect(page.getByRole('dialog', { name: 'Contacto' })).toBeVisible();
  });
});

test.describe('desktop shell', () => {
  test('opens an app in a window with its own URL', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Proyectos' }).click();

    await expect(page).toHaveURL('/projects');
    await expect(page.getByRole('dialog', { name: 'Proyectos' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Dock' })).toBeVisible();
  });

  test('keeps earlier windows open and focuses the last one', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Proyectos' }).click();
    await page.getByRole('link', { name: 'Terminal' }).click();

    await expect(page).toHaveURL('/terminal');
    await expect(page.getByRole('dialog')).toHaveCount(2);
    await expect(page.getByRole('link', { name: 'Terminal, abierta' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('going back shows the desktop and keeps the app running', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Proyectos' }).click();
    await expect(page).toHaveURL('/projects');

    await page.goBack();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Proyectos, abierta' })).toBeVisible();
  });

  test('closing a window moves the URL to the next window, then to the desktop', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Proyectos' }).click();
    await page.getByRole('link', { name: 'Terminal' }).click();
    await expect(page).toHaveURL('/terminal');

    await page.getByRole('button', { name: 'Cerrar Terminal' }).click();
    await expect(page).toHaveURL('/projects');
    await expect(page.getByRole('dialog')).toHaveCount(1);

    await page.getByRole('button', { name: 'Cerrar Proyectos' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('lists the open windows in the activities overview', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Sobre mí' }).click();
    await expect(page.getByRole('dialog', { name: 'Sobre mí' })).toBeVisible();

    await page.getByRole('button', { name: 'Actividades' }).click();

    const overview = page.getByRole('region', { name: 'Ventanas abiertas' });
    await expect(overview.getByRole('link', { name: 'Sobre mí' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(overview).toHaveCount(0);
  });

  test('minimizes and restores a window when motion is reduced', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.getByRole('link', { name: 'Proyectos' }).click();
    await expect(page).toHaveURL('/projects');

    await page.getByRole('button', { name: 'Minimizar Proyectos' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await page.getByRole('link', { name: 'Proyectos, abierta' }).click();
    await expect(page.getByRole('dialog', { name: 'Proyectos' })).toBeVisible();
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
    await expect(page.getByRole('heading', { level: 1, name: 'Dani OS' })).toBeVisible();
  });
});
