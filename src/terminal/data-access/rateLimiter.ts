export interface RateLimiterOptions {
  perClient: { limit: number; windowMs: number };
  /** A soft cap on the whole site per UTC day; the hard cap is Claude Console's. */
  dailyLimit: number;
  now?: () => number;
}

export interface RateLimiter {
  /** Counts the question and says whether it may go ahead. */
  tryConsume(clientId: string): boolean;
}

const toUtcDay = (milliseconds: number): string =>
  new Date(milliseconds).toISOString().slice(0, 10);

/**
 * Kept in memory: Render runs a single instance, so the count is exact, and it
 * starting over after a restart is fine while Console caps the spend.
 */
export function createRateLimiter({
  perClient,
  dailyLimit,
  now = Date.now,
}: RateLimiterOptions): RateLimiter {
  const recentByClient = new Map<string, number[]>();
  let day = '';
  let dailyCount = 0;

  return {
    tryConsume(clientId) {
      const currentTime = now();
      const today = toUtcDay(currentTime);
      if (today !== day) {
        day = today;
        dailyCount = 0;
      }

      const windowStart = currentTime - perClient.windowMs;
      const recent = (recentByClient.get(clientId) ?? []).filter((time) => time > windowStart);
      if (recent.length >= perClient.limit || dailyCount >= dailyLimit) {
        recentByClient.set(clientId, recent);
        return false;
      }

      recentByClient.set(clientId, [...recent, currentTime]);
      dailyCount += 1;

      return true;
    },
  };
}
