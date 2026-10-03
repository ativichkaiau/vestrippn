import { defineConfig, devices } from '@playwright/test';

/* End-to-end tests against a production build (`next build` first).
   Pages behind the sign-in gate are reached with a placeholder session
   cookie: the proxy only checks that one is present, and these tests run
   without a database, so they cover the shell and the static pages. */

const PORT = Number(process.env.E2E_PORT ?? 3100);

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    // Use a preinstalled Chromium when the environment provides one.
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } }, testIgnore: /phone\.spec\.ts/ },
    { name: 'phone', use: { ...devices['Pixel 7'] }, testMatch: /phone\.spec\.ts/ },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/legal`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
