import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';

import { AskPanel } from './AskPanel';

type AskPanelProps = ComponentProps<typeof AskPanel>;

const SUGGESTIONS = ['¿Has liderado equipos?', '¿Qué haces con IA?'];
const WELCOME = 'Hola, soy la IA de Daniel.';

function renderPanel(overrides: Partial<AskPanelProps> = {}): AskPanelProps {
  const props: AskPanelProps = {
    status: 'idle',
    question: null,
    answer: '',
    suggestions: SUGGESTIONS,
    hasFocus: false,
    welcome: { text: WELCOME, isTyping: false },
    autoFocusInput: false,
    onAsk: jest.fn(),
    onReset: jest.fn(),
    ...overrides,
  };
  render(<AskPanel {...props} />);

  return props;
}

const getConversation = (): HTMLElement => screen.getByRole('status');

describe('AskPanel', () => {
  it('is titled after what it is for, and says it is a demo', () => {
    renderPanel();

    expect(screen.getByRole('heading', { name: 'Pregúntale a mi IA' })).toBeInTheDocument();
    expect(screen.getByText('Demo')).toBeInTheDocument();
    expect(
      screen.getByText('Respondo sobre mi experiencia, proyectos y stack a partir de mi CV.'),
    ).toBeInTheDocument();
  });

  it('explains what «Demo» means to assistive technology', () => {
    renderPanel();

    expect(
      screen.getByText(/Respuestas de demostración; la versión con IA real llega pronto/),
    ).toBeInTheDocument();
  });

  it('greets the visitor', () => {
    renderPanel();

    expect(screen.getByText(WELCOME)).toBeInTheDocument();
  });

  it('shows the question and its answer as a conversation', () => {
    renderPanel({ question: '¿Qué haces con IA?', answer: 'Introduje flujos AI-native.' });

    expect(getConversation()).toHaveTextContent('¿Qué haces con IA?');
    expect(getConversation()).toHaveTextContent('Introduje flujos AI-native.');
  });

  it('holds the announcement of the answer until it has finished streaming', () => {
    renderPanel({ status: 'streaming', question: '¿Hola?', answer: 'Introduje' });

    expect(getConversation()).toHaveAttribute('aria-busy', 'true');
  });

  it('announces the answer once it is complete', () => {
    renderPanel({ status: 'idle', question: '¿Hola?', answer: 'Introduje flujos.' });

    expect(getConversation()).toHaveAttribute('aria-busy', 'false');
  });

  it('labels the suggestions as something to try', () => {
    renderPanel();

    expect(screen.getByText('Prueba con:')).toBeInTheDocument();
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

  it('puts the cursor in the field when asked to', () => {
    renderPanel({ autoFocusInput: true });

    expect(screen.getByRole('textbox', { name: 'Pregunta al portafolio' })).toHaveFocus();
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

  describe('when the conversation outgrows its space', () => {
    const CONVERSATION_HEIGHT_PX = 480;

    beforeEach(() => {
      jest
        .spyOn(HTMLElement.prototype, 'scrollHeight', 'get')
        .mockReturnValue(CONVERSATION_HEIGHT_PX);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('follows the answer down, so its last words stay in view', () => {
      renderPanel({ status: 'streaming', question: '¿Hola?', answer: 'Introduje flujos' });

      expect(screen.getByRole('group', { name: 'Conversación' }).scrollTop).toBe(
        CONVERSATION_HEIGHT_PX,
      );
    });

    it('can be scrolled with the keyboard', () => {
      renderPanel({ question: '¿Hola?', answer: 'Introduje flujos.' });

      expect(screen.getByRole('group', { name: 'Conversación' })).toHaveAttribute('tabindex', '0');
    });
  });
});
