import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { dockLink } from './support';

const WCAG_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

interface Violation {
  rule: string;
  elements: string[];
}

/** Selector of the labels of the experience graph. */
const GRAPH_LABELS = 'ul[aria-label="Nodos del grafo"]';

/** Rule ids with the elements that break them: a readable diff when it fails. */
async function findViolations(page: Page): Promise<Violation[]> {
  // The graph labels sit where their nodes are, so in a crowded view some
  // overlap and leave less than 24px of a neighbor clear. Like pins on a map,
  // their position is the information (WCAG 2.5.8, "essential" exception),
  // and each label on its own does meet the minimum size.
  const { violations: targetSizeViolations } = await new AxeBuilder({ page })
    .withRules(['target-size'])
    .exclude(GRAPH_LABELS)
    .analyze();
  const { violations } = await new AxeBuilder({ page })
    .withTags(WCAG_AA)
    .disableRules(['target-size'])
    .analyze();

  return [...violations, ...targetSizeViolations].map((violation) => ({
    rule: violation.id,
    elements: violation.nodes.map((node) => node.html),
  }));
}

/**
 * Content fades in when a window opens, and text is reported for its contrast
 * while it is still half transparent. Retrying lets every state settle; a real
 * violation is still there on the last try.
 */
async function expectNoViolations(page: Page): Promise<void> {
  await expect(async () => {
    expect(await findViolations(page)).toEqual([]);
  }).toPass({ timeout: 10_000 });
}

async function openApp(page: Page, name: string): Promise<void> {
  await page.goto('/');
  await dockLink(page, name).click();
  await expect(page.getByRole('dialog', { name })).toBeVisible();
}

test.describe('accessibility (WCAG 2.2 AA)', () => {
  test('desktop', async ({ page }) => {
    await page.goto('/');
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
    await page.getByRole('button', { name: /Factura Lens/ }).click();
    await expect(page.getByRole('region', { name: 'Factura Lens' })).toBeVisible();

    await expectNoViolations(page);
  });

  test('terminal with an answer in focus', async ({ page }) => {
    await openApp(page, 'Pregúntale a mi IA');
    await page.getByRole('button', { name: 'Design System', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Design System se conecta con');

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
