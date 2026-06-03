import { env } from '../config/env.js';

/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} email
 * @param {{ retries?: number }} [options]
 */
export async function deleteUserByEmail(request, email, { retries = 3 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await request.post(`${env.baseURL}/api/test/cleanup`, {
        data: { email },
      });
      if (res.ok() || res.status() === 404) {
        return;
      }
      lastError = new Error(`cleanup failed: ${res.status()}`);
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
      }
    }
  }
  throw lastError;
}

/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string[]} emails
 */
export async function deleteUsersByEmail(request, emails) {
  for (const email of [...emails]) {
    await deleteUserByEmail(request, email);
  }
}
