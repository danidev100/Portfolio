import type { AskEvent, AskService } from '@/shared/types/ask';

import { AskUnavailableError } from '../util/askErrors';

export interface FallbackAskServiceOptions {
  primary: AskService;
  fallback: AskService;
  /** Questions the fallback always answers, such as the suggested ones. */
  isLocalQuestion: (question: string) => boolean;
  /** Starts a fallback answer that stands in for the primary, so it is not taken for it. */
  offlineNotice: string;
}

export const OFFLINE_NOTICE = '(Modo sin conexión) ';

/** The fallback's answer, with the notice once the graph knows what it is about. */
async function* withNotice(
  events: AsyncIterable<AskEvent>,
  notice: string,
): AsyncGenerator<AskEvent> {
  let hasNotice = false;

  for await (const event of events) {
    if (!hasNotice && event.type !== 'focus_nodes') {
      hasNotice = true;
      yield { type: 'token', text: notice };
    }
    yield event;
  }
}

/**
 * Asks the primary service and, only when it cannot answer anything at all,
 * answers with the fallback. Once the primary has started, it owns the answer.
 */
export function createFallbackAskService({
  primary,
  fallback,
  isLocalQuestion,
  offlineNotice,
}: FallbackAskServiceOptions): AskService {
  return {
    async *ask(question, signal) {
      if (isLocalQuestion(question)) {
        yield* fallback.ask(question, signal);
        return;
      }

      let hasAnswered = false;
      try {
        for await (const event of primary.ask(question, signal)) {
          hasAnswered = true;
          yield event;
        }
      } catch (error) {
        if (hasAnswered || !(error instanceof AskUnavailableError)) throw error;

        yield* withNotice(fallback.ask(question, signal), offlineNotice);
      }
    },
  };
}
