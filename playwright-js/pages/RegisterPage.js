import { expect } from '@playwright/test';
import { registerLocators } from '../locators/register.locators.js';
import { dashboardLocators } from '../locators/dashboard.locators.js';
import { ROUTES, MESSAGES, PASSWORD_MIN_LENGTH } from '../utils/constants.js';

const REGISTER_API = /\/api\/auth\/register$/;

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
    return this.page.getByRole(this.loc.roles.signUp.role, {
      name: this.loc.roles.signUp.name,
    });
  }

  signInLink() {
    return this.page.getByRole(this.loc.roles.signIn.role, {
      name: this.loc.roles.signIn.name,
    });
  }

  nameByLabel() {
    return this.page.getByLabel(this.loc.labels.name);
  }

  emailByLabel() {
    return this.page.getByLabel(this.loc.labels.email);
  }

  passwordByLabel() {
    return this.page.getByLabel(this.loc.labels.password);
  }

  async goto() {
    await this.page.goto(ROUTES.register);
    await this.expectOnPage();
  }

  async expectOnPage() {
    await expect(this.page).toHaveURL(/\/register$/);
    await expect(this.page.getByText(this.loc.text.heading)).toBeVisible();
  }

  async expectSubtitle() {
    await expect(this.page.getByText(this.loc.text.subtitle)).toBeVisible();
  }

  async expectFormLabels() {
    await expect(this.page.getByText(this.loc.labels.name, { exact: true })).toBeVisible();
    await expect(this.page.getByText(this.loc.labels.email, { exact: true })).toBeVisible();
    await expect(this.page.getByText(this.loc.labels.password, { exact: true })).toBeVisible();
  }

  async fillForm(name, email, password) {
    if (name !== null) await this.nameInput().fill(name);
    if (email !== null) await this.emailInput().fill(email);
    if (password !== null) await this.passwordInput().fill(password);
  }

  /** Happy-path helper: fill, submit, wait for API + dashboard. */
  async registerExpectSuccess(name, email, password) {
    await this.fillForm(name, email, password);
    await expect(this.submitButton()).toBeEnabled();
    const responsePromise = this.page.waitForResponse(
      (r) => REGISTER_API.test(r.url()) && r.request().method() === 'POST',
    );
    await this.submitButton().click();
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();
    await this.expectOnDashboard();
  }

  async expectCoreInputsVisible() {
    await expect(this.nameInput()).toBeVisible();
    await expect(this.emailInput()).toBeVisible();
    await expect(this.passwordInput()).toBeVisible();
  }

  async expectPlaceholdersVisible() {
    await expect(this.page.getByPlaceholder(this.loc.placeholders.name)).toBeVisible();
    await expect(this.page.getByPlaceholder(this.loc.placeholders.email)).toBeVisible();
  }

  async expectPasswordEmptyOrMinError() {
    await expect(
      this.page.getByText(/Password is required|at least 6 characters/i),
    ).toBeVisible();
  }

  async submitWithEnterOnPassword() {
    await expect(this.passwordInput()).toBeFocused();
    const responsePromise = this.page.waitForResponse(
      (r) => REGISTER_API.test(r.url()) && r.request().method() === 'POST',
    );
    await this.passwordInput().press('Enter');
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();
    await this.expectOnDashboard();
  }

  async expectFieldsRetainValues({ name, email, password }) {
    if (name !== undefined) await expect(this.nameInput()).toHaveValue(name);
    if (email !== undefined) await expect(this.emailInput()).toHaveValue(email);
    if (password !== undefined) await expect(this.passwordInput()).toHaveValue(password);
  }

  async expectLabelsAccessibleViaGetByLabel() {
    await expect(this.nameByLabel()).toBeVisible();
    await expect(this.emailByLabel()).toBeVisible();
    await expect(this.passwordByLabel()).toBeVisible();
  }

  async submit() {
    await expect(this.submitButton()).toBeEnabled();
    await this.submitButton().click();
  }

  async register(name, email, password) {
    await this.fillForm(name, email, password);
    await this.submit();
  }

  /** Submit signup and wait for a failed register API response (e.g. duplicate email). */
  async registerExpectConflict(name, email, password) {
    await this.fillForm(name, email, password);
    const responsePromise = this.page.waitForResponse(
      (r) => REGISTER_API.test(r.url()) && r.request().method() === 'POST',
    );
    await this.submit();
    const response = await responsePromise;
    expect([400, 409]).toContain(response.status());
  }

  async goToLogin() {
    await this.page.getByTestId(this.loc.testIds.loginLink).click();
  }

  async expectOnDashboard() {
    await this.page.waitForURL(/\/dashboard$/, { timeout: 15_000 });
    await expect(
      this.page.getByTestId(dashboardLocators.testIds.welcome),
    ).toBeVisible({ timeout: 10_000 });
  }

  async expectStaysOnRegister() {
    await expect(this.page).toHaveURL(/\/register$/, { timeout: 10_000 });
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

  async expectFieldsEmpty() {
    await expect(this.nameInput()).toHaveValue('');
    await expect(this.emailInput()).toHaveValue('');
    await expect(this.passwordInput()).toHaveValue('');
  }

  async expectPasswordMasked() {
    await expect(this.passwordInput()).toHaveAttribute('type', 'password');
  }

  /** Tab through name → email → password → sign up */
  async tabThroughForm() {
    await this.nameInput().focus();
    await this.page.keyboard.press('Tab');
    await expect(this.emailInput()).toBeFocused();
    await this.page.keyboard.press('Tab');
    await expect(this.passwordInput()).toBeFocused();
    await this.page.keyboard.press('Tab');
    await expect(this.submitButton()).toBeFocused();
  }

  passwordMinLength() {
    return PASSWORD_MIN_LENGTH;
  }
}
