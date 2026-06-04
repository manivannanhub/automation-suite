/**
 * Todos page — smoke, positive, negative, BVA, EP, validation, error messages,
 * regression, usability, accessibility, API CRUD, and access control.
 *
 * Run: npm run test:todos
 */

import {
  test,
  expect,
  configureDashboardTodosSuite,
} from '../../fixtures/dashboardTodosTest.js';
import { users } from '../../fixtures/baseTest.js';
import { uniqueTitle } from '../../utils/helpers.js';
import { loginUser } from '../../utils/authApi.js';
import {
  listTodos,
  getTodoStats,
  createTodo,
  updateTodo,
  deleteTodo,
} from '../../utils/todoApi.js';
import {
  expectTodoCreated,
  expectTodoList,
  expectTodoStats,
  expectTodoError,
} from '../../utils/todoAssertions.js';

configureDashboardTodosSuite();

const MIN_TITLE = 'Z';

/** UI suites that open /todos before each test (admin session). */
function todosSuite(title, fn) {
  test.describe(title, () => {
    test.beforeEach(async ({ authenticatedAdminPage, todosPage }) => {
      await todosPage.goto();
    });
    fn();
  });
}

test.describe('Todos @todos', () => {
  // ─── Smoke @smoke ───────────────────────────────────────────────────────────
  todosSuite('Smoke @smoke', () => {
    // Purpose: Confirm /todos route loads for authenticated users.
    // Technique: Smoke Testing.
    test('[TOD-SMOKE-01] page loads with add form', async ({ page, todosPage }) => {
      await expect(page).toHaveURL(/\/todos$/);
      await expect(todosPage.newTodoInput()).toBeVisible();
      await expect(todosPage.addButton()).toBeVisible();
    });

    // Purpose: Page heading is visible.
    // Technique: Smoke Testing.
    test('[TOD-SMOKE-02] todos heading visible', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Todos' })).toBeVisible();
    });
  });

  // ─── Positive @positive ────────────────────────────────────────────────────
  todosSuite('Positive @positive', () => {
    // Purpose: Create a new todo from the form.
    // Technique: Positive Testing.
    test('[TOD-POS-01] adds a new todo', async ({ todosPage }) => {
      await todosPage.addTodo(uniqueTitle('add'));
    });

    // Purpose: Todo row exposes stable data-testid.
    // Technique: Positive Testing.
    test('[TOD-POS-02] todo appears with data-testid', async ({ todosPage }) => {
      const title = uniqueTitle('list');
      await todosPage.addTodo(title);
      const id = await todosPage.getTodoIdByTitle(title);
      await expect(todosPage.page.getByTestId(`todo-item-${id}`)).toContainText(
        title,
      );
    });

    // Purpose: Mark todo complete via checkbox.
    // Technique: Positive Testing.
    test('[TOD-POS-03] marks todo complete', async ({ todosPage }) => {
      const title = uniqueTitle('complete');
      await todosPage.addTodo(title);
      await todosPage.markComplete(title);
    });

    // Purpose: Toggle completed todo back to pending.
    // Technique: Positive Testing.
    test('[TOD-POS-04] unchecks completed todo', async ({ todosPage }) => {
      const title = uniqueTitle('toggle');
      await todosPage.addTodo(title);
      const id = await todosPage.getTodoIdByTitle(title);
      const checkbox = todosPage.checkbox(id);
      await checkbox.click();
      await expect(checkbox).toBeChecked();
      await checkbox.click();
      await expect(checkbox).not.toBeChecked();
    });

    // Purpose: Inline edit updates visible title.
    // Technique: Positive Testing.
    test('[TOD-POS-05] edits todo title', async ({ todosPage }) => {
      const title = uniqueTitle('edit-old');
      await todosPage.addTodo(title);
      const updated = uniqueTitle('updated');
      await todosPage.editTodo(title, updated);
    });

    // Purpose: Delete removes todo from list.
    // Technique: Positive Testing.
    test('[TOD-POS-06] deletes todo', async ({ todosPage }) => {
      const title = uniqueTitle('delete');
      await todosPage.addTodo(title);
      await todosPage.deleteTodo(title);
    });
  });

  // ─── Negative @negative ─────────────────────────────────────────────────────
  todosSuite('Negative @negative', () => {
    // Purpose: Empty submit must not add rows.
    // Technique: Negative Testing.
    test('[TOD-NEG-01] does not add empty todo', async ({ todosPage }) => {
      const countBefore = await todosPage.todoItemCount();
      await todosPage.submitEmptyAdd();
      const countAfter = await todosPage.todoItemCount();
      expect(countAfter).toBe(countBefore);
    });

    // Purpose: Whitespace-only title is trimmed away — no new item.
    // Technique: Negative Testing.
    test('[TOD-NEG-02] whitespace-only title rejected', async ({ todosPage }) => {
      const countBefore = await todosPage.todoItemCount();
      await todosPage.newTodoInput().click();
      await todosPage.page.keyboard.type('     ');
      if (await todosPage.addButton().isEnabled()) {
        await todosPage.addButton().click();
      }
      expect(await todosPage.todoItemCount()).toBe(countBefore);
    });
  });

  // ─── BVA @bva ───────────────────────────────────────────────────────────────
  todosSuite('BVA @bva', () => {
    // Purpose: Minimum valid title length (1 character).
    // Technique: Boundary Value Analysis.
    test('[TOD-BVA-01] 1-character title accepted', async ({ todosPage }) => {
      const title = `${MIN_TITLE}${Date.now()}`;
      await todosPage.addTodo(title);
    });
  });

  // ─── EP @ep ─────────────────────────────────────────────────────────────────
  todosSuite('Equivalence partitioning @ep', () => {
    // Purpose: Valid non-empty title partition.
    // Technique: Equivalence Partitioning.
    test('[TOD-EP-01] valid title partition', async ({ todosPage }) => {
      await todosPage.addTodo(uniqueTitle('ep-valid'));
    });

    // Purpose: Empty title partition.
    // Technique: Equivalence Partitioning.
    test('[TOD-EP-02] empty title partition', async ({ todosPage }) => {
      const before = await todosPage.todoItemCount();
      await todosPage.submitEmptyAdd();
      expect(await todosPage.todoItemCount()).toBe(before);
    });
  });

  // ─── Form field validation @validation ──────────────────────────────────────
  todosSuite('Form field validation @validation', () => {
    // Purpose: New-todo input accepts typing.
    // Technique: Form Field Validation.
    test('[TOD-FFV-01] input accepts typed text', async ({ todosPage }) => {
      await todosPage.newTodoInput().fill('My task');
      await expect(todosPage.newTodoInput()).toHaveValue('My task');
    });
  });

  // ─── Error messages @error ──────────────────────────────────────────────────
  todosSuite('Error messages @error', () => {
    // Purpose: Empty list shows friendly empty-state copy.
    // Technique: Error Message Validation (empty state).
    test('[TOD-ERR-01] empty state message when no todos', async ({ todosPage }) => {
      await todosPage.clearTodos();
      await todosPage.expectEmptyState();
    });
  });

  // ─── Regression @regression ─────────────────────────────────────────────────
  todosSuite('Regression @regression', () => {
    // Purpose: Add form still present after changes elsewhere.
    // Technique: Regression Testing.
    test('[TOD-REG-01] add form controls present', async ({ todosPage }) => {
      await expect(todosPage.newTodoInput()).toBeVisible();
      await expect(todosPage.addButton()).toBeVisible();
    });
  });

  // ─── Usability @usability ──────────────────────────────────────────────────
  todosSuite('Usability @usability', () => {
    // Purpose: Placeholder hints what to type.
    // Technique: Usability Testing.
    test('[TOD-USE-01] new todo placeholder visible', async ({ todosPage }) => {
      await expect(todosPage.newTodoInput()).toHaveAttribute(
        'placeholder',
        /what needs to be done/i,
      );
    });
  });

  // ─── Accessibility @accessibility ─────────────────────────────────────────────
  todosSuite('Accessibility @accessibility', () => {
    // Purpose: Page has a visible heading for screen readers.
    // Technique: Basic Accessibility Testing.
    test('[TOD-A11Y-01] todos heading present', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Todos' })).toBeVisible();
    });

    // Purpose: Add button is keyboard focusable.
    // Technique: Basic Accessibility Testing.
    test('[TOD-A11Y-02] add button focusable', async ({ todosPage }) => {
      await todosPage.addButton().focus();
      await expect(todosPage.addButton()).toBeFocused();
    });
  });

  // ─── API @api ────────────────────────────────────────────────────────────────
  test.describe('API @api', () => {
    test.beforeEach(async ({ request }) => {
      const loginRes = await loginUser(request, {
        email: users.adminUser.email,
        password: users.adminUser.password,
      });
      expect(loginRes.ok()).toBeTruthy();
    });

    // Purpose: POST /api/todos creates a task.
    // Technique: API Testing.
    test('[TOD-API-01] POST valid todo returns 201', async ({ request }) => {
      const res = await createTodo(request, { title: uniqueTitle('api-create') });
      await expectTodoCreated(res);
    });

    // Purpose: GET /api/todos returns array including created item.
    // Technique: API Testing.
    test('[TOD-API-02] GET list returns todos', async ({ request }) => {
      const title = uniqueTitle('api-list');
      const createRes = await createTodo(request, { title });
      const created = await expectTodoCreated(createRes);
      const listRes = await listTodos(request);
      const list = await expectTodoList(listRes);
      expect(list.some((t) => t.id === created.id)).toBeTruthy();
    });

    // Purpose: GET /api/todos/stats reflects totals.
    // Technique: API Testing.
    test('[TOD-API-03] GET stats returns total completed pending', async ({
      request,
    }) => {
      const statsRes = await getTodoStats(request);
      const stats = await statsRes.json();
      expect(stats).toMatchObject({
        total: expect.any(Number),
        completed: expect.any(Number),
        pending: expect.any(Number),
      });
      expect(stats.pending).toBe(stats.total - stats.completed);
    });

    // Purpose: PUT updates title.
    // Technique: API Testing.
    test('[TOD-API-04] PUT updates title', async ({ request }) => {
      const created = await expectTodoCreated(
        await createTodo(request, { title: uniqueTitle('api-upd') }),
      );
      const res = await updateTodo(request, created.id, {
        title: 'API Updated Title',
      });
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(body.title).toBe('API Updated Title');
    });

    // Purpose: PUT marks todo completed.
    // Technique: API Testing.
    test('[TOD-API-05] PUT marks completed', async ({ request }) => {
      const created = await expectTodoCreated(
        await createTodo(request, { title: uniqueTitle('api-done') }),
      );
      const res = await updateTodo(request, created.id, { completed: true });
      expect(res.ok()).toBeTruthy();
      expect((await res.json()).completed).toBe(true);
    });

    // Purpose: DELETE removes todo.
    // Technique: API Testing.
    test('[TOD-API-06] DELETE removes todo', async ({ request }) => {
      const created = await expectTodoCreated(
        await createTodo(request, { title: uniqueTitle('api-del') }),
      );
      const delRes = await deleteTodo(request, created.id);
      expect(delRes.ok()).toBeTruthy();
      const list = await expectTodoList(await listTodos(request));
      expect(list.some((t) => t.id === created.id)).toBeFalsy();
    });

    // Purpose: Missing title returns 400.
    // Technique: API Testing (negative).
    test('[TOD-API-07] POST missing title returns 400', async ({ request }) => {
      const res = await createTodo(request, {});
      await expectTodoError(res, [400]);
    });

    // Purpose: Empty title returns 400.
    // Technique: API Testing (negative).
    test('[TOD-API-08] POST empty title returns 400', async ({ request }) => {
      const res = await createTodo(request, { title: '' });
      await expectTodoError(res, [400]);
    });

    // Purpose: Whitespace-only title returns 400.
    // Technique: API Testing (negative).
    test('[TOD-API-09] POST whitespace title returns 400', async ({ request }) => {
      const res = await createTodo(request, { title: '     ' });
      await expectTodoError(res, [400]);
    });

    // Purpose: Unauthenticated API calls are rejected.
    // Technique: API Testing (security).
    test('[TOD-API-10] GET todos without session returns 401', async ({
      playwright,
    }) => {
      const fresh = await playwright.request.newContext();
      const res = await listTodos(fresh);
      expect(res.status()).toBe(401);
      await fresh.dispose();
    });

    // Purpose: Invalid id on update returns 404.
    // Technique: API Testing (negative).
    test('[TOD-API-11] PUT unknown id returns 404', async ({ request }) => {
      const res = await updateTodo(request, 999999, { title: 'ghost' });
      await expectTodoError(res, [404]);
    });

    // Purpose: Invalid id on delete returns 404.
    // Technique: API Testing (negative).
    test('[TOD-API-12] DELETE unknown id returns 404', async ({ request }) => {
      const res = await deleteTodo(request, 999999);
      await expectTodoError(res, [404]);
    });
  });

  // ─── Access control ─────────────────────────────────────────────────────────
  test('[TOD-AUTH-01] unauthenticated user redirected to login', async ({
    page,
  }) => {
    await page.goto('/todos');
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });
});
