/**
 * Contract between the terminal UI and whatever answers its questions. The
 * simulated service of V1 and the SSE client of V2 both speak it, so the UI
 * does not change between them.
 */
export type AskEvent =
  | { type: 'focus_nodes'; nodeIds: string[] }
  | { type: 'token'; text: string }
  | { type: 'done' }
  | { type: 'error'; message: string };

export interface AskService {
  ask(question: string, signal?: AbortSignal): AsyncIterable<AskEvent>;
}
