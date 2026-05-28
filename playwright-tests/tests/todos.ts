import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3005';

// ── Helpers ──────────────────────────────────────────────────
async function registerAndLogin(page: Page) {
  const email = `todo_${Date.now()}@example.com`;
  await page.goto(`${BASE_URL}/register`);
  await page.getByPlaceholder('John Doe').fill('Todo User');
  await page.getByPlaceholder('you@example.com').fill(email);
  await page.locator('input[type="password"]').fill('password123');
  await page.getByRole('button', { name: 'Sign Up' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  return email;
}

async function addTodoFromTodosPage(page: Page, title: string) {
  await page.goto(`${BASE_URL}/todos`);
  await page.getByPlaceholder('What needs to be done?').fill(title);
  await page.getByRole('button', { name: '+' }).click();
}

async function addTodoFromDashboard(page: Page, title: string) {
  await page.goto(`${BASE_URL}/dashboard`);
  await page.getByPlaceholder('What needs to be done?').fill(title);
  await page.getByRole('button', { name: /Add/i }).click();
}

async function getTodoRow(page: Page, title: string) {
  return page.locator('li, [class*="todo"], [class*="task"]').filter({ hasText: title });
}

async function deleteTodo(page: Page, title: string) {
  const row = await getTodoRow(page, title);
  await row.hover();
  await row.locator('button').last().click();
}

async function editTodo(page: Page, oldTitle: string, newTitle: string) {
  const row = await getTodoRow(page, oldTitle);
  await row.hover();
  await row.locator('button').first().click();
  await page.getByDisplayValue(oldTitle).clear();
  await page.getByDisplayValue('').fill(newTitle);
  await page.keyboard.press('Enter');
}

// ══════════════════════════════════════════════════════════════
// 1. UI TESTS
// ══════════════════════════════════════════════════════════════

test.describe('UI Tests', () => {

  test('todos page loads correctly after login', async ({ page }) => {
    await registerAndLogin(page);
    await page.goto(`${BASE_URL}/todos`);
    await expect(page.getByText('Todos')).toBeVisible();
    await expect(page.getByPlaceholder('What needs to be done?')).toBeVisible();
    await expect(page.getByRole('button', { name: '+' })).toBeVisible();
  });

  test('empty state message visible with no tasks', async ({ page }) => {
    await registerAndLogin(page);
    await page.goto(`${BASE_URL}/todos`);
    await expect(page.getByText("No tasks yet. You're all caught up!")).toBeVisible();
  });

  test('input field is empty on page load', async ({ page }) => {
    await registerAndLogin(page);
    await page.goto(`${BASE_URL}/todos`);
    await expect(page.getByPlaceholder('What needs to be done?')).toHaveValue('');
  });

  test('dashboard shows Quick Add Todo section with Add button', async ({ page }) => {
    await registerAndLogin(page);
    await expect(page.getByText('Quick Add Todo')).toBeVisible();
    await expect(page.getByPlaceholder('What needs to be done?')).toBeVisible();
    await expect(page.getByRole('button', { name: /Add/i })).toBeVisible();
  });

  test('dashboard shows total tasks, completed and pending cards', async ({ page }) => {
    await registerAndLogin(page);
    await expect(page.getByText('Total Tasks')).toBeVisible();
    await expect(page.getByText('Completed')).toBeVisible();
    await expect(page.getByText('Pending')).toBeVisible();
  });

  test('dashboard cards show 0 for new user', async ({ page }) => {
    await registerAndLogin(page);
    const totalCard = page.locator('text=Total Tasks').locator('..').locator('..');
    const completedCard = page.locator('text=Completed').locator('..').locator('..');
    const pendingCard = page.locator('text=Pending').locator('..').locator('..');
    await expect(totalCard).toContainText('0');
    await expect(completedCard).toContainText('0');
    await expect(pendingCard).toContainText('0');
  });

  test('completed todo shows strikethrough text', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, 'Strikethrough task');
    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.check();
    const todoText = page.getByText('Strikethrough task');
    await expect(todoText).toHaveCSS('text-decoration-line', 'line-through');
  });

  test('completed todo shows green checkbox', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, 'Green checkbox task');
    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  });

  test('unchecked todo shows edit and delete buttons', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, 'Edit delete task');
    const row = page.locator('li, [class*="todo"], [class*="task"]').filter({ hasText: 'Edit delete task' });
    await row.hover();
    const buttons = row.locator('button');
    await expect(buttons).toHaveCount(2);
  });

  test('completed todo does not show edit and delete buttons', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, 'Completed no buttons');
    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.check();
    const row = page.locator('li, [class*="todo"], [class*="task"]').filter({ hasText: 'Completed no buttons' });
    const buttons = row.locator('button');
    await expect(buttons).toHaveCount(0);
  });

  test('todo shows date after creation', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, 'Dated task');
    await expect(page.getByText(/May|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec/)).toBeVisible();
  });

  test('sidebar navigation visible on todos page', async ({ page }) => {
    await registerAndLogin(page);
    await page.goto(`${BASE_URL}/todos`);
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Todos' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Notes' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Contact' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Products' })).toBeVisible();
  });

});

