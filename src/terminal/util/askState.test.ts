import { applyAskEvent, INITIAL_ASK_STATE, startAsk, type AskState } from './askState';

const answering = (overrides: Partial<AskState> = {}): AskState => ({
  ...startAsk(INITIAL_ASK_STATE, '¿Qué haces con IA?'),
  ...overrides,
});

describe('startAsk', () => {
  it('remembers the question and waits for the answer', () => {
    const state = startAsk(INITIAL_ASK_STATE, '¿Qué haces con IA?');

    expect(state.status).toBe('thinking');
    expect(state.question).toBe('¿Qué haces con IA?');
  });

  it('clears the previous answer', () => {
    const previous: AskState = { ...INITIAL_ASK_STATE, answer: 'Respuesta anterior' };

    expect(startAsk(previous, 'Otra pregunta').answer).toBe('');
  });

  it('keeps the graph focused where it was until the new answer says otherwise', () => {
    const previous: AskState = { ...INITIAL_ASK_STATE, focusNodeIds: ['hp'] };

    expect(startAsk(previous, 'Otra pregunta').focusNodeIds).toEqual(['hp']);
  });
});

describe('applyAskEvent', () => {
  it('moves the focus of the graph', () => {
    const state = applyAskEvent(answering(), { type: 'focus_nodes', nodeIds: ['mcp', 'sdk'] });

    expect(state.focusNodeIds).toEqual(['mcp', 'sdk']);
  });

  it('appends each token to the answer while it streams', () => {
    const first = applyAskEvent(answering(), { type: 'token', text: 'Hola ' });
    const second = applyAskEvent(first, { type: 'token', text: 'mundo' });

    expect(second.answer).toBe('Hola mundo');
    expect(second.status).toBe('streaming');
  });

  it('goes back to idle when the answer is done, keeping it', () => {
    const state = applyAskEvent(answering({ status: 'streaming', answer: 'Listo' }), {
      type: 'done',
    });

    expect(state.status).toBe('idle');
    expect(state.answer).toBe('Listo');
  });

  it('shows the error in place of the answer', () => {
    const state = applyAskEvent(answering({ status: 'streaming', answer: 'A medias' }), {
      type: 'error',
      message: 'Sin conexión',
    });

    expect(state.status).toBe('error');
    expect(state.answer).toBe('Sin conexión');
  });
});
