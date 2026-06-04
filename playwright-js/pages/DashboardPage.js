import { expect } from '@playwright/test';
import { dashboardLocators } from '../locators/dashboard.locators.js';
import { ROUTES } from '../utils/constants.js';

export class DashboardPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.loc = dashboardLocators;
  }

  async goto() {
    await this.page.goto(ROUTES.dashboard);
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/dashboard$/, { timeout: 20_000 });
    await expect(this.page.getByTestId(this.loc.testIds.welcome)).toBeVisible({
      timeout: 20_000,
    });
  }

  async expectWelcomeFor(name) {
    await expect(this.page.getByTestId(this.loc.testIds.welcome)).toContainText(name);
  }

  async expectStatCards() {
    await expect(this.page.getByTestId(this.loc.testIds.statTotal)).toBeVisible();
    await expect(this.page.getByTestId(this.loc.testIds.statCompleted)).toBeVisible();
    await expect(this.page.getByTestId(this.loc.testIds.statPending)).toBeVisible();
  }

  async expectSidebarNav() {
    await expect(this.page.getByRole('link', { name: 'Todos' })).toBeVisible();
    await expect(this.page.getByRole('link', { name: 'Notes' })).toBeVisible();
    await expect(this.page.getByRole('link', { name: 'Products' })).toBeVisible();
  }

  async expectUserEmail(email) {
    await expect(this.page.getByText(email, { exact: true })).toBeVisible();
  }

  quickTodoInput() {
    return this.page.getByTestId(this.loc.testIds.quickTodoInput);
  }

  quickAddButton() {
    return this.page.getByTestId(this.loc.testIds.quickAddButton);
  }

  async quickAddTodo(title) {
    await this.quickTodoInput().fill(title);
    await this.quickAddButton().click();
  }

  /** Read numeric stat card values from the dashboard. */
  async readStatCounts() {
    const total = Number(
      await this.page.getByTestId(this.loc.testIds.statTotal).innerText(),
    );
    const completed = Number(
      await this.page.getByTestId(this.loc.testIds.statCompleted).innerText(),
    );
    const pending = Number(
      await this.page.getByTestId(this.loc.testIds.statPending).innerText(),
    );
    return { total, completed, pending };
  }

  /**
   * Assert todo summary cards on the dashboard (waits for numeric text).
   * @param {{ total: number, completed: number, pending: number }} counts
   */
  async expectStatCounts({ total, completed, pending }) {
    await expect(this.page.getByTestId(this.loc.testIds.statTotal)).toHaveText(
      String(total),
      { timeout: 10_000 },
    );
    await expect(this.page.getByTestId(this.loc.testIds.statCompleted)).toHaveText(
      String(completed),
      { timeout: 10_000 },
    );
    await expect(this.page.getByTestId(this.loc.testIds.statPending)).toHaveText(
      String(pending),
      { timeout: 10_000 },
    );
  }

  /** Poll stat cards until counts match (helps after navigation / mutations). */
  async expectStatCountsEventually({ total, completed, pending }) {
    await expect
      .poll(async () => this.readStatCounts(), { timeout: 15_000 })
      .toEqual({ total, completed, pending });
  }

  /**
   * Poll until stats increased by at least the given deltas (tolerates parallel admin mutations).
   * @param {{ total: number, completed: number, pending: number }} before
   * @param {{ total?: number, completed?: number, pending?: number }} delta
   */
  async expectStatCountsIncreasedBy(
    before,
    { total: totalDelta = 0, completed: completedDelta = 0, pending: pendingDelta = 0 },
  ) {
    await expect
      .poll(async () => {
        const after = await this.readStatCounts();
        return (
          after.total >= before.total + totalDelta &&
          after.completed >= before.completed + completedDelta &&
          after.pending >= before.pending + pendingDelta
        );
      }, { timeout: 15_000 })
      .toBe(true);
  }

  async waitForStatsResponse() {
    await this.page.waitForResponse(
      (r) => r.url().includes('/api/todos/stats') && r.status() === 200,
    );
  }
}
