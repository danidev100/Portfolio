import type { AskEvent } from '@/shared/types/ask';

export type AskStatus = 'idle' | 'thinking' | 'streaming' | 'error';

export interface AskState {
  status: AskStatus;
  question: string | null;
  /** The answer so far, or the error message when `status` is `error`. */
  answer: string;
  focusNodeIds: readonly string[];
}

export const INITIAL_ASK_STATE: AskState = {
  status: 'idle',
  question: null,
  answer: '',
  focusNodeIds: [],
};

/** The focus stays where it was, so the graph does not jump back while waiting. */
export function startAsk(state: AskState, question: string): AskState {
  return { ...state, status: 'thinking', question, answer: '' };
}

export function applyAskEvent(state: AskState, event: AskEvent): AskState {
  switch (event.type) {
    case 'focus_nodes':
      return { ...state, focusNodeIds: event.nodeIds };
    case 'token':
      return { ...state, status: 'streaming', answer: state.answer + event.text };
    case 'done':
      return { ...state, status: 'idle' };
    case 'error':
      return { ...state, status: 'error', answer: event.message };
  }
}
