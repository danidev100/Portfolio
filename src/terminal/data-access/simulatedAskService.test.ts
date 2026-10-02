import type { AskEvent } from '@/shared/types/ask';

import {
  createSimulatedAskService,
  THINKING_DELAY_MS,
  TOKEN_DELAY_MS,
  type Sleep,
} from './simulatedAskService';

const QUESTION = '¿Sabes de microfrontends?';

const instantSleep: Sleep = () => Promise.resolve();

async function collect(events: AsyncIterable<AskEvent>): Promise<AskEvent[]> {
  const collected: AskEvent[] = [];
  for await (const event of events) collected.push(event);

  return collected;
}

describe('createSimulatedAskService', () => {
  it('first tells which nodes the answer is about', async () => {
    const service = createSimulatedAskService({ sleep: instantSleep });

    const [first] = await collect(service.ask(QUESTION));

    expect(first).toEqual({ type: 'focus_nodes', nodeIds: ['mfe', 'ng', 'rx', 'hp'] });
  });

  it('streams the answer token by token and then says it is done', async () => {
    const service = createSimulatedAskService({ sleep: instantSleep });

    const events = await collect(service.ask(QUESTION));
    const text = events.flatMap((event) => (event.type === 'token' ? [event.text] : [])).join('');

    expect(text).toContain('Nx y Native Federation');
    expect(events.filter((event) => event.type === 'token').length).toBeGreaterThan(10);
    expect(events.at(-1)).toEqual({ type: 'done' });
  });

  it('thinks before answering and paces the tokens like a real model', async () => {
    const sleep = jest.fn<Promise<void>, Parameters<Sleep>>(() => Promise.resolve());
    const service = createSimulatedAskService({ sleep });

    const events = await collect(service.ask(QUESTION));
    const delays = sleep.mock.calls.map(([milliseconds]) => milliseconds);
    const tokenCount = events.filter((event) => event.type === 'token').length;

    expect(delays[0]).toBe(THINKING_DELAY_MS);
    expect(delays.slice(1)).toEqual(Array.from({ length: tokenCount }, () => TOKEN_DELAY_MS));
  });

  it('stops as soon as the request is aborted', async () => {
    const controller = new AbortController();
    const service = createSimulatedAskService({ sleep: instantSleep });
    const received: AskEvent[] = [];

    const consume = async (): Promise<void> => {
      for await (const event of service.ask(QUESTION, controller.signal)) {
        received.push(event);
        if (event.type === 'token') controller.abort();
      }
    };

    await expect(consume()).rejects.toThrow();
    expect(received.filter((event) => event.type === 'token')).toHaveLength(1);
  });

  it('waits for real, by default', async () => {
    jest.useFakeTimers();
    const service = createSimulatedAskService();
    const first = service.ask(QUESTION)[Symbol.asyncIterator]().next();
    let hasAnswered = false;
    void first.then(() => {
      hasAnswered = true;
    });

    await jest.advanceTimersByTimeAsync(THINKING_DELAY_MS - 1);
    expect(hasAnswered).toBe(false);

    await jest.advanceTimersByTimeAsync(1);
    expect(hasAnswered).toBe(true);
    jest.useRealTimers();
  });
});
