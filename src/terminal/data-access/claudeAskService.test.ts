/** @jest-environment node */
import type {
  BetaMessageStreamParams,
  BetaRawMessageStreamEvent,
  BetaStopReason,
} from '@anthropic-ai/sdk/resources/beta/messages/messages';

import type { AskEvent } from '@/shared/types/ask';

import { SYSTEM_PROMPT } from '../util/askPrompt';
import { AskUnavailableError } from '../util/askErrors';
import { getCitedNodeIds, KNOWLEDGE_BLOCKS, KNOWLEDGE_TITLE } from '../util/knowledge';
import {
  createClaudeAskService,
  REFUSAL_MESSAGE,
  type ClaudeStreamClient,
} from './claudeAskService';

const MODEL = 'claude-sonnet-5-5';
const QUESTION = '¿Has liderado equipos?';

const textDelta = (text: string): BetaRawMessageStreamEvent => ({
  type: 'content_block_delta',
  index: 0,
  delta: { type: 'text_delta', text },
});

const citation = (startBlockIndex: number, endBlockIndex: number): BetaRawMessageStreamEvent => ({
  type: 'content_block_delta',
  index: 0,
  delta: {
    type: 'citations_delta',
    citation: {
      type: 'content_block_location',
      cited_text: '',
      document_index: 0,
      document_title: KNOWLEDGE_TITLE,
      file_id: null,
      start_block_index: startBlockIndex,
      end_block_index: endBlockIndex,
    },
  },
});

const messageDelta = (stopReason: BetaStopReason): BetaRawMessageStreamEvent => ({
  type: 'message_delta',
  context_management: null,
  delta: { container: null, stop_details: null, stop_reason: stopReason, stop_sequence: null },
  usage: {
    cache_creation_input_tokens: null,
    cache_read_input_tokens: null,
    fallback_credit: null,
    input_tokens: null,
    iterations: null,
    output_tokens: 0,
    output_tokens_details: null,
    server_tool_use: null,
  },
});

interface StreamCall {
  params: BetaMessageStreamParams;
  signal: AbortSignal | undefined;
}

/** A client whose stream replays `events`, then throws `failure` if given. */
function fakeClient(
  events: readonly BetaRawMessageStreamEvent[],
  failure?: Error,
): { client: ClaudeStreamClient; calls: StreamCall[] } {
  const calls: StreamCall[] = [];
  const client: ClaudeStreamClient = {
    beta: {
      messages: {
        stream: (params, options) => {
          calls.push({ params, signal: options.signal });

          return (async function* replay() {
            await Promise.resolve();
            yield* events;
            if (failure) throw failure;
          })();
        },
      },
    },
  };

  return { client, calls };
}

async function collect(events: AsyncIterable<AskEvent>): Promise<AskEvent[]> {
  const collected: AskEvent[] = [];
  for await (const event of events) collected.push(event);

  return collected;
}

describe('createClaudeAskService', () => {
  it('asks the model with the prompt, the cached cited document and then the question', async () => {
    const { client, calls } = fakeClient([]);
    const signal = new AbortController().signal;

    await collect(createClaudeAskService({ client, model: MODEL }).ask(QUESTION, signal));

    const [call] = calls;
    expect(call?.signal).toBe(signal);
    expect(call?.params).toMatchObject({
      model: MODEL,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low' },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'content',
                content: KNOWLEDGE_BLOCKS.map(({ text }) => ({ type: 'text', text })),
              },
              title: KNOWLEDGE_TITLE,
              citations: { enabled: true },
              cache_control: { type: 'ephemeral' },
            },
            { type: 'text', text: QUESTION },
          ],
        },
      ],
    });
  });

  it('streams the text as tokens and then says it is done', async () => {
    const { client } = fakeClient([textDelta('Sí. '), textDelta('Lideré a 7.')]);

    const events = await collect(createClaudeAskService({ client, model: MODEL }).ask(QUESTION));

    expect(events).toEqual([
      { type: 'token', text: 'Sí. ' },
      { type: 'token', text: 'Lideré a 7.' },
      { type: 'done' },
    ]);
  });

  it('focuses the nodes of each new citation, once', async () => {
    const { client } = fakeClient([citation(2, 4), textDelta('Sí.'), citation(2, 3)]);

    const events = await collect(createClaudeAskService({ client, model: MODEL }).ask(QUESTION));

    expect(events).toEqual([
      { type: 'focus_nodes', nodeIds: getCitedNodeIds(2, 4) },
      { type: 'token', text: 'Sí.' },
      { type: 'done' },
    ]);
  });

  it('adds the nodes of a later citation to the focus', async () => {
    const { client } = fakeClient([citation(2, 3), citation(8, 9)]);

    const events = await collect(createClaudeAskService({ client, model: MODEL }).ask(QUESTION));

    expect(events[1]).toEqual({
      type: 'focus_nodes',
      nodeIds: [...new Set([...getCitedNodeIds(2, 3), ...getCitedNodeIds(8, 9)])],
    });
  });

  it('says it cannot answer when the model refuses without writing anything', async () => {
    const { client } = fakeClient([messageDelta('refusal')]);

    const events = await collect(createClaudeAskService({ client, model: MODEL }).ask(QUESTION));

    expect(events).toEqual([{ type: 'error', message: REFUSAL_MESSAGE }, { type: 'done' }]);
  });

  it('is unavailable when the model fails before answering anything', async () => {
    const { client } = fakeClient([], new Error('401 invalid x-api-key'));

    await expect(
      collect(createClaudeAskService({ client, model: MODEL }).ask(QUESTION)),
    ).rejects.toBeInstanceOf(AskUnavailableError);
  });

  it('keeps what it streamed and passes on a failure after the first token', async () => {
    const failure = new Error('connection reset');
    const { client } = fakeClient([textDelta('Sí.')], failure);
    const received: AskEvent[] = [];

    const answering = (async () => {
      for await (const event of createClaudeAskService({ client, model: MODEL }).ask(QUESTION)) {
        received.push(event);
      }
    })();

    await expect(answering).rejects.toBe(failure);
    expect(received).toEqual([{ type: 'token', text: 'Sí.' }]);
  });
});
