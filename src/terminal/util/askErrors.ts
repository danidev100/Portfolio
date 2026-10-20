/**
 * The AI did not answer anything, so whoever asked can still answer from
 * another source. Once a single event has been sent it no longer applies.
 */
export class AskUnavailableError extends Error {
  constructor(options?: ErrorOptions) {
    super('The AI is not available.', options);
    this.name = 'AskUnavailableError';
  }
}
