import { useStore } from 'zustand';

import { createAskStore, type AskStore } from './askStore';
import { createSimulatedAskService } from './simulatedAskService';

/** V2 swaps the simulated service for the SSE client here, and nowhere else. */
export const askStore = createAskStore(createSimulatedAskService());

export function useAskStore<Selected>(selector: (state: AskStore) => Selected): Selected {
  return useStore(askStore, selector);
}
