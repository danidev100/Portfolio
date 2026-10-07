import type { Locator, Page } from '@playwright/test';

import { dockLink, expect, openDesktop, test } from './support';

const card = (page: Page, name: string): Locator =>
  page.getByRole('list', { name: 'Proyectos' }).getByRole('button', { name });

async function openProjectsWindow(page: Page): Promise<void> {
  await openDesktop(page);
  await dockLink(page, 'Proyectos').click();
  await expect(page).toHaveURL('/projects');
  await expect(card(page, 'NEXA')).toHaveAttribute('aria-current', 'true');
}

test.describe('projects orbit', () => {
  test('turns to the next project from its button', async ({ page }) => {
    await openProjectsWindow(page);

    await page.getByRole('button', { name: 'Proyecto siguiente' }).click();

    await expect(card(page, 'Factura Lens')).toHaveAttribute('aria-current', 'true');
  });

  test('turns when dragged and settles on a project', async ({ page }) => {
    await openProjectsWindow(page);
    const front = await card(page, 'NEXA').boundingBox();
    if (!front) throw new Error('The front card has no layout.');
    const startX = front.x + front.width / 2;
    const y = front.y + front.height / 2;

    await page.mouse.move(startX, y);
    await page.mouse.down();
    await page.mouse.move(startX - 140, y, { steps: 10 });
    await page.mouse.up();

    await expect(card(page, 'Factura Lens')).toHaveAttribute('aria-current', 'true');
    await expect(page.getByRole('region', { name: 'NEXA' })).toHaveCount(0);
  });

  test('opens the case of a project and closes it back into the orbit', async ({ page }) => {
    await openProjectsWindow(page);

    await card(page, 'NEXA').click();

    const projectCase = page.getByRole('region', { name: 'NEXA' });
    await expect(
      projectCase.getByText('Negocios que atienden clientes todos los días.'),
    ).toBeVisible();
    await expect(projectCase.getByRole('link', { name: /Ver el sitio en vivo/ })).toHaveAttribute(
      'href',
      'https://nexa-landing.onrender.com',
    );

    await projectCase.getByRole('button', { name: 'Volver a la órbita' }).click();

    await expect(projectCase).toHaveCount(0);
    await expect(card(page, 'NEXA')).toBeFocused();
  });

  test('brings a side project to the front before opening its case', async ({ page }) => {
    await openProjectsWindow(page);

    await card(page, 'Factura Lens').click();

    await expect(page.getByRole('region', { name: 'Factura Lens' })).toBeVisible();
    await expect(card(page, 'Factura Lens')).toHaveAttribute('aria-current', 'true');
  });

  test('works on the standalone page too', async ({ page }) => {
    await page.goto('/projects');

    await page.getByRole('button', { name: 'Proyecto anterior' }).click();
    await expect(card(page, 'Interview Forge')).toHaveAttribute('aria-current', 'true');

    await card(page, 'Interview Forge').click();
    await expect(page.getByRole('region', { name: 'Interview Forge' })).toBeVisible();
  });
});
