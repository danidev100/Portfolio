import type { AskService } from '@/shared/types/ask';

import { resolveAnswer } from '../util/askAnswers';
import { toTokens } from '../util/tokens';

export type Sleep = (milliseconds: number, signal?: AbortSignal) => Promise<void>;

export interface SimulatedAskServiceOptions {
  /** Replaceable so that tests do not wait for real. */
  sleep?: Sleep;
}

/** Time to first token and pace between tokens, close to those of a real model. */
export const THINKING_DELAY_MS = 500;
export const TOKEN_DELAY_MS = 35;

const wait: Sleep = (milliseconds, signal) =>
  new Promise((resolve, reject) => {
    const abort = (): void => {
      clearTimeout(timeoutId);
      reject(new DOMException('The question was cancelled.', 'AbortError'));
    };
    const timeoutId = setTimeout(() => {
      signal?.removeEventListener('abort', abort);
      resolve();
    }, milliseconds);

    signal?.addEventListener('abort', abort, { once: true });
  });

/**
 * Answers from a script with the latency and the event stream of a real
 * model, so the UI is built against the same contract V2 will serve over SSE.
 */
export function createSimulatedAskService({
  sleep = wait,
}: SimulatedAskServiceOptions = {}): AskService {
  const pause = async (milliseconds: number, signal?: AbortSignal): Promise<void> => {
    await sleep(milliseconds, signal);
    signal?.throwIfAborted();
  };

  return {
    async *ask(question, signal) {
      await pause(THINKING_DELAY_MS, signal);
      const answer = resolveAnswer(question);
      yield { type: 'focus_nodes', nodeIds: answer.nodeIds };

      for (const text of toTokens(answer.text)) {
        await pause(TOKEN_DELAY_MS, signal);
        yield { type: 'token', text };
      }

      yield { type: 'done' };
    },
  };
}
