import { expect, test, type Locator, type Page } from '@playwright/test';

const answer = (page: Page): Locator => page.getByRole('status');

/** An answer streams for a few seconds, and slower on a busy CI machine. */
const WHILE_IT_STREAMS = { timeout: 15_000 };

const node = (page: Page, name: string): Locator =>
  page.getByRole('list', { name: 'Nodos del grafo' }).getByRole('button', { name, exact: true });

async function openTerminalWindow(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('link', { name: 'Terminal' }).click();
  await expect(page).toHaveURL('/terminal');
  await expect(node(page, 'Dani')).toBeVisible();
}

test.describe('terminal', () => {
  test('streams the answer to a suggested question and focuses the graph', async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));
    await openTerminalWindow(page);

    await page.getByRole('button', { name: '¿Qué haces con IA?' }).click();

    await expect(answer(page)).toContainText('streaming y tool-calling.', WHILE_IT_STREAMS);
    await expect(node(page, 'Claude CLI · MCP')).toHaveAttribute('aria-pressed', 'true');
    await expect(node(page, 'Angular')).toHaveAttribute('aria-pressed', 'false');
    expect(pageErrors).toEqual([]);
  });

  test('answers a question typed by the visitor', async ({ page }) => {
    await openTerminalWindow(page);

    await page.getByRole('textbox', { name: 'Pregunta al portafolio' }).fill('¿Qué sabes de AWS?');
    await page.getByRole('button', { name: 'Preguntar' }).click();

    await expect(answer(page)).toContainText(
      'Encontré relación con: AWS Lambda · S3',
      WHILE_IT_STREAMS,
    );
    await expect(node(page, 'AWS Lambda · S3')).toHaveAttribute('aria-pressed', 'true');
  });

  test('focuses a node picked in the graph and goes back to the overview', async ({ page }) => {
    await openTerminalWindow(page);

    await node(page, 'Design System').click();
    await expect(answer(page)).toContainText('Design System se conecta con', WHILE_IT_STREAMS);
    await expect(node(page, 'Accesibilidad')).toHaveAttribute('aria-pressed', 'true');

    await page.getByRole('button', { name: 'Vista general' }).click();
    await expect(node(page, 'Accesibilidad')).toHaveAttribute('aria-pressed', 'false');
  });

  test('keeps the conversation when the window is minimized and restored', async ({ page }) => {
    await openTerminalWindow(page);
    await page.getByRole('button', { name: '¿Sabes de microfrontends?' }).click();
    await expect(answer(page)).toContainText('estado compartido.', WHILE_IT_STREAMS);

    await page.getByRole('button', { name: 'Minimizar Terminal' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.getByRole('link', { name: 'Terminal, abierta' }).click();

    await expect(answer(page)).toContainText('estado compartido.', WHILE_IT_STREAMS);
    await expect(node(page, 'Nx · Native Federation')).toHaveAttribute('aria-pressed', 'true');
  });

  test('works on the standalone page too', async ({ page }) => {
    await page.goto('/terminal');

    await page.getByRole('button', { name: '¿Has liderado equipos?' }).click();

    await expect(answer(page)).toContainText('SonarQube y Husky.', WHILE_IT_STREAMS);
    await expect(node(page, 'Equipo de 7 devs')).toHaveAttribute('aria-pressed', 'true');
  });
});
