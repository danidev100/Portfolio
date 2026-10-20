import 'server-only';

import Anthropic from '@anthropic-ai/sdk';

import { createAskHandler } from './data-access/askHandler';
import { createClaudeAskService } from './data-access/claudeAskService';
import { createRateLimiter } from './data-access/rateLimiter';
import { unavailableAskService } from './data-access/unavailableAskService';

const DEFAULT_MODEL = 'claude-sonnet-5-5';

/** Spreads the $5 a month instead of letting one visitor or one day spend it. */
const QUESTIONS_PER_VISITOR = 10;
const VISITOR_WINDOW_MS = 10 * 60 * 1000;
const QUESTIONS_PER_DAY = 40;

const apiKey = process.env.ANTHROPIC_API_KEY;

/** One service and one limiter per process: Render runs a single instance. */
export const POST: (request: Request) => Promise<Response> = createAskHandler({
  service: apiKey
    ? createClaudeAskService({
        client: new Anthropic({ apiKey }),
        model: process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL,
      })
    : unavailableAskService,
  limiter: createRateLimiter({
    perClient: { limit: QUESTIONS_PER_VISITOR, windowMs: VISITOR_WINDOW_MS },
    dailyLimit: QUESTIONS_PER_DAY,
  }),
});
