import type { Page } from '@playwright/test';

import { expectNoViolations } from './axe';
import { expect, openPhone, test } from './support';

const APP_TITLES = ['Proyectos', 'Pregúntale a mi IA', 'Perfil y CV', 'Contacto'] as const;

async function openApp(page: Page, title: string): Promise<void> {
  await openPhone(page);
  await page.getByRole('navigation', { name: 'Dock' }).getByRole('link', { name: title }).tap();
  await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
}

test.describe('accessibility of the phone (WCAG 2.2 AA)', () => {
  test('home screen', async ({ page }) => {
    await openPhone(page);

    await expectNoViolations(page);
  });

  for (const title of APP_TITLES) {
    test(`${title} app`, async ({ page }) => {
      await openApp(page, title);

      await expectNoViolations(page);
    });
  }

  test('project detail', async ({ page }) => {
    await openApp(page, 'Proyectos');
    await page.getByRole('button', { name: /NEXA/ }).tap();
    await expect(page.getByRole('region', { name: 'NEXA' })).toBeVisible();

    await expectNoViolations(page);
  });

  test('guide', async ({ page }) => {
    await openPhone(page);
    await page.getByRole('button', { name: 'Guía' }).tap();
    await expect(page.getByRole('dialog', { name: 'Guía' })).toBeVisible();

    await expectNoViolations(page);
  });
});