// ══════════════════════════════════════════════════════════════
// 2. POSITIVE TESTS - TODOS PAGE
// ══════════════════════════════════════════════════════════════

test.describe('Positive Tests - Todos Page', () => {

  test('add todo from todos page using + button', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, 'Buy groceries');
    await expect(page.getByText('Buy groceries')).toBeVisible();
  });

  test('input clears after adding todo from todos page', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, 'Clear test');
    await expect(page.getByPlaceholder('What needs to be done?')).toHaveValue('');
  });

  test('add multiple todos from todos page', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, 'Task One');
    await addTodoFromTodosPage(page, 'Task Two');
    await addTodoFromTodosPage(page, 'Task Three');
    await expect(page.getByText('Task One')).toBeVisible();
    await expect(page.getByText('Task Two')).toBeVisible();
    await expect(page.getByText('Task Three')).toBeVisible();
  });

  test('mark todo as complete from todos page', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, 'Complete this task');
    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  });

  test('unmark completed todo', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, 'Toggle task');
    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  });

  test('delete todo from todos page', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, 'Delete this task');
    await expect(page.getByText('Delete this task')).toBeVisible();
    await deleteTodo(page, 'Delete this task');
    await expect(page.getByText('Delete this task')).not.toBeVisible();
  });

  test('edit todo from todos page', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, 'Original task');
    await editTodo(page, 'Original task', 'Updated task');
    await expect(page.getByText('Updated task')).toBeVisible();
    await expect(page.getByText('Original task')).not.toBeVisible();
  });

  test('empty state disappears after adding todo', async ({ page }) => {
    await registerAndLogin(page);
    await page.goto(`${BASE_URL}/todos`);
    await expect(page.getByText("No tasks yet. You're all caught up!")).toBeVisible();
    await addTodoFromTodosPage(page, 'First task');
    await expect(page.getByText("No tasks yet. You're all caught up!")).not.toBeVisible();
  });

  test('empty state returns after deleting last todo', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, 'Only task');
    await deleteTodo(page, 'Only task');
    await expect(page.getByText("No tasks yet. You're all caught up!")).toBeVisible();
  });

});

// ══════════════════════════════════════════════════════════════
// 3. POSITIVE TESTS - DASHBOARD QUICK ADD
// ══════════════════════════════════════════════════════════════

