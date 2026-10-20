import type { AskEvent, AskService } from '@/shared/types/ask';

import { AskUnavailableError } from '../util/askErrors';
import { createFallbackAskService } from './fallbackAskService';

const NOTICE = '(Modo sin conexión) ';
const LOCAL_QUESTION = '¿Has liderado equipos?';

const LOCAL_EVENTS: AskEvent[] = [
  { type: 'focus_nodes', nodeIds: ['aws'] },
  { type: 'token', text: 'Encontré relación con: AWS.' },
  { type: 'done' },
];

interface RecordingService extends AskService {
  questions: string[];
}

/** Answers `events`, then throws `failure` if given, and records what it was asked. */
function recordingService(events: readonly AskEvent[], failure?: Error): RecordingService {
  const questions: string[] = [];

  return {
    questions,
    async *ask(question) {
      questions.push(question);
      await Promise.resolve();
      yield* events;
      if (failure) throw failure;
    },
  };
}

function build(
  primary: AskService,
  fallback: AskService = recordingService(LOCAL_EVENTS),
): AskService {
  return createFallbackAskService({
    primary,
    fallback,
    isLocalQuestion: (question) => question === LOCAL_QUESTION,
    offlineNotice: NOTICE,
  });
}

async function collect(events: AsyncIterable<AskEvent>): Promise<AskEvent[]> {
  const collected: AskEvent[] = [];
  for await (const event of events) collected.push(event);

  return collected;
}

describe('createFallbackAskService', () => {
  it('answers a suggested question locally, without asking the AI', async () => {
    const primary = recordingService([{ type: 'done' }]);

    const events = await collect(build(primary).ask(LOCAL_QUESTION));

    expect(primary.questions).toEqual([]);
    expect(events).toEqual(LOCAL_EVENTS);
  });

  it('gives the answer of the AI when it is available', async () => {
    const answer: AskEvent[] = [{ type: 'token', text: 'Sí.' }, { type: 'done' }];

    expect(await collect(build(recordingService(answer)).ask('¿Qué sabes de AWS?'))).toEqual(
      answer,
    );
  });

  it('answers locally, marked as offline, when the AI is unavailable', async () => {
    const primary = recordingService([], new AskUnavailableError());

    const events = await collect(build(primary).ask('¿Qué sabes de AWS?'));

    expect(events).toEqual([
      { type: 'focus_nodes', nodeIds: ['aws'] },
      { type: 'token', text: NOTICE },
      { type: 'token', text: 'Encontré relación con: AWS.' },
      { type: 'done' },
    ]);
  });

  it('does not mix in a local answer once the AI has started answering', async () => {
    const failure = new Error('connection reset');
    const fallback = recordingService(LOCAL_EVENTS);
    const received: AskEvent[] = [];

    const answering = (async () => {
      for await (const event of build(
        recordingService([{ type: 'token', text: 'Sí.' }], failure),
        fallback,
      ).ask('¿Qué sabes de AWS?')) {
        received.push(event);
      }
    })();

    await expect(answering).rejects.toBe(failure);
    expect(received).toEqual([{ type: 'token', text: 'Sí.' }]);
    expect(fallback.questions).toEqual([]);
  });

  it('keeps the answer of the AI even if it then says it is unavailable', async () => {
    const primary = recordingService([{ type: 'token', text: 'Sí.' }], new AskUnavailableError());
    const fallback = recordingService(LOCAL_EVENTS);

    await expect(
      collect(build(primary, fallback).ask('¿Qué sabes de AWS?')),
    ).rejects.toBeInstanceOf(AskUnavailableError);
    expect(fallback.questions).toEqual([]);
  });

  it('passes on any other failure of the AI instead of hiding it', async () => {
    const failure = new DOMException('The operation was aborted.', 'AbortError');

    await expect(
      collect(build(recordingService([], failure)).ask('¿Qué sabes de AWS?')),
    ).rejects.toBe(failure);
  });
});
