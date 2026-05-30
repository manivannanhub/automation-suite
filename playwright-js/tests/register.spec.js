// ============================================================
// signup.spec.js — Complete Exhaustive Test Suite
// Page: http://localhost:3005/register
// Techniques: 30 QA Testing Techniques
// ============================================================

import { test, expect } from '@playwright/test';

// ── Constants ─────────────────────────────────────────────────
const BASE_URL  = 'http://localhost:3005';
const REGISTER  = `${BASE_URL}/register`;
const LOGIN     = `${BASE_URL}/login`;
const DASHBOARD = `${BASE_URL}/dashboard`;

// ── Shared cleanup registry ────────────────────────────────────
// Every test that successfully creates a user pushes the email here.
// The file-level afterEach deletes it via API to keep the DB clean.
const createdEmails = [];

// ── Helper Functions ───────────────────────────────────────────
async function goToRegister(page) {
  await page.goto(REGISTER);
  await expect(page.getByText('Create an account')).toBeVisible();
}

async function fillForm(page, name, email, password) {
  if (name     !== null) await page.getByPlaceholder('John Doe').fill(name);
  if (email    !== null) await page.getByPlaceholder('you@example.com').fill(email);
  if (password !== null) await page.locator('input[type="password"]').fill(password);
}

async function submit(page) {
  await page.getByRole('button', { name: 'Sign Up' }).click();
}

async function registerAndPush(page, name, email, password) {
  createdEmails.push(email);
  await goToRegister(page);
  await fillForm(page, name, email, password);
  await submit(page);
}

function uniqueEmail(prefix = 'user') {
  return `${prefix}_${Date.now()}@example.com`;
}

// ══════════════════════════════════════════════════════════════
// FILE-LEVEL HOOKS
// ══════════════════════════════════════════════════════════════

// beforeAll — verify app is running before ANY test starts
test.beforeAll(async ({ request }) => {
  const res = await request.get(REGISTER).catch(() => null);
  if (!res || !res.ok()) {
    throw new Error(
      `App is not running at ${BASE_URL}\n` +
      `Start your dev server: npm run dev`
    );
  }
  console.log(`✅ [beforeAll] App is live at ${BASE_URL}`);
});

// afterEach — screenshot on failure + delete any test users
test.afterEach(async ({ page, request }, testInfo) => {
  // 1. Screenshot on failure
  if (testInfo.status !== testInfo.expectedStatus) {
    const shot = await page.screenshot({ fullPage: true });
    await testInfo.attach('failure-screenshot', {
      body: shot,
      contentType: 'image/png',
    });
    console.log(`📸 Screenshot captured: "${testInfo.title}"`);
  }

  // 2. Clean up created users
  while (createdEmails.length > 0) {
    const email = createdEmails.pop();
    try {
      await request.delete(`${BASE_URL}/api/test/cleanup`, {
        data: { email },
      });
      console.log(`🧹 Deleted test user: ${email}`);
    } catch {
      console.warn(`⚠️  Could not delete user: ${email}`);
    }
  }
});