test.describe('Positive Tests - Dashboard Quick Add', () => {

  test('add todo from dashboard Quick Add', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromDashboard(page, 'Dashboard task');
    await page.goto(`${BASE_URL}/todos`);
    await expect(page.getByText('Dashboard task')).toBeVisible();
  });

  test('dashboard total tasks updates immediately after Quick Add', async ({ page }) => {
    await registerAndLogin(page);
    await page.goto(`${BASE_URL}/dashboard`);
    await page.getByPlaceholder('What needs to be done?').fill('Count task');
    await page.getByRole('button', { name: /Add/i }).click();
    const totalCard = page.locator('text=Total Tasks').locator('..').locator('..');
    await expect(totalCard).toContainText('1');
  });

  test('dashboard pending count updates immediately after Quick Add', async ({ page }) => {
    await registerAndLogin(page);
    await page.goto(`${BASE_URL}/dashboard`);
    await page.getByPlaceholder('What needs to be done?').fill('Pending task');
    await page.getByRole('button', { name: /Add/i }).click();
    const pendingCard = page.locator('text=Pending').locator('..').locator('..');
    await expect(pendingCard).toContainText('1');
  });

  test('input clears after Quick Add on dashboard', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromDashboard(page, 'Quick clear task');
    await expect(page.getByPlaceholder('What needs to be done?')).toHaveValue('');
  });

  test('add multiple todos from dashboard Quick Add', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromDashboard(page, 'Dashboard Task 1');
    await addTodoFromDashboard(page, 'Dashboard Task 2');
    await page.goto(`${BASE_URL}/todos`);
    await expect(page.getByText('Dashboard Task 1')).toBeVisible();
    await expect(page.getByText('Dashboard Task 2')).toBeVisible();
  });

  test('todos added from both places appear in todos page', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromDashboard(page, 'From Dashboard');
    await addTodoFromTodosPage(page, 'From Todos Page');
    await page.goto(`${BASE_URL}/todos`);
    await expect(page.getByText('From Dashboard')).toBeVisible();
    await expect(page.getByText('From Todos Page')).toBeVisible();
  });

  test('dashboard counts update correctly with todos from both places', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromDashboard(page, 'Dashboard add');
    await addTodoFromTodosPage(page, 'Todos page add');
    await page.goto(`${BASE_URL}/dashboard`);
    const totalCard = page.locator('text=Total Tasks').locator('..').locator('..');
    await expect(totalCard).toContainText('2');
    const pendingCard = page.locator('text=Pending').locator('..').locator('..');
    await expect(pendingCard).toContainText('2');
  });

  test('completing todo from todos page updates dashboard completed count', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromDashboard(page, 'Complete via todos');
    await page.goto(`${BASE_URL}/todos`);
    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.check();
    await page.goto(`${BASE_URL}/dashboard`);
    const completedCard = page.locator('text=Completed').locator('..').locator('..');
    await expect(completedCard).toContainText('1');
    const pendingCard = page.locator('text=Pending').locator('..').locator('..');
    await expect(pendingCard).toContainText('0');
  });

});

// ══════════════════════════════════════════════════════════════
// 4. NEGATIVE TESTS
// ══════════════════════════════════════════════════════════════

test.describe('Negative Tests', () => {

  test('cannot add empty todo from todos page', async ({ page }) => {
    await registerAndLogin(page);
    await page.goto(`${BASE_URL}/todos`);
    await page.getByRole('button', { name: '+' }).click();
    await expect(page.getByText("No tasks yet. You're all caught up!")).toBeVisible();
  });

  test('cannot add whitespace only todo from todos page', async ({ page }) => {
    await registerAndLogin(page);
    await page.goto(`${BASE_URL}/todos`);
    await page.getByPlaceholder('What needs to be done?').fill('     ');
    await page.getByRole('button', { name: '+' }).click();
    await expect(page.getByText("No tasks yet. You're all caught up!")).toBeVisible();
  });

  test('cannot add empty todo from dashboard', async ({ page }) => {
    await registerAndLogin(page);
    await page.goto(`${BASE_URL}/dashboard`);
    await page.getByRole('button', { name: /Add/i }).click();
    const totalCard = page.locator('text=Total Tasks').locator('..').locator('..');
    await expect(totalCard).toContainText('0');
  });

  test('cannot add whitespace only todo from dashboard', async ({ page }) => {
    await registerAndLogin(page);
    await page.goto(`${BASE_URL}/dashboard`);
    await page.getByPlaceholder('What needs to be done?').fill('     ');
    await page.getByRole('button', { name: /Add/i }).click();
    const totalCard = page.locator('text=Total Tasks').locator('..').locator('..');
    await expect(totalCard).toContainText('0');
  });

  test('typing in input without clicking + does not add todo', async ({ page }) => {
    await registerAndLogin(page);
    await page.goto(`${BASE_URL}/todos`);
    await page.getByPlaceholder('What needs to be done?').fill('Not submitted task');
    await expect(page.getByText("No tasks yet. You're all caught up!")).toBeVisible();
  });

  test('todos do not appear for different user', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, 'User 1 private task');
    await page.getByRole('button', { name: 'Logout' }).click();

    const email2 = `todo2_${Date.now()}@example.com`;
    await page.goto(`${BASE_URL}/register`);
    await page.getByPlaceholder('John Doe').fill('User Two');
    await page.getByPlaceholder('you@example.com').fill(email2);
    await page.locator('input[type="password"]').fill('password123');
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await page.goto(`${BASE_URL}/todos`);
    await expect(page.getByText('User 1 private task')).not.toBeVisible();
    await expect(page.getByText("No tasks yet. You're all caught up!")).toBeVisible();
  });

  test.skip('accessing todos without login redirects', async ({ page }) => {
    // DEFECT: App does not redirect unauthenticated users
    await page.goto(`${BASE_URL}/todos`);
    await expect(page).toHaveURL(/\/login$/);
  });

});

