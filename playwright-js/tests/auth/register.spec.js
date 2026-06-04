/**
 * Register page — all test techniques in one spec file.
 *
 * Techniques: smoke, positive, negative, BVA, EP, decision table,
 * form validation, error messages, regression, security, usability,
 * accessibility, API, integration.
 *
 * Run: npm run test:register
 */

import { test, expect, configureRegisterSuite } from '../../fixtures/registerTest.js';
import { uniqueEmail } from '../../utils/helpers.js';
import { registerUser } from '../../utils/authApi.js';
import {
  expectAuthSuccessBody,
  expectErrorBody,
} from '../../utils/apiAssertions.js';
import { MESSAGES } from '../../utils/constants.js';
import { env } from '../../config/env.js';

configureRegisterSuite();

const DEFAULT_PASSWORD = 'Password123';
const SHORT_PASSWORD = '12345';
const MIN_PASSWORD = 'abcdef';
const LONG_PASSWORD_LENGTH = 128;
/** Five space characters only — below minimum password length */
const WHITESPACE_ONLY_PASSWORD = '     ';
const SECRET_PASSWORD = 'SuperSecret99';
const XSS_PAYLOAD = '<script>alert("xss")</script>';
const SQLI_PAYLOAD = "' OR '1'='1";

/** UI suites that navigate to /register before each test. */
function uiSuite(title, fn) {
  test.describe(title, () => {
    test.beforeEach(async ({ registerPage }) => {
      await registerPage.goto();
    });
    fn();
  });
}

