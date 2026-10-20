export interface RateLimiterOptions {
  /** `dailyLimit` keeps one visitor from spending the whole site's day. */
  perClient: { limit: number; windowMs: number; dailyLimit: number };
  /** A soft cap on the whole site per UTC day; the hard cap is Claude Console's. */
  dailyLimit: number;
  now?: () => number;
}

export interface RateLimiter {
  /** Counts the question and says whether it may go ahead. */
  tryConsume(clientId: string): boolean;
}

/** Past this many visitors, the expired ones are swept so memory stays bounded. */
const MAX_TRACKED_CLIENTS = 1000;

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
  const dailyCountByClient = new Map<string, number>();
  let day = '';
  let dailyCount = 0;

  /** Visitors who asked nothing in the window no longer need remembering. */
  const forgetExpired = (windowStart: number): void => {
    for (const [clientId, times] of recentByClient) {
      if (times.every((time) => time <= windowStart)) recentByClient.delete(clientId);
    }
  };

  return {
    tryConsume(clientId) {
      const currentTime = now();
      const today = toUtcDay(currentTime);
      if (today !== day) {
        day = today;
        dailyCount = 0;
        dailyCountByClient.clear();
      }

      const clientDailyCount = dailyCountByClient.get(clientId) ?? 0;
      if (dailyCount >= dailyLimit || clientDailyCount >= perClient.dailyLimit) return false;

      const windowStart = currentTime - perClient.windowMs;
      if (recentByClient.size > MAX_TRACKED_CLIENTS) forgetExpired(windowStart);

      const recent = (recentByClient.get(clientId) ?? []).filter((time) => time > windowStart);
      if (recent.length >= perClient.limit) {
        recentByClient.set(clientId, recent);
        return false;
      }

      recentByClient.set(clientId, [...recent, currentTime]);
      dailyCountByClient.set(clientId, clientDailyCount + 1);
      dailyCount += 1;

      return true;
    },
  };
}
