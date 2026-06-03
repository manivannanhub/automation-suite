import { expect } from '@playwright/test';
import { MESSAGES } from './constants.js';

/**
 * @param {import('@playwright/test').APIResponse} response
 * @param {'login' | 'register'} flow
 */
export async function expectAuthSuccessBody(response, flow) {
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  const expectedMessage =
    flow === 'login' ? MESSAGES.api.loginSuccess : MESSAGES.api.registerSuccess;

  expect(body).toMatchObject({
    user: {
      id: expect.any(Number),
      name: expect.any(String),
      email: expect.any(String),
    },
    message: expectedMessage,
  });
  expect(body.user).not.toHaveProperty('password');
  return body;
}

/**
 * @param {import('@playwright/test').APIResponse} response
 * @param {number[]} allowedStatuses
 */
export async function expectErrorBody(response, allowedStatuses) {
  expect(allowedStatuses).toContain(response.status());
  const body = await response.json();
  expect(body).toMatchObject({
    error: expect.any(String),
  });
  expect(body.error.length).toBeGreaterThan(0);
  return body;
}
