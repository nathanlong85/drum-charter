import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
dotenv.config({ path: path.resolve(__dirname, '.env.test'), quiet: true });

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  timeout: 30 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    actionTimeout: 10 * 1000,
    navigationTimeout: 60000,
    ignoreHTTPSErrors: true,
  },
  projects: [
    // Setup project
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Use prepared auth state.
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command:
      'unset NO_COLOR && export NEXT_PUBLIC_FORCE_SW=true && pnpm build && pnpm start --port 3001',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI && process.env.RUN_OFFLINE_E2E !== 'true',
    timeout: 180000,
  },
});
