import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';

import { AskPanel } from './AskPanel';

type AskPanelProps = ComponentProps<typeof AskPanel>;

const SUGGESTIONS = ['¿Has liderado equipos?', '¿Qué haces con IA?'];

function renderPanel(overrides: Partial<AskPanelProps> = {}): AskPanelProps {
  const props: AskPanelProps = {
    status: 'idle',
    question: null,
    answer: '',
    suggestions: SUGGESTIONS,
    hasFocus: false,
    onAsk: jest.fn(),
    onReset: jest.fn(),
    ...overrides,
  };
  render(<AskPanel {...props} />);

  return props;
}

const getAnswer = (): HTMLElement => screen.getByRole('status');

describe('AskPanel', () => {
  it('invites to ask before anything has been asked', () => {
    renderPanel();

    expect(getAnswer()).toHaveTextContent('Pregunta por mi experiencia');
  });

  it('shows the question and its answer', () => {
    renderPanel({ question: '¿Qué haces con IA?', answer: 'Introduje flujos AI-native.' });

    expect(getAnswer()).toHaveTextContent('¿Qué haces con IA?');
    expect(getAnswer()).toHaveTextContent('Introduje flujos AI-native.');
  });

  it('holds the announcement of the answer until it has finished streaming', () => {
    renderPanel({ status: 'streaming', question: '¿Hola?', answer: 'Introduje' });

    expect(getAnswer()).toHaveAttribute('aria-busy', 'true');
  });

  it('announces the answer once it is complete', () => {
    renderPanel({ status: 'idle', question: '¿Hola?', answer: 'Introduje flujos.' });

    expect(getAnswer()).toHaveAttribute('aria-busy', 'false');
  });

  it('asks a suggested question from its chip', async () => {
    const user = userEvent.setup();
    const { onAsk } = renderPanel();

    await user.click(screen.getByRole('button', { name: '¿Qué haces con IA?' }));

    expect(onAsk).toHaveBeenCalledWith('¿Qué haces con IA?');
  });

  it('asks the question typed in the field and clears it', async () => {
    const user = userEvent.setup();
    const { onAsk } = renderPanel();
    const field = screen.getByRole('textbox', { name: 'Pregunta al portafolio' });

    await user.type(field, '¿Sabes de AWS?{Enter}');

    expect(onAsk).toHaveBeenCalledWith('¿Sabes de AWS?');
    expect(field).toHaveValue('');
  });

  it('does not ask when the field is blank', async () => {
    const user = userEvent.setup();
    const { onAsk } = renderPanel();

    await user.type(screen.getByRole('textbox', { name: 'Pregunta al portafolio' }), '   ');
    await user.click(screen.getByRole('button', { name: 'Preguntar' }));

    expect(onAsk).not.toHaveBeenCalled();
  });

  it('offers the way back to the overview while the graph is focused', async () => {
    const user = userEvent.setup();
    const { onReset } = renderPanel({ hasFocus: true });

    await user.click(screen.getByRole('button', { name: 'Vista general' }));

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('disables the way back when there is nothing in focus', () => {
    renderPanel({ hasFocus: false });

    expect(screen.getByRole('button', { name: 'Vista general' })).toBeDisabled();
  });
});
