/**
 * Register suite fixture — extends baseTest with evidence hooks.
 * - Screenshot, console log, and network log on failure
 * - CI retries (also configured in playwright.config.js)
 */

import { test as base, expect } from './baseTest.js';

export const test = base;

/** @type {WeakMap<import('@playwright/test').Page, { console: string[], network: string[] }>} */
const evidenceByPage = new WeakMap();

function installEvidenceCollectors(page) {
  const logs = { console: [], network: [] };
  evidenceByPage.set(page, logs);

  page.on('console', (msg) => {
    logs.console.push(`[${msg.type()}] ${msg.text()}`);
  });

  page.on('response', (response) => {
    const url = response.url();
    if (url.includes('/api/') || url.includes('/register') || url.includes('/dashboard')) {
      logs.network.push(
        `${response.request().method()} ${url} → ${response.status()}`,
      );
    }
  });
}

async function attachFailureEvidence(page, testInfo) {
  try {
    const screenshot = await page.screenshot({ fullPage: true });
    await testInfo.attach('failure-screenshot', {
      body: screenshot,
      contentType: 'image/png',
    });
  } catch {
    // Page may already be closed after a hard failure.
  }

  const logs = evidenceByPage.get(page);
  if (!logs) return;

  if (logs.console.length > 0) {
    await testInfo.attach('console-log', {
      body: logs.console.join('\n'),
      contentType: 'text/plain',
    });
  }

  if (logs.network.length > 0) {
    await testInfo.attach('network-log', {
      body: logs.network.join('\n'),
      contentType: 'text/plain',
    });
  }
}

/** Call at top of register.spec.js */
export function configureRegisterSuite() {
  test.describe.configure({ retries: process.env.CI ? 2 : 0 });

  test.beforeEach(async ({ page }) => {
    installEvidenceCollectors(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await attachFailureEvidence(page, testInfo);
    }
  });
}

export { expect };
