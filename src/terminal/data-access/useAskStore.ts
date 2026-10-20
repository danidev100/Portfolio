import { useStore } from 'zustand';

import { isScriptedQuestion } from '../util/askAnswers';
import { createAskStore, type AskStore } from './askStore';
import { createFallbackAskService, OFFLINE_NOTICE } from './fallbackAskService';
import { createSimulatedAskService } from './simulatedAskService';
import { createSseAskService } from './sseAskService';

/**
 * Claude answers through `/api/ask`. The suggested questions, and any question
 * asked while Claude is unavailable, get the local answers of V1.
 */
export const askStore = createAskStore(
  createFallbackAskService({
    primary: createSseAskService(),
    fallback: createSimulatedAskService(),
    isLocalQuestion: isScriptedQuestion,
    offlineNotice: OFFLINE_NOTICE,
  }),
);

export function useAskStore<Selected>(selector: (state: AskStore) => Selected): Selected {
  return useStore(askStore, selector);
}
