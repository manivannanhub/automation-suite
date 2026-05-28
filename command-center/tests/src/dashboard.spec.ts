import { test, expect } from "@playwright/test";
import { DashboardPage } from "./pages/dashboard.page";
import { registerAndLogin } from "./helpers/auth";

test.describe("Dashboard", () => {
  test("shows personalised welcome message", async ({ page }) => {
    const { name } = await registerAndLogin(page, "Daisy Brown");
    const dashboard = new DashboardPage(page);
    await expect(dashboard.welcomeText).toContainText("Daisy");
  });

  test("shows todo stats on load", async ({ page }) => {
    await registerAndLogin(page);
    const dashboard = new DashboardPage(page);
    await expect(dashboard.statTotal).toBeVisible();
    await expect(dashboard.statCompleted).toBeVisible();
    await expect(dashboard.statPending).toBeVisible();
  });

  test("quick-add todo increments total stat", async ({ page }) => {
    await registerAndLogin(page);
    const dashboard = new DashboardPage(page);

    const totalBefore = parseInt(
      (await dashboard.statTotal.textContent()) ?? "0",
    );

    await dashboard.quickAddTodo("Quick task from dashboard");
    await page.waitForTimeout(500);

    await expect(dashboard.statTotal).toHaveText(String(totalBefore + 1));
  });

  test("sidebar nav links are visible", async ({ page }) => {
    await registerAndLogin(page);
    await expect(page.getByTestId("nav-dashboard")).toBeVisible();
    await expect(page.getByTestId("nav-todos")).toBeVisible();
    await expect(page.getByTestId("nav-notes")).toBeVisible();
    await expect(page.getByTestId("nav-contact")).toBeVisible();
    await expect(page.getByTestId("nav-products")).toBeVisible();
  });
});
