import { type Page, type Locator } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly welcomeText: Locator;
  readonly statTotal: Locator;
  readonly statCompleted: Locator;
  readonly statPending: Locator;
  readonly quickTodoInput: Locator;
  readonly quickAddButton: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeText = page.getByTestId("text-welcome");
    this.statTotal = page.getByTestId("stat-total");
    this.statCompleted = page.getByTestId("stat-completed");
    this.statPending = page.getByTestId("stat-pending");
    this.quickTodoInput = page.getByTestId("input-quick-todo");
    this.quickAddButton = page.getByTestId("button-quick-add-todo");
    this.logoutButton = page.getByTestId("button-logout");
  }

  async goto() {
    await this.page.goto("/dashboard");
  }

  async quickAddTodo(title: string) {
    await this.quickTodoInput.fill(title);
    await this.quickAddButton.click();
  }

  async logout() {
    await this.logoutButton.click();
  }
}
