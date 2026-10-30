import type { Page } from '@playwright/test';

import { expectNoViolations } from './axe';
import { answerWithStream, dockLink, expect, openDesktop, test } from './support';

async function openApp(page: Page, name: string): Promise<void> {
  await openDesktop(page);
  await dockLink(page, name).click();
  await expect(page.getByRole('dialog', { name })).toBeVisible();
}

test.describe('accessibility (WCAG 2.2 AA)', () => {
  test('desktop', async ({ page }) => {
    await openDesktop(page);
    await expect(page.locator('canvas')).toBeVisible();

    await expectNoViolations(page);
  });

  test('windows overview', async ({ page }) => {
    await openApp(page, 'Perfil y CV');
    await page.getByRole('button', { name: 'Ventanas' }).click();
    await expect(page.getByRole('region', { name: 'Ventanas abiertas' })).toBeVisible();

    await expectNoViolations(page);
  });

  for (const name of ['Proyectos', 'Pregúntale a mi IA', 'Perfil y CV', 'Contacto']) {
    test(`${name} window`, async ({ page }) => {
      await openApp(page, name);

      await expectNoViolations(page);
    });
  }

  test('project case', async ({ page }) => {
    await openApp(page, 'Proyectos');
    await page.getByRole('button', { name: /NEXA/ }).click();
    await expect(page.getByRole('region', { name: 'NEXA' })).toBeVisible();

    await expectNoViolations(page);
  });

  test('terminal with an answer in focus', async ({ page }) => {
    await openApp(page, 'Pregúntale a mi IA');
    await page.getByRole('button', { name: 'Design System', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Design System se conecta con');

    await expectNoViolations(page);
  });

  test('terminal with a claude answer in focus', async ({ page }) => {
    await openApp(page, 'Pregúntale a mi IA');
    await answerWithStream(page, [
      { type: 'focus_nodes', nodeIds: ['hp', 'k7'] },
      { type: 'token', text: 'Lideré un equipo de 7 desarrolladores.' },
      { type: 'done' },
    ]);
    await page.getByRole('textbox', { name: 'Pregunta al portafolio' }).fill('¿Cómo lideras?');
    await page.getByRole('button', { name: 'Preguntar' }).click();
    await expect(page.getByRole('status')).toContainText('7 desarrolladores.');

    await expectNoViolations(page);
  });

  for (const route of ['/projects', '/terminal', '/about', '/contact', '/no-such-page']) {
    test(`standalone page ${route}`, async ({ page }) => {
      await page.goto(route);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      await expectNoViolations(page);
    });
  }
});

test.describe('accessibility of the onboarding tour (WCAG 2.2 AA)', () => {
  test.use({ hasSeenTour: false });

  for (const [index, title] of [
    'Empieza por aquí',
    'Una ventana por sección',
    'Habla con mi IA',
  ].entries()) {
    test(`tour step ${String(index + 1)}`, async ({ page }) => {
      await openDesktop(page);
      for (let next = 0; next < index; next += 1) {
        await page.getByRole('button', { name: 'Siguiente' }).click();
      }
      await expect(page.getByRole('dialog', { name: title })).toBeVisible();

      await expectNoViolations(page);
    });
  }
});
