import { expect, test, type Locator, type Page } from '@playwright/test';

import { dockLink } from './support';

const card = (page: Page, name: string): Locator =>
  page.getByRole('list', { name: 'Proyectos' }).getByRole('button', { name });

async function openProjectsWindow(page: Page): Promise<void> {
  await page.goto('/');
  await dockLink(page, 'Proyectos').click();
  await expect(page).toHaveURL('/projects');
  await expect(card(page, 'Factura Lens')).toHaveAttribute('aria-current', 'true');
}

test.describe('projects orbit', () => {
  test('turns to the next project from its button', async ({ page }) => {
    await openProjectsWindow(page);

    await page.getByRole('button', { name: 'Proyecto siguiente' }).click();

    await expect(card(page, 'Solar Scout')).toHaveAttribute('aria-current', 'true');
  });

  test('turns when dragged and settles on a project', async ({ page }) => {
    await openProjectsWindow(page);
    const front = await card(page, 'Factura Lens').boundingBox();
    if (!front) throw new Error('The front card has no layout.');
    const startX = front.x + front.width / 2;
    const y = front.y + front.height / 2;

    await page.mouse.move(startX, y);
    await page.mouse.down();
    await page.mouse.move(startX - 140, y, { steps: 10 });
    await page.mouse.up();

    await expect(card(page, 'Solar Scout')).toHaveAttribute('aria-current', 'true');
    await expect(page.getByRole('region', { name: 'Factura Lens' })).toHaveCount(0);
  });

  test('opens the case of a project and closes it back into the orbit', async ({ page }) => {
    await openProjectsWindow(page);

    await card(page, 'Factura Lens').click();

    const projectCase = page.getByRole('region', { name: 'Factura Lens' });
    await expect(projectCase.getByText('PYMES y contadores que aún digitan')).toBeVisible();

    await projectCase.getByRole('button', { name: 'Volver a la órbita' }).click();

    await expect(projectCase).toHaveCount(0);
    await expect(card(page, 'Factura Lens')).toBeFocused();
  });

  test('brings a side project to the front before opening its case', async ({ page }) => {
    await openProjectsWindow(page);

    await card(page, 'Solar Scout').click();

    await expect(page.getByRole('region', { name: 'Solar Scout' })).toBeVisible();
    await expect(card(page, 'Solar Scout')).toHaveAttribute('aria-current', 'true');
  });

  test('works on the standalone page too', async ({ page }) => {
    await page.goto('/projects');

    await page.getByRole('button', { name: 'Proyecto anterior' }).click();
    await expect(card(page, 'Interview Forge')).toHaveAttribute('aria-current', 'true');

    await card(page, 'Interview Forge').click();
    await expect(page.getByRole('region', { name: 'Interview Forge' })).toBeVisible();
  });
});