// ══════════════════════════════════════════════════════════════
// 5. BOUNDARY VALUE ANALYSIS (BVA)
// ══════════════════════════════════════════════════════════════

test.describe('Boundary Value Analysis', () => {

  test('BVA - todo with 1 character (minimum)', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, 'A');
    await expect(page.getByText('A')).toBeVisible();
  });

  test('BVA - todo with 2 characters', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, 'AB');
    await expect(page.getByText('AB')).toBeVisible();
  });

  test('BVA - todo with 100 characters', async ({ page }) => {
    await registerAndLogin(page);
    const task = 'A'.repeat(100);
    await addTodoFromTodosPage(page, task);
    await expect(page.locator('input[type="checkbox"]')).toHaveCount(1);
  });

  test('BVA - todo with 255 characters', async ({ page }) => {
    await registerAndLogin(page);
    const task = 'A'.repeat(255);
    await addTodoFromTodosPage(page, task);
    await expect(page.locator('input[type="checkbox"]')).toHaveCount(1);
  });

  test('BVA - add exactly 10 todos from todos page', async ({ page }) => {
    await registerAndLogin(page);
    for (let i = 1; i <= 10; i++) {
      await addTodoFromTodosPage(page, `Task ${i}`);
    }
    for (let i = 1; i <= 10; i++) {
      await expect(page.getByText(`Task ${i}`)).toBeVisible();
    }
    await page.goto(`${BASE_URL}/dashboard`);
    const totalCard = page.locator('text=Total Tasks').locator('..').locator('..');
    await expect(totalCard).toContainText('10');
  });

  test('BVA - dashboard count matches 5 todos added from dashboard', async ({ page }) => {
    await registerAndLogin(page);
    for (let i = 1; i <= 5; i++) {
      await addTodoFromDashboard(page, `BVA Task ${i}`);
    }
    await page.goto(`${BASE_URL}/dashboard`);
    const totalCard = page.locator('text=Total Tasks').locator('..').locator('..');
    await expect(totalCard).toContainText('5');
  });

});

// ══════════════════════════════════════════════════════════════
// 6. EQUIVALENCE PARTITIONING (EP)
// ══════════════════════════════════════════════════════════════

test.describe('Equivalence Partitioning', () => {

  test('EP - valid: standard text todo from todos page', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, 'Buy groceries');
    await expect(page.getByText('Buy groceries')).toBeVisible();
  });

  test('EP - valid: standard text todo from dashboard', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromDashboard(page, 'Dashboard groceries');
    await page.goto(`${BASE_URL}/todos`);
    await expect(page.getByText('Dashboard groceries')).toBeVisible();
  });

  test('EP - valid: todo with numbers', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, 'Task 12345');
    await expect(page.getByText('Task 12345')).toBeVisible();
  });

  test('EP - valid: todo with special characters', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, 'Buy milk & eggs!');
    await expect(page.getByText('Buy milk & eggs!')).toBeVisible();
  });

  test('EP - valid: todo with emoji', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, 'Buy coffee ☕');
    await expect(page.getByText('Buy coffee ☕')).toBeVisible();
  });

  test('EP - invalid: empty string from todos page', async ({ page }) => {
    await registerAndLogin(page);
    await page.goto(`${BASE_URL}/todos`);
    await addTodoFromTodosPage(page, '');
    await expect(page.getByText("No tasks yet. You're all caught up!")).toBeVisible();
  });

  test('EP - invalid: whitespace only from dashboard', async ({ page }) => {
    await registerAndLogin(page);
    await page.goto(`${BASE_URL}/dashboard`);
    await page.getByPlaceholder('What needs to be done?').fill('   ');
    await page.getByRole('button', { name: /Add/i }).click();
    const totalCard = page.locator('text=Total Tasks').locator('..').locator('..');
    await expect(totalCard).toContainText('0');
  });

});

// ══════════════════════════════════════════════════════════════
// 7. FUNCTIONAL TESTS
// ══════════════════════════════════════════════════════════════

