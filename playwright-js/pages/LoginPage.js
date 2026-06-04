import { expect } from '@playwright/test';
import { loginLocators } from '../locators/login.locators.js';
import { ROUTES, MESSAGES } from '../utils/constants.js';

export class LoginPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.loc = loginLocators;
  }

  emailInput() {
    return this.page.getByTestId(this.loc.testIds.email);
  }

  passwordInput() {
    return this.page.getByTestId(this.loc.testIds.password);
  }

  submitButton() {
    return this.page.getByTestId(this.loc.testIds.submit);
  }

  async goto() {
    await this.page.goto(ROUTES.login);
    await this.expectOnPage();
  }

  async expectOnPage() {
    await expect(this.page).toHaveURL(/\/login$/);
    await expect(this.page.getByText(MESSAGES.login.welcomeHeading)).toBeVisible();
  }

  async fillEmail(email) {
    if (email !== null) {
      await this.emailInput().fill(email);
    }
  }

  async fillPassword(password) {
    if (password !== null) {
      await this.passwordInput().fill(password);
    }
  }

  async submit() {
    await this.submitButton().click();
  }

  async login(email, password) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  /** Submit credentials and wait for dashboard redirect (happy path). */
  async loginExpectSuccess(email, password) {
    await this.login(email, password);
    await this.page.waitForURL(/\/dashboard$/, { timeout: 20_000 });
  }

  async submitWithEnterOnPassword() {
    await this.passwordInput().press('Enter');
  }

  async goToRegister() {
    await this.page.getByTestId(this.loc.testIds.registerLink).click();
  }

  async expectValidationErrors() {
    await expect(this.page.getByText(MESSAGES.login.invalidEmail)).toBeVisible();
    await expect(this.page.getByText(MESSAGES.login.passwordRequired)).toBeVisible();
  }

  async expectInvalidCredentialsError() {
    await expect(this.page.getByTestId(this.loc.testIds.error)).toHaveText(
      MESSAGES.login.invalidCredentials,
    );
  }

  async expectServerError(message) {
    await expect(this.page.getByTestId(this.loc.testIds.error)).toHaveText(message);
  }

  async expectStaysOnLogin() {
    await expect(this.page).toHaveURL(/\/login$/);
    await expect(this.page).not.toHaveURL(/\/dashboard$/);
  }
}
