import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps, ReactNode } from 'react';

import { askStore } from '../data-access/useAskStore';
import type { ExperienceGraph } from '../ui/ExperienceGraph';
import { TerminalApp } from './TerminalApp';

/** Long enough for the simulated service to finish any answer. */
const ANSWER_TIME_MS = 30_000;

// WebGL does not exist in jsdom: the graph is replaced by the list of its
// nodes, which is enough to check what the app tells it to focus.
jest.mock('../ui/ExperienceGraph', () => ({
  ExperienceGraph: ({
    nodes,
    activeNodeIds,
    onSelectNode,
  }: ComponentProps<typeof ExperienceGraph>): ReactNode => (
    <ul aria-label="Nodos del grafo">
      {nodes.map((node) => (
        <li key={node.id}>
          <button
            type="button"
            aria-pressed={activeNodeIds.includes(node.id)}
            onClick={() => {
              onSelectNode(node.id);
            }}
          >
            {node.label}
          </button>
        </li>
      ))}
    </ul>
  ),
}));

async function renderApp(): Promise<ReturnType<typeof userEvent.setup>> {
  render(<TerminalApp />);
  await screen.findByRole('list', { name: 'Nodos del grafo' });

  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
}

const waitForTheAnswer = (): Promise<void> =>
  act(async () => {
    await jest.advanceTimersByTimeAsync(ANSWER_TIME_MS);
  });

const getFocusedNodes = (): string[] =>
  screen.getAllByRole('button', { pressed: true }).map((node) => node.textContent);

describe('TerminalApp', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    askStore.getState().reset();
    askStore.setState({ hasInteracted: false, hasWelcomed: false });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('welcomes the visitor and points the graph at the chat', async () => {
    await renderApp();
    await waitForTheAnswer();

    expect(
      screen.getByText(
        'Hola, soy la IA de Daniel. Pregúntame por mi experiencia, mis proyectos o cómo trabajo.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Pregunta en el chat y aquí verás de qué hablo')).toBeInTheDocument();
    expect(screen.queryAllByRole('button', { pressed: true })).toEqual([]);
  });

  it('does not type the welcome again when the app is opened again in the same visit', async () => {
    const { unmount } = render(<TerminalApp />);
    await waitForTheAnswer();
    unmount();

    render(<TerminalApp />);

    expect(
      screen.getByText(
        'Hola, soy la IA de Daniel. Pregúntame por mi experiencia, mis proyectos o cómo trabajo.',
      ),
    ).toBeInTheDocument();
  });

  it('keeps the welcome readable when a question comes in while it is typing', async () => {
    const user = await renderApp();

    await user.click(screen.getByRole('button', { name: '¿Sabes de microfrontends?' }));
    await waitForTheAnswer();

    expect(screen.getByText(/Hola, soy la IA de Daniel\./)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('¿Sabes de microfrontends?');
    expect(screen.getByRole('status')).toHaveTextContent('estado compartido.');
  });

  it('hides the pointer to the chat once the visitor has used it', async () => {
    const user = await renderApp();

    await user.click(screen.getByRole('button', { name: 'Design System' }));

    expect(
      screen.queryByText('Pregunta en el chat y aquí verás de qué hablo'),
    ).not.toBeInTheDocument();
  });

  it('streams the answer to a suggested question', async () => {
    const user = await renderApp();

    await user.click(screen.getByRole('button', { name: '¿Sabes de microfrontends?' }));
    await waitForTheAnswer();

    expect(screen.getByRole('status')).toHaveTextContent(
      'He entregado arquitecturas de microfrontends en producción',
    );
  });

  it('is busy while the answer is on its way', async () => {
    const user = await renderApp();

    await user.click(screen.getByRole('button', { name: '¿Sabes de microfrontends?' }));

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    await waitForTheAnswer();
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'false');
  });

  it('focuses the graph on the nodes the answer is about', async () => {
    const user = await renderApp();

    await user.click(screen.getByRole('button', { name: '¿Sabes de microfrontends?' }));
    await waitForTheAnswer();

    expect(getFocusedNodes()).toEqual([
      'Home Power · Tech Lead',
      'Angular',
      'RxJS · Signals',
      'Nx · Native Federation',
    ]);
  });

  it('answers a question typed by the visitor', async () => {
    const user = await renderApp();

    await user.type(
      screen.getByRole('textbox', { name: 'Pregunta al portafolio' }),
      '¿Qué sabes de AWS?{Enter}',
    );
    await waitForTheAnswer();

    expect(screen.getByRole('status')).toHaveTextContent('Encontré relación con: AWS Lambda · S3');
    expect(getFocusedNodes()).toEqual(['AWS Lambda · S3']);
  });

  it('focuses a node picked in the graph together with its connections', async () => {
    const user = await renderApp();

    await user.click(screen.getByRole('button', { name: 'Design System' }));

    expect(screen.getByRole('status')).toHaveTextContent('Design System se conecta con');
    expect(screen.getByRole('status')).toHaveTextContent('¿Con qué se conecta Design System?');
    expect(getFocusedNodes()).toEqual([
      'Home Power · Tech Lead',
      'Design System',
      'Accesibilidad',
      '60% adopción del DS',
    ]);
  });

  it('goes back to the overview', async () => {
    const user = await renderApp();
    await user.click(screen.getByRole('button', { name: 'Design System' }));

    await user.click(screen.getByRole('button', { name: 'Vista general' }));

    expect(screen.queryAllByRole('button', { pressed: true })).toEqual([]);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
});
