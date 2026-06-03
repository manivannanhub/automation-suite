import { expect } from '@playwright/test';
import { dashboardLocators } from '../locators/dashboard.locators.js';
import { ROUTES } from '../utils/constants.js';

export class DashboardPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.loc = dashboardLocators;
  }

  async goto() {
    await this.page.goto(ROUTES.dashboard);
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/dashboard$/);
    await expect(this.page.getByTestId(this.loc.testIds.welcome)).toBeVisible();
  }

  async expectWelcomeFor(name) {
    await expect(this.page.getByTestId(this.loc.testIds.welcome)).toContainText(name);
  }

  async expectStatCards() {
    await expect(this.page.getByTestId(this.loc.testIds.statTotal)).toBeVisible();
    await expect(this.page.getByTestId(this.loc.testIds.statCompleted)).toBeVisible();
    await expect(this.page.getByTestId(this.loc.testIds.statPending)).toBeVisible();
  }

  async expectSidebarNav() {
    await expect(this.page.getByRole('link', { name: 'Todos' })).toBeVisible();
    await expect(this.page.getByRole('link', { name: 'Notes' })).toBeVisible();
    await expect(this.page.getByRole('link', { name: 'Products' })).toBeVisible();
  }

  async expectUserEmail(email) {
    await expect(this.page.getByText(email, { exact: true })).toBeVisible();
  }

  async quickAddTodo(title) {
    await this.page.getByTestId(this.loc.testIds.quickTodoInput).fill(title);
    await this.page.getByTestId(this.loc.testIds.quickAddButton).click();
  }
}
