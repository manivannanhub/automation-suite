import { test, expect } from '../../fixtures/baseTest.js';
import { uniqueTitle } from '../../utils/helpers.js';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ authenticatedPage, dashboardPage }) => {
    await dashboardPage.goto();
    await dashboardPage.expectLoaded();
  });

  test('[DASH-01] shows welcome and stat cards', async ({ dashboardPage }) => {
    await dashboardPage.expectStatCards();
  });

  test('[DASH-02] sidebar navigation is visible', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Todos' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Notes' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Contact' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Products' })).toBeVisible();
  });

  test('[DASH-03] quick-add todo appears on Todos page', async ({
    dashboardPage,
    appLayout,
    todosPage,
    page,
  }) => {
    const title = uniqueTitle('quick');
    await dashboardPage.quickAddTodo(title);
    await appLayout.goToTodos();
    await expect(page).toHaveURL(/\/todos$/);
    await expect(page.getByText(title, { exact: true })).toBeVisible();
  });
});
