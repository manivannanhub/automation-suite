import { expect } from '@playwright/test';
import { todosLocators } from '../locators/todos.locators.js';
import { ROUTES } from '../utils/constants.js';

export class TodosPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.loc = todosLocators;
  }

  async goto() {
    await this.page.goto(ROUTES.todos);
    await expect(
      this.page.getByRole('heading', { name: this.loc.roles.heading }),
    ).toBeVisible();
  }

  newTodoInput() {
    return this.page.getByTestId(this.loc.testIds.newTodoInput);
  }

  addButton() {
    return this.page.getByTestId(this.loc.testIds.addButton);
  }

  todoItemByTitle(title) {
    return this.page.locator(`[data-testid^="${this.loc.testIds.itemPrefix}"]`).filter({
      hasText: title,
    });
  }

  /**
   * Resolve todo id from the card that contains the given title.
   * @param {string} title
   */
  async getTodoIdByTitle(title) {
    const item = this.todoItemByTitle(title);
    await expect(item).toBeVisible();
    const testId = await item.getAttribute('data-testid');
    return testId.replace(this.loc.testIds.itemPrefix, '');
  }

  checkbox(id) {
    return this.page.getByTestId(`${this.loc.testIds.checkboxPrefix}${id}`);
  }

  editButton(id) {
    return this.page.getByTestId(`${this.loc.testIds.editButtonPrefix}${id}`);
  }

  deleteButton(id) {
    return this.page.getByTestId(`${this.loc.testIds.deleteButtonPrefix}${id}`);
  }

  editInput(id) {
    return this.page.getByTestId(`${this.loc.testIds.editInputPrefix}${id}`);
  }

  async addTodo(title) {
    await this.newTodoInput().fill(title);
    await this.addButton().click();
    await expect(this.page.getByText(title, { exact: true })).toBeVisible();
  }

  async markComplete(title) {
    const id = await this.getTodoIdByTitle(title);
    await this.checkbox(id).click();
    await expect(this.checkbox(id)).toBeChecked();
  }

  async editTodo(title, newTitle) {
    const id = await this.getTodoIdByTitle(title);
    await this.todoItemByTitle(title).hover();
    await this.editButton(id).click();
    const input = this.editInput(id);
    await input.clear();
    await input.fill(newTitle);
    await this.page.keyboard.press('Enter');
    await expect(this.todoItemByTitle(newTitle)).toBeVisible();
  }

  async deleteTodo(title) {
    const id = await this.getTodoIdByTitle(title);
    await this.todoItemByTitle(title).hover();
    await this.deleteButton(id).click();
    await expect(this.todoItemByTitle(title)).not.toBeVisible();
  }
}
