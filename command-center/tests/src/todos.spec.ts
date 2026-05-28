import { test, expect } from "@playwright/test";
import { TodosPage } from "./pages/todos.page";
import { registerAndLogin } from "./helpers/auth";

test.describe("Todos", () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page);
  });

  test("adds a new todo", async ({ page }) => {
    const todos = new TodosPage(page);
    await todos.goto();
    await todos.addTodo("Buy groceries");
    await expect(page.getByText("Buy groceries")).toBeVisible();
  });

  test("added todo appears in the list", async ({ page }) => {
    const todos = new TodosPage(page);
    await todos.goto();
    await todos.addTodo("Read a book");

    const id = await todos.getFirstTodoId();
    await expect(todos.todoItem(id)).toContainText("Read a book");
  });

  test("marks a todo as complete", async ({ page }) => {
    const todos = new TodosPage(page);
    await todos.goto();
    await todos.addTodo("Complete this task");

    const id = await todos.getFirstTodoId();
    await todos.todoCheckbox(id).click();
    await page.waitForTimeout(300);

    await expect(todos.todoCheckbox(id)).toBeChecked();
  });

  test("unchecks a completed todo", async ({ page }) => {
    const todos = new TodosPage(page);
    await todos.goto();
    await todos.addTodo("Toggle me");

    const id = await todos.getFirstTodoId();
    await todos.todoCheckbox(id).click();
    await page.waitForTimeout(300);
    await todos.todoCheckbox(id).click();
    await page.waitForTimeout(300);

    await expect(todos.todoCheckbox(id)).not.toBeChecked();
  });

  test("edits a todo title", async ({ page }) => {
    const todos = new TodosPage(page);
    await todos.goto();
    await todos.addTodo("Old title");

    const id = await todos.getFirstTodoId();
    await todos.editButton(id).click();
    await todos.editInput(id).clear();
    await todos.editInput(id).fill("New title");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);

    await expect(todos.todoItem(id)).toContainText("New title");
  });

  test("deletes a todo", async ({ page }) => {
    const todos = new TodosPage(page);
    await todos.goto();
    await todos.addTodo("Delete me");

    const id = await todos.getFirstTodoId();
    await todos.deleteButton(id).click();
    await page.waitForTimeout(300);

    await expect(todos.todoItem(id)).not.toBeVisible();
  });

  test("does not add empty todo", async ({ page }) => {
    const todos = new TodosPage(page);
    await todos.goto();

    const countBefore = await page
      .locator("[data-testid^='todo-item-']")
      .count();
    await todos.addTodoButton.click();
    await page.waitForTimeout(300);

    const countAfter = await page
      .locator("[data-testid^='todo-item-']")
      .count();
    expect(countAfter).toBe(countBefore);
  });

  test("multiple todos are added in order", async ({ page }) => {
    const todos = new TodosPage(page);
    await todos.goto();
    await todos.addTodo("First task");
    await todos.addTodo("Second task");
    await todos.addTodo("Third task");

    await expect(page.getByText("First task")).toBeVisible();
    await expect(page.getByText("Second task")).toBeVisible();
    await expect(page.getByText("Third task")).toBeVisible();
  });
});
