import { test as base, expect, type Locator, type Page } from '@playwright/test';

import { ONBOARDING_STORAGE_KEY } from '../src/desktop/data-access/onboardingStorage';
import type { AskEvent } from '../src/shared/types/ask';
import { encodeSseEvent } from '../src/terminal/util/sse';

const ASK_ROUTE = '**/api/ask';
const SERVICE_UNAVAILABLE = 503;

interface SupportOptions {
  /**
   * Starts the visit as if the onboarding tour had been seen, so it does not
   * get in the way of tests about something else. Tour tests set it to false.
   */
  hasSeenTour: boolean;
}

export const test = base.extend<SupportOptions>({
  hasSeenTour: [true, { option: true }],
  page: async ({ page, hasSeenTour }, provide) => {
    if (hasSeenTour) {
      await page.addInitScript((key) => {
        window.localStorage.setItem(key, 'seen');
      }, ONBOARDING_STORAGE_KEY);
    }
    // Tests never reach Claude: they would spend money and depend on its answers.
    // By default the AI is unavailable, so the terminal answers locally.
    await page.route(ASK_ROUTE, (route) => route.fulfill({ status: SERVICE_UNAVAILABLE }));
    await provide(page);
  },
});

/** Makes the AI answer the next questions with `events`, streamed as Claude would. */
export async function answerWithStream(page: Page, events: readonly AskEvent[]): Promise<void> {
  await page.unroute(ASK_ROUTE);
  await page.route(ASK_ROUTE, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: events.map(encodeSseEvent).join(''),
    }),
  );
}

export { expect };

/** A link in the dock. Scoped, because the desktop greeting links to the same apps. */
export const dockLink = (page: Page, name: string): Locator =>
  page.getByRole('navigation', { name: 'Dock' }).getByRole('link', { name });

/**
 * Opens the desktop and waits until it is interactive. A click that lands
 * before hydration is a plain link navigation that the next client-side
 * navigation cancels, so the app it meant to open never shows up. The clock is
 * the marker: the server renders no time, because it cannot know the time zone.
 */
export async function openDesktop(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('time[datetime]')).toBeVisible();
}

/**
 * Opens the phone at `path` and waits until it is interactive, for the same
 * reason as `openDesktop`. The phone marks itself once it has hydrated.
 */
export async function openPhone(page: Page, path = '/'): Promise<void> {
  await page.goto(path);
  await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
}
