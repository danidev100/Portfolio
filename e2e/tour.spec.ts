import type { Locator, Page } from '@playwright/test';

import { ONBOARDING_STORAGE_KEY } from '../src/desktop/data-access/onboardingStorage';
import { dockLink, expect, openDesktop, test } from './support';

test.use({ hasSeenTour: false });

const step = (page: Page, name: string): Locator => page.getByRole('dialog', { name });

test.describe('onboarding tour', () => {
  test('greets a first visit and remembers it was skipped', async ({ page }) => {
    await openDesktop(page);

    await expect(step(page, 'Empieza por aquí')).toBeVisible();
    await expect(page.getByText('Paso 1 de 3')).toBeVisible();
    await page.getByRole('button', { name: 'Saltar guía' }).click();

    await expect(step(page, 'Empieza por aquí')).toHaveCount(0);
    expect(
      await page.evaluate((key) => window.localStorage.getItem(key), ONBOARDING_STORAGE_KEY),
    ).toBe('seen');
  });

  test('walks through the three steps and opens the profile at the end', async ({ page }) => {
    await openDesktop(page);
    await expect(step(page, 'Empieza por aquí')).toBeVisible();

    await page.getByRole('button', { name: 'Siguiente' }).click();
    await expect(step(page, 'Una ventana por sección')).toBeVisible();
    await page.getByRole('button', { name: 'Siguiente' }).click();
    await step(page, 'Habla con mi IA').getByRole('link', { name: 'Ver mi perfil y CV' }).click();

    await expect(page).toHaveURL('/about');
    await expect(page.getByRole('dialog', { name: 'Perfil y CV' })).toBeVisible();
    await expect(step(page, 'Habla con mi IA')).toHaveCount(0);
  });

  test('ends when the visitor opens the app it points at', async ({ page }) => {
    await openDesktop(page);
    await expect(step(page, 'Empieza por aquí')).toBeVisible();

    await dockLink(page, 'Perfil y CV').click();

    await expect(page.getByRole('dialog', { name: 'Perfil y CV' })).toBeVisible();
    await expect(step(page, 'Empieza por aquí')).toHaveCount(0);
  });

  test('closes with Escape', async ({ page }) => {
    await openDesktop(page);
    await expect(step(page, 'Empieza por aquí')).toBeFocused();

    await page.keyboard.press('Escape');

    await expect(step(page, 'Empieza por aquí')).toHaveCount(0);
  });
});

test.describe('onboarding tour once seen', () => {
  test.use({ hasSeenTour: true });

  test('comes back from «Guía»', async ({ page }) => {
    await openDesktop(page);

    await page.getByRole('button', { name: 'Guía', exact: true }).click();

    await expect(step(page, 'Empieza por aquí')).toBeVisible();
  });

  test('gives the focus back to «Guía» when closed with Escape', async ({ page }) => {
    await openDesktop(page);
    const guide = page.getByRole('button', { name: 'Guía', exact: true });
    await guide.click();
    await expect(step(page, 'Empieza por aquí')).toBeFocused();

    await page.keyboard.press('Escape');

    await expect(guide).toBeFocused();
  });
});
