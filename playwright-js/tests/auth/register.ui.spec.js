/**
 * Register UI — modernised from legacy register.spec.js
 */

import { test, expect } from '../../fixtures/baseTest.js';
import { MESSAGES, PASSWORD_MIN_LENGTH, ROUTES } from '../../utils/constants.js';
import { uniqueEmail } from '../../utils/helpers.js';

const DEFAULT_PASSWORD = 'Password123';

test.describe('Register UI @auth', () => {
  test.beforeEach(async ({ registerPage }) => {
    await registerPage.goto();
  });

  test.describe('Smoke @smoke', () => {
    test('[REG-SMOKE-01] page loads with form controls', async ({
      page,
      registerPage,
    }) => {
      await registerPage.expectOnPage();
      await expect(page).toHaveTitle(/.+/);
      await expect(registerPage.nameInput()).toBeVisible();
      await expect(registerPage.emailInput()).toBeVisible();
      await expect(registerPage.passwordInput()).toBeVisible();
      await expect(registerPage.submitButton()).toBeVisible();
      await expect(registerPage.submitButton()).toBeEnabled();
    });
  });

  test.describe('Positive', () => {
    test('[REG-POS-01] valid registration redirects to dashboard', async ({
      registerPage,
      trackEmail,
    }) => {
      const email = uniqueEmail('pos');
      trackEmail(email);
      await registerPage.register('Jane Doe', email, DEFAULT_PASSWORD);
      await registerPage.expectOnDashboard();
    });

    test('[REG-POS-02] dashboard welcome shows registered name', async ({
      registerPage,
      dashboardPage,
      trackEmail,
    }) => {
      const email = uniqueEmail('pos');
      trackEmail(email);
      await registerPage.register('James Bond', email, DEFAULT_PASSWORD);
      await dashboardPage.expectWelcomeFor('James Bond');
    });

    test('[REG-POS-03] sign in link navigates to login', async ({
      page,
      registerPage,
    }) => {
      await registerPage.goToLogin();
      await expect(page).toHaveURL(/\/login$/);
    });

    test('[REG-POS-04] Enter on password submits registration', async ({
      page,
      registerPage,
      trackEmail,
    }) => {
      const email = uniqueEmail('enter');
      trackEmail(email);
      await registerPage.fillForm('Enter User', email, DEFAULT_PASSWORD);
      await registerPage.passwordInput().press('Enter');
      await expect(page).toHaveURL(/\/dashboard$/);
    });
  });

  test.describe('Negative', () => {
    test('[REG-NEG-01] empty submit stays on register', async ({
      registerPage,
    }) => {
      await registerPage.submit();
      await registerPage.expectStaysOnRegister();
    });

    test('[REG-NEG-02] empty name shows name required', async ({
      registerPage,
    }) => {
      await registerPage.register('', uniqueEmail('neg'), DEFAULT_PASSWORD);
      await registerPage.expectNameRequired();
      await registerPage.expectStaysOnRegister();
    });

    test('[REG-NEG-03] invalid email shows invalid email', async ({
      registerPage,
    }) => {
      await registerPage.register('Test', 'bad-email', DEFAULT_PASSWORD);
      await registerPage.expectInvalidEmail();
      await registerPage.expectStaysOnRegister();
    });

    test('[REG-NEG-04] short password shows min length message', async ({
      registerPage,
    }) => {
      await registerPage.register('Test', uniqueEmail('neg'), '12345');
      await registerPage.expectPasswordMinLength();
      await registerPage.expectStaysOnRegister();
    });

    test('[REG-NEG-05] duplicate email shows server error banner', async ({
      page,
      registerPage,
      trackEmail,
    }) => {
      const email = uniqueEmail('dup');
      trackEmail(email);
      await registerPage.register('First User', email, DEFAULT_PASSWORD);
      await expect(page).toHaveURL(/\/dashboard$/);
      await registerPage.goto();
      await registerPage.register('Second User', email, DEFAULT_PASSWORD);
      await registerPage.expectDuplicateEmailError();
      await registerPage.expectStaysOnRegister();
    });

    test('[REG-NEG-06] whitespace-only fields do not register', async ({
      registerPage,
    }) => {
      await registerPage.register('   ', '   ', '   ');
      await registerPage.expectStaysOnRegister();
    });
  });

  test.describe('Boundary', () => {
    test('[REG-BVA-01] password at min length (6) is accepted', async ({
      registerPage,
      trackEmail,
    }) => {
      const email = uniqueEmail('bva');
      trackEmail(email);
      const password = 'a'.repeat(PASSWORD_MIN_LENGTH);
      await registerPage.register('Boundary User', email, password);
      await registerPage.expectOnDashboard();
    });

    test('[REG-BVA-02] password below min (5) is rejected', async ({
      registerPage,
    }) => {
      await registerPage.register('Test', uniqueEmail('bva'), 'Pass1');
      await registerPage.expectPasswordMinLength();
      await registerPage.expectStaysOnRegister();
    });
  });

  test.describe('Regression', () => {
    test('[REG-REG-01] fields empty on fresh load', async ({ registerPage }) => {
      await expect(registerPage.nameInput()).toHaveValue('');
      await expect(registerPage.emailInput()).toHaveValue('');
      await expect(registerPage.passwordInput()).toHaveValue('');
    });

    test('[REG-REG-02] password field remains masked', async ({
      registerPage,
    }) => {
      await expect(registerPage.passwordInput()).toHaveAttribute(
        'type',
        'password',
      );
    });
  });

  test.describe('Access', () => {
    test('[REG-AUTH-01] unauthenticated user can open register', async ({
      registerPage,
    }) => {
      await registerPage.expectOnPage();
    });
  });
});
