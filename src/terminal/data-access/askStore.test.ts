import type { AskEvent, AskService } from '@/shared/types/ask';

import { createAskStore } from './askStore';

/** A service that answers with the given events, in order, right away. */
function serviceThatYields(events: readonly AskEvent[]): AskService {
  return {
    // eslint-disable-next-line @typescript-eslint/require-await
    async *ask() {
      yield* events;
    },
  };
}

const HELLO_WORLD: readonly AskEvent[] = [
  { type: 'focus_nodes', nodeIds: ['mcp', 'sdk'] },
  { type: 'token', text: 'Hola ' },
  { type: 'token', text: 'mundo' },
  { type: 'done' },
];

describe('createAskStore', () => {
  it('starts idle, with nothing asked and nothing in focus', () => {
    const store = createAskStore(serviceThatYields([]));

    expect(store.getState()).toMatchObject({
      status: 'idle',
      question: null,
      answer: '',
      focusNodeIds: [],
    });
  });

  it('collects the streamed answer and the nodes in focus', async () => {
    const store = createAskStore(serviceThatYields(HELLO_WORLD));

    await store.getState().ask('¿Qué haces con IA?');

    expect(store.getState()).toMatchObject({
      status: 'idle',
      question: '¿Qué haces con IA?',
      answer: 'Hola mundo',
      focusNodeIds: ['mcp', 'sdk'],
    });
  });

  it('passes the question to the service, trimmed', async () => {
    const ask = jest.fn(() => serviceThatYields(HELLO_WORLD).ask(''));
    const store = createAskStore({ ask });

    await store.getState().ask('  ¿Qué haces con IA?  ');

    expect(ask).toHaveBeenCalledWith('¿Qué haces con IA?', expect.any(AbortSignal));
  });

  it('ignores an empty question', async () => {
    const ask = jest.fn(() => serviceThatYields(HELLO_WORLD).ask(''));
    const store = createAskStore({ ask });

    await store.getState().ask('   ');

    expect(ask).not.toHaveBeenCalled();
    expect(store.getState().status).toBe('idle');
  });

  it('is thinking until the first token arrives', () => {
    const neverAnswers: AskService = {
      async *ask() {
        await new Promise(() => undefined);
        yield { type: 'done' };
      },
    };
    const store = createAskStore(neverAnswers);

    void store.getState().ask('¿Hola?');

    expect(store.getState().status).toBe('thinking');
  });

  it('drops the answer to a question when a newer one is asked', async () => {
    let releaseFirst: () => void = () => undefined;
    const firstIsHeld = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    const service: AskService = {
      async *ask(question) {
        if (question === 'primera') {
          await firstIsHeld;
          yield { type: 'token', text: 'respuesta vieja' };
        } else {
          yield { type: 'token', text: 'respuesta nueva' };
        }
        yield { type: 'done' };
      },
    };
    const store = createAskStore(service);

    const first = store.getState().ask('primera');
    await store.getState().ask('segunda');
    releaseFirst();
    await first;

    expect(store.getState()).toMatchObject({ question: 'segunda', answer: 'respuesta nueva' });
  });

  it('aborts the request of the previous question', async () => {
    const signals: AbortSignal[] = [];
    const service: AskService = {
      // eslint-disable-next-line @typescript-eslint/require-await
      async *ask(_question, signal) {
        if (signal) signals.push(signal);
        yield { type: 'done' };
      },
    };
    const store = createAskStore(service);

    await store.getState().ask('primera');
    await store.getState().ask('segunda');

    expect(signals[0]?.aborted).toBe(true);
    expect(signals[1]?.aborted).toBe(false);
  });

  it('shows the message of an error event', async () => {
    const store = createAskStore(serviceThatYields([{ type: 'error', message: 'Sin conexión' }]));

    await store.getState().ask('¿Hola?');

    expect(store.getState()).toMatchObject({ status: 'error', answer: 'Sin conexión' });
  });

  it('turns a failure of the service into an error the visitor can read', async () => {
    const failing: AskService = {
      // eslint-disable-next-line @typescript-eslint/require-await
      async *ask() {
        throw new Error('boom');
      },
    };
    const reportError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const store = createAskStore(failing);

    await store.getState().ask('¿Hola?');

    expect(store.getState().status).toBe('error');
    expect(store.getState().answer).toContain('No pude responder');
    expect(reportError).toHaveBeenCalled();
    reportError.mockRestore();
  });

  it('focuses a node picked by hand together with its connections', () => {
    const store = createAskStore(serviceThatYields([]));

    store.getState().selectNode('ds');

    expect(store.getState()).toMatchObject({
      status: 'idle',
      question: '¿Con qué se conecta Design System?',
      focusNodeIds: ['ds', 'hp', 'k60', 'a11y'],
    });
    expect(store.getState().answer).toContain('Design System se conecta con');
  });

  it('goes back to the overview on reset', async () => {
    const store = createAskStore(serviceThatYields(HELLO_WORLD));
    await store.getState().ask('¿Qué haces con IA?');

    store.getState().reset();

    expect(store.getState()).toMatchObject({
      status: 'idle',
      question: null,
      answer: '',
      focusNodeIds: [],
    });
  });

  it('has not been interacted with until something is asked or picked', async () => {
    const asked = createAskStore(serviceThatYields(HELLO_WORLD));
    const picked = createAskStore(serviceThatYields([]));
    expect(asked.getState().hasInteracted).toBe(false);

    await asked.getState().ask('¿Hola?');
    picked.getState().selectNode('ds');

    expect(asked.getState().hasInteracted).toBe(true);
    expect(picked.getState().hasInteracted).toBe(true);
  });

  it('remembers the interaction after going back to the overview', async () => {
    const store = createAskStore(serviceThatYields(HELLO_WORLD));
    await store.getState().ask('¿Hola?');

    store.getState().reset();

    expect(store.getState().hasInteracted).toBe(true);
  });

  it('welcomes the visitor once per visit', () => {
    const store = createAskStore(serviceThatYields([]));
    expect(store.getState().hasWelcomed).toBe(false);

    store.getState().markWelcomed();
    store.getState().reset();

    expect(store.getState().hasWelcomed).toBe(true);
  });
});
