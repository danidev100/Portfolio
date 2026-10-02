/**
 * What a route change means for the window stack:
 * - `external`: the app did not ask for it (back button, typed URL).
 * - `superseded`: the app asked for it, and has asked for another route since.
 * - `final`: the last navigation the app asked for has landed.
 */
export type Landing = 'external' | 'superseded' | 'final';

export interface LandingResult {
  landing: Landing;
  /** Navigations still on their way after this one landed. */
  outstanding: readonly string[];
}

/**
 * Classifies the route that just landed against the navigations the app has
 * asked for, oldest first. Navigations land in order, and one that a later one
 * cancelled never lands, so everything before the landed route is dropped.
 */
export function settleLanding(outstanding: readonly string[], pathname: string): LandingResult {
  const landedAt = outstanding.indexOf(pathname);
  if (landedAt === -1) return { landing: 'external', outstanding: [] };

  const afterLanded = outstanding.slice(landedAt + 1);
  const firstOtherRoute = afterLanded.findIndex((href) => href !== pathname);
  const stillOutstanding = firstOtherRoute === -1 ? [] : afterLanded.slice(firstOtherRoute);

  return {
    landing: stillOutstanding.length > 0 ? 'superseded' : 'final',
    outstanding: stillOutstanding,
  };
}
