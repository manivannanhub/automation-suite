import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { RegisterPage } from '../pages/RegisterPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { TodosPage } from '../pages/TodosPage.js';
import { ProductsPage } from '../pages/ProductsPage.js';
import { AppLayout } from '../pages/AppLayout.js';
import { loadTestData } from '../utils/testData.js';
import { env } from '../config/env.js';
import { deleteUsersByEmail } from '../utils/userCleanup.js';
import { ensureUserRegistered } from '../utils/authApi.js';

const users = loadTestData('users.json');

/** @type {string[]} */
const createdEmails = [];

export const test = base.extend({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  todosPage: async ({ page }, use) => {
    await use(new TodosPage(page));
  },

  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },

  appLayout: async ({ page }, use) => {
    await use(new AppLayout(page));
  },

  authenticatedPage: async ({ page, loginPage, request }, use) => {
    const { name, email, password } = users.validUser;
    await ensureUserRegistered(request, { name, email, password });
    await loginPage.goto();
    await loginPage.login(email, password);
    await page.waitForURL(/\/dashboard$/, { timeout: 20_000 });
    await use(page);
  },

  /** Logs in with admin@admin.com (see test-data/users.json). */
  authenticatedAdminPage: async ({ page, loginPage, request }, use) => {
    const { name, email, password } = users.adminUser;
    await ensureUserRegistered(request, { name, email, password });
    await loginPage.goto();
    await loginPage.login(email, password);
    await page.waitForURL(/\/dashboard$/, { timeout: 20_000 });
    await use(page);
  },

  trackEmail: async ({}, use) => {
    await use((email) => {
      createdEmails.push(email.toLowerCase());
    });
  },
});

test.beforeAll(async ({ request }) => {
  const res = await request.get(`${env.baseURL}${env.healthCheckPath}`);
  expect(res.ok()).toBeTruthy();
});

test.afterEach(async ({ request }) => {
  if (createdEmails.length > 0) {
    await deleteUsersByEmail(request, createdEmails);
    createdEmails.length = 0;
  }
});

export { expect, users };
