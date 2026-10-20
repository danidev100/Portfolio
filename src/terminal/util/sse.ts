import type { AskEvent } from '@/shared/types/ask';

const EVENT_SEPARATOR = '\n\n';
const DATA_PREFIX = 'data:';

/** One server-sent event per `AskEvent`. JSON escapes line breaks, so it is one line. */
export function encodeSseEvent(event: AskEvent): string {
  return `${DATA_PREFIX} ${JSON.stringify(event)}${EVENT_SEPARATOR}`;
}

function toData(rawEvent: string): string[] {
  return rawEvent
    .split('\n')
    .filter((line) => line.startsWith(DATA_PREFIX))
    .map((line) => line.slice(DATA_PREFIX.length).trimStart());
}

/** The data of each complete event in the stream, however the network splits it. */
export async function* readSseData(stream: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    for (;;) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });

      const rawEvents = buffer.split(EVENT_SEPARATOR);
      buffer = rawEvents.pop() ?? '';
      for (const rawEvent of rawEvents) yield* toData(rawEvent);

      if (done) break;
    }
    yield* toData(buffer);
  } finally {
    reader.releaseLock();
  }
}
