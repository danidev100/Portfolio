import { defineConfig, devices } from '@playwright/test';

const PORT = 3000;
const BASE_URL = `http://localhost:${String(PORT)}`;
const isCI = Boolean(process.env.CI);

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
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // Calls `next` directly: pnpm runs scripts in their own process group, so
    // Playwright cannot stop a `pnpm dev` server and hangs waiting for it.
    // CI runs against the production build so e2e covers what gets deployed.
    command: isCI ? 'next build && next start' : 'next dev',
    url: BASE_URL,
    reuseExistingServer: !isCI,
  },
});
