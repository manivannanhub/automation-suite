import { expect } from '@playwright/test';
import { layoutLocators } from '../locators/layout.locators.js';
import { ROUTES } from '../utils/constants.js';

export class AppLayout {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.loc = layoutLocators;
  }

  logoutButton() {
    return this.page.getByRole(this.loc.roles.logout.role, {
      name: this.loc.roles.logout.name,
    });
  }

  async goToDashboard() {
    await this.page.getByRole('link', { name: 'Dashboard' }).click();
  }

  async goToTodos() {
    await this.page.getByRole('link', { name: 'Todos' }).click();
  }

  async logout() {
    await this.logoutButton().click();
    await this.page.waitForURL(/\/login$/);
  }

  async expectRedirectToLoginFrom(route) {
    await this.page.goto(route);
    await this.page.waitForURL(/\/login$/);
    await expect(this.page).toHaveURL(/\/login$/);
  }
}