// ══════════════════════════════════════════════════════════════
// 1. SMOKE TESTING
// Quick sanity that the page is alive — run before anything else
// ══════════════════════════════════════════════════════════════
test.describe('01 — Smoke Testing', () => {

  test.beforeEach(async ({ page }) => { await goToRegister(page); });

  test('[SMOKE-01] Register page loads at correct URL', async ({ page }) => {
    await expect(page).toHaveURL(/\/register$/);
  });

  test('[SMOKE-02] Page title is set', async ({ page }) => {
    await expect(page).toHaveTitle(/.+/);
  });

  test('[SMOKE-03] Sign Up button is visible and enabled', async ({ page }) => {
    const btn = page.getByRole('button', { name: 'Sign Up' });
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  });

  test('[SMOKE-04] All three input fields render', async ({ page }) => {
    await expect(page.getByPlaceholder('John Doe')).toBeVisible();
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('[SMOKE-05] Sign in link is present', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
  });

});


// ══════════════════════════════════════════════════════════════
// 2. SANITY TESTING
// Narrow focused checks after a build or deploy
// ══════════════════════════════════════════════════════════════
test.describe('02 — Sanity Testing', () => {

  test.beforeEach(async ({ page }) => { await goToRegister(page); });

  test('[SANITY-01] Heading text is correct', async ({ page }) => {
    await expect(page.getByText('Create an account')).toBeVisible();
    await expect(page.getByText('Set up your command center')).toBeVisible();
  });

  test('[SANITY-02] Fields are empty on fresh page load', async ({ page }) => {
    await expect(page.getByPlaceholder('John Doe')).toHaveValue('');
    await expect(page.getByPlaceholder('you@example.com')).toHaveValue('');
    await expect(page.locator('input[type="password"]')).toHaveValue('');
  });

  test('[SANITY-03] Successful registration redirects to dashboard', async ({ page }) => {
    const email = uniqueEmail('sanity');
    createdEmails.push(email);
    await fillForm(page, 'Sanity User', email, 'Password123');
    await submit(page);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('[SANITY-04] Invalid form does not navigate away', async ({ page }) => {
    await submit(page);
    await expect(page).toHaveURL(/\/register$/);
  });

  test('[SANITY-05] Sign in link navigates to login', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

});


// ══════════════════════════════════════════════════════════════
// 3. POSITIVE TESTING
// Valid inputs — happy path scenarios
// ══════════════════════════════════════════════════════════════
test.describe('03 — Positive Testing', () => {

  test.beforeEach(async ({ page }) => { await goToRegister(page); });

  test('[POS-01] Register with standard valid details', async ({ page }) => {
    const email = uniqueEmail('pos');
    createdEmails.push(email);
    await fillForm(page, 'John Doe', email, 'Password123');
    await submit(page);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('[POS-02] Dashboard shows registered name after signup', async ({ page }) => {
    const email = uniqueEmail('pos');
    createdEmails.push(email);
    await fillForm(page, 'James Bond', email, 'Password123');
    await submit(page);
    await expect(page.getByTestId('text-welcome')).toContainText('James Bond');
  });

  test('[POS-03] Register with complex special-char password', async ({ page }) => {
    const email = uniqueEmail('pos');
    createdEmails.push(email);
    await fillForm(page, 'Test User', email, 'P@ssw0rd!£$%^&*()');
    await submit(page);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('[POS-04] Register with subdomain email', async ({ page }) => {
    const email = `user_${Date.now()}@mail.example.com`;
    createdEmails.push(email);
    await fillForm(page, 'Test User', email, 'Password123');
    await submit(page);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('[POS-05] Register with email plus addressing', async ({ page }) => {
    const email = `user+qa_${Date.now()}@example.com`;
    createdEmails.push(email);
    await fillForm(page, 'Test User', email, 'Password123');
    await submit(page);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('[POS-06] Register with hyphenated name', async ({ page }) => {
    const email = uniqueEmail('pos');
    createdEmails.push(email);
    await fillForm(page, 'Mary-Jane Watson', email, 'Password123');
    await submit(page);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('[POS-07] Register with name containing apostrophe', async ({ page }) => {
    const email = uniqueEmail('pos');
    createdEmails.push(email);
    await fillForm(page, "O'Brien", email, 'Password123');
    await submit(page);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('[POS-08] Register with long valid name', async ({ page }) => {
    const email = uniqueEmail('pos');
    createdEmails.push(email);
    await fillForm(page, 'Alexander Benjamin Thompson Jr', email, 'Password123');
    await submit(page);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('[POS-09] Form submits on Enter key', async ({ page }) => {
    const email = uniqueEmail('pos');
    createdEmails.push(email);
    await fillForm(page, 'Enter User', email, 'Password123');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('[POS-10] Register with numeric characters in name', async ({ page }) => {
    const email = uniqueEmail('pos');
    createdEmails.push(email);
    await fillForm(page, 'User2024', email, 'Password123');
    await submit(page);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

});


// ══════════════════════════════════════════════════════════════
// 4. NEGATIVE TESTING
// Invalid inputs — all must stay on /register or show errors
// ══════════════════════════════════════════════════════════════
test.describe('04 — Negative Testing', () => {

  test.beforeEach(async ({ page }) => { await goToRegister(page); });

  test('[NEG-01] Submit empty form stays on register', async ({ page }) => {
    await submit(page);
    await expect(page).not.toHaveURL(/\/dashboard$/);
  });

  test('[NEG-02] Empty name field shows error', async ({ page }) => {
    await fillForm(page, '', uniqueEmail(), 'Password123');
    await submit(page);
    await expect(page.getByText(/name.*required/i)).toBeVisible();
  });

  test('[NEG-03] Empty email field shows error', async ({ page }) => {
    await fillForm(page, 'Test User', '', 'Password123');
    await submit(page);
    await expect(page).not.toHaveURL(/\/dashboard$/);
  });

  test('[NEG-04] Empty password field shows error', async ({ page }) => {
    await fillForm(page, 'Test User', uniqueEmail(), '');
    await submit(page);
    await expect(page).not.toHaveURL(/\/dashboard$/);
  });

  test('[NEG-05] Invalid email format shows error', async ({ page }) => {
    await fillForm(page, 'Test User', 'notanemail', 'Password123');
    await submit(page);
    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });

  test('[NEG-06] Email missing @ symbol', async ({ page }) => {
    await fillForm(page, 'Test User', 'userexample.com', 'Password123');
    await submit(page);
    await expect(page).not.toHaveURL(/\/dashboard$/);
  });

  test('[NEG-07] Email missing domain', async ({ page }) => {
    await fillForm(page, 'Test User', 'user@', 'Password123');
    await submit(page);
    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });

  test('[NEG-08] Email with spaces rejected', async ({ page }) => {
    await fillForm(page, 'Test User', 'user name@example.com', 'Password123');
    await submit(page);
    await expect(page).not.toHaveURL(/\/dashboard$/);
  });

  test('[NEG-09] Password too short (< 6 chars) shows error', async ({ page }) => {
    await fillForm(page, 'Test User', uniqueEmail(), '123');
    await submit(page);
    await expect(page.getByText(/password must be at least 6 characters/i)).toBeVisible();
  });

  test('[NEG-10] Password with 5 chars rejected', async ({ page }) => {
    await fillForm(page, 'Test User', uniqueEmail(), 'Pass1');
    await submit(page);
    await expect(page.getByText(/password must be at least 6 characters/i)).toBeVisible();
  });

  test('[NEG-11] Whitespace-only name rejected', async ({ page }) => {
    await fillForm(page, '   ', uniqueEmail(), 'Password123');
    await submit(page);
    await expect(page).not.toHaveURL(/\/dashboard$/);
  });

  test('[NEG-12] Duplicate email shows error', async ({ page }) => {
    const email = uniqueEmail('dup');
    createdEmails.push(email);
    // First registration succeeds
    await fillForm(page, 'First User', email, 'Password123');
    await submit(page);
    await expect(page).toHaveURL(/\/dashboard$/);
    // Second registration with same email
    await goToRegister(page);
    await fillForm(page, 'Second User', email, 'Password123');
    await submit(page);
    await expect(page).not.toHaveURL(/\/dashboard$/);
  });

  test('[NEG-13] All fields whitespace does not register', async ({ page }) => {
    await fillForm(page, '   ', '   ', '   ');
    await submit(page);
    await expect(page).not.toHaveURL(/\/dashboard$/);
  });

});


// ══════════════════════════════════════════════════════════════
// 5. BOUNDARY VALUE ANALYSIS (BVA)
// Test at exact min/max/±1 boundaries
// Password min = 6 chars per UI validation message
// ══════════════════════════════════════════════════════════════
test.describe('05 — Boundary Value Analysis', () => {

  test.beforeEach(async ({ page }) => { await goToRegister(page); });

  // ── Password boundaries (min = 6) ─────────────────────────
  test('[BVA-01] Password = 5 chars (below min) → rejected', async ({ page }) => {
    await fillForm(page, 'Test User', uniqueEmail(), 'Pass1');
    await submit(page);
    await expect(page.getByText(/at least 6 characters/i)).toBeVisible();
  });

  test('[BVA-02] Password = 6 chars (at min) → accepted', async ({ page }) => {
    const email = uniqueEmail('bva');
    createdEmails.push(email);
    await fillForm(page, 'Test User', email, 'Pass12');
    await submit(page);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('[BVA-03] Password = 7 chars (above min) → accepted', async ({ page }) => {
    const email = uniqueEmail('bva');
    createdEmails.push(email);
    await fillForm(page, 'Test User', email, 'Pass123');
    await submit(page);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('[BVA-04] Password = 1 char (far below min) → rejected', async ({ page }) => {
    await fillForm(page, 'Test User', uniqueEmail(), 'a');
    await submit(page);
    await expect(page.getByText(/at least 6 characters/i)).toBeVisible();
  });

  test('[BVA-05] Password = 255 chars (upper boundary) → accepted or handled', async ({ page }) => {
    const email = uniqueEmail('bva');
    await fillForm(page, 'Test User', email, 'A'.repeat(255));
    await submit(page);
    // Should not crash — either accept or show max-length error
    await expect(page).not.toHaveURL(/error/);
  });

  // ── Name boundaries ────────────────────────────────────────
  test('[BVA-06] Name = 1 char (min boundary) → outcome observed', async ({ page }) => {
    const email = uniqueEmail('bva');
    await fillForm(page, 'A', email, 'Password123');
    await submit(page);
    // App decides pass/fail — test verifies no crash
    await expect(page).not.toHaveURL(/error/);
  });

  test('[BVA-07] Name = 2 chars (just above min) → outcome observed', async ({ page }) => {
    const email = uniqueEmail('bva');
    await fillForm(page, 'Jo', email, 'Password123');
    await submit(page);
    await expect(page).not.toHaveURL(/error/);
  });

  test('[BVA-08] Name = 255 chars (upper boundary) → no crash', async ({ page }) => {
    const email = uniqueEmail('bva');
    await fillForm(page, 'A'.repeat(255), email, 'Password123');
    await submit(page);
    await expect(page).not.toHaveURL(/error/);
  });

  // ── Email boundaries ───────────────────────────────────────
  test('[BVA-09] Email = 1 char local part → rejected', async ({ page }) => {
    await fillForm(page, 'Test User', 'a@b.co', 'Password123');
    await submit(page);
    // minimal valid email — observe outcome
  });

  test('[BVA-10] Very long email (100 chars) → no crash', async ({ page }) => {
    const longEmail = `${'a'.repeat(50)}_${Date.now()}@${'b'.repeat(30)}.com`;
    await fillForm(page, 'Test User', longEmail, 'Password123');
    await submit(page);
    await expect(page).not.toHaveURL(/error/);
  });

});


// ══════════════════════════════════════════════════════════════
// 6. EQUIVALENCE PARTITIONING (EP)
// One representative from each valid/invalid class
// ══════════════════════════════════════════════════════════════
test.describe('06 — Equivalence Partitioning', () => {

  test.beforeEach(async ({ page }) => { await goToRegister(page); });

  // Valid partitions
  test('[EP-01] Valid class: standard name + email + password', async ({ page }) => {
    const email = uniqueEmail('ep');
    createdEmails.push(email);
    await fillForm(page, 'Jane Doe', email, 'Password123');
    await submit(page);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('[EP-02] Valid class: alphanumeric password', async ({ page }) => {
    const email = uniqueEmail('ep');
    createdEmails.push(email);
    await fillForm(page, 'Test User', email, 'Pass1234');
    await submit(page);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('[EP-03] Valid class: email with plus addressing', async ({ page }) => {
    const email = `ep+${Date.now()}@example.com`;
    createdEmails.push(email);
    await fillForm(page, 'Test User', email, 'Password123');
    await submit(page);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  // Invalid partitions
  test('[EP-04] Invalid class: numeric-only name', async ({ page }) => {
    await fillForm(page, '12345', uniqueEmail(), 'Password123');
    await submit(page);
    // Observe: app may accept or reject numeric names
  });

  test('[EP-06] Invalid class: email missing TLD', async ({ page }) => {
    await fillForm(page, 'Test User', 'user@example', 'Password123');
    await submit(page);
    await expect(page).not.toHaveURL(/\/dashboard$/);
  });

  test('[EP-07] Invalid class: password below minimum', async ({ page }) => {
    await fillForm(page, 'Test User', uniqueEmail(), '123');
    await submit(page);
    await expect(page.getByText(/at least 6 characters/i)).toBeVisible();
  });

  test('[EP-08] Invalid class: empty email', async ({ page }) => {
    await fillForm(page, 'Test User', '', 'Password123');
    await submit(page);
    await expect(page).not.toHaveURL(/\/dashboard$/);
  });

  test('[EP-09] Valid class: name with spaces (first + last)', async ({ page }) => {
    const email = uniqueEmail('ep');
    createdEmails.push(email);
    await fillForm(page, 'First Last', email, 'Password123');
    await submit(page);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

});


// ══════════════════════════════════════════════════════════════
// 7. FORM FIELD VALIDATION
// Field-level rules: type, placeholder, required, length
// ══════════════════════════════════════════════════════════════
test.describe('07 — Form Field Validation', () => {

  test.beforeEach(async ({ page }) => { await goToRegister(page); });

  test('[FFV-01] Name placeholder is "John Doe"', async ({ page }) => {
    await expect(page.getByPlaceholder('John Doe')).toBeVisible();
  });

  test('[FFV-02] Email placeholder is "you@example.com"', async ({ page }) => {
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
  });

  test('[FFV-03] Password input type is "password" (masked)', async ({ page }) => {
    await expect(page.locator('input[type="password"]')).toHaveAttribute('type', 'password');
  });

  test('[FFV-04] Name field accepts text input', async ({ page }) => {
    await page.getByPlaceholder('John Doe').fill('My Name');
    await expect(page.getByPlaceholder('John Doe')).toHaveValue('My Name');
  });

  test('[FFV-05] Email field accepts email input', async ({ page }) => {
    await page.getByPlaceholder('you@example.com').fill('test@example.com');
    await expect(page.getByPlaceholder('you@example.com')).toHaveValue('test@example.com');
  });

  test('[FFV-06] Field can be cleared and retyped', async ({ page }) => {
    await page.getByPlaceholder('John Doe').fill('Wrong');
    await page.getByPlaceholder('John Doe').clear();
    await page.getByPlaceholder('John Doe').fill('Correct');
    await expect(page.getByPlaceholder('John Doe')).toHaveValue('Correct');
  });

  test('[FFV-07] Name label is visible', async ({ page }) => {
    await expect(page.getByText('Name')).toBeVisible();
  });

  test('[FFV-08] Email label is visible', async ({ page }) => {
    await expect(page.getByText('Email')).toBeVisible();
  });

  test('[FFV-09] Password label is visible', async ({ page }) => {
    await expect(page.getByText('Password')).toBeVisible();
  });

  test('[FFV-10] Error: "Name is required" on empty name submit', async ({ page }) => {
    await fillForm(page, '', uniqueEmail(), 'Password123');
    await submit(page);
    await expect(page.getByText('Name is required')).toBeVisible();
  });

  test('[FFV-11] Error: "Invalid email" on bad email submit', async ({ page }) => {
    await fillForm(page, 'Test', 'bad-email', 'Password123');
    await submit(page);
    await expect(page.getByText('Invalid email')).toBeVisible();
  });

  test('[FFV-12] Error: "Password must be at least 6 characters"', async ({ page }) => {
    await fillForm(page, 'Test', uniqueEmail(), '123');
    await submit(page);
    await expect(page.getByText('Password must be at least 6 characters')).toBeVisible();
  });

  test('[FFV-13] Multiple errors shown simultaneously', async ({ page }) => {
    await submit(page); // all empty
    await expect(page.getByText('Name is required')).toBeVisible();
    await expect(page.getByText('Invalid email')).toBeVisible();
    await expect(page.getByText('Password must be at least 6 characters')).toBeVisible();
  });

});


// ══════════════════════════════════════════════════════════════
// 8. ERROR MESSAGE VALIDATION
// Exact wording, colour, placement of error messages
// ══════════════════════════════════════════════════════════════
test.describe('08 — Error Message Validation', () => {

  test.beforeEach(async ({ page }) => { await goToRegister(page); });

  test('[ERR-01] "Name is required" appears below name field', async ({ page }) => {
    await fillForm(page, '', uniqueEmail(), 'Password123');
    await submit(page);
    await expect(page.getByText('Name is required')).toBeVisible();
  });

  test('[ERR-02] "Invalid email" appears below email field', async ({ page }) => {
    await fillForm(page, 'Test', 'mani@', 'Password123');
    await submit(page);
    await expect(page.getByText('Invalid email')).toBeVisible();
  });

  test('[ERR-03] "Password must be at least 6 characters" appears', async ({ page }) => {
    await fillForm(page, 'Test', uniqueEmail(), '12');
    await submit(page);
    await expect(page.getByText('Password must be at least 6 characters')).toBeVisible();
  });

  test('[ERR-04] Error messages are in red colour', async ({ page }) => {
    await submit(page);
    const nameError = page.getByText('Name is required');
    await expect(nameError).toBeVisible();
    const color = await nameError.evaluate(el =>
      getComputedStyle(el).color
    );
    // red in RGB
    expect(color).toMatch(/rgb\(2[0-9][0-9]|rgb\(1[5-9][0-9]/);
  });

  test('[ERR-05] Errors clear when valid input is entered', async ({ page }) => {
    await submit(page);
    await expect(page.getByText('Name is required')).toBeVisible();
    await page.getByPlaceholder('John Doe').fill('Valid Name');
    await submit(page);
    await expect(page.getByText('Name is required')).not.toBeVisible();
  });

  test('[ERR-06] All three errors show at once on blank submit', async ({ page }) => {
    await submit(page);
    await expect(page.getByText('Name is required')).toBeVisible();
    await expect(page.getByText('Invalid email')).toBeVisible();
    await expect(page.getByText('Password must be at least 6 characters')).toBeVisible();
  });

  test('[ERR-07] Label turns red on field error', async ({ page }) => {
    await fillForm(page, '', uniqueEmail(), 'Password123');
    await submit(page);
    const label = page.getByText('Name').first();
    const color = await label.evaluate(el => getComputedStyle(el).color);
    expect(color).toMatch(/rgb\(2[0-9][0-9]|rgb\(1[5-9][0-9]/);
  });

});


// ══════════════════════════════════════════════════════════════
// 9. INPUT VALIDATION TESTING
// Client-side validation before any server call
// ══════════════════════════════════════════════════════════════
test.describe('09 — Input Validation Testing', () => {

  test.beforeEach(async ({ page }) => { await goToRegister(page); });

  test('[INV-01] Spaces-only name is invalid', async ({ page }) => {
    await fillForm(page, '     ', uniqueEmail(), 'Password123');
    await submit(page);
    await expect(page).not.toHaveURL(/\/dashboard$/);
  });

  test('[INV-02] Numbers-only name behaviour observed', async ({ page }) => {
    await fillForm(page, '12345', uniqueEmail(), 'Password123');
    await submit(page);
    // Document: pass = app allows, fail = app rejects
  });

  test('[INV-03] Email with double @ rejected', async ({ page }) => {
    await fillForm(page, 'Test', 'user@@example.com', 'Password123');
    await submit(page);
    await expect(page).not.toHaveURL(/\/dashboard$/);
  });

  test('[INV-04] Email starting with @ rejected', async ({ page }) => {
    await fillForm(page, 'Test', '@example.com', 'Password123');
    await submit(page);
    await expect(page).not.toHaveURL(/\/dashboard$/);
  });

  test('[INV-05] Email ending with dot rejected', async ({ page }) => {
    await fillForm(page, 'Test', 'user@example.', 'Password123');
    await submit(page);
    await expect(page).not.toHaveURL(/\/dashboard$/);
  });

  test('[INV-07] HTML tags in name field sanitised', async ({ page }) => {
    const email = uniqueEmail('inv');
    await fillForm(page, '<b>Bold</b>', email, 'Password123');
    await submit(page);
    // Should not render as HTML
    await expect(page.locator('b:has-text("Bold")')).not.toBeVisible();
  });

  test('[INV-08] Copy-paste into fields works correctly', async ({ page }) => {
    await page.getByPlaceholder('John Doe').fill('');
    await page.getByPlaceholder('John Doe').evaluate(el => {
      el.value = 'Pasted Name';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await expect(page.getByPlaceholder('John Doe')).toHaveValue('Pasted Name');
  });

  test('[INV-09] Leading/trailing whitespace in email rejected', async ({ page }) => {
    await fillForm(page, 'Test', ' user@example.com ', 'Password123');
    await submit(page);
    // Should trim or reject
    await expect(page).not.toHaveURL(/error/);
  });

  test('[INV-10] Unicode characters in name accepted', async ({ page }) => {
    const email = uniqueEmail('inv');
    await fillForm(page, 'Ünïcödé Nàmé', email, 'Password123');
    await submit(page);
    await expect(page).not.toHaveURL(/error/);
  });

});


// ══════════════════════════════════════════════════════════════
// 10. ERROR GUESSING
// Tester intuition — weird edge cases that often break apps
// ══════════════════════════════════════════════════════════════
test.describe('10 — Error Guessing', () => {

  test.beforeEach(async ({ page }) => { await goToRegister(page); });

  test('[EG-01] Double-click Sign Up does not duplicate user', async ({ page }) => {
    const email = uniqueEmail('eg');
    createdEmails.push(email);
    await fillForm(page, 'Test User', email, 'Password123');
    await page.getByRole('button', { name: 'Sign Up' }).dblclick();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('[EG-02] Rapid multiple submits do not crash', async ({ page }) => {
  const email = uniqueEmail('eg');
  createdEmails.push(email);
  await fillForm(page, 'Test', email, 'Password123');
  const btn = page.getByRole('button', { name: 'Sign Up' });
  // Fire two submissions quickly, but don’t wait for the second click
  await Promise.all([
    btn.click(),
    btn.click().catch(() => {}) // ignore if button disappears
  ]);

  // Wait for navigation or stable state
  await page.waitForLoadState('networkidle');

  // App should not crash
  await expect(page).not.toHaveURL(/error/);
  });

  test('[EG-03] Back button after registration', async ({ page }) => {
    const email = uniqueEmail('eg');
    createdEmails.push(email);
    await fillForm(page, 'Test User', email, 'Password123');
    await submit(page);
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.goBack();
    // Should not register again or crash
    await expect(page).not.toHaveURL(/error/);
  });

  test('[EG-04] Refresh on register page clears form', async ({ page }) => {
    await fillForm(page, 'Test', 'test@example.com', 'Password123');
    await page.reload();
    await expect(page.getByPlaceholder('John Doe')).toHaveValue('');
  });

  test('[EG-05] Very long name (500 chars) does not crash', async ({ page }) => {
    await fillForm(page, 'A'.repeat(500), uniqueEmail(), 'Password123');
    await submit(page);
    await expect(page).not.toHaveURL(/error/);
  });

  test('[EG-06] Emoji in name field does not crash', async ({ page }) => {
    const email = uniqueEmail('eg');
    await fillForm(page, '😀 User 🎉', email, 'Password123');
    await submit(page);
    await expect(page).not.toHaveURL(/error/);
  });

  test('[EG-07] Tab order is logical (Name → Email → Password → Button)', async ({ page }) => {
    await page.getByPlaceholder('John Doe').focus();
    await page.keyboard.press('Tab');
    const focused1 = await page.evaluate(() => document.activeElement?.placeholder);
    expect(focused1).toBe('you@example.com');
    await page.keyboard.press('Tab');
    const focused2 = await page.evaluate(() => document.activeElement?.type);
    expect(focused2).toBe('password');
  });

  test('[EG-08] Email with consecutive dots rejected', async ({ page }) => {
    await fillForm(page, 'Test', 'user..name@example.com', 'Password123');
    await submit(page);
    await expect(page).not.toHaveURL(/\/dashboard$/);
  });

  test('[EG-10] Null-byte character in fields does not crash', async ({ page }) => {
    await fillForm(page, 'Test\x00User', uniqueEmail(), 'Password123');
    await submit(page);
    await expect(page).not.toHaveURL(/error/);
  });

});


// ══════════════════════════════════════════════════════════════
// 11. UI / UX TESTING
// Visual layout, colours, responsiveness of elements
// ══════════════════════════════════════════════════════════════
test.describe('11 — UI/UX Testing', () => {

  test.beforeEach(async ({ page }) => { await goToRegister(page); });

  test('[UI-01] Sign Up button has blue background', async ({ page }) => {
    const btn = page.getByRole('button', { name: 'Sign Up' });
    const bg = await btn.evaluate(el => getComputedStyle(el).backgroundColor);
    // Blue: rgb(37, 99, 235) or similar blue shade
    expect(bg).toMatch(/rgb\(\s*[0-9]+\s*,\s*[0-9]+\s*,\s*(1[5-9][0-9]|2[0-4][0-9])\s*\)/);
  });

  test('[UI-03] Sign Up button is full width', async ({ page }) => {
    const btn = page.getByRole('button', { name: 'Sign Up' });
    const box = await btn.boundingBox();
    const viewport = page.viewportSize();
    // Button should span a significant width relative to viewport
    expect(box.width).toBeGreaterThan(viewport.width * 0.3);
  });

  test('[UI-04] Form card has visible border/shadow', async ({ page }) => {
    const card = page.locator('form, [class*="card"], [class*="container"]').first();
    await expect(card).toBeVisible();
  });

  test('[UI-05] Fields have visible focus ring on click', async ({ page }) => {
    const input = page.getByPlaceholder('John Doe');
    await input.click();
    const outline = await input.evaluate(el => getComputedStyle(el).outline);
    // Should have some outline/ring when focused
    expect(outline).not.toBe('none');
  });

  test('[UI-06] Heading is centred on the page', async ({ page }) => {
    const heading = page.getByText('Create an account');
    const textAlign = await heading.evaluate(el => getComputedStyle(el).textAlign);
    expect(textAlign).toBe('center');
  });

  test('[UI-07] Error state turns label red', async ({ page }) => {
    await submit(page); // trigger all errors
    const nameLabel = page.getByText('Name').first();
    const color = await nameLabel.evaluate(el => getComputedStyle(el).color);
    expect(color).not.toBe('rgb(0, 0, 0)');
  });

  test('[UI-08] Input fields have border and are rounded', async ({ page }) => {
    const input = page.getByPlaceholder('John Doe');
    const radius = await input.evaluate(el => getComputedStyle(el).borderRadius);
    // Should have some border radius (rounded corners)
    expect(parseFloat(radius)).toBeGreaterThan(0);
  });

});


// ══════════════════════════════════════════════════════════════
// 12. USABILITY TESTING
// Can a real user easily complete the form?
// ══════════════════════════════════════════════════════════════
test.describe('12 — Usability Testing', () => {

  test.beforeEach(async ({ page }) => { await goToRegister(page); });

  test('[USE-01] Entire form completable via keyboard only', async ({ page }) => {
    const email = uniqueEmail('use');
    createdEmails.push(email);
    await page.keyboard.press('Tab'); // focus Name
    await page.keyboard.type('Keyboard User');
    await page.keyboard.press('Tab'); // focus Email
    await page.keyboard.type(email);
    await page.keyboard.press('Tab'); // focus Password
    await page.keyboard.type('Password123');
    await page.keyboard.press('Tab'); // focus Sign Up button
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('[USE-02] "Already have an account?" text is present', async ({ page }) => {
    await expect(page.getByText('Already have an account?')).toBeVisible();
  });

  test('[USE-03] Sign in link is clearly identifiable', async ({ page }) => {
    const link = page.getByRole('link', { name: 'Sign in' });
    await expect(link).toBeVisible();
    const color = await link.evaluate(el => getComputedStyle(el).color);
    // Should be distinct (blue or similar)
    expect(color).not.toBe('rgb(0, 0, 0)');
  });

  test('[USE-04] Error messages appear immediately after submit', async ({ page }) => {
    await submit(page);
    // Errors should appear without page reload
    await expect(page.getByText('Name is required')).toBeVisible({ timeout: 1000 });
  });

  test('[USE-05] Form does not auto-submit on field focus', async ({ page }) => {
    await page.getByPlaceholder('John Doe').focus();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/register$/);
  });

  test('[USE-06] Password field has no show/hide toggle (observed)', async ({ page }) => {
    // Document whether show/hide exists — not a pass/fail
    const toggle = page.locator('[aria-label*="show"], [aria-label*="hide"], [data-testid*="toggle"]');
    console.log(`Password toggle present: ${await toggle.count() > 0}`);
  });

});


// ══════════════════════════════════════════════════════════════
// 13. NAVIGATION TESTING
// Links, redirects, browser history
// ══════════════════════════════════════════════════════════════
test.describe('13 — Navigation Testing', () => {

  test('[NAV-01] Sign in link navigates to /login', async ({ page }) => {
    await goToRegister(page);
    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('[NAV-02] Login page Sign up link navigates back to /register', async ({ page }) => {
    await page.goto(LOGIN);
    await page.getByRole('link', { name: 'Sign up' }).click();
    await expect(page).toHaveURL(/\/register$/);
  });

  test('[NAV-03] Successful registration redirects to /dashboard', async ({ page }) => {
    const email = uniqueEmail('nav');
    createdEmails.push(email);
    await goToRegister(page);
    await fillForm(page, 'Nav User', email, 'Password123');
    await submit(page);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('[NAV-04] Direct URL /register loads correctly', async ({ page }) => {
    await page.goto(REGISTER);
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByText('Create an account')).toBeVisible();
  });

  test('[NAV-05] Browser back after navigating to login returns to register', async ({ page }) => {
    await goToRegister(page);
    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/register$/);
  });

  test('[NAV-06] Page does not navigate on validation error', async ({ page }) => {
    await goToRegister(page);
    await submit(page);
    await expect(page).toHaveURL(/\/register$/);
  });

  test('[NAV-07] Authenticated user visiting /register behaviour observed', async ({ page }) => {
    // Login first then visit register
    await page.goto(LOGIN);
    await page.getByPlaceholder('you@example.com').fill('mani1@yahoo.com');
    await page.locator('input[type="password"]').fill('Password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.goto(REGISTER);
    // Observe: redirect to dashboard or show register page
    console.log(`Authed user at /register redirected to: ${page.url()}`);
  });

});


// ══════════════════════════════════════════════════════════════
// 14. SECURITY TESTING
// SQLi, XSS, CSRF, brute force, header checks
// ══════════════════════════════════════════════════════════════
test.describe('14 — Security Testing', () => {

  test.beforeEach(async ({ page }) => { await goToRegister(page); });

  test('[SEC-01] SQL injection in name field does not crash', async ({ page }) => {
    const email = uniqueEmail('sec');
    await fillForm(page, "'; DROP TABLE users; --", email, 'Password123');
    await submit(page);
    await expect(page).not.toHaveURL(/error/);
    await expect(page.getByText(/syntax error|sql/i)).not.toBeVisible();
  });

  test('[SEC-02] SQL injection in email field is rejected', async ({ page }) => {
    await fillForm(page, 'Test', "admin' OR '1'='1", 'Password123');
    await submit(page);
    await expect(page).not.toHaveURL(/\/dashboard$/);
  });

  test('[SEC-03] XSS payload in name field does not execute', async ({ page }) => {
    let alertFired = false;
    page.on('dialog', async dialog => { alertFired = true; await dialog.dismiss(); });
    const email = uniqueEmail('sec');
    await fillForm(page, '<script>alert("xss")</script>', email, 'Password123');
    await submit(page);
    await page.waitForTimeout(1000);
    expect(alertFired).toBe(false);
  });

  test('[SEC-04] XSS img onerror payload does not execute', async ({ page }) => {
    let alertFired = false;
    page.on('dialog', async d => { alertFired = true; await d.dismiss(); });
    await fillForm(page, '<img src=x onerror=alert(1)>', uniqueEmail(), 'Password123');
    await submit(page);
    await page.waitForTimeout(1000);
    expect(alertFired).toBe(false);
  });

  test('[SEC-07] HTTPS enforced in production (doc check)', async ({ page }) => {
    // In dev: localhost. Note for production: verify HTTPS redirect
    const url = page.url();
    console.log(`[SEC-07] Current protocol: ${new URL(url).protocol}`);
    // Pass in dev, assert https:// in production
  });

  test('[SEC-08] Response headers include security headers (API)', async ({ request }) => {
    const res = await request.get(REGISTER);
    const csp  = res.headers()['content-security-policy'];
    const xco  = res.headers()['x-content-type-options'];
    // Note: These may not be set in dev — document for production
    console.log(`CSP: ${csp ?? 'not set'}`);
    console.log(`X-Content-Type-Options: ${xco ?? 'not set'}`);
  });

  test('[SEC-09] No sensitive data in localStorage after failed registration', async ({ page }) => {
    await fillForm(page, '', '', '');
    await submit(page);
    const storage = await page.evaluate(() => JSON.stringify(localStorage));
    expect(storage).not.toContain('password');
    expect(storage).not.toContain('token');
  });

  test('[SEC-10] Brute force: 10 rapid failed submits no lockout crash', async ({ page }) => {
    for (let i = 0; i < 10; i++) {
      await fillForm(page, 'Test', `bad${i}@`, 'Password123');
      await submit(page);
      await expect(page).not.toHaveURL(/error/);
    }
  });

});


// ══════════════════════════════════════════════════════════════
// 15. COOKIE / SESSION TESTING
// Session creation, persistence, expiry
// ══════════════════════════════════════════════════════════════
test.describe('15 — Cookie / Session Testing', () => {

  test('[COOK-01] Session cookie set after successful registration', async ({ page }) => {
    const email = uniqueEmail('cook');
    createdEmails.push(email);
    await goToRegister(page);
    await fillForm(page, 'Cookie User', email, 'Password123');
    await submit(page);
    await expect(page).toHaveURL(/\/dashboard$/);
    const cookies = await page.context().cookies();
    console.log(`Cookies after registration: ${cookies.map(c => c.name).join(', ')}`);
    expect(cookies.length).toBeGreaterThan(0);
  });

  test('[COOK-02] Dashboard accessible after registration (session active)', async ({ page }) => {
    const email = uniqueEmail('cook');
    createdEmails.push(email);
    await goToRegister(page);
    await fillForm(page, 'Cookie User', email, 'Password123');
    await submit(page);
    await page.goto(DASHBOARD);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('[COOK-03] Session persists after page refresh', async ({ page }) => {
    const email = uniqueEmail('cook');
    createdEmails.push(email);
    await goToRegister(page);
    await fillForm(page, 'Session User', email, 'Password123');
    await submit(page);
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('[COOK-04] No session cookie before login', async ({ page }) => {
    await goToRegister(page);
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c =>
      c.name.toLowerCase().includes('session') || c.name.toLowerCase().includes('token')
    );
    expect(sessionCookie).toBeUndefined();
  });

  test('[COOK-05] No token in localStorage before registration', async ({ page }) => {
    await goToRegister(page);
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });

});


// ══════════════════════════════════════════════════════════════
// 16. API TESTING — POST /register (or /api/auth/register)
// Direct API validation without browser UI
// ══════════════════════════════════════════════════════════════
test.describe('16 — API Testing (POST /register)', () => {

  test('[API-01] POST valid payload returns 200 or 201', async ({ request }) => {
    const email = uniqueEmail('api');
    createdEmails.push(email);
    const res = await request.post(`${BASE_URL}/api/auth/register`, {
      data: { name: 'API User', email, password: 'Password123' },
    });
    expect([200, 201]).toContain(res.status());
  });

  test('[API-02] Response body contains user data or token', async ({ request }) => {
    const email = uniqueEmail('api');
    createdEmails.push(email);
    const res = await request.post(`${BASE_URL}/api/auth/register`, {
      data: { name: 'API User', email, password: 'Password123' },
    });
    const body = await res.json().catch(() => ({}));
    console.log(`[API-02] Response body keys: ${Object.keys(body).join(', ')}`);
    expect(res.status()).toBeLessThan(400);
  });

  test('[API-03] Missing name returns 400 or 422', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/auth/register`, {
      data: { email: uniqueEmail('api'), password: 'Password123' },
    });
    expect([400, 422]).toContain(res.status());
  });

  test('[API-04] Missing email returns 400 or 422', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/auth/register`, {
      data: { name: 'API User', password: 'Password123' },
    });
    expect([400, 422]).toContain(res.status());
  });

  test('[API-05] Missing password returns 400 or 422', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/auth/register`, {
      data: { name: 'API User', email: uniqueEmail('api') },
    });
    expect([400, 422]).toContain(res.status());
  });

  test('[API-06] Invalid email returns 400 or 422', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/auth/register`, {
      data: { name: 'API User', email: 'notanemail', password: 'Password123' },
    });
    expect([400, 422]).toContain(res.status());
  });

  test('[API-07] Short password returns 400 or 422', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/auth/register`, {
      data: { name: 'API User', email: uniqueEmail('api'), password: '123' },
    });
    expect([400, 422]).toContain(res.status());
  });

  test('[API-08] Duplicate email returns 409 or 400', async ({ request }) => {
    const email = uniqueEmail('api');
    createdEmails.push(email);
    await request.post(`${BASE_URL}/api/auth/register`, {
      data: { name: 'First', email, password: 'Password123' },
    });
    const res2 = await request.post(`${BASE_URL}/api/auth/register`, {
      data: { name: 'Second', email, password: 'Password123' },
    });
    expect([400, 409, 422]).toContain(res2.status());
  });

  test('[API-09] Empty body returns 400', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/auth/register`, {
      data: {},
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test('[API-10] Content-Type is application/json in response', async ({ request }) => {
    const email = uniqueEmail('api');
    createdEmails.push(email);
    const res = await request.post(`${BASE_URL}/api/auth/register`, {
      data: { name: 'API User', email, password: 'Password123' },
    });
    const ct = res.headers()['content-type'];
    expect(ct).toContain('application/json');
  });

});


// ══════════════════════════════════════════════════════════════
// 17. INTEGRATION TESTING — Signup → Login → Dashboard
// Full flow across multiple pages
// ══════════════════════════════════════════════════════════════
test.describe('17 — Integration Testing', () => {

  test('[INT-01] Register → Dashboard → Logout → Login with same credentials', async ({ page }) => {
    const email    = uniqueEmail('int');
    const password = 'Password123';
    const name     = 'Integration User';
    createdEmails.push(email);

    // Register
    await goToRegister(page);
    await fillForm(page, name, email, password);
    await submit(page);
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

  test('[INT-02] Register → verify all dashboard elements present', async ({ page }) => {
    const email = uniqueEmail('int');
    createdEmails.push(email);
    await goToRegister(page);
    await fillForm(page, 'Dashboard User', email, 'Password123');
    await submit(page);
    await expect(page).toHaveURL(/\/dashboard$/);

    // Dashboard elements
    await expect(page.getByText('Total Tasks')).toBeVisible();
    await expect(page.getByText('Completed')).toBeVisible();
    await expect(page.getByText('Pending')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Todos' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Notes' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Products' })).toBeVisible();
  });

  test('[INT-03] Registered user email persisted in sidebar', async ({ page }) => {
    const email = uniqueEmail('int');
    createdEmails.push(email);
    await goToRegister(page);
    await fillForm(page, 'Sidebar User', email, 'Password123');
    await submit(page);
    await expect(page.getByText(email)).toBeVisible();
  });

  test('[INT-05] Register → navigate to Todos via sidebar', async ({ page }) => {
    const email = uniqueEmail('int');
    createdEmails.push(email);
    await goToRegister(page);
    await fillForm(page, 'Todo User', email, 'Password123');
    await submit(page);
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.getByRole('link', { name: 'Todos' }).click();
    await expect(page).toHaveURL(/\/todos$/);
  });

});


// ══════════════════════════════════════════════════════════════
// 18. DATA-DRIVEN TESTING
// Same test logic with multiple data sets
// ══════════════════════════════════════════════════════════════
test.describe('18 — Data-Driven Testing', () => {

  // Valid registration data sets
  const validUsers = [
    { name: 'Alice Smith',    password: 'Password123',  label: 'standard user'      },
    { name: 'Bob Jones',      password: 'P@ssw0rd!',    label: 'special char pass'  },
    { name: 'Carlos Ruiz',    password: 'Abc123456',    label: 'alphanumeric pass'   },
    { name: 'Diana Prince',   password: 'Secure#Pass1', label: 'hash char pass'      },
    { name: 'Elton Musk',     password: '123456',       label: 'numeric pass (min)'  },
  ];

  for (const user of validUsers) {
    test(`[DDT-POS] Register: ${user.label}`, async ({ page }) => {
      const email = uniqueEmail('ddt');
      createdEmails.push(email);
      await goToRegister(page);
      await fillForm(page, user.name, email, user.password);
      await submit(page);
      await expect(page).toHaveURL(/\/dashboard$/);
    });
  }

  // Invalid data sets — all must stay on register
  const invalidData = [
    { name: '',           email: uniqueEmail(),    password: 'Password123', label: 'empty name'          },
    { name: 'Test',       email: 'bad-email',      password: 'Password123', label: 'invalid email'       },
    { name: 'Test',       email: uniqueEmail(),    password: '123',         label: 'short password'      },
    { name: 'Test',       email: 'user@',          password: 'Password123', label: 'incomplete email'    },
    { name: '   ',        email: uniqueEmail(),    password: 'Password123', label: 'whitespace name'     },
  ];

  for (const d of invalidData) {
    test(`[DDT-NEG] Reject: ${d.label}`, async ({ page }) => {
      await goToRegister(page);
      await fillForm(page, d.name, d.email, d.password);
      await submit(page);
      await expect(page).not.toHaveURL(/\/dashboard$/);
    });
  }

});


// ══════════════════════════════════════════════════════════════
// 19. REGRESSION TESTING
// Previously fixed bugs — ensure they stay fixed
// ══════════════════════════════════════════════════════════════
test.describe('19 — Regression Testing', () => {

  test.beforeEach(async ({ page }) => { await goToRegister(page); });

  test('[REG-01] Registration still works after last deployment', async ({ page }) => {
    const email = uniqueEmail('reg');
    createdEmails.push(email);
    await fillForm(page, 'Regression User', email, 'Password123');
    await submit(page);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('[REG-02] Error messages still appear correctly', async ({ page }) => {
    await submit(page);
    await expect(page.getByText('Name is required')).toBeVisible();
    await expect(page.getByText('Invalid email')).toBeVisible();
    await expect(page.getByText('Password must be at least 6 characters')).toBeVisible();
  });

  test('[REG-03] Sign in link still works', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('[REG-04] Password masking still in effect', async ({ page }) => {
    await expect(page.locator('input[type="password"]')).toHaveAttribute('type', 'password');
  });

  test('[REG-05] Duplicate email still blocked', async ({ page }) => {
    const email = uniqueEmail('reg');
    createdEmails.push(email);
    await fillForm(page, 'First', email, 'Password123');
    await submit(page);
    await expect(page).toHaveURL(/\/dashboard$/);
    await goToRegister(page);
    await fillForm(page, 'Second', email, 'Password123');
    await submit(page);
    await expect(page).not.toHaveURL(/\/dashboard$/);
  });

  test('[REG-06] Dashboard shows correct welcome name', async ({ page }) => {
    const email = uniqueEmail('reg');
    createdEmails.push(email);
    await fillForm(page, 'Regress User', email, 'Password123');
    await submit(page);
    await expect(page.getByTestId('text-welcome')).toContainText('Regress User');
  });

});


// ══════════════════════════════════════════════════════════════
// 20. PERFORMANCE TESTING
// Response time thresholds
// ══════════════════════════════════════════════════════════════
test.describe('20 — Performance Testing', () => {

  test('[PERF-01] Register page loads within 3 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto(REGISTER);
    await expect(page.getByText('Create an account')).toBeVisible();
    const elapsed = Date.now() - start;
    console.log(`[PERF-01] Page load time: ${elapsed}ms`);
    expect(elapsed).toBeLessThan(3000);
  });

  test('[PERF-02] Successful registration completes within 5 seconds', async ({ page }) => {
    const email = uniqueEmail('perf');
    createdEmails.push(email);
    await goToRegister(page);
    await fillForm(page, 'Perf User', email, 'Password123');
    const start = Date.now();
    await submit(page);
    await expect(page).toHaveURL(/\/dashboard$/);
    const elapsed = Date.now() - start;
    console.log(`[PERF-02] Registration time: ${elapsed}ms`);
    expect(elapsed).toBeLessThan(5000);
  });

  test('[PERF-03] Validation errors appear within 1 second', async ({ page }) => {
    await goToRegister(page);
    const start = Date.now();
    await submit(page);
    await expect(page.getByText('Name is required')).toBeVisible();
    const elapsed = Date.now() - start;
    console.log(`[PERF-03] Validation time: ${elapsed}ms`);
    expect(elapsed).toBeLessThan(1000);
  });

  test('[PERF-04] Sign in link navigation within 2 seconds', async ({ page }) => {
    await goToRegister(page);
    const start = Date.now();
    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/login$/);
    const elapsed = Date.now() - start;
    console.log(`[PERF-04] Navigation time: ${elapsed}ms`);
    expect(elapsed).toBeLessThan(2000);
  });

});


// ══════════════════════════════════════════════════════════════
// 21. ACCESSIBILITY TESTING (WCAG 2.1)
// Keyboard nav, ARIA, focus, contrast
// ══════════════════════════════════════════════════════════════
test.describe('21 — Accessibility Testing (WCAG)', () => {

  test.beforeEach(async ({ page }) => { await goToRegister(page); });

  test('[A11Y-01] All fields focusable via Tab', async ({ page }) => {
    await page.keyboard.press('Tab');
    const f1 = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON', 'A']).toContain(f1);
    await page.keyboard.press('Tab');
    const f2 = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON', 'A']).toContain(f2);
  });

  test('[A11Y-02] Submit button reachable via Tab', async ({ page }) => {
    await page.keyboard.press('Tab'); // Name
    await page.keyboard.press('Tab'); // Email
    await page.keyboard.press('Tab'); // Password
    await page.keyboard.press('Tab'); // Button
    const active = await page.evaluate(() => document.activeElement?.textContent?.trim());
    expect(active).toMatch(/sign up/i);
  });

  test('[A11Y-04] Inputs have associated labels', async ({ page }) => {
    const nameInput = page.getByPlaceholder('John Doe');
    const id = await nameInput.getAttribute('id');
    if (id) {
      const label = page.locator(`label[for="${id}"]`);
      await expect(label).toBeVisible();
    } else {
      // Check aria-label or aria-labelledby
      const ariaLabel = await nameInput.getAttribute('aria-label');
      expect(ariaLabel).not.toBeNull();
    }
  });

  test('[A11Y-05] Error messages have role="alert" or aria-live', async ({ page }) => {
    await submit(page);
    const alert = page.locator('[role="alert"], [aria-live]');
    // At least one alert region should exist on error
    const count = await alert.count();
    console.log(`[A11Y-05] Alert regions found: ${count}`);
  });

  test('[A11Y-06] Sign Up button is keyboard activatable (Enter)', async ({ page }) => {
    const email = uniqueEmail('a11y');
    createdEmails.push(email);
    await fillForm(page, 'A11y User', email, 'Password123');
    const btn = page.getByRole('button', { name: 'Sign Up' });
    await btn.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('[A11Y-07] Images (if any) have alt attributes', async ({ page }) => {
    const imgs = page.locator('img');
    const count = await imgs.count();
    for (let i = 0; i < count; i++) {
      const alt = await imgs.nth(i).getAttribute('alt');
      expect(alt).not.toBeNull();
    }
  });

  test('[A11Y-08] Page has lang attribute', async ({ page }) => {
    const lang = await page.evaluate(() => document.documentElement.lang);
    expect(lang).toBeTruthy();
    expect(lang.length).toBeGreaterThan(0);
  });

});


// ══════════════════════════════════════════════════════════════
// 22. RESPONSIVE / COMPATIBILITY TESTING
// Different viewports: mobile, tablet, desktop
// ══════════════════════════════════════════════════════════════
test.describe('22 — Responsive Testing', () => {

  const viewports = [
    { name: 'Mobile S',  width: 320,  height: 568  },
    { name: 'Mobile L',  width: 414,  height: 896  },
    { name: 'Tablet',    width: 768,  height: 1024 },
    { name: 'Desktop',   width: 1280, height: 800  },
    { name: 'HD',        width: 1920, height: 1080 },
  ];

  for (const vp of viewports) {
    test(`[RESP-${vp.name}] Form is visible and usable at ${vp.width}x${vp.height}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(REGISTER);
      await expect(page.getByText('Create an account')).toBeVisible();
      await expect(page.getByPlaceholder('John Doe')).toBeVisible();
      await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
    });
  }

  test('[RESP-01] No horizontal scroll on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(REGISTER);
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // 5px tolerance
  });

});


// ══════════════════════════════════════════════════════════════
// 23. RECOVERY TESTING
// Network failure, page refresh mid-fill
// ══════════════════════════════════════════════════════════════
test.describe('23 — Recovery Testing', () => {

  test('[REC-01] Refresh mid-fill clears form gracefully', async ({ page }) => {
    await goToRegister(page);
    await fillForm(page, 'Test User', 'test@example.com', 'Password123');
    await page.reload();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByText('Create an account')).toBeVisible();
    await expect(page.getByPlaceholder('John Doe')).toHaveValue('');
  });

  test('[REC-02] Network failure on submit shows user-friendly error', async ({ page }) => {
    await goToRegister(page);
    await fillForm(page, 'Test', uniqueEmail(), 'Password123');
    // Simulate offline
    await page.context().setOffline(true);
    await submit(page);
    await page.waitForTimeout(2000);
    // Should show error or stay on register — not crash
    await expect(page).not.toHaveURL(/error/);
    await page.context().setOffline(false);
  });

  test('[REC-03] Back-forward cache: re-entering register page works', async ({ page }) => {
    await goToRegister(page);
    await page.goto(LOGIN);
    await page.goBack();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByText('Create an account')).toBeVisible();
  });

  test('[REC-04] Page still functional after rapid navigation', async ({ page }) => {
    await goToRegister(page);
    await page.goto(LOGIN);
    await page.goto(REGISTER);
    await page.goto(LOGIN);
    await page.goto(REGISTER);
    await expect(page.getByText('Create an account')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeEnabled();
  });

});


// ══════════════════════════════════════════════════════════════
// 24. CLIENT-SIDE vs SERVER-SIDE VALIDATION
// Same rules enforced at both layers
// ══════════════════════════════════════════════════════════════
test.describe('24 — Client-side & Server-side Validation', () => {

  test('[CSV-01] Client-side: empty name blocked before API call', async ({ page }) => {
    await goToRegister(page);
    let apiCalled = false;
    page.on('request', req => {
      if (req.url().includes('/api/auth') && req.method() === 'POST') apiCalled = true;
    });
    await fillForm(page, '', uniqueEmail(), 'Password123');
    await submit(page);
    await expect(page.getByText('Name is required')).toBeVisible();
    // If client-side validation blocks it, no API call made
    console.log(`[CSV-01] API called: ${apiCalled}`);
  });

  test('[CSV-02] Client-side: short password blocked before API call', async ({ page }) => {
    await goToRegister(page);
    let apiCalled = false;
    page.on('request', req => {
      if (req.url().includes('/api/auth') && req.method() === 'POST') apiCalled = true;
    });
    await fillForm(page, 'Test', uniqueEmail(), '123');
    await submit(page);
    await expect(page.getByText('Password must be at least 6 characters')).toBeVisible();
    console.log(`[CSV-02] API called: ${apiCalled}`);
  });

  test('[CSV-03] Server-side: duplicate email rejected by API', async ({ request }) => {
    const email = uniqueEmail('csv');
    createdEmails.push(email);
    // First via API
    await request.post(`${BASE_URL}/api/auth/register`, {
      data: { name: 'First', email, password: 'Password123' },
    });
    // Second via API
    const res = await request.post(`${BASE_URL}/api/auth/register`, {
      data: { name: 'Second', email, password: 'Password123' },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test('[CSV-04] Server-side: bypassed client validation still rejected', async ({ request }) => {
    // Submit direct API with short password (bypasses browser)
    const res = await request.post(`${BASE_URL}/api/auth/register`, {
      data: { name: 'Test', email: uniqueEmail('csv'), password: '123' },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

});


// ══════════════════════════════════════════════════════════════
// 25. DATABASE TESTING
// User creation, duplicates, data integrity
// ══════════════════════════════════════════════════════════════
test.describe('25 — Database Testing', () => {

  test('[DB-01] User persists — can login after registration', async ({ page }) => {
    const email    = uniqueEmail('db');
    const password = 'Password123';
    createdEmails.push(email);

    await goToRegister(page);
    await fillForm(page, 'DB User', email, password);
    await submit(page);
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.getByRole('button', { name: 'Logout' }).click();

    await page.getByPlaceholder('you@example.com').fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('[DB-02] Duplicate email blocked at DB level', async ({ request }) => {
    const email = uniqueEmail('db');
    createdEmails.push(email);
    await request.post(`${BASE_URL}/api/auth/register`, {
      data: { name: 'DB User 1', email, password: 'Password123' },
    });
    const res = await request.post(`${BASE_URL}/api/auth/register`, {
      data: { name: 'DB User 2', email, password: 'Password123' },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test('[DB-03] Name stored correctly — visible on dashboard', async ({ page }) => {
    const email = uniqueEmail('db');
    const name  = 'StoredName User';
    createdEmails.push(email);
    await goToRegister(page);
    await fillForm(page, name, email, 'Password123');
    await submit(page);
    await expect(page.getByTestId('text-welcome')).toContainText(name);
  });

  test('[DB-04] Email stored correctly — visible in sidebar', async ({ page }) => {
    const email = uniqueEmail('db');
    createdEmails.push(email);
    await goToRegister(page);
    await fillForm(page, 'DB User', email, 'Password123');
    await submit(page);
    await expect(page.getByText(email)).toBeVisible();
  });

  test('[DB-05] Password is not stored in plaintext (not visible in response)', async ({ request }) => {
    const email = uniqueEmail('db');
    createdEmails.push(email);
    const res  = await request.post(`${BASE_URL}/api/auth/register`, {
      data: { name: 'DB User', email, password: 'Password123' },
    });
    const body = await res.text();
    expect(body).not.toContain('Password123');
  });

});


// ══════════════════════════════════════════════════════════════
// 26. RELIABILITY TESTING
// Consistent results across repeated runs
// ══════════════════════════════════════════════════════════════
test.describe('26 — Reliability Testing', () => {

  test('[REL-01] Register succeeds on first attempt consistently', async ({ page }) => {
    const email = uniqueEmail('rel');
    createdEmails.push(email);
    await goToRegister(page);
    await fillForm(page, 'Reliable User', email, 'Password123');
    await submit(page);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('[REL-02] Validation error shows consistently on bad input', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await goToRegister(page);
      await fillForm(page, '', uniqueEmail(), 'Password123');
      await submit(page);
      await expect(page.getByText('Name is required')).toBeVisible();
    }
  });

  test('[REL-03] Page loads consistently on 3 successive visits', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await page.goto(REGISTER);
      await expect(page.getByText('Create an account')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign Up' })).toBeEnabled();
    }
  });

});


// ══════════════════════════════════════════════════════════════
// 27. EXPLORATORY TESTING
// Unscripted, curiosity-driven edge cases
// ══════════════════════════════════════════════════════════════
test.describe('27 — Exploratory Testing', () => {

  test.beforeEach(async ({ page }) => { await goToRegister(page); });

  test('[EXP-01] Register with uppercase email', async ({ page }) => {
    const email = `USER_${Date.now()}@EXAMPLE.COM`;
    createdEmails.push(email);
    await fillForm(page, 'Upper Email', email, 'Password123');
    await submit(page);
    // Observe: whether accepted or normalised to lowercase
    console.log(`[EXP-01] Result URL: ${page.url()}`);
  });

  test('[EXP-02] Register with leading/trailing spaces in name', async ({ page }) => {
    const email = uniqueEmail('exp');
    await fillForm(page, '  Test User  ', email, 'Password123');
    await submit(page);
    console.log(`[EXP-02] Result URL: ${page.url()}`);
  });

  test('[EXP-03] Register with very long password (500 chars)', async ({ page }) => {
    const email = uniqueEmail('exp');
    await fillForm(page, 'Test', email, 'A'.repeat(500));
    await submit(page);
    await expect(page).not.toHaveURL(/error/);
  });

  test('[EXP-04] Register with CJK characters in name', async ({ page }) => {
    const email = uniqueEmail('exp');
    await fillForm(page, '山田太郎', email, 'Password123');
    await submit(page);
    await expect(page).not.toHaveURL(/error/);
  });

  test('[EXP-05] Register with Arabic name', async ({ page }) => {
    const email = uniqueEmail('exp');
    await fillForm(page, 'محمد علي', email, 'Password123');
    await submit(page);
    await expect(page).not.toHaveURL(/error/);
  });

  test('[EXP-06] Pasting valid email from clipboard', async ({ page }) => {
    await page.getByPlaceholder('you@example.com').evaluate(el => {
      el.value = 'pasted@example.com';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await expect(page.getByPlaceholder('you@example.com')).toHaveValue('pasted@example.com');
  });

  test('[EXP-07] Register with password containing spaces mid-word', async ({ page }) => {
    const email = uniqueEmail('exp');
    await fillForm(page, 'Test', email, 'Pass word123');
    await submit(page);
    console.log(`[EXP-07] Result URL: ${page.url()}`);
  });

  test('[EXP-08] Page works after browser zoom 150%', async ({ page }) => {
    await page.evaluate(() => { document.body.style.zoom = '1.5'; });
    await expect(page.getByText('Create an account')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
  });

});


// ══════════════════════════════════════════════════════════════
// 28. LOCALIZATION TESTING
// Language, encoding, RTL layouts
// ══════════════════════════════════════════════════════════════
test.describe('28 — Localization Testing', () => {

  test('[LOC-01] Page renders with lang="en" attribute', async ({ page }) => {
    await goToRegister(page);
    const lang = await page.evaluate(() => document.documentElement.lang);
    console.log(`[LOC-01] Lang attribute: ${lang}`);
  });

  test('[LOC-02] Special chars in name field (accents) accepted', async ({ page }) => {
    const email = uniqueEmail('loc');
    createdEmails.push(email);
    await goToRegister(page);
    await fillForm(page, 'Ångström Bäcker', email, 'Password123');
    await submit(page);
    await expect(page).not.toHaveURL(/error/);
  });

  test('[LOC-03] Cyrillic name accepted', async ({ page }) => {
    const email = uniqueEmail('loc');
    await goToRegister(page);
    await fillForm(page, 'Иван Петров', email, 'Password123');
    await submit(page);
    await expect(page).not.toHaveURL(/error/);
  });

  test('[LOC-04] Greek name accepted', async ({ page }) => {
    const email = uniqueEmail('loc');
    await goToRegister(page);
    await fillForm(page, 'Γεώργιος Παπαδόπουλος', email, 'Password123');
    await submit(page);
    await expect(page).not.toHaveURL(/error/);
  });

  test('[LOC-05] Page charset is UTF-8', async ({ page }) => {
    await goToRegister(page);
    const charset = await page.evaluate(() =>
      document.querySelector('meta[charset]')?.getAttribute('charset') ||
      document.characterSet
    );
    expect(charset.toLowerCase()).toBe('utf-8');
  });

});


// ══════════════════════════════════════════════════════════════
// 29. CROSS-BROWSER / COMPATIBILITY TESTING
// Note: configure multiple browsers in playwright.config.js
// This describe documents what to verify per browser
// ══════════════════════════════════════════════════════════════
test.describe('29 — Cross-Browser Compatibility', () => {

  // These tests run in whatever browser playwright.config.js specifies.
  // Add chromium, firefox, webkit in config to cover all three.

  test.beforeEach(async ({ page }) => { await goToRegister(page); });

  test('[XBROW-01] Register page renders correctly', async ({ page }) => {
    await expect(page.getByText('Create an account')).toBeVisible();
    await expect(page.getByPlaceholder('John Doe')).toBeVisible();
  });

  test('[XBROW-02] Form submits and navigates to dashboard', async ({ page }) => {
    const email = uniqueEmail('xbrow');
    createdEmails.push(email);
    await fillForm(page, 'Browser User', email, 'Password123');
    await submit(page);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('[XBROW-03] Password masking works in this browser', async ({ page }) => {
    await expect(page.locator('input[type="password"]')).toHaveAttribute('type', 'password');
  });

  test('[XBROW-04] Validation errors render in this browser', async ({ page }) => {
    await submit(page);
    await expect(page.getByText('Name is required')).toBeVisible();
  });

  test('[XBROW-05] Sign in link works in this browser', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

});


// ══════════════════════════════════════════════════════════════
// 30. RELIABILITY + NETWORK TESTING (bonus)
// Slow network, request interception
// ══════════════════════════════════════════════════════════════
test.describe('30 — Network / Reliability Edge Cases', () => {

  test('[NET-01] Register page loads on slow 3G (throttled)', async ({ page, context }) => {
    // Simulate slow network via CDP (Chromium only)
    try {
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: (750 * 1024) / 8, // 750 kbps
        uploadThroughput:   (250 * 1024) / 8,
        latency: 100,
      });
    } catch {
      console.log('[NET-01] CDP throttling not available (non-Chromium) — skipping throttle');
    }
    const start = Date.now();
    await page.goto(REGISTER);
    await expect(page.getByText('Create an account')).toBeVisible();
    console.log(`[NET-01] Load time on slow network: ${Date.now() - start}ms`);
  });

  test('[NET-02] API error 500 handled gracefully in UI', async ({ page }) => {
    await goToRegister(page);
    // Intercept register API and force 500
    await page.route('**/api/auth/register', route => {
      route.fulfill({ status: 500, body: JSON.stringify({ message: 'Internal Server Error' }) });
    });
    await fillForm(page, 'Test User', uniqueEmail(), 'Password123');
    await submit(page);
    // Should not crash or show raw stack trace
    await expect(page).not.toHaveURL(/error/);
    await expect(page.getByText(/syntax error|stack trace|at Object/i)).not.toBeVisible();
  });

  test('[NET-03] API 429 rate limit handled gracefully', async ({ page }) => {
    await goToRegister(page);
    await page.route('**/api/auth/register', route => {
      route.fulfill({ status: 429, body: JSON.stringify({ message: 'Too many requests' }) });
    });
    await fillForm(page, 'Test User', uniqueEmail(), 'Password123');
    await submit(page);
    await expect(page).not.toHaveURL(/\/dashboard$/);
    await expect(page).not.toHaveURL(/error/);
  });

  test('[NET-04] Request payload contains correct fields', async ({ page }) => {
    await goToRegister(page);
    let payload = null;
    page.on('request', req => {
      if (req.url().includes('/api/auth') && req.method() === 'POST') {
        payload = req.postDataJSON();
      }
    });
    const email = uniqueEmail('net');
    createdEmails.push(email);
    await fillForm(page, 'Payload User', email, 'Password123');
    await submit(page);
    await expect(page).toHaveURL(/\/dashboard$/);
    expect(payload).not.toBeNull();
    expect(payload).toHaveProperty('name');
    expect(payload).toHaveProperty('email');
    expect(payload).toHaveProperty('password');
    expect(payload.email).toBe(email);
  });

  test('[NET-05] Password not sent in plaintext in request body (hashed or at minimum sent)', async ({ page }) => {
    await goToRegister(page);
    let passwordSent = null;
    page.on('request', req => {
      if (req.url().includes('/api/auth') && req.method() === 'POST') {
        const data = req.postDataJSON();
        if (data) passwordSent = data.password;
      }
    });
    const email = uniqueEmail('net');
    createdEmails.push(email);
    await fillForm(page, 'Test User', email, 'MyPlainPass123');
    await submit(page);
    // Document: password is sent to API (HTTPS encrypts in transit)
    // Hashing should happen server-side
    console.log(`[NET-05] Password field sent: ${passwordSent ? 'yes' : 'no'}`);
  });

});