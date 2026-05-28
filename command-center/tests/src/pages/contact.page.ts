import { type Page, type Locator } from "@playwright/test";

export class ContactPage {
  readonly page: Page;
  readonly form: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly messageInput: Locator;
  readonly submitButton: Locator;
  readonly successBanner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.form = page.getByTestId("contact-form");
    this.nameInput = page.getByTestId("input-contact-name");
    this.emailInput = page.getByTestId("input-contact-email");
    this.messageInput = page.getByTestId("input-contact-message");
    this.submitButton = page.getByTestId("button-submit-contact");
    this.successBanner = page.getByTestId("success-banner");
  }

  async goto() {
    await this.page.goto("/contact");
  }

  async submit(name: string, email: string, message: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.messageInput.fill(message);
    await this.submitButton.click();
  }
}
