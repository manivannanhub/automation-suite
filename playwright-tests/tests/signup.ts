import { test, expect } from '@playwright/test';

test('signup from home page, verify dashboard and logout', async ({ page }) => {
  const email = `home_signup_${Date.now()}@example.com`;
  const name = 'Home Signup User';

  // ── 1. Go to home / login page ──────────────────────────────
  await page.goto('http://localhost:3005/');
  await expect(page.getByText('Welcome back')).toBeVisible();
  await expect(page.getByText('Enter your credentials to access your command center')).toBeVisible();

  // ── 2. Click Sign Up link ────────────────────────────────────
  await page.getByRole('link', { name: 'Sign up' }).click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.getByText('Create an account')).toBeVisible();

  // ── 3. Fill registration form ────────────────────────────────
  await page.getByTestId('input-name').fill(name);
  await page.getByTestId('input-email').fill(email);
  await page.getByTestId('input-password').fill('password123');
  await page.getByTestId('button-register').click();

  // ── 4. Verify redirect to dashboard ─────────────────────────
  await expect(page).toHaveURL(/\/dashboard$/);

  // ── 5. Verify welcome message ────────────────────────────────
  await expect(page.getByTestId('text-welcome')).toContainText(name);
  await expect(page.getByText("Here is your summary for today. Let's get things done.")).toBeVisible();

  // ── 6. Verify dashboard summary cards ────────────────────────
  await expect(page.getByText('Total Tasks')).toBeVisible();
  await expect(page.getByText('Completed')).toBeVisible();
  await expect(page.getByText('Pending')).toBeVisible();

  // ── 7. Verify Quick Add Todo section ─────────────────────────
  await expect(page.getByText('Quick Add Todo')).toBeVisible();
  await expect(page.getByPlaceholder('What needs to be done?')).toBeVisible();
  await expect(page.getByRole('button', { name: /Add/i })).toBeVisible();

  // ── 8. Verify sidebar navigation links ───────────────────────
  await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Todos' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Notes' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Contact' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Products' })).toBeVisible();

  // ── 9. Verify user info in sidebar ───────────────────────────
  await expect(page.locator('span[class*="text-sidebar-foreground"]').getByText(name)).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();

  // ── 10. Logout and verify redirect to login page ─────────────
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText('Welcome back')).toBeVisible();
  await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
});