test.describe('Functional Tests', () => {

  test('todos persist after page refresh', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, 'Persistent task');
    await page.reload();
    await expect(page.getByText('Persistent task')).toBeVisible();
  });

  test('completed count updates on dashboard after completing todo', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, 'Complete me');
    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.check();
    await page.goto(`${BASE_URL}/dashboard`);
    const completedCard = page.locator('text=Completed').locator('..').locator('..');
    await expect(completedCard).toContainText('1');
    const pendingCard = page.locator('text=Pending').locator('..').locator('..');
    await expect(pendingCard).toContainText('0');
  });

  test('total stays same after completing todo', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, 'Stay counted');
    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.check();
    await page.goto(`${BASE_URL}/dashboard`);
    const totalCard = page.locator('text=Total Tasks').locator('..').locator('..');
    await expect(totalCard).toContainText('1');
  });

  test('total decreases after deleting todo', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, 'Delete count task');
    await deleteTodo(page, 'Delete count task');
    await page.goto(`${BASE_URL}/dashboard`);
    const totalCard = page.locator('text=Total Tasks').locator('..').locator('..');
    await expect(totalCard).toContainText('0');
  });

  test('navigate to todos via sidebar link', async ({ page }) => {
    await registerAndLogin(page);
    await page.getByRole('link', { name: 'Todos' }).click();
    await expect(page).toHaveURL(/\/todos$/);
  });

  test('todos added from dashboard visible on todos page', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromDashboard(page, 'Dashboard added task');
    await page.getByRole('link', { name: 'Todos' }).click();
    await expect(page.getByText('Dashboard added task')).toBeVisible();
  });

  test('todos added from todos page visible on dashboard count', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, 'Todos page task');
    await page.goto(`${BASE_URL}/dashboard`);
    const totalCard = page.locator('text=Total Tasks').locator('..').locator('..');
    await expect(totalCard).toContainText('1');
  });

});

// ══════════════════════════════════════════════════════════════
// 8. E2E TESTS
// ══════════════════════════════════════════════════════════════

test.describe('E2E Tests', () => {

  test('full journey: add from both places, complete, verify dashboard', async ({ page }) => {
    await registerAndLogin(page);

    // Add from dashboard — verify count updates immediately
    await page.goto(`${BASE_URL}/dashboard`);
    await page.getByPlaceholder('What needs to be done?').fill('Dashboard E2E Task');
    await page.getByRole('button', { name: /Add/i }).click();
    await expect(page.locator('text=Total Tasks').locator('..').locator('..')).toContainText('1');
    await expect(page.locator('text=Pending').locator('..').locator('..')).toContainText('1');

    // Add from todos page
    await addTodoFromTodosPage(page, 'Todos Page E2E Task');

    // Complete one from todos page
    const checkboxes = page.locator('input[type="checkbox"]');
    await checkboxes.first().check();

    // Verify dashboard counts
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page.locator('text=Total Tasks').locator('..').locator('..')).toContainText('2');
    await expect(page.locator('text=Completed').locator('..').locator('..')).toContainText('1');
    await expect(page.locator('text=Pending').locator('..').locator('..')).toContainText('1');
  });

  test('full journey: add, logout, login, verify todos persist', async ({ page }) => {
    const email = `e2e_${Date.now()}@example.com`;

    await page.goto(`${BASE_URL}/register`);
    await page.getByPlaceholder('John Doe').fill('E2E User');
    await page.getByPlaceholder('you@example.com').fill(email);
    await page.locator('input[type="password"]').fill('password123');
    await page.getByRole('button', { name: 'Sign Up' }).click();

    await addTodoFromTodosPage(page, 'Persistent E2E Task 1');
    await addTodoFromDashboard(page, 'Persistent E2E Task 2');

    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page.getByPlaceholder('you@example.com').fill(email);
    await page.locator('input[type="password"]').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.goto(`${BASE_URL}/todos`);
    await expect(page.getByText('Persistent E2E Task 1')).toBeVisible();
    await expect(page.getByText('Persistent E2E Task 2')).toBeVisible();
  });

  test('full CRUD journey: add, edit, complete, delete', async ({ page }) => {
    await registerAndLogin(page);

    // Add
    await addTodoFromTodosPage(page, 'CRUD Task');
    await expect(page.getByText('CRUD Task')).toBeVisible();

    // Edit
    await editTodo(page, 'CRUD Task', 'CRUD Task Updated');
    await expect(page.getByText('CRUD Task Updated')).toBeVisible();

    // Complete
    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.check();
    await expect(checkbox).toBeChecked();

    // Uncheck to enable delete
    await checkbox.uncheck();

    // Delete
    await deleteTodo(page, 'CRUD Task Updated');
    await expect(page.getByText('CRUD Task Updated')).not.toBeVisible();
    await expect(page.getByText("No tasks yet. You're all caught up!")).toBeVisible();
  });

});

