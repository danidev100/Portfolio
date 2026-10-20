import type { AskService } from '@/shared/types/ask';

import { AskUnavailableError, SERVICE_FAILURE_MESSAGE } from '../util/askErrors';
import { isAskEvent } from '../util/isAskEvent';
import { readSseData } from '../util/sse';

export interface SseAskServiceOptions {
  endpoint?: string;
  fetch?: typeof fetch;
}

const DEFAULT_ENDPOINT = '/api/ask';

const isAbort = (error: unknown): boolean =>
  error instanceof DOMException && error.name === 'AbortError';

function parseEvent(data: string): unknown {
  try {
    return JSON.parse(data);
  } catch {
    // Not JSON is just another malformed event, rejected by the check below.
    return null;
  }
}

/**
 * Asks `/api/ask` and reads its stream. No stream at all is an
 * `AskUnavailableError`, so the terminal can still answer locally.
 */
export function createSseAskService({
  endpoint = DEFAULT_ENDPOINT,
  // Read at call time so tests and the browser can each provide their own.
  fetch: fetchImpl = (input, init) => globalThis.fetch(input, init),
}: SseAskServiceOptions = {}): AskService {
  return {
    async *ask(question, signal) {
      let response: Response;
      try {
        response = await fetchImpl(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ question }),
          signal,
        });
      } catch (error) {
        if (isAbort(error)) throw error;
        throw new AskUnavailableError({ cause: error });
      }
      if (!response.ok || !response.body) throw new AskUnavailableError();

      for await (const data of readSseData(response.body)) {
        const event = parseEvent(data);
        if (!isAskEvent(event)) {
          yield { type: 'error', message: SERVICE_FAILURE_MESSAGE };
          return;
        }
        yield event;
        if (event.type === 'done' || event.type === 'error') return;
      }

      // The stream ended without saying so: the connection dropped midway.
      yield { type: 'error', message: SERVICE_FAILURE_MESSAGE };
    },
  };
}
