import { defineConfig, devices } from '@playwright/test';

const DEFAULT_PORT = '3000';
/** `PORT=3200 CI=1 pnpm e2e` checks the production build while a dev server keeps port 3000. */
const PORT = process.env.PORT ?? DEFAULT_PORT;
const BASE_URL = `http://localhost:${PORT}`;
const isCI = Boolean(process.env.CI);
/** Specs of the phone shell, which only a phone gets. */
const PHONE_SPECS = /phone.*\.spec\.ts/;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? 'github' : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, testIgnore: PHONE_SPECS },
    {
      // CI only installs Chromium: this checks the iPhone's user agent, screen
      // and touch, not WebKit itself.
      name: 'iphone',
      use: { ...devices['iPhone 15'], browserName: 'chromium' },
      testMatch: PHONE_SPECS,
    },
    { name: 'android', use: { ...devices['Pixel 7'] }, testMatch: PHONE_SPECS },
  ],
  webServer: {
    // Calls `next` directly: pnpm runs scripts in their own process group, so
    // Playwright cannot stop a `pnpm dev` server and hangs waiting for it.
    // CI runs against the production build so e2e covers what gets deployed.
    command: isCI ? `next build && next start --port ${PORT}` : `next dev --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !isCI,
  },
});
