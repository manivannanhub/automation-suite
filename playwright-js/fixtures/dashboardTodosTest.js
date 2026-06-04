/**
 * Dashboard + Todos suite fixture — evidence on failure and CI retries.
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
    if (url.includes('/api/') || url.includes('/dashboard') || url.includes('/todos')) {
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
    // Page may already be closed.
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

/** Call at top of dashboard.spec.js and todos.spec.js */
export function configureDashboardTodosSuite() {
  test.setTimeout(60_000);
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
