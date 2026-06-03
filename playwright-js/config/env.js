/**
 * Environment configuration for Playwright runs.
 * Override via env vars in CI or local shell.
 */

export const env = {
  baseURL: process.env.BASE_URL ?? 'http://localhost:3005',
  healthCheckPath: '/api/healthz',
  defaultTimeout: Number(process.env.PW_TIMEOUT ?? 15_000),
  isCI: Boolean(process.env.CI),
};
