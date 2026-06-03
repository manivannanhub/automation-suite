// @ts-check
import { defineConfig, devices } from '@playwright/test';
import { env } from './config/env.js';

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,
  forbidOnly: env.isCI,
  retries: env.isCI ? 2 : 0,
  workers: env.isCI ? 1 : undefined,
  timeout: env.defaultTimeout,

  outputDir: 'reports/test-results',

  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
  ],

  use: {
    baseURL: env.baseURL,
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Uncomment when you want Playwright to start the app automatically:
  // webServer: {
  //   command: 'npm start',
  //   cwd: '../command-center',
  //   url: `${env.baseURL}${env.healthCheckPath}`,
  //   reuseExistingServer: !env.isCI,
  //   timeout: 120_000,
  // },
});
