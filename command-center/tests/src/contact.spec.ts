import { test, expect } from "@playwright/test";
import { ContactPage } from "./pages/contact.page";
import { registerAndLogin } from "./helpers/auth";

test.describe("Contact Form", () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
  });

  test("submits successfully with valid data", async ({ page }) => {
    const contact = new ContactPage(page);
    await contact.goto();
    await contact.submit(
      "John Doe",
      "john@example.com",
      "I have a question about your service and would like more information.",
    );
    await expect(contact.successBanner).toBeVisible();
  });

  test("success banner contains confirmation text", async ({ page }) => {
    const contact = new ContactPage(page);
    await contact.goto();
    await contact.submit(
      "Jane Smith",
      "jane@example.com",
      "Please contact me regarding a billing issue I have encountered.",
    );
    await expect(contact.successBanner).toContainText(/sent|success|received/i);
  });

  test("shows error for missing name", async ({ page }) => {
    const contact = new ContactPage(page);
    await contact.goto();
    await contact.emailInput.fill("test@example.com");
    await contact.messageInput.fill("A message that is long enough to pass validation.");
    await contact.submitButton.click();
    await expect(contact.successBanner).not.toBeVisible();
  });

  test("shows error for invalid email", async ({ page }) => {
    const contact = new ContactPage(page);
    await contact.goto();
    await contact.nameInput.fill("Bob");
    await contact.emailInput.fill("not-valid-email");
    await contact.messageInput.fill("A message that is long enough to pass validation.");
    await contact.submitButton.click();
    await expect(contact.successBanner).not.toBeVisible();
  });

  test("shows error for message too short", async ({ page }) => {
    const contact = new ContactPage(page);
    await contact.goto();
    await contact.nameInput.fill("Bob");
    await contact.emailInput.fill("bob@example.com");
    await contact.messageInput.fill("Short");
    await contact.submitButton.click();
    await expect(contact.successBanner).not.toBeVisible();
  });

  test("shows error for completely empty form", async ({ page }) => {
    const contact = new ContactPage(page);
    await contact.goto();
    await contact.submitButton.click();
    await expect(contact.successBanner).not.toBeVisible();
  });

  test("form resets after successful submission", async ({ page }) => {
    const contact = new ContactPage(page);
    await contact.goto();
    await contact.submit(
      "Reset Tester",
      "reset@example.com",
      "Checking that the form resets correctly after submission.",
    );
    await expect(contact.successBanner).toBeVisible();
    await expect(contact.nameInput).toHaveValue("");
  });
});
