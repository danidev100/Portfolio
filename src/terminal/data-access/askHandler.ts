import { z } from 'zod';

import type { AskEvent, AskService } from '@/shared/types/ask';

import { SERVICE_FAILURE_MESSAGE } from '../util/askErrors';
import { encodeSseEvent } from '../util/sse';
import type { RateLimiter } from './rateLimiter';

export interface AskHandlerOptions {
  service: AskService;
  limiter: RateLimiter;
}

const MAX_QUESTION_LENGTH = 500;
const UNKNOWN_CLIENT = 'unknown';

const askRequestSchema = z.object({
  question: z.string().trim().min(1).max(MAX_QUESTION_LENGTH),
});

const SSE_HEADERS = {
  'content-type': 'text/event-stream',
  'cache-control': 'no-cache, no-transform',
  // Keeps proxies from buffering the stream until it ends.
  'x-accel-buffering': 'no',
};

/** Render's proxy puts the visitor first in `x-forwarded-for`. */
function getClientId(request: Request): string {
  const [firstAddress] = (request.headers.get('x-forwarded-for') ?? '').split(',');

  return firstAddress?.trim() || UNKNOWN_CLIENT;
}

async function readQuestion(request: Request): Promise<string | null> {
  try {
    const parsed = askRequestSchema.safeParse(await request.json());

    return parsed.success ? parsed.data.question : null;
  } catch {
    // A body that is not JSON is the visitor's mistake, answered with a 400.
    return null;
  }
}

function toSseStream(
  firstEvent: AskEvent,
  events: AsyncIterator<AskEvent>,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const send = (controller: ReadableStreamDefaultController<Uint8Array>, event: AskEvent): void => {
    controller.enqueue(encoder.encode(encodeSseEvent(event)));
  };

  return new ReadableStream({
    async start(controller) {
      send(controller, firstEvent);
      try {
        for (let next = await events.next(); !next.done; next = await events.next()) {
          send(controller, next.value);
        }
      } catch (error) {
        console.error('The answer failed while streaming', error);
        send(controller, { type: 'error', message: SERVICE_FAILURE_MESSAGE });
      }
      controller.close();
    },
    async cancel() {
      await events.return?.();
    },
  });
}

/**
 * `POST /api/ask`: checks the question and the limits, then streams the
 * answer. Nothing streamed means no answer: the client then answers locally.
 */
export function createAskHandler({
  service,
  limiter,
}: AskHandlerOptions): (request: Request) => Promise<Response> {
  return async (request) => {
    const question = await readQuestion(request);
    if (question === null) return new Response(null, { status: 400 });
    if (!limiter.tryConsume(getClientId(request))) return new Response(null, { status: 429 });

    const events = service.ask(question, request.signal)[Symbol.asyncIterator]();
    let first: IteratorResult<AskEvent>;
    try {
      first = await events.next();
    } catch (error) {
      console.error('The AI could not answer', error);
      return new Response(null, { status: 503 });
    }
    if (first.done) return new Response(null, { status: 503 });

    return new Response(toSseStream(first.value, events), { status: 200, headers: SSE_HEADERS });
  };
}
