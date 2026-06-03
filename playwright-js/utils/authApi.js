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
