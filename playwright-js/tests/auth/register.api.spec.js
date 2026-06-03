/**
 * Register API — modernised from legacy register.spec.js API block
 */

import { test, expect } from '../../fixtures/baseTest.js';
import { registerUser, loginUser } from '../../utils/authApi.js';
import {
  expectAuthSuccessBody,
  expectErrorBody,
} from '../../utils/apiAssertions.js';
import { MESSAGES } from '../../utils/constants.js';
import { uniqueEmail } from '../../utils/helpers.js';
import { env } from '../../config/env.js';

const DEFAULT_PASSWORD = 'Password123';

test.describe('Register API @auth @api', () => {
  test('[REG-API-01] valid payload returns 201 and user', async ({
    request,
    trackEmail,
  }) => {
    const email = uniqueEmail('api');
    trackEmail(email);
    const res = await registerUser(request, {
      name: 'API User',
      email,
      password: DEFAULT_PASSWORD,
    });
    expect(res.status()).toBe(201);
    const body = await expectAuthSuccessBody(res, 'register');
    expect(body.user.email).toBe(email.toLowerCase());
    expect(body.message).toBe(MESSAGES.api.registerSuccess);
  });

  test('[REG-API-02] Content-Type is application/json', async ({
    request,
    trackEmail,
  }) => {
    const email = uniqueEmail('api');
    trackEmail(email);
    const res = await registerUser(request, {
      name: 'API User',
      email,
      password: DEFAULT_PASSWORD,
    });
    expect(res.headers()['content-type']).toContain('application/json');
  });

  test('[REG-API-03] missing name returns 400', async ({ request }) => {
    const res = await registerUser(request, {
      email: uniqueEmail('api'),
      password: DEFAULT_PASSWORD,
    });
    await expectErrorBody(res, [400]);
  });

  test('[REG-API-04] missing email returns 400', async ({ request }) => {
    const res = await registerUser(request, {
      name: 'API User',
      password: DEFAULT_PASSWORD,
    });
    await expectErrorBody(res, [400]);
  });

  test('[REG-API-05] missing password returns 400', async ({ request }) => {
    const res = await registerUser(request, {
      name: 'API User',
      email: uniqueEmail('api'),
    });
    await expectErrorBody(res, [400]);
  });

  test('[REG-API-06] invalid email returns 400', async ({ request }) => {
    const res = await registerUser(request, {
      name: 'API User',
      email: 'notanemail',
      password: DEFAULT_PASSWORD,
    });
    await expectErrorBody(res, [400]);
  });

  test('[REG-API-07] short password returns 400', async ({ request }) => {
    const res = await registerUser(request, {
      name: 'API User',
      email: uniqueEmail('api'),
      password: '123',
    });
    await expectErrorBody(res, [400]);
  });

  test('[REG-API-08] duplicate email returns 409', async ({
    request,
    trackEmail,
  }) => {
    const email = uniqueEmail('api-dup');
    trackEmail(email);
    const first = await registerUser(request, {
      name: 'First',
      email,
      password: DEFAULT_PASSWORD,
    });
    expect(first.status()).toBe(201);

    const second = await registerUser(request, {
      name: 'Second',
      email,
      password: DEFAULT_PASSWORD,
    });
    const body = await expectErrorBody(second, [409]);
    expect(body.error).toBe(MESSAGES.register.emailInUse);
  });

  test('[REG-API-09] empty body returns 400', async ({ request }) => {
    const res = await request.post(`${env.baseURL}/api/auth/register`, {
      data: {},
    });
    await expectErrorBody(res, [400]);
  });

  test('[REG-API-10] registered user can login', async ({
    request,
    trackEmail,
  }) => {
    const email = uniqueEmail('api-flow');
    trackEmail(email);
    const reg = await registerUser(request, {
      name: 'Flow User',
      email,
      password: DEFAULT_PASSWORD,
    });
    expect(reg.status()).toBe(201);

    const login = await loginUser(request, { email, password: DEFAULT_PASSWORD });
    expect(login.status()).toBe(200);
    await expectAuthSuccessBody(login, 'login');
  });
});
