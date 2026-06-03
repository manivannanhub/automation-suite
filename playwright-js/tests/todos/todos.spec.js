import { test, expect } from '../../fixtures/baseTest.js';
import { uniqueTitle } from '../../utils/helpers.js';

test.describe('Todos — smoke', () => {
  test.beforeEach(async ({ authenticatedPage, todosPage }) => {
    await todosPage.goto();
  });

  test('[TOD-SMOKE-01] page loads with add form', async ({ page, todosPage }) => {
    await expect(page).toHaveURL(/\/todos$/);
    await expect(todosPage.newTodoInput()).toBeVisible();
    await expect(todosPage.addButton()).toBeVisible();
  });
});

test.describe('Todos — CRUD', () => {
  test.beforeEach(async ({ authenticatedPage, todosPage }) => {
    await todosPage.goto();
    await todosPage.page.waitForLoadState('networkidle');
  });

  test('[TOD-01] adds a new todo', async ({ todosPage }) => {
    await todosPage.addTodo(uniqueTitle('add'));
  });

  test('[TOD-02] added todo appears in list with data-testid', async ({
    todosPage,
  }) => {
    const title = uniqueTitle('list');
    await todosPage.addTodo(title);
    const id = await todosPage.getTodoIdByTitle(title);
    await expect(todosPage.page.getByTestId(`todo-item-${id}`)).toContainText(
      title,
    );
  });

  test('[TOD-03] marks a todo as complete', async ({ todosPage }) => {
    const title = uniqueTitle('complete');
    await todosPage.addTodo(title);
    await todosPage.markComplete(title);
  });

  test('[TOD-04] unchecks a completed todo', async ({ todosPage }) => {
    const title = uniqueTitle('toggle');
    await todosPage.addTodo(title);
    const id = await todosPage.getTodoIdByTitle(title);
    const checkbox = todosPage.checkbox(id);
    await checkbox.click();
    await expect(checkbox).toBeChecked();
    await checkbox.click();
    await expect(checkbox).not.toBeChecked();
  });

  test('[TOD-05] edits a todo title', async ({ todosPage }) => {
    const title = uniqueTitle('edit-old');
    await todosPage.addTodo(title);
    await todosPage.editTodo(title, 'Updated via Playwright');
  });

  test('[TOD-06] deletes a todo', async ({ todosPage }) => {
    const title = uniqueTitle('delete');
    await todosPage.addTodo(title);
    await todosPage.deleteTodo(title);
  });

  test('[TOD-07] does not add empty todo', async ({ todosPage }) => {
    const countBefore = await todosPage.page
      .locator('[data-testid^="todo-item-"]')
      .count();
    await todosPage.addButton().click();
    const countAfter = await todosPage.page
      .locator('[data-testid^="todo-item-"]')
      .count();
    expect(countAfter).toBe(countBefore);
  });

  test('[TOD-08] multiple todos are visible', async ({ todosPage }) => {
    const a = uniqueTitle('multi-a');
    const b = uniqueTitle('multi-b');
    await todosPage.addTodo(a);
    await todosPage.addTodo(b);
    await expect(todosPage.page.getByText(a, { exact: true })).toBeVisible();
    await expect(todosPage.page.getByText(b, { exact: true })).toBeVisible();
  });
});

test.describe('Todos — access control', () => {
  test('[TOD-AUTH-01] unauthenticated user is redirected to login', async ({
    page,
  }) => {
    await page.goto('/todos');
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });
});
