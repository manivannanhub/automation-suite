import { test, expect } from '@playwright/test';

test('click signup from home page and create account', async ({ page }) => {
  const email = `home_signup_${Date.now()}@example.com`;

  await page.goto('http://localhost:3005/');

  await expect(page.getByText('Welcome back')).toBeVisible();

  await page.getByTestId('link-register').click();

  await expect(page).toHaveURL(/\/register$/);
  await expect(page.getByText('Create an account')).toBeVisible();

  await page.getByTestId('input-name').fill('Home Signup User');
  await page.getByTestId('input-email').fill(email);
  await page.getByTestId('input-password').fill('password123');
  await page.getByTestId('button-register').click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByTestId('text-welcome')).toContainText('Home Signup User');
});
