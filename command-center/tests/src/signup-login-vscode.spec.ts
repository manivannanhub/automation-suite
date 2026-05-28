import { test, expect } from "@playwright/test";
import { uniqueEmail } from "./helpers/auth";
import { LoginPage, RegisterPage } from "./pages/auth.page";

test.describe("Signup and Login", () => {
  test("signs up a new user and opens the dashboard", async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const email = uniqueEmail();

    await registerPage.goto();
    await registerPage.register("VS Code User", email, "password123");

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId("text-welcome")).toContainText("VS Code User");
    await expect(page.getByTestId("button-logout")).toBeVisible();
  });

  test("logs in with an existing user", async ({ page }) => {
    const email = uniqueEmail();
    const password = "password123";

    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register("Login Test User", email, password);
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.getByTestId("button-logout").click();
    await expect(page).toHaveURL(/\/login$/);

    const loginPage = new LoginPage(page);
    await loginPage.login(email, password);

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId("text-welcome")).toContainText("Login Test User");
  });

  test("shows an error for invalid login credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login("missing-user@example.com", "wrong-password");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByTestId("login-error")).toContainText(
      "Invalid email or password",
    );
  });

  test("shows an error when signing up with a duplicate email", async ({ page }) => {
    const email = uniqueEmail();
    const registerPage = new RegisterPage(page);

    await registerPage.goto();
    await registerPage.register("First User", email, "password123");
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.goto("/register");
    await registerPage.register("Second User", email, "password123");

    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByTestId("register-error")).toContainText(
      "Email already in use",
    );
  });
});
