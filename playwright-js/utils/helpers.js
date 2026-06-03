/** Generic test helpers (no page-specific logic). */

/**
 * @param {string} [prefix]
 * @returns {string}
 */
export function uniqueEmail(prefix = 'pw') {
  return `${prefix}-${Date.now()}@test.com`;
}

/**
 * @param {string} [prefix]
 * @returns {string}
 */
export function uniqueTitle(prefix = 'todo') {
  return `${prefix}-${Date.now()}`;
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {RegExp|string} url
 */
export async function waitForAppUrl(page, url) {
  await page.waitForURL(url, { timeout: 15_000 });
}
