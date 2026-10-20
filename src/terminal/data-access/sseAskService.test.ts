/** @jest-environment node */
import type { AskEvent } from '@/shared/types/ask';

import { AskUnavailableError, SERVICE_FAILURE_MESSAGE } from '../util/askErrors';
import { encodeSseEvent } from '../util/sse';
import { createSseAskService } from './sseAskService';

interface FetchCall {
  url: string;
  init: RequestInit | undefined;
}

function sseResponse(body: string): Response {
  return new Response(body, { status: 200, headers: { 'content-type': 'text/event-stream' } });
}

function fakeFetch(respond: () => Promise<Response>): { fetch: typeof fetch; calls: FetchCall[] } {
  const calls: FetchCall[] = [];
  const fetchImpl: typeof fetch = (input, init) => {
    calls.push({ url: input instanceof Request ? input.url : input.toString(), init });
    return respond();
  };

  return { fetch: fetchImpl, calls };
}

async function collect(events: AsyncIterable<AskEvent>): Promise<AskEvent[]> {
  const collected: AskEvent[] = [];
  for await (const event of events) collected.push(event);

  return collected;
}

describe('createSseAskService', () => {
  it('posts the question with the signal to the endpoint', async () => {
    const { fetch, calls } = fakeFetch(() =>
      Promise.resolve(sseResponse(encodeSseEvent({ type: 'done' }))),
    );
    const signal = new AbortController().signal;

    await collect(createSseAskService({ fetch, endpoint: '/api/ask' }).ask('Hola', signal));

    expect(calls).toEqual([
      {
        url: '/api/ask',
        init: expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ question: 'Hola' }),
          signal,
        }) as unknown,
      },
    ]);
  });

  it('gives the events the server streams', async () => {
    const events: AskEvent[] = [
      { type: 'focus_nodes', nodeIds: ['hp'] },
      { type: 'token', text: 'Sí.' },
      { type: 'done' },
    ];
    const { fetch } = fakeFetch(() =>
      Promise.resolve(sseResponse(events.map(encodeSseEvent).join(''))),
    );

    expect(await collect(createSseAskService({ fetch }).ask('Hola'))).toEqual(events);
  });

  it('is unavailable when the server answers without a stream', async () => {
    const { fetch } = fakeFetch(() => Promise.resolve(new Response(null, { status: 503 })));

    await expect(collect(createSseAskService({ fetch }).ask('Hola'))).rejects.toBeInstanceOf(
      AskUnavailableError,
    );
  });

  it('is unavailable when the network fails', async () => {
    const { fetch } = fakeFetch(() => Promise.reject(new TypeError('Failed to fetch')));

    await expect(collect(createSseAskService({ fetch }).ask('Hola'))).rejects.toBeInstanceOf(
      AskUnavailableError,
    );
  });

  it('passes on a cancelled request as it is', async () => {
    const abort = new DOMException('The operation was aborted.', 'AbortError');
    const { fetch } = fakeFetch(() => Promise.reject(abort));

    await expect(collect(createSseAskService({ fetch }).ask('Hola'))).rejects.toBe(abort);
  });

  it('ends with an error when the server sends something that is not an event', async () => {
    const { fetch } = fakeFetch(() =>
      Promise.resolve(
        sseResponse(`${encodeSseEvent({ type: 'token', text: 'Sí.' })}data: {"type":"nope"}\n\n`),
      ),
    );

    expect(await collect(createSseAskService({ fetch }).ask('Hola'))).toEqual([
      { type: 'token', text: 'Sí.' },
      { type: 'error', message: SERVICE_FAILURE_MESSAGE },
    ]);
  });
});
