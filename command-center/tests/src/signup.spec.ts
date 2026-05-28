import { test, expect } from '@playwright/test';

function uniqueEmail(): string {
  return `signup_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;
}

test('user can sign up successfully', async ({ page }) => {
  const email = uniqueEmail();

  await page.goto('/register');

  await page.getByTestId('input-name').fill('Signup Test User');
  await page.getByTestId('input-email').fill(email);
  await page.getByTestId('input-password').fill('password123');
  await page.getByTestId('button-register').click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByTestId('text-welcome')).toContainText('Signup Test User');
  await expect(page.getByTestId('button-logout')).toBeVisible();
});

test('user cannot sign up with duplicate email', async ({ page }) => {
  const email = uniqueEmail();

  await page.goto('/register');

  await page.getByTestId('input-name').fill('First Signup User');
  await page.getByTestId('input-email').fill(email);
  await page.getByTestId('input-password').fill('password123');
  await page.getByTestId('button-register').click();

  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto('/register');

  await page.getByTestId('input-name').fill('Duplicate Signup User');
  await page.getByTestId('input-email').fill(email);
  await page.getByTestId('input-password').fill('password123');
  await page.getByTestId('button-register').click();

  await expect(page).toHaveURL(/\/register$/);
  await expect(page.getByTestId('register-error')).toContainText('Email already in use');
});
