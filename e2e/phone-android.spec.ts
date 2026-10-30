import { expect, openPhone, test } from './support';

// jsdom does not apply Tailwind: the android look is checked on real styles.
const SURFACE = 'rgb(20, 25, 34)';
const CARD_RADIUS = '20px';
const SURFACE_RAISED = 'rgb(27, 34, 48)';
const HIGHLIGHT = 'rgb(255, 184, 119)';

test.describe('the android flavor', () => {
  test.skip(() => test.info().project.name !== 'android', 'Only android phones get it');

  test('android icons are circles on the raised surface', async ({ page }) => {
    await openPhone(page);
    const icon = page
      .getByRole('navigation', { name: 'Dock' })
      .getByRole('link', { name: 'Proyectos' })
      .locator('span[aria-hidden="true"]')
      .first();

    await expect(icon).toHaveCSS('background-color', SURFACE_RAISED);
    await expect(icon).toHaveCSS('color', HIGHLIGHT);
  });

  test('android lists are separate cards', async ({ page }) => {
    await openPhone(page, '/projects');
    const list = page.getByRole('region', { name: 'En producción' }).getByRole('list');

    await expect(list.getByRole('listitem').first()).toHaveCSS('background-color', SURFACE);
    await expect(list).not.toHaveCSS('row-gap', /^(normal|0px)$/);
  });

  test('a pressed or focused card keeps its rounded corners', async ({ page }) => {
    await openPhone(page, '/projects');
    const row = page.getByRole('region', { name: 'En producción' }).getByRole('button').first();

    await expect(row).toHaveCSS('border-radius', CARD_RADIUS);
  });
});
