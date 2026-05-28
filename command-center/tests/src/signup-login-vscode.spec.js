const { test, expect } = require("@playwright/test");

let counter = Date.now();

function uniqueEmail() {
  return `testuser_${counter++}@example.com`;
}

test.describe("Signup and Login", () => {
  test("signs up a new user and opens the dashboard", async ({ page }) => {
    const email = uniqueEmail();

    await page.goto("/register");
    await page.getByTestId("input-name").fill("VS Code User");
    await page.getByTestId("input-email").fill(email);
    await page.getByTestId("input-password").fill("password123");
    await page.getByTestId("button-register").click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId("text-welcome")).toContainText("VS Code User");
    await expect(page.getByTestId("button-logout")).toBeVisible();
  });

  test("logs in with an existing user", async ({ page }) => {
    const email = uniqueEmail();
    const password = "password123";

    await page.goto("/register");
    await page.getByTestId("input-name").fill("Login Test User");
    await page.getByTestId("input-email").fill(email);
    await page.getByTestId("input-password").fill(password);
    await page.getByTestId("button-register").click();
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.getByTestId("button-logout").click();
    await expect(page).toHaveURL(/\/login$/);

    await page.getByTestId("input-email").fill(email);
    await page.getByTestId("input-password").fill(password);
    await page.getByTestId("button-login").click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId("text-welcome")).toContainText("Login Test User");
  });

  test("shows an error for invalid login credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("input-email").fill("missing-user@example.com");
    await page.getByTestId("input-password").fill("wrong-password");
    await page.getByTestId("button-login").click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByTestId("login-error")).toContainText(
      "Invalid email or password",
    );
  });

  test("shows an error when signing up with a duplicate email", async ({ page }) => {
    const email = uniqueEmail();

    await page.goto("/register");
    await page.getByTestId("input-name").fill("First User");
    await page.getByTestId("input-email").fill(email);
    await page.getByTestId("input-password").fill("password123");
    await page.getByTestId("button-register").click();
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.goto("/register");
    await page.getByTestId("input-name").fill("Second User");
    await page.getByTestId("input-email").fill(email);
    await page.getByTestId("input-password").fill("password123");
    await page.getByTestId("button-register").click();

    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByTestId("register-error")).toContainText(
      "Email already in use",
    );
  });
});
