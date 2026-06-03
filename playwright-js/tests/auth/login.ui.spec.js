/**
 * Login UI — modernised from legacy login.spec.js
 * POM + fixtures + getByTestId / getByRole
 */

import { test, expect, users } from '../../fixtures/baseTest.js';
import { MESSAGES, ROUTES } from '../../utils/constants.js';

test.describe('Login UI @auth', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test.describe('Smoke @smoke', () => {
    test('[LOGIN-SMOKE-01] loads at /login with core controls', async ({
      page,
      loginPage,
    }) => {
      await loginPage.expectOnPage();
      await expect(page).toHaveTitle(/.+/);
      await expect(loginPage.emailInput()).toBeVisible();
      await expect(loginPage.passwordInput()).toBeVisible();
      await expect(loginPage.submitButton()).toBeVisible();
      await expect(loginPage.submitButton()).toBeEnabled();
      await expect(
        page.getByRole('link', { name: 'Sign up' }),
      ).toBeVisible();
      await expect(page.getByText(MESSAGES.login.subtitle)).toBeVisible();
    });
  });

  test.describe('Positive', () => {
    test('[LOGIN-POS-01] valid credentials redirect to dashboard', async ({
      page,
      loginPage,
      dashboardPage,
    }) => {
      const { email, password } = users.validUser;
      await loginPage.login(email, password);
      await dashboardPage.expectLoaded();
      await expect(page).toHaveURL(/\/dashboard$/);
    });

    test('[LOGIN-POS-02] dashboard shows welcome and stats after login', async ({
      loginPage,
      dashboardPage,
    }) => {
      const { email, password, name } = users.validUser;
      await loginPage.login(email, password);
      await dashboardPage.expectWelcomeFor(name);
      await dashboardPage.expectStatCards();
      await dashboardPage.expectSidebarNav();
    });

    test('[LOGIN-POS-03] sidebar shows logged-in email', async ({
      loginPage,
      dashboardPage,
    }) => {
      const { email, password } = users.validUser;
      await loginPage.login(email, password);
      await dashboardPage.expectUserEmail(email);
    });

    test('[LOGIN-POS-04] Enter on password field submits login', async ({
      page,
      loginPage,
    }) => {
      const { email, password } = users.validUser;
      await loginPage.fillEmail(email);
      await loginPage.fillPassword(password);
      await loginPage.submitWithEnterOnPassword();
      await expect(page).toHaveURL(/\/dashboard$/);
    });

    test('[LOGIN-POS-05] uppercase email is normalised and login succeeds', async ({
      page,
      loginPage,
    }) => {
      const { email, password } = users.validUser;
      await loginPage.login(email.toUpperCase(), password);
      await expect(page).toHaveURL(/\/dashboard$/);
    });

    test('[LOGIN-POS-06] sign up link navigates to register', async ({
      page,
      loginPage,
    }) => {
      await loginPage.goToRegister();
      await expect(page).toHaveURL(/\/register$/);
    });
  });

  test.describe('Negative', () => {
    test('[LOGIN-NEG-01] empty submit shows validation errors', async ({
      loginPage,
    }) => {
      await loginPage.submit();
      await loginPage.expectValidationErrors();
      await loginPage.expectStaysOnLogin();
    });

    test('[LOGIN-NEG-02] empty password shows password required', async ({
      loginPage,
    }) => {
      await loginPage.login(users.validUser.email, '');
      await expect(
        loginPage.page.getByText(MESSAGES.login.passwordRequired),
      ).toBeVisible();
      await loginPage.expectStaysOnLogin();
    });

    test('[LOGIN-NEG-03] invalid email format shows invalid email', async ({
      loginPage,
    }) => {
      await loginPage.login('notanemail', 'Password123');
      await expect(
        loginPage.page.getByText(MESSAGES.login.invalidEmail),
      ).toBeVisible();
      await loginPage.expectStaysOnLogin();
    });

    test('[LOGIN-NEG-04] wrong password shows server error banner', async ({
      loginPage,
    }) => {
      await loginPage.login(users.validUser.email, 'WrongPass999');
      await loginPage.expectInvalidCredentialsError();
      await loginPage.expectStaysOnLogin();
    });

    test('[LOGIN-NEG-05] unregistered email shows invalid credentials', async ({
      loginPage,
    }) => {
      await loginPage.login('nobody-here@example.com', 'Password123');
      await loginPage.expectInvalidCredentialsError();
      await loginPage.expectStaysOnLogin();
    });

    test('[LOGIN-NEG-06] SQL injection in email does not authenticate', async ({
      loginPage,
    }) => {
      await loginPage.login("' OR '1'='1", 'Password123');
      await loginPage.expectStaysOnLogin();
    });
  });

  test.describe('Regression', () => {
    test('[LOGIN-REG-01] logout returns to login', async ({
      page,
      loginPage,
      appLayout,
    }) => {
      const { email, password } = users.validUser;
      await loginPage.login(email, password);
      await expect(page).toHaveURL(/\/dashboard$/);
      await appLayout.logout();
      await expect(page).toHaveURL(/\/login$/);
    });

    test('[LOGIN-REG-02] /dashboard after logout redirects to login', async ({
      page,
      loginPage,
      appLayout,
    }) => {
      const { email, password } = users.validUser;
      await loginPage.login(email, password);
      await appLayout.logout();
      await appLayout.expectRedirectToLoginFrom(ROUTES.dashboard);
      await expect(page).not.toHaveURL(/\/dashboard$/);
    });

    test('[LOGIN-REG-03] full login dashboard logout flow', async ({
      page,
      loginPage,
      dashboardPage,
      appLayout,
    }) => {
      const { email, password, name } = users.validUser;
      await loginPage.login(email, password);
      await dashboardPage.expectWelcomeFor(name);
      await appLayout.logout();
      await expect(page).toHaveURL(/\/login$/);
    });
  });

  test.describe('Access', () => {
    test('[LOGIN-AUTH-01] unauthenticated /dashboard redirects to login', async ({
      page,
      appLayout,
    }) => {
      await appLayout.expectRedirectToLoginFrom(ROUTES.dashboard);
    });
  });
});
