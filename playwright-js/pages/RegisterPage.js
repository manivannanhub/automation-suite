import { expect } from '@playwright/test';
import { registerLocators } from '../locators/register.locators.js';
import { ROUTES, MESSAGES } from '../utils/constants.js';

export class RegisterPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.loc = registerLocators;
  }

  nameInput() {
    return this.page.getByTestId(this.loc.testIds.name);
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
    await this.page.goto(ROUTES.register);
    await this.expectOnPage();
  }

  async expectOnPage() {
    await expect(this.page).toHaveURL(/\/register$/);
    await expect(this.page.getByText(this.loc.text.heading)).toBeVisible();
  }

  async fillForm(name, email, password) {
    if (name !== null) await this.nameInput().fill(name);
    if (email !== null) await this.emailInput().fill(email);
    if (password !== null) await this.passwordInput().fill(password);
  }

  async submit() {
    await this.submitButton().click();
  }

  async register(name, email, password) {
    await this.fillForm(name, email, password);
    await this.submit();
  }

  async goToLogin() {
    await this.page.getByTestId(this.loc.testIds.loginLink).click();
  }

  async expectOnDashboard() {
    await expect(this.page).toHaveURL(/\/dashboard$/);
  }

  async expectStaysOnRegister() {
    await expect(this.page).toHaveURL(/\/register$/);
    await expect(this.page).not.toHaveURL(/\/dashboard$/);
  }

  async expectNameRequired() {
    await expect(this.page.getByText(MESSAGES.register.nameRequired)).toBeVisible();
  }

  async expectInvalidEmail() {
    await expect(this.page.getByText(MESSAGES.register.invalidEmail)).toBeVisible();
  }

  async expectPasswordMinLength() {
    await expect(this.page.getByText(MESSAGES.register.passwordMin)).toBeVisible();
  }

  async expectDuplicateEmailError() {
    await expect(this.page.getByTestId(this.loc.testIds.error)).toHaveText(
      MESSAGES.register.emailInUse,
    );
  }

  async expectSubmitDisabledWhileLoading() {
    await expect(this.submitButton()).toBeDisabled();
  }
}
