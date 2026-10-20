import type {
  BetaMessageStreamParams,
  BetaRawMessageStreamEvent,
} from '@anthropic-ai/sdk/resources/beta/messages/messages';

import type { AskEvent, AskService } from '@/shared/types/ask';

import { SYSTEM_PROMPT } from '../util/askPrompt';
import { AskUnavailableError } from '../util/askErrors';
import { getCitedNodeIds, KNOWLEDGE_BLOCKS, KNOWLEDGE_TITLE } from '../util/knowledge';

/** The part of the Anthropic client this service uses, so tests can pass a plain object. */
export interface ClaudeStreamClient {
  beta: {
    messages: {
      stream: (
        params: BetaMessageStreamParams,
        options: { signal?: AbortSignal },
      ) => AsyncIterable<BetaRawMessageStreamEvent>;
    };
  };
}

export interface ClaudeAskServiceOptions {
  client: ClaudeStreamClient;
  model: string;
}

export const REFUSAL_MESSAGE =
  'No puedo responder a eso. Pregúntame por mi experiencia, mis proyectos o cómo trabajo.';

/** Room for a few short paragraphs; the prompt asks for two to four sentences. */
const MAX_ANSWER_TOKENS = 1024;

function buildParams(model: string, question: string): BetaMessageStreamParams {
  return {
    model,
    max_tokens: MAX_ANSWER_TOKENS,
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
            // The prompt and the CV are the same for every visitor: only the question changes.
            cache_control: { type: 'ephemeral' },
          },
          { type: 'text', text: question },
        ],
      },
    ],
  };
}

/** Turns Claude's stream into the events the terminal understands. */
async function* toAskEvents(
  stream: AsyncIterable<BetaRawMessageStreamEvent>,
): AsyncGenerator<AskEvent> {
  const focusedIds = new Set<string>();
  let hasText = false;

  for await (const event of stream) {
    if (event.type === 'message_delta') {
      if (event.delta.stop_reason === 'refusal' && !hasText) {
        yield { type: 'error', message: REFUSAL_MESSAGE };
      }
      continue;
    }
    if (event.type !== 'content_block_delta') continue;

    const { delta } = event;
    if (delta.type === 'text_delta') {
      hasText = true;
      yield { type: 'token', text: delta.text };
    } else if (
      delta.type === 'citations_delta' &&
      delta.citation.type === 'content_block_location'
    ) {
      const { start_block_index: start, end_block_index: end } = delta.citation;
      const newIds = getCitedNodeIds(start, end).filter((nodeId) => !focusedIds.has(nodeId));
      if (newIds.length === 0) continue;

      for (const nodeId of newIds) focusedIds.add(nodeId);
      yield { type: 'focus_nodes', nodeIds: [...focusedIds] };
    }
  }

  yield { type: 'done' };
}

/**
 * Answers from Claude, grounded on the CV. A failure before the first event
 * is an `AskUnavailableError`, so the caller can still answer some other way.
 */
export function createClaudeAskService({ client, model }: ClaudeAskServiceOptions): AskService {
  return {
    async *ask(question, signal) {
      let hasAnswered = false;

      try {
        const stream = client.beta.messages.stream(buildParams(model, question), { signal });
        for await (const event of toAskEvents(stream)) {
          hasAnswered = true;
          yield event;
        }
      } catch (error) {
        if (hasAnswered || signal?.aborted) throw error;

        throw new AskUnavailableError({ cause: error });
      }
    },
  };
}
