/** @jest-environment node */
import { askEventSchema } from './askEventSchema';
import { encodeSseEvent, readSseData } from './sse';

function streamOf(chunks: readonly string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
}

async function collect(data: AsyncIterable<string>): Promise<string[]> {
  const collected: string[] = [];
  for await (const item of data) collected.push(item);

  return collected;
}

describe('encodeSseEvent', () => {
  it('writes an event as a single data line, even when its text has line breaks', () => {
    const encoded = encodeSseEvent({ type: 'token', text: 'a\nb' });

    expect(encoded).toBe('data: {"type":"token","text":"a\\nb"}\n\n');
  });
});

describe('readSseData', () => {
  it('rebuilds an event that arrives split across chunks', async () => {
    const data = await collect(readSseData(streamOf(['da', 'ta: {"type":"do', 'ne"}\n\n'])));

    expect(data).toEqual(['{"type":"done"}']);
  });

  it('reads two events from one chunk and skips blank lines and comments', async () => {
    const data = await collect(
      readSseData(streamOf([': keep-alive\n\ndata: {"type":"done"}\n\n\ndata: 2\n\n'])),
    );

    expect(data).toEqual(['{"type":"done"}', '2']);
  });
});

describe('askEventSchema', () => {
  it('accepts every kind of event', () => {
    const events = [
      { type: 'focus_nodes', nodeIds: ['hp'] },
      { type: 'token', text: 'Hola' },
      { type: 'done' },
      { type: 'error', message: 'Algo falló' },
    ];

    for (const event of events) expect(askEventSchema.safeParse(event).success).toBe(true);
  });

  it('rejects malformed events', () => {
    expect(askEventSchema.safeParse({ type: 'token' }).success).toBe(false);
    expect(askEventSchema.safeParse({ type: 'focus_nodes', nodeIds: [1] }).success).toBe(false);
    expect(askEventSchema.safeParse({ type: 'nope' }).success).toBe(false);
  });
});
