import type { AskService } from '@/shared/types/ask';

import { AskUnavailableError } from '../util/askErrors';

/** Stands in for Claude when there is no API key: the terminal then answers locally. */
export const unavailableAskService: AskService = {
  ask: () => ({
    [Symbol.asyncIterator]: () => ({
      next: () => Promise.reject(new AskUnavailableError()),
    }),
  }),
};