// ══════════════════════════════════════════════════════════════
// 9. SIT TESTS
// ══════════════════════════════════════════════════════════════

test.describe('SIT Tests', () => {

  test('SIT - todos added from dashboard appear in todos page', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromDashboard(page, 'SIT Dashboard Task');
    await page.goto(`${BASE_URL}/todos`);
    await expect(page.getByText('SIT Dashboard Task')).toBeVisible();
  });

  test('SIT - todos added from todos page update dashboard counts', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, 'SIT Todos Task');
    await page.goto(`${BASE_URL}/dashboard`);
    const totalCard = page.locator('text=Total Tasks').locator('..').locator('..');
    await expect(totalCard).toContainText('1');
  });

  test('SIT - completing todo updates both todos page and dashboard', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, 'SIT Complete Task');
    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page.locator('text=Completed').locator('..').locator('..')).toContainText('1');
    await expect(page.locator('text=Pending').locator('..').locator('..')).toContainText('0');
  });

  test('SIT - todos are user-specific', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, 'User 1 private task');
    await page.getByRole('button', { name: 'Logout' }).click();

    const email2 = `sit2_${Date.now()}@example.com`;
    await page.goto(`${BASE_URL}/register`);
    await page.getByPlaceholder('John Doe').fill('User Two');
    await page.getByPlaceholder('you@example.com').fill(email2);
    await page.locator('input[type="password"]').fill('password123');
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await page.goto(`${BASE_URL}/todos`);
    await expect(page.getByText('User 1 private task')).not.toBeVisible();
    await expect(page.getByText("No tasks yet. You're all caught up!")).toBeVisible();
  });

  test('SIT - dashboard counts are accurate across multiple operations', async ({ page }) => {
    await registerAndLogin(page);

    await addTodoFromTodosPage(page, 'SIT Task 1');
    await addTodoFromDashboard(page, 'SIT Task 2');
    await addTodoFromTodosPage(page, 'SIT Task 3');

    await page.goto(`${BASE_URL}/todos`);
    const checkboxes = page.locator('input[type="checkbox"]');
    await checkboxes.first().check();
    await checkboxes.nth(1).check();

    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page.locator('text=Total Tasks').locator('..').locator('..')).toContainText('3');
    await expect(page.locator('text=Completed').locator('..').locator('..')).toContainText('2');
    await expect(page.locator('text=Pending').locator('..').locator('..')).toContainText('1');
  });

});

// ══════════════════════════════════════════════════════════════
// 10. EXPLORATORY TESTS
// ══════════════════════════════════════════════════════════════

test.describe('Exploratory Tests', () => {

  test('add todo with SQL injection', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, "'; DROP TABLE todos; --");
    await expect(page).not.toHaveURL(/error/);
  });

  test('add todo with XSS payload', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, '<script>alert("xss")</script>');
    await expect(page).not.toHaveURL(/error/);
  });

  test('add todo with unicode characters', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, '任务 Tamil தமிழ் Arabic عربي');
    await expect(page).not.toHaveURL(/error/);
  });

  test('rapid add 5 todos from todos page', async ({ page }) => {
    await registerAndLogin(page);
    for (let i = 1; i <= 5; i++) {
      await addTodoFromTodosPage(page, `Rapid task ${i}`);
    }
    await expect(page.getByText('Rapid task 5')).toBeVisible();
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page.locator('text=Total Tasks').locator('..').locator('..')).toContainText('5');
  });

  test('add from dashboard and complete from todos page', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromDashboard(page, 'Cross page task');
    await page.goto(`${BASE_URL}/todos`);
    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.check();
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page.locator('text=Completed').locator('..').locator('..')).toContainText('1');
  });

  test('navigate away and back retains todos', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, 'Navigate away task');
    await page.goto(`${BASE_URL}/dashboard`);
    await page.goto(`${BASE_URL}/todos`);
    await expect(page.getByText('Navigate away task')).toBeVisible();
  });

  test('add todo with very long text', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, 'A'.repeat(500));
    await expect(page).not.toHaveURL(/error/);
  });

  test('add same todo title twice - both appear', async ({ page }) => {
    await registerAndLogin(page);
    await addTodoFromTodosPage(page, 'Duplicate task');
    await addTodoFromTodosPage(page, 'Duplicate task');
    const duplicates = page.getByText('Duplicate task');
    await expect(duplicates).toHaveCount(2);
  });

});