import { expect, openPhone, test } from './support';

test('?device=ios previews the phone on a computer', async ({ page }) => {
  await openPhone(page, '/?device=ios');

  await expect(
    page.getByRole('navigation', { name: 'Dock' }).getByRole('link', { name: 'Proyectos' }),
  ).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Apps' })).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
});

test('?device=android previews the android phone on a computer', async ({ page }) => {
  await openPhone(page, '/?device=android');

  await expect(page.locator('[data-flavor]')).toHaveAttribute('data-flavor', 'android');
  await expect(page.locator('canvas')).toHaveCount(0);
});
