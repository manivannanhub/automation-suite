/**
 * Dashboard page — smoke, positive, negative, BVA, EP, validation, regression,
 * usability, accessibility, and SIT integration with Todos.
 *
 * Run: npm run test:dashboard
 */

import {
  test,
  expect,
  configureDashboardTodosSuite,
} from '../../fixtures/dashboardTodosTest.js';
import { users } from '../../fixtures/baseTest.js';
import { uniqueEmail, uniqueTitle } from '../../utils/helpers.js';
import { registerUser } from '../../utils/authApi.js';

const SIT_PASSWORD = 'Password123';

configureDashboardTodosSuite();

const MIN_TASK_TITLE = 'A';

/** UI suites that open /dashboard before each test (admin session). */
function dashboardSuite(title, fn) {
  test.describe(title, () => {
    test.beforeEach(async ({ authenticatedAdminPage, dashboardPage }) => {
      await dashboardPage.goto();
      await dashboardPage.expectLoaded();
    });
    fn();
  });
}

test.describe('Dashboard @dashboard', () => {
  // ─── Smoke @smoke ─────────────────────────────────────────────────────────
  dashboardSuite('Smoke @smoke', () => {
    // Purpose: Confirm authenticated users reach the dashboard route.
    // Technique: Smoke Testing.
    test('[DASH-SMOKE-01] page loads at /dashboard', async ({ page }) => {
      await expect(page).toHaveURL(/\/dashboard$/);
    });

    // Purpose: Verify welcome copy is visible after login.
    // Technique: Smoke Testing.
    test('[DASH-SMOKE-02] welcome message visible', async ({ dashboardPage }) => {
      await expect(dashboardPage.page.getByTestId('text-welcome')).toContainText(
        /welcome back/i,
      );
    });

    // Purpose: Ensure summary stat cards render.
    // Technique: Smoke Testing.
    test('[DASH-SMOKE-03] stat cards visible', async ({ dashboardPage }) => {
      await dashboardPage.expectStatCards();
    });

    // Purpose: Quick-add controls are on screen for power users.
    // Technique: Smoke Testing.
    test('[DASH-SMOKE-04] quick-add todo controls visible', async ({
      dashboardPage,
    }) => {
      await expect(dashboardPage.quickTodoInput()).toBeVisible();
      await expect(dashboardPage.quickAddButton()).toBeVisible();
    });

    // Purpose: Primary sidebar links are available.
    // Technique: Smoke Testing.
    test('[DASH-SMOKE-05] sidebar navigation visible', async ({ dashboardPage }) => {
      await dashboardPage.expectSidebarNav();
    });
  });

  // ─── Positive @positive ─────────────────────────────────────────────────────
  dashboardSuite('Positive @positive', () => {
    // Purpose: Quick-add creates a task reachable from Todos page.
    // Technique: Positive Testing.
    test('[DASH-POS-01] quick-add todo appears on todos page', async ({
      dashboardPage,
      appLayout,
      page,
    }) => {
      const title = uniqueTitle('quick');
      await dashboardPage.quickAddTodo(title);
      await appLayout.goToTodos();
      await expect(page).toHaveURL(/\/todos$/);
      await expect(page.getByText(title, { exact: true })).toBeVisible();
    });

    // Purpose: Admin email appears in the shell after login.
    // Technique: Positive Testing.
    test('[DASH-POS-02] shows logged-in user email', async ({ dashboardPage }) => {
      await dashboardPage.expectUserEmail(users.adminUser.email);
    });

    // Purpose: Navigate to Todos from sidebar.
    // Technique: Positive Testing.
    test('[DASH-POS-03] todos link navigates to /todos', async ({
      appLayout,
      page,
    }) => {
      await appLayout.goToTodos();
      await expect(page).toHaveURL(/\/todos$/);
    });
  });

  // ─── Negative @negative ─────────────────────────────────────────────────────
  dashboardSuite('Negative @negative', () => {
    // Purpose: Empty quick-add must not change total count.
    // Technique: Negative Testing.
    test('[DASH-NEG-01] empty quick-add does not increase total', async ({
      dashboardPage,
    }) => {
      const before = await dashboardPage.readStatCounts();
      await expect(dashboardPage.quickAddButton()).toBeDisabled();
      await dashboardPage.expectStatCounts(before);
    });

    // Purpose: Whitespace-only quick-add is rejected client-side.
    // Technique: Negative Testing.
    test('[DASH-NEG-02] whitespace-only quick-add ignored', async ({
      dashboardPage,
    }) => {
      const before = await dashboardPage.readStatCounts();
      await dashboardPage.quickTodoInput().fill('     ');
      await expect(dashboardPage.quickAddButton()).toBeDisabled();
      await dashboardPage.expectStatCounts(before);
    });
  });

  // ─── BVA @bva ─────────────────────────────────────────────────────────────
  dashboardSuite('BVA @bva', () => {
    // Purpose: Minimum valid title length (1 char) via quick-add.
    // Technique: Boundary Value Analysis.
    test('[DASH-BVA-01] quick-add with 1-char title', async ({
      dashboardPage,
      appLayout,
      page,
    }) => {
      const title = `${MIN_TASK_TITLE}${Date.now()}`;
      const before = await dashboardPage.readStatCounts();
      await dashboardPage.quickAddTodo(title);
      await dashboardPage.expectStatCountsEventually({
        total: before.total + 1,
        completed: before.completed,
        pending: before.pending + 1,
      });
      await appLayout.goToTodos();
      await expect(page.getByText(title, { exact: true })).toBeVisible();
    });
  });

  // ─── EP @ep ─────────────────────────────────────────────────────────────────
  dashboardSuite('Equivalence partitioning @ep', () => {
    // Purpose: Valid title partition succeeds.
    // Technique: Equivalence Partitioning.
    test('[DASH-EP-01] valid title partition increases total', async ({
      dashboardPage,
    }) => {
      const before = await dashboardPage.readStatCounts();
      await dashboardPage.quickAddTodo(uniqueTitle('ep-valid'));
      await dashboardPage.expectStatCountsEventually({
        total: before.total + 1,
        completed: before.completed,
        pending: before.pending + 1,
      });
    });

    // Purpose: Empty title partition does not create work.
    // Technique: Equivalence Partitioning.
    test('[DASH-EP-02] empty title partition unchanged stats', async ({
      dashboardPage,
    }) => {
      const before = await dashboardPage.readStatCounts();
      await expect(dashboardPage.quickAddButton()).toBeDisabled();
      await dashboardPage.expectStatCounts(before);
    });
  });

  // ─── Form field validation @validation ────────────────────────────────────
  dashboardSuite('Form field validation @validation', () => {
    // Purpose: Quick-add input accepts typed text.
    // Technique: Form Field Validation.
    test('[DASH-FFV-01] quick-add input stores typed value', async ({
      dashboardPage,
    }) => {
      await dashboardPage.quickTodoInput().fill('Draft task');
      await expect(dashboardPage.quickTodoInput()).toHaveValue('Draft task');
    });
  });

  // ─── Regression @regression ─────────────────────────────────────────────────
  dashboardSuite('Regression @regression', () => {
    // Purpose: Core dashboard layout remains available.
    // Technique: Regression Testing.
    test('[DASH-REG-01] stat cards and welcome still present', async ({
      dashboardPage,
    }) => {
      await dashboardPage.expectStatCards();
      await expect(dashboardPage.page.getByTestId('text-welcome')).toBeVisible();
    });

    // Purpose: Sidebar still exposes Todos route.
    // Technique: Regression Testing.
    test('[DASH-REG-02] todos nav link still visible', async ({ page }) => {
      await expect(page.getByRole('link', { name: 'Todos' })).toBeVisible();
    });
  });

  // ─── Usability @usability ──────────────────────────────────────────────────
  dashboardSuite('Usability @usability', () => {
    // Purpose: Logout control is discoverable.
    // Technique: Usability Testing.
    test('[DASH-USE-01] logout button visible', async ({ appLayout }) => {
      await expect(appLayout.logoutButton()).toBeVisible();
    });
  });

  // ─── Accessibility @accessibility ───────────────────────────────────────────
  dashboardSuite('Accessibility @accessibility', () => {
    // Purpose: Welcome region is exposed to assistive tech via test id.
    // Technique: Basic Accessibility Testing.
    test('[DASH-A11Y-01] welcome region visible', async ({ dashboardPage }) => {
      await expect(
        dashboardPage.page.getByTestId('text-welcome'),
      ).toBeVisible();
    });

    // Purpose: Quick-add uses a focusable button role.
    // Technique: Basic Accessibility Testing.
    test('[DASH-A11Y-02] quick-add input is focusable', async ({
      dashboardPage,
    }) => {
      await dashboardPage.quickTodoInput().focus();
      await expect(dashboardPage.quickTodoInput()).toBeFocused();
    });
  });

  // ─── SIT Integration @integration @sit ──────────────────────────────────────
  test.describe('SIT Integration @integration @sit', () => {
    test.describe.configure({ timeout: 60_000 });

    test.beforeEach(async ({
      page,
      request,
      loginPage,
      dashboardPage,
      trackEmail,
    }) => {
      const email = uniqueEmail('sit');
      trackEmail(email);
      const res = await registerUser(request, {
        name: 'SIT User',
        email,
        password: SIT_PASSWORD,
      });
      expect(res.status()).toBe(201);
      await loginPage.goto();
      await loginPage.login(email, SIT_PASSWORD);
      await page.waitForURL(/\/dashboard$/);
      await dashboardPage.expectLoaded();
      await dashboardPage.expectStatCounts({ total: 0, completed: 0, pending: 0 });
    });

    // Purpose: Add task on Todos → verify dashboard total increases.
    // Technique: SIT Integration Testing.
    test('[DASH-SIT-01] add task updates dashboard total', async ({
      dashboardPage,
      todosPage,
      appLayout,
    }) => {
      const title = uniqueTitle('sit-add');
      await appLayout.goToTodos();
      await todosPage.addTodo(title);
      await appLayout.goToDashboard();
      await dashboardPage.expectStatCountsEventually({
        total: 1,
        completed: 0,
        pending: 1,
      });
    });

    // Purpose: Edit task title → total/completed unchanged on dashboard.
    // Technique: SIT Integration Testing.
    test('[DASH-SIT-02] modify task keeps dashboard counts', async ({
      dashboardPage,
      todosPage,
      appLayout,
    }) => {
      const title = uniqueTitle('sit-edit');
      const edited = `${title}-updated`;
      await appLayout.goToTodos();
      await todosPage.addTodo(title);
      await todosPage.editTodo(title, edited);
      await appLayout.goToDashboard();
      await dashboardPage.expectStatCountsEventually({
        total: 1,
        completed: 0,
        pending: 1,
      });
    });

    // Purpose: Complete task → completed count increases, pending decreases.
    // Technique: SIT Integration Testing.
    test('[DASH-SIT-03] complete task updates completed count', async ({
      dashboardPage,
      todosPage,
      appLayout,
    }) => {
      const title = uniqueTitle('sit-done');
      await appLayout.goToTodos();
      await todosPage.addTodo(title);
      await todosPage.markComplete(title);
      await appLayout.goToDashboard();
      await dashboardPage.expectStatCountsEventually({
        total: 1,
        completed: 1,
        pending: 0,
      });
    });

    // Purpose: Delete task → dashboard total decreases.
    // Technique: SIT Integration Testing.
    test('[DASH-SIT-04] delete task decreases dashboard total', async ({
      dashboardPage,
      todosPage,
      appLayout,
    }) => {
      const title = uniqueTitle('sit-del');
      await appLayout.goToTodos();
      await todosPage.addTodo(title);
      await todosPage.deleteTodo(title);
      await appLayout.goToDashboard();
      await dashboardPage.expectStatCountsEventually({
        total: 0,
        completed: 0,
        pending: 0,
      });
    });
  });

  // ─── Access control ─────────────────────────────────────────────────────────
  test('[DASH-AUTH-01] unauthenticated user redirected to login', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });
});
