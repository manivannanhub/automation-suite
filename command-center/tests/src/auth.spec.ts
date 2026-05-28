import { test, expect } from "@playwright/test";
import { LoginPage, RegisterPage } from "./pages/auth.page";
import { DashboardPage } from "./pages/dashboard.page";
import { uniqueEmail } from "./helpers/auth";

test.describe("Auth — Register", () => {
  test("registers a new user and lands on dashboard", async ({ page }) => {
    const register = new RegisterPage(page);
    const email = uniqueEmail();

    await register.goto();
    await register.register("Alice Smith", email, "password123");

    await page.waitForURL("**/dashboard");
    const dashboard = new DashboardPage(page);
    await expect(dashboard.welcomeText).toBeVisible();
    await expect(dashboard.welcomeText).toContainText("Alice");
  });

  test("shows error for duplicate email", async ({ page }) => {
    const register = new RegisterPage(page);
    const email = uniqueEmail();

    await register.goto();
    await register.register("Alice Smith", email, "password123");
    await page.waitForURL("**/dashboard");

    await page.goto("/register");
    await register.register("Alice Smith", email, "password123");
    await expect(page.getByText(/already in use/i)).toBeVisible();
  });

  test("shows error for missing name", async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();
    await register.emailInput.fill("someone@example.com");
    await register.passwordInput.fill("password123");
    await register.submitButton.click();
    await expect(page).toHaveURL(/register/);
  });

  test("shows error for invalid email format", async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();
    await register.nameInput.fill("Bob");
    await register.emailInput.fill("not-an-email");
    await register.passwordInput.fill("password123");
    await register.submitButton.click();
    await expect(page).toHaveURL(/register/);
  });

  test("shows error for password too short", async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();
    await register.nameInput.fill("Bob");
    await register.emailInput.fill(uniqueEmail());
    await register.passwordInput.fill("abc");
    await register.submitButton.click();
    await expect(page).toHaveURL(/register/);
  });

  test("register page has link to login", async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();
    await register.loginLink.click();
    await expect(page).toHaveURL(/login/);
  });
});

test.describe("Auth — Login", () => {
  test("logs in with valid credentials", async ({ page }) => {
    const register = new RegisterPage(page);
    const email = uniqueEmail();
    await register.goto();
    await register.register("Login User", email, "mypassword");
    await page.waitForURL("**/dashboard");

    await page.goto("/login");
    const login = new LoginPage(page);
    await login.login(email, "mypassword");
    await page.waitForURL("**/dashboard");
    await expect(page.getByTestId("text-welcome")).toBeVisible();
  });

  test("shows error for wrong password", async ({ page }) => {
    const register = new RegisterPage(page);
    const email = uniqueEmail();
    await register.goto();
    await register.register("Login User", email, "correctpassword");
    await page.waitForURL("**/dashboard");

    await page.goto("/login");
    const login = new LoginPage(page);
    await login.login(email, "wrongpassword");
    await expect(page.getByText(/invalid/i)).toBeVisible();
  });

  test("shows error for non-existent email", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login("nobody@nowhere.com", "password123");
    await expect(page.getByText(/invalid/i)).toBeVisible();
  });

  test("shows error for invalid email format on login", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.emailInput.fill("bad-email");
    await login.passwordInput.fill("password123");
    await login.submitButton.click();
    await expect(page).toHaveURL(/login/);
  });

  test("login page has link to register", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.registerLink.click();
    await expect(page).toHaveURL(/register/);
  });
});

test.describe("Auth — Dashboard & Logout", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/login/);
    await expect(page).toHaveURL(/login/);
  });

  test("logs out and redirects to login", async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();
    await register.register("Logout User", uniqueEmail(), "password123");
    await page.waitForURL("**/dashboard");

    const dashboard = new DashboardPage(page);
    await dashboard.logout();
    await page.waitForURL(/login/);
    await expect(page).toHaveURL(/login/);
  });

  test("cannot access dashboard after logout", async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();
    await register.register("Sec User", uniqueEmail(), "password123");
    await page.waitForURL("**/dashboard");

    const dashboard = new DashboardPage(page);
    await dashboard.logout();
    await page.waitForURL(/login/);

    await page.goto("/dashboard");
    await page.waitForURL(/login/);
    await expect(page).toHaveURL(/login/);
  });
});
