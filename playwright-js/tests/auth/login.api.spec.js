/**
 * Login API — modernised from legacy login.spec.js @APITesting block
 */

import { test, expect, users } from '../../fixtures/baseTest.js';
import { loginUser } from '../../utils/authApi.js';
import {
  expectAuthSuccessBody,
  expectErrorBody,
} from '../../utils/apiAssertions.js';
import { MESSAGES } from '../../utils/constants.js';
import { uniqueEmail } from '../../utils/helpers.js';
import { env } from '../../config/env.js';

test.describe('Login API @auth @api', () => {
  test('[LOGIN-API-01] valid credentials return 200 and user payload', async ({
    request,
  }) => {
    const res = await loginUser(request, users.validUser);
    expect(res.status()).toBe(200);
    const body = await expectAuthSuccessBody(res, 'login');
    expect(body.user.email).toBe(users.validUser.email);
    expect(body.message).toBe(MESSAGES.api.loginSuccess);
  });

  test('[LOGIN-API-02] response Content-Type is application/json', async ({
    request,
  }) => {
    const res = await loginUser(request, users.validUser);
    expect(res.headers()['content-type']).toContain('application/json');
  });

  test('[LOGIN-API-03] wrong password returns 401 with error', async ({
    request,
  }) => {
    const res = await loginUser(request, {
      email: users.validUser.email,
      password: 'WrongPass999',
    });
    const body = await expectErrorBody(res, [401]);
    expect(body.error).toBe(MESSAGES.login.invalidCredentials);
  });

  test('[LOGIN-API-04] unregistered email returns 401', async ({ request }) => {
    const res = await loginUser(request, {
      email: uniqueEmail('missing'),
      password: 'Password123',
    });
    await expectErrorBody(res, [401]);
  });

  test('[LOGIN-API-05] missing email returns 400', async ({ request }) => {
    const res = await loginUser(request, { password: users.validUser.password });
    await expectErrorBody(res, [400]);
  });

  test('[LOGIN-API-06] missing password returns 400', async ({ request }) => {
    const res = await loginUser(request, { email: users.validUser.email });
    await expectErrorBody(res, [400]);
  });

  test('[LOGIN-API-07] invalid email format returns 400', async ({ request }) => {
    const res = await loginUser(request, {
      email: 'notanemail',
      password: users.validUser.password,
    });
    await expectErrorBody(res, [400]);
  });

  test('[LOGIN-API-08] empty body returns 400', async ({ request }) => {
    const res = await request.post(`${env.baseURL}/api/auth/login`, { data: {} });
    await expectErrorBody(res, [400]);
  });

  test('[LOGIN-API-09] SQL injection email returns 401 or 400', async ({
    request,
  }) => {
    const res = await loginUser(request, {
      email: "' OR '1'='1",
      password: users.validUser.password,
    });
    expect([400, 401]).toContain(res.status());
  });

  test('[LOGIN-API-10] success response never contains plain password', async ({
    request,
  }) => {
    const res = await loginUser(request, users.validUser);
    const text = await res.text();
    expect(text).not.toContain(users.validUser.password);
  });
});
