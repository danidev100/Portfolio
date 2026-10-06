import type { Locator, Page } from '@playwright/test';

/** A link in the dock. Scoped, because the desktop greeting links to the same apps. */
export const dockLink = (page: Page, name: string): Locator =>
  page.getByRole('navigation', { name: 'Dock' }).getByRole('link', { name });
