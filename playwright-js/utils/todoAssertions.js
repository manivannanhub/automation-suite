import { expect } from '@playwright/test';

/**
 * @param {import('@playwright/test').APIResponse} response
 */
export async function expectTodoCreated(response) {
  expect(response.status()).toBe(201);
  const body = await response.json();
  expect(body).toMatchObject({
    id: expect.any(Number),
    title: expect.any(String),
    completed: false,
    createdAt: expect.any(String),
  });
  return body;
}

/**
 * @param {import('@playwright/test').APIResponse} response
 */
export async function expectTodoList(response) {
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(Array.isArray(body)).toBe(true);
  return body;
}

/**
 * @param {import('@playwright/test').APIResponse} response
 */
export async function expectTodoStats(response, expected) {
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body).toMatchObject({
    total: expected.total,
    completed: expected.completed,
    pending: expected.pending,
  });
  return body;
}

/**
 * @param {import('@playwright/test').APIResponse} response
 * @param {number[]} allowedStatuses
 */
export async function expectTodoError(response, allowedStatuses) {
  expect(allowedStatuses).toContain(response.status());
  const body = await response.json();
  expect(body).toMatchObject({ error: expect.any(String) });
  return body;
}
