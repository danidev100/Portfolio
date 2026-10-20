import { createRateLimiter } from './rateLimiter';

const TEN_MINUTES_MS = 600_000;
const START = Date.UTC(2026, 9, 20, 12, 0, 0);

function buildLimiter(dailyLimit = 40): {
  tryConsume(clientId: string): boolean;
  at: (ms: number) => void;
} {
  let currentTime = START;
  const limiter = createRateLimiter({
    perClient: { limit: 10, windowMs: TEN_MINUTES_MS },
    dailyLimit,
    now: () => currentTime,
  });

  return {
    tryConsume: (clientId) => limiter.tryConsume(clientId),
    at: (ms) => {
      currentTime = ms;
    },
  };
}

function consume(
  limiter: { tryConsume(clientId: string): boolean },
  clientId: string,
  times: number,
): boolean[] {
  return Array.from({ length: times }, () => limiter.tryConsume(clientId));
}

describe('createRateLimiter', () => {
  it('lets a visitor ask 10 questions in 10 minutes and not an 11th', () => {
    const limiter = buildLimiter();

    expect(consume(limiter, '1.1.1.1', 10).every(Boolean)).toBe(true);
    expect(limiter.tryConsume('1.1.1.1')).toBe(false);
  });

  it('lets the visitor ask again once the window has passed', () => {
    const limiter = buildLimiter();
    consume(limiter, '1.1.1.1', 10);

    limiter.at(START + TEN_MINUTES_MS + 1);

    expect(limiter.tryConsume('1.1.1.1')).toBe(true);
  });

  it('does not limit a visitor for what another one asked', () => {
    const limiter = buildLimiter();
    consume(limiter, '1.1.1.1', 10);

    expect(limiter.tryConsume('2.2.2.2')).toBe(true);
  });

  it('stops everyone at the daily limit and starts again after midnight UTC', () => {
    const limiter = buildLimiter(3);
    consume(limiter, '1.1.1.1', 2);
    consume(limiter, '2.2.2.2', 1);

    expect(limiter.tryConsume('3.3.3.3')).toBe(false);

    limiter.at(Date.UTC(2026, 9, 21, 0, 0, 1));
    expect(limiter.tryConsume('3.3.3.3')).toBe(true);
  });

  it('does not spend the daily budget on questions it refuses', () => {
    const limiter = buildLimiter(11);
    consume(limiter, '1.1.1.1', 12);

    expect(limiter.tryConsume('2.2.2.2')).toBe(true);
  });
});
