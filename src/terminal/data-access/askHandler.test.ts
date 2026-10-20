/** @jest-environment node */
import type { AskEvent, AskService } from '@/shared/types/ask';

import { AskUnavailableError, SERVICE_FAILURE_MESSAGE } from '../util/askErrors';
import { readSseData } from '../util/sse';
import { createAskHandler } from './askHandler';

const ENDPOINT = 'http://localhost/api/ask';

interface FakeService extends AskService {
  questions: string[];
  signals: (AbortSignal | undefined)[];
}

/** Answers `events`, then throws `failure` if given. */
function fakeService(events: readonly AskEvent[], failure?: Error): FakeService {
  const questions: string[] = [];
  const signals: (AbortSignal | undefined)[] = [];

  return {
    questions,
    signals,
    async *ask(question, signal) {
      questions.push(question);
      signals.push(signal);
      await Promise.resolve();
      yield* events;
      if (failure) throw failure;
    },
  };
}

function fakeLimiter(allows = true): {
  tryConsume(clientId: string): boolean;
  clientIds: string[];
} {
  const clientIds: string[] = [];

  return {
    clientIds,
    tryConsume: (clientId) => {
      clientIds.push(clientId);
      return allows;
    },
  };
}

const post = (body: string, headers: Record<string, string> = {}): Request =>
  new Request(ENDPOINT, {
    method: 'POST',
    body,
    headers: { 'content-type': 'application/json', ...headers },
  });

const ask = (question: string, headers?: Record<string, string>): Request =>
  post(JSON.stringify({ question }), headers);

async function readEvents(response: Response): Promise<unknown[]> {
  if (!response.body) return [];
  const events: unknown[] = [];
  for await (const data of readSseData(response.body)) events.push(JSON.parse(data));

  return events;
}

describe('createAskHandler', () => {
  it('rejects a body that is not JSON without asking', async () => {
    const service = fakeService([]);
    const handle = createAskHandler({ service, limiter: fakeLimiter() });

    const response = await handle(post('not json'));

    expect(response.status).toBe(400);
    expect(service.questions).toEqual([]);
  });

  it('rejects an empty question and one longer than 500 characters', async () => {
    const service = fakeService([]);
    const handle = createAskHandler({ service, limiter: fakeLimiter() });

    expect((await handle(ask('   '))).status).toBe(400);
    expect((await handle(ask('a'.repeat(501)))).status).toBe(400);
    expect(service.questions).toEqual([]);
  });

  it('answers 429 without asking when the visitor is over the limit', async () => {
    const service = fakeService([]);
    const handle = createAskHandler({ service, limiter: fakeLimiter(false) });

    const response = await handle(ask('¿Has liderado equipos?'));

    expect(response.status).toBe(429);
    expect(service.questions).toEqual([]);
  });

  it('limits by the first forwarded address, or as unknown without one', async () => {
    const limiter = fakeLimiter();
    const handle = createAskHandler({ service: fakeService([{ type: 'done' }]), limiter });

    await handle(ask('Hola', { 'x-forwarded-for': ' 1.1.1.1 , 2.2.2.2' }));
    await handle(ask('Hola'));

    expect(limiter.clientIds).toEqual(['1.1.1.1', 'unknown']);
  });

  it('answers 503 when the AI cannot answer anything', async () => {
    const service = fakeService([], new AskUnavailableError());
    const handle = createAskHandler({ service, limiter: fakeLimiter() });

    const response = await handle(ask('Hola'));

    expect(response.status).toBe(503);
  });

  it('streams the answer as server-sent events, with the trimmed question and the request signal', async () => {
    const events: AskEvent[] = [
      { type: 'focus_nodes', nodeIds: ['hp'] },
      { type: 'token', text: 'Sí.' },
      { type: 'done' },
    ];
    const service = fakeService(events);
    const handle = createAskHandler({ service, limiter: fakeLimiter() });
    const request = ask('  ¿Has liderado equipos?  ');

    const response = await handle(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/event-stream');
    expect(await readEvents(response)).toEqual(events);
    expect(service.questions).toEqual(['¿Has liderado equipos?']);
    expect(service.signals).toEqual([request.signal]);
  });

  it('keeps what it streamed and ends with an error when the AI fails midway', async () => {
    const service = fakeService([{ type: 'token', text: 'Sí.' }], new Error('connection reset'));
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const handle = createAskHandler({ service, limiter: fakeLimiter() });

    const response = await handle(ask('Hola'));

    expect(await readEvents(response)).toEqual([
      { type: 'token', text: 'Sí.' },
      { type: 'error', message: SERVICE_FAILURE_MESSAGE },
    ]);
  });
});
