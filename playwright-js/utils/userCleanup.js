import { env } from '../config/env.js';

/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} email
 */
export async function deleteUserByEmail(request, email) {
  await request.post(`${env.baseURL}/api/test/cleanup`, {
    data: { email },
  });
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
