import { env } from '../config/env.js';

/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {{ name: string, email: string, password: string }} user
 */
export function registerUser(request, user) {
  return request.post(`${env.baseURL}/api/auth/register`, { data: user });
}

/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {{ email: string, password: string }} credentials
 */
export function loginUser(request, credentials) {
  return request.post(`${env.baseURL}/api/auth/login`, { data: credentials });
}

/**
 * Register the user if missing (201) or already present (409). Safe before UI login in CI.
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {{ name: string, email: string, password: string }} user
 */
export async function ensureUserRegistered(request, user) {
  const res = await registerUser(request, user);
  const status = res.status();
  if (status === 201 || status === 409) {
    return;
  }
  const body = await res.text();
  throw new Error(`ensureUserRegistered failed for ${user.email}: ${status} ${body}`);
}
