import { test as base, expect, type Locator, type Page } from '@playwright/test';

import { ONBOARDING_STORAGE_KEY } from '../src/desktop/data-access/onboardingStorage';

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
    await provide(page);
  },
});

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