test.describe('Register @auth', () => {
  // ─── Smoke @smoke ───────────────────────────────────────────────────────
  uiSuite('Smoke @smoke', () => {
    // Purpose: Confirm the signup route resolves without redirect loops.
    // Technique: Smoke Testing.
    // Validates: Basic routing to /register is available.
    test('[REG-SMOKE-01] page loads at /register', async ({ page }) => {
      await expect(page).toHaveURL(/\/register$/);
    });

    // Purpose: Ensure the browser tab receives a non-empty document title.
    // Technique: Smoke Testing.
    // Validates: Page metadata is present (not a blank shell).
    test('[REG-SMOKE-02] document title is set', async ({ page }) => {
      await expect(page).toHaveTitle(/.+/);
    });

    // Purpose: Verify primary heading and subtitle copy render on first paint.
    // Technique: Smoke Testing.
    // Validates: Core page chrome is visible to the user.
    test('[REG-SMOKE-03] heading and subtitle visible', async ({ registerPage }) => {
      await registerPage.expectOnPage();
      await registerPage.expectSubtitle();
    });

    // Purpose: Confirm all mandatory form inputs are on screen.
    // Technique: Smoke Testing.
    // Validates: Signup form is usable without missing controls.
    test('[REG-SMOKE-04] name email password inputs visible', async ({
      registerPage,
    }) => {
      await registerPage.expectCoreInputsVisible();
    });

    // Purpose: Check the primary CTA is visible and clickable.
    // Technique: Smoke Testing.
    // Validates: Users can initiate registration immediately.
    test('[REG-SMOKE-05] Sign Up button visible and enabled', async ({
      registerPage,
    }) => {
      await expect(registerPage.submitButton()).toBeVisible();
      await expect(registerPage.submitButton()).toBeEnabled();
    });

    // Purpose: Ensure existing users can reach the login page.
    // Technique: Smoke Testing.
    // Validates: Cross-link between auth flows exists.
    test('[REG-SMOKE-06] Sign in link visible', async ({ registerPage }) => {
      await expect(registerPage.signInLink()).toBeVisible();
    });
  });

  // ─── Regression @regression ─────────────────────────────────────────────
  uiSuite('Regression @regression', () => {
    // Purpose: Guard against layout regressions on the register form.
    // Technique: Regression Testing.
    // Validates: Labels, submit button, and login link remain present.
    test('[REG-REG-01] form layout elements present', async ({ registerPage }) => {
      await registerPage.expectFormLabels();
      await expect(registerPage.submitButton()).toBeVisible();
      await expect(registerPage.signInLink()).toBeVisible();
    });

    // Purpose: Ensure password masking is not accidentally removed.
    // Technique: Regression Testing.
    // Validates: Password field type remains "password".
    test('[REG-REG-02] password field is masked', async ({ registerPage }) => {
      await registerPage.expectPasswordMasked();
    });
  });

  // ─── Positive @positive ───────────────────────────────────────────────────
  uiSuite('Positive @positive', () => {
    // Purpose: Verify a standard valid signup completes successfully.
    // Technique: Positive Testing.
    // Validates: Happy path redirects authenticated user to dashboard.
    test('[REG-POS-01] valid signup redirects to dashboard', async ({
      registerPage,
      trackEmail,
    }) => {
      const email = uniqueEmail('pos');
      trackEmail(email);
      await registerPage.registerExpectSuccess('Jane Doe', email, DEFAULT_PASSWORD);
    });

    // Purpose: Confirm the dashboard reflects the registered display name.
    // Technique: Positive Testing.
    // Validates: UI state matches persisted user profile after signup.
    test('[REG-POS-02] welcome message shows registered name', async ({
      registerPage,
      dashboardPage,
      trackEmail,
    }) => {
      const email = uniqueEmail('pos');
      trackEmail(email);
      await registerPage.registerExpectSuccess('James Bond', email, DEFAULT_PASSWORD);
      await dashboardPage.expectWelcomeFor('James Bond');
    });

    // Purpose: Accept RFC-compliant plus-addressed email local parts.
    // Technique: Positive Testing.
    // Validates: Email alias formats are not rejected client-side.
    test('[REG-POS-03] plus-address email is accepted', async ({
      registerPage,
      trackEmail,
    }) => {
      const email = `user+${Date.now()}@example.com`;
      trackEmail(email);
      await registerPage.registerExpectSuccess('Plus User', email, DEFAULT_PASSWORD);
    });

    // Purpose: Allow hyphenated personal names.
    // Technique: Positive Testing.
    // Validates: Name field accepts common punctuation.
    test('[REG-POS-04] hyphenated name is accepted', async ({
      registerPage,
      trackEmail,
    }) => {
      const email = uniqueEmail('pos');
      trackEmail(email);
      await registerPage.registerExpectSuccess('Mary-Jane', email, DEFAULT_PASSWORD);
    });

    // Purpose: Support keyboard-only submission from the password field.
    // Technique: Positive Testing.
    // Validates: Enter key triggers the same submit flow as the button.
    test('[REG-POS-05] Enter on password submits registration', async ({
      registerPage,
      trackEmail,
    }) => {
      const email = uniqueEmail('enter');
      trackEmail(email);
      await registerPage.fillForm('Enter User', email, DEFAULT_PASSWORD);
      await registerPage.passwordInput().focus();
      await registerPage.submitWithEnterOnPassword();
    });

    // Purpose: Navigate to login via footer link without registering.
    // Technique: Positive Testing.
    // Validates: Sign-in link routing works from the register page.
    test('[REG-POS-06] Sign in link navigates to login', async ({
      page,
      registerPage,
    }) => {
      await registerPage.goToLogin();
      await expect(page).toHaveURL(/\/login$/);
    });
  });

  // ─── Negative @negative ───────────────────────────────────────────────────
  uiSuite('Negative @negative', () => {
    // Purpose: Reject a completely empty form submission.
    // Technique: Negative Testing.
    // Validates: User stays on register with no silent success.
    test('[REG-NEG-01] empty submit stays on register', async ({ registerPage }) => {
      await registerPage.submit();
      await registerPage.expectStaysOnRegister();
    });

    // Purpose: Require a non-empty name before signup proceeds.
    // Technique: Negative Testing.
    // Validates: Client shows "Name is required" and blocks navigation.
    test('[REG-NEG-02] empty name shows name required', async ({ registerPage }) => {
      await registerPage.register('', uniqueEmail('neg'), DEFAULT_PASSWORD);
      await registerPage.expectNameRequired();
      await registerPage.expectStaysOnRegister();
    });

    // Purpose: Reject malformed email strings.
    // Technique: Negative Testing.
    // Validates: Invalid email message appears and signup is blocked.
    test('[REG-NEG-03] invalid email format', async ({ registerPage }) => {
      await registerPage.register('Test User', 'bad-email', DEFAULT_PASSWORD);
      await registerPage.expectInvalidEmail();
      await registerPage.expectStaysOnRegister();
    });

    // Purpose: Enforce minimum password length on the client.
    // Technique: Negative Testing.
    // Validates: Short passwords show length error and stay on register.
    test('[REG-NEG-04] password below minimum length', async ({ registerPage }) => {
      await registerPage.register('Test', uniqueEmail('neg'), SHORT_PASSWORD);
      await registerPage.expectPasswordMinLength();
      await registerPage.expectStaysOnRegister();
    });

    // Purpose: Surface server-side duplicate email conflict in the UI.
    // Technique: Negative Testing.
    // Validates: Second signup with same email shows "Email already in use".
    test('[REG-NEG-05] duplicate email shows server banner', async ({
      registerPage,
      trackEmail,
    }) => {
      const email = uniqueEmail('dup');
      trackEmail(email);
      await registerPage.registerExpectSuccess('First User', email, DEFAULT_PASSWORD);
      await registerPage.goto();
      await registerPage.register('Second User', email, DEFAULT_PASSWORD);
      await registerPage.expectDuplicateEmailError();
      await registerPage.expectStaysOnRegister();
    });

    // Purpose: Reject whitespace-only input across all fields.
    // Technique: Negative Testing.
    // Validates: Trimmed-empty values do not create accounts.
    test('[REG-NEG-06] whitespace-only fields rejected', async ({ registerPage }) => {
      await registerPage.register('   ', '   ', '   ');
      await registerPage.expectStaysOnRegister();
    });
  });

  // ─── Decision table @decision ─────────────────────────────────────────────
  uiSuite('Decision table @decision', () => {
    // Purpose: Row — all inputs valid → signup succeeds.
    // Technique: Decision Table Testing.
    // Validates: Combined valid name, email, password produces dashboard.
    test('[REG-DT-01] valid name + valid email + valid password', async ({
      registerPage,
      trackEmail,
    }) => {
      const email = uniqueEmail('dt');
      trackEmail(email);
      await registerPage.registerExpectSuccess('DT User', email, DEFAULT_PASSWORD);
    });

    // Purpose: Row — empty name blocks signup regardless of other fields.
    // Technique: Decision Table Testing.
    // Validates: Name is a hard gate in the decision matrix.
    test('[REG-DT-02] empty name blocks signup', async ({ registerPage }) => {
      await registerPage.register('', uniqueEmail('dt'), DEFAULT_PASSWORD);
      await registerPage.expectNameRequired();
    });

    // Purpose: Row — invalid email blocks signup.
    // Technique: Decision Table Testing.
    // Validates: Email validity is required even when name/password are fine.
    test('[REG-DT-03] invalid email blocks signup', async ({ registerPage }) => {
      await registerPage.register('User', 'no-at-sign', DEFAULT_PASSWORD);
      await registerPage.expectInvalidEmail();
    });

    // Purpose: Row — short password blocks signup.
    // Technique: Decision Table Testing.
    // Validates: Password length rule applies with otherwise valid inputs.
    test('[REG-DT-04] short password blocks signup', async ({ registerPage }) => {
      await registerPage.register('User', uniqueEmail('dt'), '123'); // 3 chars — below min
      await registerPage.expectPasswordMinLength();
    });

    // Purpose: Row — all fields empty → no navigation.
    // Technique: Decision Table Testing.
    // Validates: Default empty state never auto-submits to dashboard.
    test('[REG-DT-05] all empty fields stay on register', async ({ registerPage }) => {
      await registerPage.submit();
      await registerPage.expectStaysOnRegister();
    });

    // Purpose: Row — valid name + invalid email + valid password → blocked.
    // Technique: Decision Table Testing.
    // Validates: A single invalid dimension prevents success.
    test('[REG-DT-06] valid name invalid email valid password blocks signup', async ({
      registerPage,
    }) => {
      await registerPage.register('Decision User', 'not-valid', DEFAULT_PASSWORD);
      await registerPage.expectInvalidEmail();
      await registerPage.expectStaysOnRegister();
    });

    // Purpose: Row — valid name + valid email + invalid password → blocked.
    // Technique: Decision Table Testing.
    // Validates: Password rule is enforced independently of name/email.
    test('[REG-DT-07] valid name valid email invalid password blocks signup', async ({
      registerPage,
    }) => {
      await registerPage.register('Decision User', uniqueEmail('dt'), '12');
      await registerPage.expectPasswordMinLength();
      await registerPage.expectStaysOnRegister();
    });
  });

  // ─── Form field validation @validation ────────────────────────────────────
  uiSuite('Form field validation @validation', () => {
    // Purpose: Confirm placeholder hints match the design spec.
    // Technique: Form Field Validation.
    // Validates: UX hints for name and email fields are visible.
    test('[REG-FFV-01] placeholders match design', async ({ registerPage }) => {
      await registerPage.expectPlaceholdersVisible();
    });

    // Purpose: Ensure fields start empty on a fresh page load.
    // Technique: Form Field Validation.
    // Validates: No stale autofill or default values leak into the form.
    test('[REG-FFV-02] fields empty on load', async ({ registerPage }) => {
      await registerPage.expectFieldsEmpty();
    });

    // Purpose: Verify controlled inputs reflect typed text.
    // Technique: Form Field Validation.
    // Validates: Name field accepts and displays user input.
    test('[REG-FFV-03] typing updates field values', async ({ registerPage }) => {
      await registerPage.nameInput().fill('Typed Name');
      await expect(registerPage.nameInput()).toHaveValue('Typed Name');
    });

    // Purpose: Verify the email field binds input correctly.
    // Technique: Form Field Validation.
    // Validates: Email input updates its value as the user types.
    test('[REG-FFV-04] email field accepts typed input', async ({ registerPage }) => {
      await registerPage.emailInput().fill('typed@example.com');
      await expect(registerPage.emailInput()).toHaveValue('typed@example.com');
    });
  });

  // ─── Error messages @error ────────────────────────────────────────────────
  uiSuite('Error messages @error', () => {
    // Purpose: Show the correct copy for invalid email errors.
    // Technique: Error Message Validation.
    // Validates: User sees "Invalid email" for malformed addresses.
    test('[REG-ERR-01] invalid email error text', async ({ registerPage }) => {
      await registerPage.register('U', 'x', DEFAULT_PASSWORD);
      await registerPage.expectInvalidEmail();
    });

    // Purpose: Surface password required/min-length messaging when empty.
    // Technique: Error Message Validation.
    // Validates: Empty password triggers a visible validation message.
    test('[REG-ERR-02] empty password shows min/required message', async ({
      registerPage,
    }) => {
      await registerPage.register('User', uniqueEmail('err'), '');
      await registerPage.expectPasswordEmptyOrMinError();
    });

    // Purpose: Confirm inline errors clear after the user fixes input.
    // Technique: Error Message Validation.
    // Validates: Correcting email removes the invalid-email message.
    test('[REG-ERR-03] error clears after fixing email', async ({ registerPage, trackEmail }) => {
      await registerPage.register('User', 'bad', DEFAULT_PASSWORD);
      await registerPage.expectInvalidEmail();
      await registerPage.emailInput().clear();
      const email = uniqueEmail('err-fix');
      trackEmail(email);
      await registerPage.emailInput().fill(email);
      await expect(
        registerPage.page.getByText(MESSAGES.register.invalidEmail),
      ).not.toBeVisible();
    });
  });

  // ─── BVA @bva ─────────────────────────────────────────────────────────────
  uiSuite('BVA @bva', () => {
    // Purpose: Test password length one below the minimum (5 chars).
    // Technique: Boundary Value Analysis.
    // Validates: Lower bound-1 is rejected.
    test('[REG-BVA-01] password 5 chars rejected', async ({ registerPage }) => {
      await registerPage.register('User', uniqueEmail('bva'), 'Pass1');
      await registerPage.expectPasswordMinLength();
      await registerPage.expectStaysOnRegister();
    });

    // Purpose: Test password at exact minimum length (6 chars).
    // Technique: Boundary Value Analysis.
    // Validates: Inclusive lower bound is accepted.
    test('[REG-BVA-02] password 6 chars accepted', async ({
      registerPage,
      trackEmail,
    }) => {
      const email = uniqueEmail('bva');
      trackEmail(email);
      const pwd = 'a'.repeat(registerPage.passwordMinLength());
      await registerPage.registerExpectSuccess('Boundary', email, pwd);
    });

    // Purpose: Test password one above minimum (7 chars).
    // Technique: Boundary Value Analysis.
    // Validates: Upper bound+1 of valid class is accepted.
    test('[REG-BVA-03] password 7 chars accepted', async ({
      registerPage,
      trackEmail,
    }) => {
      const email = uniqueEmail('bva');
      trackEmail(email);
      await registerPage.registerExpectSuccess('Boundary', email, `${MIN_PASSWORD}g`);
    });

    // Purpose: Test minimum name length (1 character).
    // Technique: Boundary Value Analysis.
    // Validates: Single-character names are allowed.
    test('[REG-BVA-04] name 1 char accepted', async ({
      registerPage,
      trackEmail,
    }) => {
      const email = uniqueEmail('bva');
      trackEmail(email);
      await registerPage.registerExpectSuccess('A', email, DEFAULT_PASSWORD);
    });

    // Purpose: Stress-test a long but valid email local-part.
    // Technique: Boundary Value Analysis.
    // Validates: A 64-character local-part still completes signup successfully.
    test('[REG-BVA-05] very long email handled safely', async ({
      registerPage,
      trackEmail,
    }) => {
      const longLocal = `${Date.now()}${'a'.repeat(48)}`.slice(0, 64);
      const email = `${longLocal}@example.com`;
      trackEmail(email);
      await registerPage.registerExpectSuccess('User', email, DEFAULT_PASSWORD);
    });

    // Purpose: Test empty password boundary (0 characters).
    // Technique: Boundary Value Analysis.
    // Validates: Zero-length password is rejected at the lower bound.
    test('[REG-BVA-06] empty password at lower bound rejected', async ({
      registerPage,
    }) => {
      await registerPage.register('User', uniqueEmail('bva'), '');
      await registerPage.expectPasswordEmptyOrMinError();
      await registerPage.expectStaysOnRegister();
    });

    // Purpose: Test a long but valid password (128 chars).
    // Technique: Boundary Value Analysis.
    // Validates: Upper-bound password length does not break signup.
    test('[REG-BVA-07] long password 128 chars accepted', async ({
      registerPage,
      trackEmail,
    }) => {
      const email = uniqueEmail('bva-long');
      trackEmail(email);
      await registerPage.registerExpectSuccess(
        'User',
        email,
        'a'.repeat(LONG_PASSWORD_LENGTH),
      );
    });
  });

  // ─── Equivalence partitioning @ep ─────────────────────────────────────────
  uiSuite('Equivalence partitioning @ep', () => {
    // Purpose: Representative from the valid email equivalence class.
    // Technique: Equivalence Partitioning.
    // Validates: Well-formed email leads to successful registration.
    test('[REG-EP-01] valid email class → success', async ({
      registerPage,
      trackEmail,
    }) => {
      const email = uniqueEmail('ep');
      trackEmail(email);
      await registerPage.registerExpectSuccess('EP User', email, DEFAULT_PASSWORD);
    });

    // Purpose: Representative from invalid email class (missing TLD).
    // Technique: Equivalence Partitioning.
    // Validates: Incomplete domain is rejected.
    test('[REG-EP-02] invalid email class (no TLD) → error', async ({
      registerPage,
    }) => {
      await registerPage.register('EP', 'user@', DEFAULT_PASSWORD);
      await registerPage.expectInvalidEmail();
    });

    // Purpose: Representative from valid password class (length ≥ 6).
    // Technique: Equivalence Partitioning.
    // Validates: Minimum-strength valid password succeeds.
    test('[REG-EP-03] valid password class (>=6) → success', async ({
      registerPage,
      trackEmail,
    }) => {
      const email = uniqueEmail('ep');
      trackEmail(email);
      await registerPage.registerExpectSuccess('EP', email, MIN_PASSWORD);
    });

    // Purpose: Representative from invalid password class (length < 6).
    // Technique: Equivalence Partitioning.
    // Validates: Weak password partition is blocked.
    test('[REG-EP-04] invalid password class (<6) → error', async ({
      registerPage,
    }) => {
      await registerPage.register('EP', uniqueEmail('ep'), 'abc');
      await registerPage.expectPasswordMinLength();
    });

    // Purpose: Representative from valid name class (alphabetic).
    // Technique: Equivalence Partitioning.
    // Validates: Normal alphabetic names are accepted.
    test('[REG-EP-05] valid name class (letters) → success', async ({
      registerPage,
      trackEmail,
    }) => {
      const email = uniqueEmail('ep');
      trackEmail(email);
      await registerPage.registerExpectSuccess('Valid Name', email, DEFAULT_PASSWORD);
    });

    // Purpose: Representative from invalid name class (empty string).
    // Technique: Equivalence Partitioning.
    // Validates: Empty name partition triggers required error.
    test('[REG-EP-06] invalid name class (empty) → error', async ({
      registerPage,
    }) => {
      await registerPage.register('', uniqueEmail('ep'), DEFAULT_PASSWORD);
      await registerPage.expectNameRequired();
    });

    // Purpose: Email partition missing domain segment (no dot).
    // Technique: Equivalence Partitioning.
    // Validates: user@domain without TLD stays in invalid class.
    test('[REG-EP-07] email missing domain dot → error', async ({ registerPage }) => {
      await registerPage.register('EP', 'user@domain', DEFAULT_PASSWORD);
      await registerPage.expectInvalidEmail();
    });

    // Purpose: Password partition of whitespace-only characters (5 spaces).
    // Technique: Equivalence Partitioning.
    // Validates: Whitespace-only password below min length is rejected.
    test('[REG-EP-08] whitespace-only password class → error', async ({
      registerPage,
    }) => {
      await registerPage.register('EP', uniqueEmail('ep'), WHITESPACE_ONLY_PASSWORD);
      await registerPage.expectPasswordMinLength();
      await registerPage.expectStaysOnRegister();
    });
  });

  // ─── Security @security ───────────────────────────────────────────────────
  uiSuite('Security @security', () => {
    // Purpose: Ensure XSS payloads in name are stored safely without execution.
    // Technique: Basic Security Testing (XSS).
    // Validates: No alert dialog fires; React escapes rendered content.
    test('[REG-SEC-01] XSS in name does not execute script', async ({
      page,
      registerPage,
      trackEmail,
    }) => {
      let dialogFired = false;
      page.on('dialog', () => {
        dialogFired = true;
      });
      const email = uniqueEmail('sec-xss');
      trackEmail(email);
      await registerPage.registerExpectSuccess(XSS_PAYLOAD, email, DEFAULT_PASSWORD);
      expect(dialogFired).toBe(false);
    });

    // Purpose: Reject SQL-injection-style strings in the email field.
    // Technique: Basic Security Testing (SQLi).
    // Validates: Injection pattern does not bypass validation or crash the app.
    test('[REG-SEC-02] SQLi-style email rejected or stays safe', async ({
      registerPage,
    }) => {
      await registerPage.register('User', SQLI_PAYLOAD, DEFAULT_PASSWORD);
      await registerPage.expectInvalidEmail();
      await registerPage.expectStaysOnRegister();
    });

    // Purpose: Block XSS-like strings in the email input.
    // Technique: Basic Security Testing (XSS).
    // Validates: Script tags in email never reach a success redirect.
    test('[REG-SEC-03] XSS string in email stays on register', async ({
      registerPage,
    }) => {
      await registerPage.register('User', `${XSS_PAYLOAD}@test.com`, DEFAULT_PASSWORD);
      await registerPage.expectInvalidEmail();
      await registerPage.expectStaysOnRegister();
    });

    // Purpose: Handle accidental double-click on submit gracefully.
    // Technique: Basic Security Testing (abuse / double-submit).
    // Validates: Double-click still completes a single successful registration.
    test('[REG-SEC-04] double-click submit handled gracefully', async ({
      registerPage,
      trackEmail,
    }) => {
      const email = uniqueEmail('sec');
      trackEmail(email);
      await registerPage.fillForm('Double', email, DEFAULT_PASSWORD);
      await expect(registerPage.submitButton()).toBeEnabled();
      const responsePromise = registerPage.page.waitForResponse(
        (r) => r.url().includes('/api/auth/register') && r.request().method() === 'POST',
      );
      await registerPage.submitButton().dblclick();
      const response = await responsePromise;
      expect(response.ok()).toBeTruthy();
      await registerPage.expectOnDashboard();
    });

    // Purpose: Ensure credentials never appear in the browser URL.
    // Technique: Basic Security Testing (credential leakage).
    // Validates: Password is not appended to query string or path.
    test('[REG-SEC-05] password not leaked in URL', async ({ page, registerPage }) => {
      await registerPage.register('User', 'not-valid', SECRET_PASSWORD);
      expect(page.url()).not.toContain(SECRET_PASSWORD);
      await registerPage.expectStaysOnRegister();
    });

    // Purpose: Reject path-traversal-like strings in the name field.
    // Technique: Basic Security Testing (injection).
    // Validates: Suspicious path strings register safely without code execution.
    test('[REG-SEC-06] path traversal string in name stays safe', async ({
      registerPage,
      trackEmail,
    }) => {
      const email = uniqueEmail('sec-path');
      trackEmail(email);
      await registerPage.registerExpectSuccess('../../etc/passwd', email, DEFAULT_PASSWORD);
    });

    // Purpose: Reject null-byte patterns in email input.
    // Technique: Basic Security Testing (injection).
    // Validates: Null-byte email never reaches dashboard.
    test('[REG-SEC-07] null-byte email pattern rejected', async ({ registerPage }) => {
      await registerPage.register('User', 'user%00@test.com', DEFAULT_PASSWORD);
      await registerPage.expectInvalidEmail();
      await registerPage.expectStaysOnRegister();
    });
  });

  // ─── Accessibility @accessibility ─────────────────────────────────────────
  uiSuite('Accessibility @accessibility', () => {
    // Purpose: Verify visible label text is associated with inputs.
    // Technique: Basic Accessibility Testing.
    // Validates: Screen readers can discover field labels.
    test('[REG-A11Y-01] inputs have accessible labels', async ({ registerPage }) => {
      await registerPage.expectFormLabels();
    });

    // Purpose: Confirm logical tab order through the form fields.
    // Technique: Basic Accessibility Testing.
    // Validates: Keyboard users reach name → email → password in order.
    test('[REG-A11Y-02] tab order through form fields', async ({
      page,
      registerPage,
    }) => {
      await registerPage.nameInput().focus();
      await page.keyboard.press('Tab');
      await expect(registerPage.emailInput()).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(registerPage.passwordInput()).toBeFocused();
    });

    // Purpose: Ensure the submit control is reachable via keyboard.
    // Technique: Basic Accessibility Testing.
    // Validates: Sign Up button can receive focus.
    test('[REG-A11Y-03] Sign Up button is focusable', async ({ registerPage }) => {
      await registerPage.submitButton().focus();
      await expect(registerPage.submitButton()).toBeFocused();
    });

    // Purpose: Ensure the login link is reachable via keyboard.
    // Technique: Basic Accessibility Testing.
    // Validates: Sign in link can receive focus for keyboard navigation.
    test('[REG-A11Y-04] Sign in link is focusable', async ({ registerPage }) => {
      await registerPage.signInLink().focus();
      await expect(registerPage.signInLink()).toBeFocused();
    });

    // Purpose: Confirm the page title/heading is visible (CardTitle is a div).
    // Technique: Basic Accessibility Testing.
    // Validates: Primary heading text is perceivable on load.
    test('[REG-A11Y-05] page has visible title text', async ({ registerPage }) => {
      await registerPage.expectOnPage();
    });

    // Purpose: Verify getByLabel locators resolve for every field.
    // Technique: Basic Accessibility Testing.
    // Validates: Programmatic label association works for automation and AT.
    test('[REG-A11Y-06] getByLabel locators resolve for all fields', async ({
      registerPage,
    }) => {
      await registerPage.expectLabelsAccessibleViaGetByLabel();
    });

    // Purpose: Submit the form via keyboard from the password field.
    // Technique: Basic Accessibility Testing.
    // Validates: Enter on last field completes signup without mouse.
    test('[REG-A11Y-07] keyboard Enter on password submits form', async ({
      registerPage,
      trackEmail,
    }) => {
      const email = uniqueEmail('a11y');
      trackEmail(email);
      await registerPage.fillForm('Keyboard User', email, DEFAULT_PASSWORD);
      await registerPage.passwordInput().focus();
      await registerPage.submitWithEnterOnPassword();
    });
  });

  // ─── Usability @usability ──────────────────────────────────────────────────
  uiSuite('Usability @usability', () => {
    // Purpose: Let users switch to login without creating an account.
    // Technique: Usability Testing. Test
    // Validates: Sign-in path is one click away.
    test('[REG-USE-01] user can navigate to login without registering', async ({
      page,
      registerPage,
    }) => {
      await registerPage.goToLogin();
      await expect(page).toHaveURL(/\/login$/);
    });

    // Purpose: Confirm password characters are hidden while typing.
    // Technique: Usability Testing.
    // Validates: Masking protects shoulder-surfing during entry.
    test('[REG-USE-02] password field masks input', async ({ registerPage }) => {
      await registerPage.passwordInput().fill('visible');
      await registerPage.expectPasswordMasked();
    });

    // Purpose: Preserve user input after a failed validation attempt.
    // Technique: Usability Testing.
    // Validates: Name/email are not cleared when password fails validation.
    test('[REG-USE-03] fields retain values after validation error', async ({
      registerPage,
    }) => {
      const email = uniqueEmail('use');
      await registerPage.register('Retain Me', email, SHORT_PASSWORD);
      await registerPage.expectPasswordMinLength();
      await registerPage.expectFieldsRetainValues({
        name: 'Retain Me',
        email,
      });
    });

    // Purpose: Confirm the submit button has an actionable accessible name.
    // Technique: Usability Testing.
    // Validates: CTA label "Sign Up" is exposed to users and assistive tech.
    test('[REG-USE-04] sign up button has readable accessible name', async ({
      registerPage,
    }) => {
      await expect(registerPage.submitButton()).toHaveAccessibleName('Sign Up');
    });
  });

  // ─── API @api (no page navigation) ────────────────────────────────────────
  test.describe('API @api', () => {
    // Purpose: Verify successful registration contract over HTTP.
    // Technique: API Testing.
    // Validates: POST /api/auth/register returns 201 with expected body shape.
    test('[REG-API-01] POST valid user returns 201', async ({ request, trackEmail }) => {
      const email = uniqueEmail('api');
      trackEmail(email);
      const res = await registerUser(request, {
        name: 'API User',
        email,
        password: DEFAULT_PASSWORD,
      });
      expect(res.status()).toBe(201);
      await expectAuthSuccessBody(res, 'register');
    });

    // Purpose: Reject payloads missing the name field.
    // Technique: API Testing.
    // Validates: Server returns 400 with error JSON.
    test('[REG-API-02] missing name returns 400', async ({ request }) => {
      const res = await registerUser(request, {
        email: uniqueEmail('api'),
        password: DEFAULT_PASSWORD,
      });
      await expectErrorBody(res, [400]);
    });

    // Purpose: Reject syntactically invalid email addresses.
    // Technique: API Testing.
    // Validates: Email schema validation on the API layer.
    test('[REG-API-03] invalid email returns 400', async ({ request }) => {
      const res = await registerUser(request, {
        name: 'User',
        email: 'not-an-email',
        password: DEFAULT_PASSWORD,
      });
      await expectErrorBody(res, [400]);
    });

    // Purpose: Enforce password length on the server.
    // Technique: API Testing.
    // Validates: Short passwords return 400 even if UI is bypassed.
    test('[REG-API-04] short password returns 400', async ({ request }) => {
      const res = await registerUser(request, {
        name: 'User',
        email: uniqueEmail('api'),
        password: '123',
      });
      await expectErrorBody(res, [400]);
    });

    // Purpose: Prevent duplicate account creation at the API layer.
    // Technique: API Testing.
    // Validates: Second POST with same email returns 409 conflict.
    test('[REG-API-05] duplicate email returns 409', async ({ request, trackEmail }) => {
      const email = uniqueEmail('api-dup');
      trackEmail(email);
      const first = await registerUser(request, {
        name: 'First',
        email,
        password: DEFAULT_PASSWORD,
      });
      expect(first.status()).toBe(201);
      const res = await registerUser(request, {
        name: 'Second',
        email,
        password: DEFAULT_PASSWORD,
      });
      const body = await expectErrorBody(res, [409]);
      expect(body.error).toMatch(/already in use/i);
    });

    // Purpose: Confirm email normalisation to lowercase in persistence.
    // Technique: API Testing.
    // Validates: Mixed-case input is stored as lowercase in the response body.
    test('[REG-API-06] email stored lowercase', async ({ request, trackEmail }) => {
      const local = `Mixed${Date.now()}`;
      const email = `${local}@Example.COM`;
      trackEmail(email.toLowerCase());
      const res = await registerUser(request, {
        name: 'Mixed',
        email,
        password: DEFAULT_PASSWORD,
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.user.email).toBe(email.toLowerCase());
    });

    // Purpose: Reject completely empty JSON bodies.
    // Technique: API Testing.
    // Validates: API does not accept {} as a valid registration payload.
    test('[REG-API-07] empty JSON body returns 400', async ({ request }) => {
      const res = await request.post(`${env.baseURL}/api/auth/register`, { data: {} });
      await expectErrorBody(res, [400]);
    });

    // Purpose: Assert the success schema includes id, email, and message.
    // Technique: API Testing.
    // Validates: Contract fields required by downstream UI/clients exist.
    test('[REG-API-08] success body has user id and email', async ({
      request,
      trackEmail,
    }) => {
      const email = uniqueEmail('api');
      trackEmail(email);
      const res = await registerUser(request, {
        name: 'Schema',
        email,
        password: DEFAULT_PASSWORD,
      });
      const body = await expectAuthSuccessBody(res, 'register');
      expect(body.user).toMatchObject({
        id: expect.any(Number),
        email,
        name: 'Schema',
      });
      expect(body.message).toBe(MESSAGES.api.registerSuccess);
    });

    // Purpose: Ensure plain-text passwords never appear in API responses.
    // Technique: API Testing (security).
    // Validates: Response body and raw text exclude the submitted password.
    test('[REG-API-09] response never contains plain password', async ({
      request,
      trackEmail,
    }) => {
      const email = uniqueEmail('api-sec');
      trackEmail(email);
      const res = await registerUser(request, {
        name: 'Secret',
        email,
        password: SECRET_PASSWORD,
      });
      expect(res.status()).toBe(201);
      const body = await expectAuthSuccessBody(res, 'register');
      expect(JSON.stringify(body)).not.toContain(SECRET_PASSWORD);
      expect(body.user).not.toHaveProperty('password');
    });

    // Purpose: Reject payloads missing the email field.
    // Technique: API Testing.
    // Validates: Server returns 400 when email is omitted.
    test('[REG-API-10] missing email returns 400', async ({ request }) => {
      const res = await registerUser(request, {
        name: 'User',
        password: DEFAULT_PASSWORD,
      });
      await expectErrorBody(res, [400]);
    });

    // Purpose: Reject payloads missing the password field.
    // Technique: API Testing.
    // Validates: Server returns 400 when password is omitted.
    test('[REG-API-11] missing password returns 400', async ({ request }) => {
      const res = await registerUser(request, {
        name: 'User',
        email: uniqueEmail('api'),
      });
      await expectErrorBody(res, [400]);
    });

    // Purpose: Reject whitespace-only name after server trim.
    // Technique: API Testing.
    // Validates: Trimmed-empty name returns 400.
    test('[REG-API-12] whitespace-only name returns 400', async ({ request }) => {
      const res = await registerUser(request, {
        name: '   ',
        email: uniqueEmail('api'),
        password: DEFAULT_PASSWORD,
      });
      await expectErrorBody(res, [400]);
    });

    // Purpose: Reject whitespace-only password below minimum length via API.
    // Technique: API Testing.
    // Validates: Short whitespace password returns 400.
    test('[REG-API-13] whitespace-only password returns 400', async ({ request }) => {
      const res = await registerUser(request, {
        name: 'User',
        email: uniqueEmail('api'),
        password: WHITESPACE_ONLY_PASSWORD,
      });
      await expectErrorBody(res, [400]);
    });
  });

  // ─── Integration @integration ─────────────────────────────────────────────
  test.describe('Integration @integration', () => {
    test.describe.configure({ timeout: 60_000 });
    // Purpose: End-to-end UI signup reflects in dashboard welcome state.
    // Technique: Integration Testing (Signup → Dashboard).
    // Validates: Registered name appears immediately after redirect.
    test('[REG-INT-01] signup then dashboard welcome', async ({
      registerPage,
      dashboardPage,
      trackEmail,
    }) => {
      const email = uniqueEmail('int');
      trackEmail(email);
      await registerPage.goto();
      await registerPage.registerExpectSuccess('Integration User', email, DEFAULT_PASSWORD);
      await dashboardPage.expectWelcomeFor('Integration User');
    });

    // Purpose: Full auth lifecycle — signup, logout, login with new credentials.
    // Technique: Integration Testing (Signup → Login).
    // Validates: New account credentials work on the login page.
    test('[REG-INT-02] signup logout login with new account', async ({
      registerPage,
      loginPage,
      appLayout,
      dashboardPage,
      trackEmail,
    }) => {
      const email = uniqueEmail('int');
      trackEmail(email);
      await registerPage.goto();
      await registerPage.registerExpectSuccess('Flow User', email, DEFAULT_PASSWORD);
      await appLayout.logout();
      await loginPage.loginExpectSuccess(email, DEFAULT_PASSWORD);
      await dashboardPage.expectWelcomeFor('Flow User');
    });

    // Purpose: Block duplicate UI registration after a successful first signup.
    // Technique: Integration Testing.
    // Validates: Server conflict surfaces in UI after logout + retry.
    test('[REG-INT-03] duplicate signup blocked after first success', async ({
      registerPage,
      appLayout,
      trackEmail,
    }) => {
      const email = uniqueEmail('int-dup');
      trackEmail(email);
      await registerPage.goto();
      await registerPage.registerExpectSuccess('First', email, DEFAULT_PASSWORD);
      await appLayout.logout();
      await registerPage.goto();
      await registerPage.registerExpectConflict('Second', email, DEFAULT_PASSWORD);
      await registerPage.expectDuplicateEmailError();
      await registerPage.expectStaysOnRegister();
    });

    // Purpose: Handle revisiting /register while already authenticated.
    // Technique: Integration Testing.
    // Validates: No crash when a logged-in user opens /register (app keeps session).
    test('[REG-INT-04] logged-in user visiting register', async ({
      page,
      registerPage,
      trackEmail,
    }) => {
      const email = uniqueEmail('int');
      trackEmail(email);
      await registerPage.goto();
      await registerPage.registerExpectSuccess('Logged', email, DEFAULT_PASSWORD);
      await registerPage.goto();
      await expect(page).toHaveURL(/\/(dashboard|register)/);
    });

    // Purpose: API-created user can authenticate via UI login.
    // Technique: Integration Testing (API → UI).
    // Validates: API persistence matches what login UI accepts; email shown in sidebar.
    test('[REG-INT-05] api signup then ui login shows account email', async ({
      page,
      request,
      loginPage,
      dashboardPage,
      trackEmail,
    }) => {
      const email = uniqueEmail('int-api');
      trackEmail(email);
      const res = await registerUser(request, {
        name: 'API Then UI',
        email,
        password: DEFAULT_PASSWORD,
      });
      expect(res.status()).toBe(201);
      const body = await expectAuthSuccessBody(res, 'register');
      expect(body.user.email).toBe(email);

      await loginPage.goto();
      await loginPage.login(email, DEFAULT_PASSWORD);
      await dashboardPage.expectWelcomeFor('API Then UI');
      await expect(page.getByText(email, { exact: true })).toBeVisible();
    });
  });
});

