// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  // Run tests in parallel
  fullyParallel: true,

  // Fail CI if test.only is left accidentally
  forbidOnly: !!process.env.CI,

  // Retry only on CI
  retries: process.env.CI ? 2 : 0,

  // Use 1 worker on CI for stability
  workers: process.env.CI ? 1 : undefined,

  // Reporters
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],

  // Shared settings
  use: {
    baseURL: 'http://localhost:3005',

    headless: true,

    // Capture trace only on retry
    trace: 'on-first-retry',

    // Capture screenshot on failure
    screenshot: 'only-on-failure',

    // Capture video on failure
    video: 'retain-on-failure'
  },

  // Browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
    ],

  // Optional: Start your local dev server before tests
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3005',
  //   reuseExistingServer: !process.env.CI
  // }
});
