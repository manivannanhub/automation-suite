import { type Page, type Locator } from "@playwright/test";

export class TodosPage {
  readonly page: Page;
  readonly newTodoInput: Locator;
  readonly addTodoButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newTodoInput = page.getByTestId("input-new-todo");
    this.addTodoButton = page.getByTestId("button-add-todo");
  }

  async goto() {
    await this.page.goto("/todos");
  }

  async addTodo(title: string) {
    await this.newTodoInput.fill(title);
    await this.addTodoButton.click();
  }

  todoItem(id: string | number) {
    return this.page.getByTestId(`todo-item-${id}`);
  }

  todoCheckbox(id: string | number) {
    return this.page.getByTestId(`checkbox-todo-${id}`);
  }

  editButton(id: string | number) {
    return this.page.getByTestId(`button-edit-todo-${id}`);
  }

  deleteButton(id: string | number) {
    return this.page.getByTestId(`button-delete-todo-${id}`);
  }

  editInput(id: string | number) {
    return this.page.getByTestId(`input-edit-todo-${id}`);
  }

  async getFirstTodoId(): Promise<string> {
    const item = this.page.locator("[data-testid^='todo-item-']").first();
    const testId = await item.getAttribute("data-testid");
    return testId!.replace("todo-item-", "");
  }
}
