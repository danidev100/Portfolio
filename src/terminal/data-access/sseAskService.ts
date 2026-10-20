import type { AskService } from '@/shared/types/ask';

import { askEventSchema } from '../util/askEventSchema';
import { AskUnavailableError, SERVICE_FAILURE_MESSAGE } from '../util/askErrors';
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
    // Not JSON is just another malformed event, rejected by the schema below.
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
        const parsed = askEventSchema.safeParse(parseEvent(data));
        if (!parsed.success) {
          yield { type: 'error', message: SERVICE_FAILURE_MESSAGE };
          return;
        }
        yield parsed.data;
      }
    },
  };
}
