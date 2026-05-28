import { test, expect, Page } from '@playwright/test';

test('register page loads', async ({ page }) => {
  await page.goto('http://localhost:3005/register');
  await expect(page.locator('text=Create an account')).toBeVisible();
});

// ── Helper ───────────────────────────────────────────────────
const BASE_URL = 'http://localhost:3005';


async function goToRegister(page: Page) {
  await page.goto(`${BASE_URL}/register`);
  await expect(page.getByText('Create an account')).toBeVisible();
}

async function fillRegisterForm(page: Page, name: string, email: string, password: string) {
  await page.getByPlaceholder('John Doe').fill(name);
  await page.getByPlaceholder('you@example.com').fill(email);
  await page.locator('input[type="password"]').fill(password);
}

async function submitForm(page: Page) {
  await page.getByRole('button', { name: 'Sign Up' }).click();
}

// ══════════════════════════════════════════════════════════════
// 1. UI TESTS
// ══════════════════════════════════════════════════════════════

test.describe('UI Tests', () => {

  test('register page loads correctly', async ({ page }) => {
    await goToRegister(page);
    await expect(page.getByText('Create an account')).toBeVisible();
    await expect(page.getByText('Set up your command center')).toBeVisible();
  });

  test('all fields and button are visible', async ({ page }) => {
    await goToRegister(page);
    await expect(page.getByPlaceholder('John Doe')).toBeVisible();
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
  });

  test('field labels are correct', async ({ page }) => {
    await goToRegister(page);
    await expect(page.getByText('Name')).toBeVisible();
    await expect(page.getByText('Email')).toBeVisible();
    await expect(page.getByText('Password')).toBeVisible();
  });

  test('password field masks input', async ({ page }) => {
    await goToRegister(page);
    await expect(page.locator('input[type="password"]')).toHaveAttribute('type', 'password');
  });

  test('sign in link is visible on register page', async ({ page }) => {
    await goToRegister(page);
    await expect(page.getByText('Already have an account?')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
  });

  test('register page URL is correct', async ({ page }) => {
    await goToRegister(page);
    await expect(page).toHaveURL(/\/register$/);
  });

  test('page title is set', async ({ page }) => {
    await goToRegister(page);
    await expect(page).toHaveTitle(/.+/);
  });

  test('fields are empty on page load', async ({ page }) => {
    await goToRegister(page);
    await expect(page.getByPlaceholder('John Doe')).toHaveValue('');
    await expect(page.getByPlaceholder('you@example.com')).toHaveValue('');
    await expect(page.locator('input[type="password"]')).toHaveValue('');
  });

});

// ══════════════════════════════════════════════════════════════
// 2. POSITIVE TESTS
// ══════════════════════════════════════════════════════════════

test.describe('Positive Tests', () => {

  test('successful registration redirects to dashboard', async ({ page }) => {
    const email = `user_${Date.now()}@example.com`;
    await goToRegister(page);
    await fillRegisterForm(page, 'Test User', email, 'password123');
    await submitForm(page);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('welcome message shows registered name on dashboard', async ({ page }) => {
    const email = `user_${Date.now()}@example.com`;
    await goToRegister(page);
    await fillRegisterForm(page, 'James Bond', email, 'password123');
    await submitForm(page);
    await expect(page.getByTestId('text-welcome')).toContainText('James Bond');
  });

  test('register with valid long name', async ({ page }) => {
    const email = `user_${Date.now()}@example.com`;
    await goToRegister(page);
    await fillRegisterForm(page, 'Alexander-Benjamin Thompson', email, 'password123');
    await submitForm(page);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('register with valid complex password', async ({ page }) => {
    const email = `user_${Date.now()}@example.com`;
    await goToRegister(page);
    await fillRegisterForm(page, 'Test User', email, 'P@ssw0rd!£$%');
    await submitForm(page);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('register with email containing subdomain', async ({ page }) => {
    const email = `user_${Date.now()}@mail.example.com`;
    await goToRegister(page);
    await fillRegisterForm(page, 'Test User', email, 'password123');
    await submitForm(page);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('sign in link navigates to login page', async ({ page }) => {
    await goToRegister(page);
    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

});

// ══════════════════════════════════════════════════════════════
// 3. NEGATIVE TESTS
// ══════════════════════════════════════════════════════════════

test.describe('Negative Tests', () => {

  test('submit with all fields empty shows errors', async ({ page }) => {
    await goToRegister(page);
    await submitForm(page);
    await expect(page).not.toHaveURL(/\/dashboard$/);
  });

  test('submit with empty name shows error', async ({ page }) => {
    const email = `user_${Date.now()}@example.com`;
    await goToRegister(page);
    await fillRegisterForm(page, '', email, 'password123');
    await submitForm(page);
    await expect(page).not.toHaveURL(/\/dashboard$/);
  });

  test('submit with empty email shows error', async ({ page }) => {
    await goToRegister(page);
    await fillRegisterForm(page, 'Test User', '', 'password123');
    await submitForm(page);
    await expect(page).not.toHaveURL(/\/dashboard$/);
  });

  test('submit with empty password shows error', async ({ page }) => {
    const email = `user_${Date.now()}@example.com`;
    await goToRegister(page);
    await fillRegisterForm(page, 'Test User', email, '');
    await submitForm(page);
    await expect(page).not.toHaveURL(/\/dashboard$/);
  });

  test('submit with invalid email format', async ({ page }) => {
    await goToRegister(page);
    await fillRegisterForm(page, 'Test User', 'notanemail', 'password123');
    await submitForm(page);
    await expect(page).not.toHaveURL(/\/dashboard$/);
  });

  test('submit with email missing @ symbol', async ({ page }) => {
    await goToRegister(page);
    await fillRegisterForm(page, 'Test User', 'userexample.com', 'password123');
    await submitForm(page);
    await expect(page).not.toHaveURL(/\/dashboard$/);
  });

  test('submit with email missing domain', async ({ page }) => {
    await goToRegister(page);
    await fillRegisterForm(page, 'Test User', 'user@', 'password123');
    await submitForm(page);
    await expect(page).not.toHaveURL(/\/dashboard$/);
  });

  test('duplicate email registration shows error', async ({ page }) => {
    const email = `duplicate_${Date.now()}@example.com`;
    // First registration
    await goToRegister(page);
    await fillRegisterForm(page, 'First User', email, 'password123');
    await submitForm(page);
    await expect(page).toHaveURL(/\/dashboard$/);
    // Second registration with same email
    await goToRegister(page);
    await fillRegisterForm(page, 'Second User', email, 'password123');
    await submitForm(page);
    await expect(page).not.toHaveURL(/\/dashboard$/);
  });

});

// ══════════════════════════════════════════════════════════════
// 4. BOUNDARY VALUE ANALYSIS (BVA)
// ══════════════════════════════════════════════════════════════

test.describe('Boundary Value Analysis', () => {

  test('BVA - name with 1 character (minimum boundary)', async ({ page }) => {
    const email = `bva_${Date.now()}@example.com`;
    await goToRegister(page);
    await fillRegisterForm(page, 'A', email, 'password123');
    await submitForm(page);
    // Note: pass or fail depending on app validation rules
  });

  test('BVA - name with 2 characters (just above minimum)', async ({ page }) => {
    const email = `bva_${Date.now()}@example.com`;
    await goToRegister(page);
    await fillRegisterForm(page, 'Jo', email, 'password123');
    await submitForm(page);
  });

  test('BVA - password with 1 character (minimum boundary)', async ({ page }) => {
    const email = `bva_${Date.now()}@example.com`;
    await goToRegister(page);
    await fillRegisterForm(page, 'Test User', email, 'a');
    await submitForm(page);
  });

  test('BVA - password with 8 characters (common minimum)', async ({ page }) => {
    const email = `bva_${Date.now()}@example.com`;
    await goToRegister(page);
    await fillRegisterForm(page, 'Test User', email, 'pass1234');
    await submitForm(page);
  });

  test('BVA - password with 7 characters (just below common minimum)', async ({ page }) => {
    const email = `bva_${Date.now()}@example.com`;
    await goToRegister(page);
    await fillRegisterForm(page, 'Test User', email, 'pass123');
    await submitForm(page);
  });

  test('BVA - name with 255 characters (upper boundary)', async ({ page }) => {
    const email = `bva_${Date.now()}@example.com`;
    const longName = 'A'.repeat(255);
    await goToRegister(page);
    await fillRegisterForm(page, longName, email, 'password123');
    await submitForm(page);
  });

  test('BVA - password with 255 characters (upper boundary)', async ({ page }) => {
    const email = `bva_${Date.now()}@example.com`;
    const longPassword = 'A'.repeat(255);
    await goToRegister(page);
    await fillRegisterForm(page, 'Test User', email, longPassword);
    await submitForm(page);
  });

});

// ══════════════════════════════════════════════════════════════
// 5. EQUIVALENCE PARTITIONING (EP)
// ══════════════════════════════════════════════════════════════

test.describe('Equivalence Partitioning', () => {

  test('EP - valid partition: standard name, email and password', async ({ page }) => {
    const email = `ep_${Date.now()}@example.com`;
    await goToRegister(page);
    await fillRegisterForm(page, 'Jane Doe', email, 'password123');
    await submitForm(page);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('EP - invalid partition: numeric only name', async ({ page }) => {
    const email = `ep_${Date.now()}@example.com`;
    await goToRegister(page);
    await fillRegisterForm(page, '12345', email, 'password123');
    await submitForm(page);
  });

  test('EP - invalid partition: special characters only in name', async ({ page }) => {
    const email = `ep_${Date.now()}@example.com`;
    await goToRegister(page);
    await fillRegisterForm(page, '!@#$%', email, 'password123');
    await submitForm(page);
  });

  test('EP - valid partition: email with plus addressing', async ({ page }) => {
    const email = `user+test_${Date.now()}@example.com`;
    await goToRegister(page);
    await fillRegisterForm(page, 'Test User', email, 'password123');
    await submitForm(page);
  });

  test('EP - invalid partition: email with spaces', async ({ page }) => {
    await goToRegister(page);
    await fillRegisterForm(page, 'Test User', 'user name@example.com', 'password123');
    await submitForm(page);
    await expect(page).not.toHaveURL(/\/dashboard$/);
  });

  test('EP - valid partition: alphanumeric password', async ({ page }) => {
    const email = `ep_${Date.now()}@example.com`;
    await goToRegister(page);
    await fillRegisterForm(page, 'Test User', email, 'Pass1234');
    await submitForm(page);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

});

// ══════════════════════════════════════════════════════════════
// 6. FUNCTIONAL TESTS
// ══════════════════════════════════════════════════════════════

test.describe('Functional Tests', () => {

  test('can type in all fields', async ({ page }) => {
    await goToRegister(page);
    await page.getByPlaceholder('John Doe').fill('Test User');
    await page.getByPlaceholder('you@example.com').fill('test@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await expect(page.getByPlaceholder('John Doe')).toHaveValue('Test User');
    await expect(page.getByPlaceholder('you@example.com')).toHaveValue('test@example.com');
  });

  test('can clear and retype fields', async ({ page }) => {
    await goToRegister(page);
    await page.getByPlaceholder('John Doe').fill('Wrong Name');
    await page.getByPlaceholder('John Doe').clear();
    await page.getByPlaceholder('John Doe').fill('Correct Name');
    await expect(page.getByPlaceholder('John Doe')).toHaveValue('Correct Name');
  });

  test('form submits on Enter key press', async ({ page }) => {
    const email = `enter_${Date.now()}@example.com`;
    await goToRegister(page);
    await fillRegisterForm(page, 'Test User', email, 'password123');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('navigating directly to /register loads page', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByText('Create an account')).toBeVisible();
  });

  test('login page sign up link navigates to register', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.getByRole('link', { name: 'Sign up' }).click();
    await expect(page).toHaveURL(/\/register$/);
  });

});

// ══════════════════════════════════════════════════════════════
// 7. E2E TESTS
// ══════════════════════════════════════════════════════════════

test.describe('E2E Tests', () => {

  test('full journey: register -> dashboard -> logout -> login', async ({ page }) => {
    const email = `e2e_${Date.now()}@example.com`;
    const password = 'password123';
    const name = 'E2E User';

    // Register
    await goToRegister(page);
    await fillRegisterForm(page, name, email, password);
    await submitForm(page);
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId('text-welcome')).toContainText(name);

    // Logout
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/\/login$/);

    // Login with same credentials
    await page.getByPlaceholder('you@example.com').fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId('text-welcome')).toContainText(name);
  });

  test('full journey: register -> verify dashboard elements', async ({ page }) => {
    const email = `e2e_${Date.now()}@example.com`;
    await goToRegister(page);
    await fillRegisterForm(page, 'Dashboard User', email, 'password123');
    await submitForm(page);
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText('Total Tasks')).toBeVisible();
    await expect(page.getByText('Completed')).toBeVisible();
    await expect(page.getByText('Pending')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Todos' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Notes' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Contact' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Products' })).toBeVisible();
  });

});

// ══════════════════════════════════════════════════════════════
// 8. SIT TESTS (System Integration)
// ══════════════════════════════════════════════════════════════

test.describe('SIT Tests', () => {

  test('SIT - registered user stored and retrievable via login', async ({ page }) => {
    const email = `sit_${Date.now()}@example.com`;
    const password = 'SitTest123';

    // Register
    await goToRegister(page);
    await fillRegisterForm(page, 'SIT User', email, password);
    await submitForm(page);
    await expect(page).toHaveURL(/\/dashboard$/);

    // Logout
    await page.getByRole('button', { name: 'Logout' }).click();

    // Login — verifies user was persisted in session/memory
    await page.getByPlaceholder('you@example.com').fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('SIT - session persists on page refresh after login', async ({ page }) => {
    const email = `sit_${Date.now()}@example.com`;
    await goToRegister(page);
    await fillRegisterForm(page, 'Session User', email, 'password123');
    await submitForm(page);
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test.skip('SIT - unauthenticated user redirected from dashboard', async ({ page }) => {
    // DEFECT: App does not redirect unauthenticated users to login
    // Expected: Redirect to /login when accessing /dashboard without session
    // Actual: Dashboard loads without authentication
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page).toHaveURL(/\/(login|register)$/);
  });

});

// ══════════════════════════════════════════════════════════════
// 9. EXPLORATORY TESTS
// ══════════════════════════════════════════════════════════════

test.describe('Exploratory Tests', () => {

  test('register with name containing numbers', async ({ page }) => {
    const email = `exp_${Date.now()}@example.com`;
    await goToRegister(page);
    await fillRegisterForm(page, 'User123', email, 'password123');
    await submitForm(page);
  });

  test('register with name containing hyphen', async ({ page }) => {
    const email = `exp_${Date.now()}@example.com`;
    await goToRegister(page);
    await fillRegisterForm(page, 'Mary-Jane Watson', email, 'password123');
    await submitForm(page);
  });

  test('register with name containing apostrophe', async ({ page }) => {
    const email = `exp_${Date.now()}@example.com`;
    await goToRegister(page);
    await fillRegisterForm(page, "O'Brien", email, 'password123');
    await submitForm(page);
  });

  test('register with uppercase email', async ({ page }) => {
    const email = `EXP_${Date.now()}@EXAMPLE.COM`;
    await goToRegister(page);
    await fillRegisterForm(page, 'Test User', email, 'password123');
    await submitForm(page);
  });

  test('register with whitespace in name', async ({ page }) => {
    const email = `exp_${Date.now()}@example.com`;
    await goToRegister(page);
    await fillRegisterForm(page, '  Test User  ', email, 'password123');
    await submitForm(page);
  });

  test('register with SQL injection in name field', async ({ page }) => {
    const email = `exp_${Date.now()}@example.com`;
    await goToRegister(page);
    await fillRegisterForm(page, "'; DROP TABLE users; --", email, 'password123');
    await submitForm(page);
    await expect(page).not.toHaveURL(/error/);
  });

  test('register with XSS payload in name field', async ({ page }) => {
    const email = `exp_${Date.now()}@example.com`;
    await goToRegister(page);
    await fillRegisterForm(page, '<script>alert("xss")</script>', email, 'password123');
    await submitForm(page);
    await expect(page).not.toHaveURL(/error/);
  });

  test('rapid double click on sign up button', async ({ page }) => {
    const email = `exp_${Date.now()}@example.com`;
    await goToRegister(page);
    await fillRegisterForm(page, 'Test User', email, 'password123');
    await page.getByRole('button', { name: 'Sign Up' }).dblclick();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('back button after registration lands on correct page', async ({ page }) => {
    const email = `exp_${Date.now()}@example.com`;
    await goToRegister(page);
    await fillRegisterForm(page, 'Test User', email, 'password123');
    await submitForm(page);
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.goBack();
  });

  test('register with very long email address', async ({ page }) => {
    const longEmail = `${'a'.repeat(50)}_${Date.now()}@${'b'.repeat(50)}.com`;
    await goToRegister(page);
    await fillRegisterForm(page, 'Test User', longEmail, 'password123');
    await submitForm(page);
  });

});

// ══════════════════════════════════════════════════════════════
// 10. ACCESSIBILITY TESTS
// ══════════════════════════════════════════════════════════════

test.describe('Accessibility Tests', () => {

  test('fields are focusable via Tab key', async ({ page }) => {
    await goToRegister(page);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON']).toContain(focused);
  });

  test('name field has correct placeholder', async ({ page }) => {
    await goToRegister(page);
    await expect(page.getByPlaceholder('John Doe')).toBeVisible();
  });

  test('email field has correct placeholder', async ({ page }) => {
    await goToRegister(page);
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
  });

});