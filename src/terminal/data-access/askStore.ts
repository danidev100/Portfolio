import { createStore, type StoreApi } from 'zustand';

import type { AskService } from '@/shared/types/ask';

import { describeNode } from '../util/askAnswers';
import { applyAskEvent, INITIAL_ASK_STATE, startAsk, type AskState } from '../util/askState';

export interface AskStore extends AskState {
  ask: (question: string) => Promise<void>;
  /** Focuses a node picked by hand, with the nodes it connects to. */
  selectNode: (nodeId: string) => void;
  reset: () => void;
  /** The visitor has asked or picked something at least once in this visit. */
  hasInteracted: boolean;
  /** The welcome message has been typed once in this visit. */
  hasWelcomed: boolean;
  markWelcomed: () => void;
}

const SERVICE_FAILURE_MESSAGE = 'No pude responder a esa pregunta. Inténtalo de nuevo.';

/**
 * Holds the conversation outside of the window, so it survives the window
 * being minimized. The service is injected: V1 simulates it, V2 streams it.
 */
export function createAskStore(service: AskService): StoreApi<AskStore> {
  let currentRequest: AbortController | null = null;

  /** Only one question is live: asking or picking anything else cancels it. */
  const startRequest = (): AbortController => {
    currentRequest?.abort();
    currentRequest = new AbortController();

    return currentRequest;
  };

  return createStore<AskStore>()((set) => ({
    ...INITIAL_ASK_STATE,
    hasInteracted: false,
    hasWelcomed: false,

    ask: async (rawQuestion) => {
      const question = rawQuestion.trim();
      if (!question) return;

      const { signal } = startRequest();
      set((state) => ({ ...startAsk(state, question), hasInteracted: true }));

      try {
        for await (const event of service.ask(question, signal)) {
          if (signal.aborted) return;
          set((state) => applyAskEvent(state, event));
        }
      } catch (error) {
        // A cancelled request rejects too, and that is not a failure.
        if (signal.aborted) return;

        console.error('The ask service failed', error);
        set((state) => applyAskEvent(state, { type: 'error', message: SERVICE_FAILURE_MESSAGE }));
      }
    },

    selectNode: (nodeId) => {
      startRequest();
      const { nodeIds, text, question } = describeNode(nodeId);
      set({ status: 'idle', question, answer: text, focusNodeIds: nodeIds, hasInteracted: true });
    },

    markWelcomed: () => {
      set({ hasWelcomed: true });
    },

    reset: () => {
      startRequest();
      set(INITIAL_ASK_STATE);
    },
  }));
}
