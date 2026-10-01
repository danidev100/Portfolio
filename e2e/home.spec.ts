import { expect, test } from '@playwright/test';

test('renders the desktop entry point', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Dani OS' })).toBeVisible();
});
