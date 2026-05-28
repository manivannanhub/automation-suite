# Command Center Playwright Test Scenarios And User Stories

## Document Purpose

This document defines user stories, acceptance criteria, and Playwright automation scenarios for the Command Center application. It covers UI, API, system integration, and end-to-end behavior for the modules available at `http://localhost:3005`.

## Automation Context

- App URL: `http://localhost:3005`
- Playwright config: `tests/playwright.config.ts`
- Test folder: `tests/src`
- Browser project: Chromium
- App server health endpoint: `/api/healthz`
- Primary selector strategy: `data-testid`

## Core Routes And Selectors

| Area | Route | Key Selectors |
| --- | --- | --- |
| Register | `/register` | `input-name`, `input-email`, `input-password`, `button-register`, `link-login`, `register-error` |
| Login | `/login` | `input-email`, `input-password`, `button-login`, `link-register`, `login-error` |
| Dashboard | `/dashboard` | `text-welcome`, `stat-total`, `stat-completed`, `stat-pending`, `input-quick-todo`, `button-quick-add-todo` |
| Layout | Protected pages | `nav-dashboard`, `nav-todos`, `nav-notes`, `nav-contact`, `nav-products`, `button-logout` |
| Todos | `/todos` | `input-new-todo`, `button-add-todo`, `todo-item-{id}`, `checkbox-todo-{id}`, `button-edit-todo-{id}`, `input-edit-todo-{id}`, `button-delete-todo-{id}` |
| Notes | `/notes` | `button-new-note`, `note-card-{id}`, `input-note-title`, `input-note-content`, `button-save-note`, `button-delete-note-{id}` |
| Contact | `/contact` | `contact-form`, `input-contact-name`, `input-contact-email`, `input-contact-message`, `button-submit-contact`, `success-banner` |
| Products | `/products` | `product-search`, `select-sort-by`, `select-sort-order`, `product-card-{id}`, `[data-product-name]` |

## Test Data Strategy

- Generate unique emails using timestamp or counter, for example `testuser_${Date.now()}@example.com`.
- Use a stable password such as `password123` for happy-path auth tests.
- Keep auth test users independent per test to avoid cross-test coupling.
- Use browser context isolation for each test.
- Use `localStorage` checks for Notes persistence.
- Avoid hardcoding dynamic IDs; read IDs from `data-testid` prefixes where needed.

## Login And Register Module

### User Stories

#### Story AUTH-001: Register A New User

As a new user, I want to create an account, so that I can access the protected command center features.

Acceptance criteria:

```gherkin
Given I am on the register page
When I enter a valid name, email, and password
And I submit the register form
Then I should be redirected to the dashboard
And I should see a personalized welcome message
```

#### Story AUTH-002: Login Existing User

As a registered user, I want to log in with my credentials, so that I can continue using my dashboard.

Acceptance criteria:

```gherkin
Given I have an existing account
And I am on the login page
When I enter my valid email and password
And I submit the login form
Then I should be redirected to the dashboard
And I should see the logout button
```

#### Story AUTH-003: Reject Invalid Auth Attempts

As a user, I want clear validation and authentication errors, so that I understand how to fix login or signup problems.

Acceptance criteria:

```gherkin
Given I am on the login or register page
When I submit invalid or incomplete credentials
Then I should remain on the current page
And I should see an appropriate validation or server error message
```

### Positive Test Scenarios

| ID | Scenario | Playwright Steps | Expected Result |
| --- | --- | --- | --- |
| AUTH-POS-001 | Register with valid details | Go to `/register`, fill `input-name`, `input-email`, `input-password`, click `button-register` | URL becomes `/dashboard`; `text-welcome` contains user name |
| AUTH-POS-002 | Login with valid credentials | Register user, logout, fill login fields, click `button-login` | URL becomes `/dashboard`; protected layout is visible |
| AUTH-POS-003 | Navigate from login to register | Go to `/login`, click `link-register` | URL becomes `/register` |
| AUTH-POS-004 | Navigate from register to login | Go to `/register`, click `link-login` | URL becomes `/login` |
| AUTH-POS-005 | Logout authenticated user | Login/register, click `button-logout` | URL becomes `/login` |

### Negative Test Scenarios

| ID | Scenario | Input | Expected Result |
| --- | --- | --- | --- |
| AUTH-NEG-001 | Register without name | Empty name, valid email/password | Remains on `/register`; name validation appears |
| AUTH-NEG-002 | Register invalid email | `bad-email` | Remains on `/register`; email validation appears |
| AUTH-NEG-003 | Register short password | Password less than 6 characters | Remains on `/register`; password validation appears |
| AUTH-NEG-004 | Register duplicate email | Existing email | `register-error` contains `Email already in use` |
| AUTH-NEG-005 | Login missing account | Unknown email/password | `login-error` contains `Invalid email or password` |
| AUTH-NEG-006 | Login wrong password | Existing email, wrong password | `login-error` contains `Invalid email or password` |
| AUTH-NEG-007 | Access protected route unauthenticated | Go to `/dashboard` without session | Redirects to `/login` |

### Functional Tests

- Verify all auth fields accept keyboard input.
- Verify submit buttons trigger form submission.
- Verify form validation prevents invalid submission.
- Verify auth error messages are visible and readable.
- Verify logout invalidates access to protected routes.
- Verify protected pages do not render content while unauthenticated.

### SIT Tests

| ID | Scenario | Validation |
| --- | --- | --- |
| AUTH-SIT-001 | Register UI calls `/api/auth/register` | Intercept request with `page.waitForResponse`; expect `201` |
| AUTH-SIT-002 | Login UI calls `/api/auth/login` | Expect successful auth response and session cookie |
| AUTH-SIT-003 | Dashboard auth guard calls `/api/auth/me` | After login, expect user object returned |
| AUTH-SIT-004 | Logout calls `/api/auth/logout` | Expect logout response and redirect |

### E2E Flows

```gherkin
Given I register a new user
When I land on the dashboard
And I log out
And I log back in with the same credentials
Then I should return to the dashboard successfully
```

## Dashboard And Navigation

### User Stories

#### Story DASH-001: View Dashboard Summary

As an authenticated user, I want to see my dashboard summary, so that I can quickly understand my task status.

Acceptance criteria:

```gherkin
Given I am logged in
When I visit the dashboard
Then I should see my name
And I should see total, completed, and pending task stats
```

#### Story DASH-002: Navigate Between Modules

As an authenticated user, I want sidebar navigation, so that I can move between app modules quickly.

Acceptance criteria:

```gherkin
Given I am logged in
When I click a sidebar navigation item
Then I should be taken to the selected module page
```

### Positive Test Scenarios

| ID | Scenario | Expected Result |
| --- | --- | --- |
| DASH-POS-001 | Dashboard loads after register | Welcome text is visible |
| DASH-POS-002 | Stats render on dashboard | `stat-total`, `stat-completed`, `stat-pending` visible |
| DASH-POS-003 | Quick add todo from dashboard | Total stat increases after adding todo |
| DASH-POS-004 | Navigate to Todos | Click `nav-todos`; URL becomes `/todos` |
| DASH-POS-005 | Navigate to Notes | Click `nav-notes`; URL becomes `/notes` |
| DASH-POS-006 | Navigate to Contact | Click `nav-contact`; URL becomes `/contact` |
| DASH-POS-007 | Navigate to Products | Click `nav-products`; URL becomes `/products` |

### Negative Test Scenarios

| ID | Scenario | Expected Result |
| --- | --- | --- |
| DASH-NEG-001 | Visit dashboard without login | Redirects to `/login` |
| DASH-NEG-002 | Quick add empty todo | No new todo is created; stats remain unchanged |
| DASH-NEG-003 | Use protected navigation after logout | User remains on or returns to `/login` |

### Functional Tests

- Validate sidebar links are visible for authenticated users.
- Validate active navigation styling changes on route change.
- Validate dashboard stats match todo API state.
- Validate quick-add form clears after successful todo creation.

### SIT Tests

| ID | Scenario | Validation |
| --- | --- | --- |
| DASH-SIT-001 | Dashboard stats reflect Todo API | Create todo via UI, verify `/api/todos/stats` result updates |
| DASH-SIT-002 | Quick add creates todo | Intercept `/api/todos` POST and expect `201` |
| DASH-SIT-003 | Auth guard plus navigation | Login, navigate modules, logout, verify protected access denied |

### E2E Flow

```gherkin
Given I am logged in
When I create a todo from the dashboard
And I navigate to the Todos page
Then the created todo should appear in the Todo list
And the dashboard stats should remain consistent
```

## Todo Module

### User Stories

#### Story TODO-001: Create Todo

As an authenticated user, I want to create todos, so that I can track my tasks.

Acceptance criteria:

```gherkin
Given I am logged in
And I am on the Todos page
When I enter a valid todo title
And I click the add button
Then the todo should appear in the todo list
```

#### Story TODO-002: Update Todo

As an authenticated user, I want to edit and complete todos, so that my task list stays accurate.

Acceptance criteria:

```gherkin
Given I have an existing todo
When I edit its title or toggle its completed state
Then the todo should show the updated value
```

#### Story TODO-003: Delete Todo

As an authenticated user, I want to delete todos, so that I can remove tasks I no longer need.

Acceptance criteria:

```gherkin
Given I have an existing todo
When I click its delete button
Then the todo should be removed from the list
```

### Positive Test Scenarios

| ID | Scenario | Expected Result |
| --- | --- | --- |
| TODO-POS-001 | Add todo | New `todo-item-{id}` is visible |
| TODO-POS-002 | Toggle todo complete | `checkbox-todo-{id}` becomes checked |
| TODO-POS-003 | Toggle completed todo back to pending | Checkbox becomes unchecked |
| TODO-POS-004 | Edit todo title | Updated title appears in `todo-item-{id}` |
| TODO-POS-005 | Delete todo | `todo-item-{id}` is not visible |
| TODO-POS-006 | Add multiple todos | All entered todos are displayed |

### Negative Test Scenarios

| ID | Scenario | Input | Expected Result |
| --- | --- | --- | --- |
| TODO-NEG-001 | Add empty todo | Empty string | No todo is added |
| TODO-NEG-002 | Add whitespace-only todo | Spaces | No todo is added |
| TODO-NEG-003 | Edit todo to empty title | Clear edit field | Todo keeps previous title or edit is cancelled |
| TODO-NEG-004 | Update non-existing todo via API | Invalid ID | API returns `404` |
| TODO-NEG-005 | Todo endpoint without auth | No session | API returns `401` |

### Functional Tests

- Verify `input-new-todo` accepts task text.
- Verify `button-add-todo` submits the task.
- Verify item count increases after create.
- Verify checkbox state changes persist after UI refresh/query invalidation.
- Verify edit input appears after clicking edit.
- Verify Enter key saves edited title.
- Verify Escape key cancels edit.
- Verify delete button removes the item.

### SIT Tests

| ID | Scenario | UI Action | API Validation |
| --- | --- | --- | --- |
| TODO-SIT-001 | Create todo | Submit Todo form | `/api/todos` POST returns created todo |
| TODO-SIT-002 | List todos | Navigate to Todos | `/api/todos` GET returns user todos |
| TODO-SIT-003 | Update todo | Toggle checkbox/edit title | `/api/todos/{id}` PUT returns updated todo |
| TODO-SIT-004 | Delete todo | Click delete | `/api/todos/{id}` DELETE returns success |
| TODO-SIT-005 | Stats update | Create/complete/delete todo | `/api/todos/stats` returns accurate counts |

### E2E Flow

```gherkin
Given I register and log in
When I create three todos
And I complete one todo
And I edit another todo
And I delete the third todo
Then the Todo page should show the expected remaining todos
And the Dashboard stats should match the Todo state
```

## Contact Form Module

### User Stories

#### Story CONTACT-001: Submit Contact Message

As an authenticated user, I want to send a support message, so that I can request help from the team.

Acceptance criteria:

```gherkin
Given I am logged in
And I am on the Contact page
When I submit a valid name, email, and message
Then I should see a success confirmation
And the form should reset
```

#### Story CONTACT-002: Validate Contact Inputs

As a user, I want the contact form to validate my inputs, so that incomplete or invalid messages are not submitted.

Acceptance criteria:

```gherkin
Given I am on the Contact page
When I submit invalid contact form data
Then I should see validation feedback
And no success confirmation should be shown
```

### Positive Test Scenarios

| ID | Scenario | Expected Result |
| --- | --- | --- |
| CONTACT-POS-001 | Submit valid contact form | `success-banner` visible |
| CONTACT-POS-002 | Success confirmation text appears | Confirmation message visible |
| CONTACT-POS-003 | Submit another message | Form returns after clicking send another |
| CONTACT-POS-004 | Form resets after success | Name/email/message values reset |

### Negative Test Scenarios

| ID | Scenario | Input | Expected Result |
| --- | --- | --- | --- |
| CONTACT-NEG-001 | Missing name | Empty name | Name validation appears |
| CONTACT-NEG-002 | Invalid email | `bad-email` | Email validation appears |
| CONTACT-NEG-003 | Short message | Less than 10 chars | Message validation appears |
| CONTACT-NEG-004 | Empty form | All empty | Required field validation appears |
| CONTACT-NEG-005 | API rejects invalid data | Invalid payload | API returns `400` |

### Functional Tests

- Verify field labels and placeholders are present.
- Verify submit button is clickable.
- Verify validation messages appear for invalid fields.
- Verify success banner appears only after valid submission.
- Verify form reset behavior after valid submission.

### SIT Tests

| ID | Scenario | Validation |
| --- | --- |
| CONTACT-SIT-001 | Submit valid contact form | `/api/contact` POST returns success message |
| CONTACT-SIT-002 | Submit invalid contact form | Request should not be sent, or API returns `400` if forced |
| CONTACT-SIT-003 | Auth plus contact | Login, navigate to Contact, submit message successfully |

### E2E Flow

```gherkin
Given I am logged in
When I navigate to Contact from the sidebar
And I submit a valid support request
Then I should see a success confirmation
And I should be able to send another message
```

## Notes Module

### User Stories

#### Story NOTES-001: Create Notes

As an authenticated user, I want to create notes, so that I can save personal information in my browser.

Acceptance criteria:

```gherkin
Given I am logged in
And I am on the Notes page
When I create a note with a title and content
Then the note should appear as a note card
And the note should be saved in localStorage
```

#### Story NOTES-002: Edit Notes

As an authenticated user, I want to edit notes, so that I can update saved information.

Acceptance criteria:

```gherkin
Given I have an existing note
When I open and update the note
Then the note card should show the updated title or content
And localStorage should contain the updated note
```

#### Story NOTES-003: Delete Notes

As an authenticated user, I want to delete notes, so that I can remove information I no longer need.

Acceptance criteria:

```gherkin
Given I have an existing note
When I click the note delete button
Then the note should be removed from the UI
And it should be removed from localStorage
```

### Positive Test Scenarios

| ID | Scenario | Expected Result |
| --- | --- | --- |
| NOTES-POS-001 | Create note with title and content | `note-card-{id}` visible |
| NOTES-POS-002 | Create note with only content | Note appears with fallback title |
| NOTES-POS-003 | Edit note title | Card title updates |
| NOTES-POS-004 | Edit note content | Card preview updates |
| NOTES-POS-005 | Delete note | Note card disappears |
| NOTES-POS-006 | Reload page after create | Note still appears from localStorage |

### Negative Test Scenarios

| ID | Scenario | Input | Expected Result |
| --- | --- | --- | --- |
| NOTES-NEG-001 | Save empty note | Empty title and content | No note is created |
| NOTES-NEG-002 | Cancel note creation | Fill fields, click cancel | No note is created |
| NOTES-NEG-003 | Delete one of multiple notes | Multiple notes exist | Only selected note is removed |
| NOTES-NEG-004 | Reload after delete | Deleted note | Deleted note does not reappear |
| NOTES-NEG-005 | Corrupt localStorage data | Invalid notes value | App should recover or show empty state |

### Functional Tests

- Verify `button-new-note` opens editor dialog.
- Verify `input-note-title` and `input-note-content` accept text.
- Verify `button-save-note` persists note.
- Verify clicking `note-card-{id}` opens edit dialog.
- Verify `button-delete-note-{id}` deletes a note.
- Verify notes persist after reload through localStorage.
- Verify note timestamps update after edits.

### SIT Tests

Notes are browser-local and do not use an API. SIT should focus on UI plus browser storage:

| ID | Scenario | Validation |
| --- | --- | --- |
| NOTES-SIT-001 | Create note | UI card appears and localStorage includes note |
| NOTES-SIT-002 | Edit note | UI card and localStorage update |
| NOTES-SIT-003 | Delete note | UI card removed and localStorage no longer has note |
| NOTES-SIT-004 | Auth plus local notes | Notes page accessible only after login |

### E2E Flow

```gherkin
Given I am logged in
When I create a note
And I reload the page
Then the note should still be visible
When I edit and delete the note
Then the note should no longer appear after another reload
```

## Product Module

### User Stories

#### Story PROD-001: View Product Catalog

As an authenticated user, I want to view products, so that I can browse available catalog items.

Acceptance criteria:

```gherkin
Given I am logged in
When I navigate to Products
Then I should see a list of product cards
And each product should show a name, category, description, and price
```

#### Story PROD-002: Search Products

As an authenticated user, I want to search products, so that I can quickly find matching catalog items.

Acceptance criteria:

```gherkin
Given I am on the Products page
When I type a search term
Then the product list should show only matching products
And a no-results state should appear when nothing matches
```

#### Story PROD-003: Sort Products

As an authenticated user, I want to sort products by name or price, so that I can browse the catalog in a useful order.

Acceptance criteria:

```gherkin
Given I am on the Products page
When I choose a sort field and sort order
Then the product cards should appear in the selected order
```

### Positive Test Scenarios

| ID | Scenario | Expected Result |
| --- | --- | --- |
| PROD-POS-001 | Load products | At least one `product-card-{id}` visible |
| PROD-POS-002 | Search by product name | Matching products visible |
| PROD-POS-003 | Search is case-insensitive | Uppercase/lowercase terms return same count |
| PROD-POS-004 | Clear search | Full product list returns |
| PROD-POS-005 | Sort by name ascending | Names match ascending order |
| PROD-POS-006 | Sort by name descending | Names match descending order |
| PROD-POS-007 | Sort by price ascending | Prices match ascending order |
| PROD-POS-008 | Combine search and sort | Filtered products are sorted |

### Negative Test Scenarios

| ID | Scenario | Input | Expected Result |
| --- | --- | --- | --- |
| PROD-NEG-001 | Search no match | Random string | Empty state visible; zero cards |
| PROD-NEG-002 | Search whitespace | Spaces only | Full list or sanitized search behavior |
| PROD-NEG-003 | Invalid sort query via API | Unsupported sortBy | API falls back safely or returns validation error |
| PROD-NEG-004 | Products route unauthenticated | No session | Redirects to `/login` |

### Functional Tests

- Verify `product-search` debounces and filters list.
- Verify `select-sort-by` supports `name` and `price`.
- Verify `select-sort-order` supports `asc` and `desc`.
- Verify product card count changes after search.
- Verify no-results state appears for unmatched search.
- Verify product name extraction through `[data-product-name]`.

### SIT Tests

| ID | Scenario | Validation |
| --- | --- | --- |
| PROD-SIT-001 | Product page calls list API | `/api/products` returns products |
| PROD-SIT-002 | Search calls API with query | `/api/products?search=Keyboard` returns matching data |
| PROD-SIT-003 | Sort calls API with params | `/api/products?sortBy=name&sortOrder=asc` returns sorted data |
| PROD-SIT-004 | UI count matches API count | Compare rendered cards against response length |

### E2E Flow

```gherkin
Given I am logged in
When I navigate to Products
And I search for a product
And I sort the filtered result by price ascending
Then matching product cards should remain visible
And their prices should be in ascending order
```

## API And UI Interaction Coverage

### API Endpoints To Exercise

| Endpoint | Method | Main Coverage |
| --- | --- | --- |
| `/api/healthz` | GET | Server readiness |
| `/api/auth/register` | POST | Register success, duplicate email, invalid payload |
| `/api/auth/login` | POST | Login success, wrong password, missing user |
| `/api/auth/logout` | POST | Session termination |
| `/api/auth/me` | GET | Authenticated user state, unauthenticated failure |
| `/api/todos` | GET | Authenticated todo list |
| `/api/todos` | POST | Create todo |
| `/api/todos/{id}` | PUT | Update todo title/completed |
| `/api/todos/{id}` | DELETE | Delete todo |
| `/api/todos/stats` | GET | Dashboard stats |
| `/api/contact` | POST | Contact submission |
| `/api/products` | GET | List/search/sort products |

### API Plus UI Playwright Patterns

- Use `page.waitForResponse((res) => res.url().includes("/api/auth/login") && res.status() === 200)`.
- Use `page.route()` for forced API failures where UI error handling must be tested.
- Use `request` fixture for direct API validation when UI setup would be slow.
- Use `expect.poll()` for UI updates driven by async query invalidation.
- Use `context.clearCookies()` or new browser contexts to validate auth boundaries.

## System Integration Tests

| ID | Flow | Steps | Expected Result |
| --- | --- | --- | --- |
| SIT-001 | Auth to Dashboard | Register user | Dashboard loads and `/api/auth/me` returns same user |
| SIT-002 | Dashboard to Todo | Quick add todo on dashboard, open Todos | Todo appears in Todos page |
| SIT-003 | Todo to Dashboard Stats | Create and complete todo, return dashboard | Stats reflect total/completed/pending |
| SIT-004 | Auth to Contact | Login, submit contact form | API returns success and success banner appears |
| SIT-005 | Auth to Products | Login, open Products, search and sort | UI reflects `/api/products` data |
| SIT-006 | Auth to Notes localStorage | Login, create note, reload | Note persists from localStorage |
| SIT-007 | Logout security | Login, navigate protected route, logout, revisit route | Redirects to login |

## End-To-End User Journeys

### E2E-001: New User Productivity Journey

```gherkin
Given I am a new user
When I register an account
And I land on the dashboard
And I create a quick todo
And I open the Todos page
And I complete the todo
And I return to the dashboard
Then the stats should show one total task
And the completed count should be one
```

### E2E-002: Returning User Journey

```gherkin
Given I have registered an account
When I log out
And I log back in
Then I should see my dashboard
And I should be able to navigate to Todos, Notes, Contact, and Products
```

### E2E-003: Notes Persistence Journey

```gherkin
Given I am logged in
When I create a browser note
And I reload the Notes page
Then the note should still be visible
When I delete the note
And I reload again
Then the note should not be visible
```

### E2E-004: Catalog Search Journey

```gherkin
Given I am logged in
When I open Products
And I search for Keyboard
And I sort by name ascending
Then only matching products should be visible
And the results should be sorted
```

### E2E-005: Support Contact Journey

```gherkin
Given I am logged in
When I navigate to Contact
And I submit a valid support message
Then I should see a success confirmation
And I should be able to start a new message
```

## Equivalence Partitioning

### Email Inputs

| Class | Examples | Expected Result |
| --- | --- | --- |
| Valid standard email | `user@example.com` | Accepted |
| Valid plus alias | `user+qa@example.com` | Accepted |
| Valid subdomain | `user@mail.example.com` | Accepted |
| Missing `@` | `userexample.com` | Rejected |
| Missing domain | `user@` | Rejected |
| Missing local part | `@example.com` | Rejected |
| Invalid whitespace | `user @example.com` | Rejected |
| Empty string | `` | Rejected |

### Password Inputs

| Class | Examples | Register Expected | Login Expected |
| --- | --- | --- | --- |
| Valid minimum | `123456` | Accepted | Depends on account |
| Valid normal | `password123` | Accepted | Accepted for matching account |
| Too short | `abc` | Rejected | Invalid credentials or form validation |
| Empty | `` | Rejected | Rejected |
| Wrong password | `wrong-password` | N/A | Login error |

### Name Inputs

| Class | Examples | Expected Result |
| --- | --- | --- |
| Valid name | `Alice Smith` | Accepted |
| Single character | `A` | Accepted |
| Empty | `` | Rejected |
| Whitespace only | `   ` | Rejected or trimmed and rejected |

### Todo Title Inputs

| Class | Examples | Expected Result |
| --- | --- | --- |
| Valid short title | `Buy milk` | Todo created |
| Valid long title | 100+ chars | Todo created if UI supports display |
| Empty | `` | No todo created |
| Whitespace only | `   ` | No todo created |

### Contact Message Inputs

| Class | Examples | Expected Result |
| --- | --- | --- |
| Valid message | `Please help me with my account.` | Accepted |
| Exactly 10 chars | `1234567890` | Accepted |
| Too short | `Help` | Rejected |
| Empty | `` | Rejected |

### Product Search Inputs

| Class | Examples | Expected Result |
| --- | --- | --- |
| Existing product name | `Keyboard` | Matching cards visible |
| Existing lowercase | `keyboard` | Same result as uppercase |
| Existing uppercase | `KEYBOARD` | Same result as lowercase |
| Category term | `Hardware` | Matching category cards visible if supported |
| No match | `xyznonexistentproduct12345` | Empty state |
| Empty search | `` | Full list |

### Sort Inputs

| Class | Examples | Expected Result |
| --- | --- | --- |
| Valid sort field | `name`, `price` | Sorted list |
| Valid sort order | `asc`, `desc` | Correct order |
| Invalid sort field via API | `rating` | Safe fallback or validation error |
| Invalid sort order via API | `sideways` | Safe fallback or validation error |

## Recommended Playwright Spec Mapping

| Spec File | Coverage |
| --- | --- |
| `auth.spec.ts` | Full auth validation, register, login, logout |
| `signup-login-vscode.spec.js` | Simple JS signup/login smoke tests |
| `dashboard.spec.ts` | Dashboard stats, quick add, navigation |
| `todos.spec.ts` | Todo CRUD and state transitions |
| `contact.spec.ts` | Contact validation and success flow |
| `notes.spec.ts` | Notes CRUD and localStorage persistence |
| `products.spec.ts` | Product list, search, sort |

## Recommended Additional Automation

- Add API-only tests using Playwright `request` fixture for all `/api/*` endpoints.
- Add route interception tests for 500 responses to verify UI error states.
- Add accessibility smoke checks for forms and navigation.
- Add visual regression snapshots for dashboard, products, and notes.
- Add mobile viewport tests for protected layout navigation.
- Add localStorage corruption recovery tests for Notes.
- Add session expiry simulation tests for protected pages.

## Execution Commands

Run all tests:

```powershell
cd C:\projects\command-center
npm test
```

Run JS signup/login tests:

```powershell
cd C:\projects\command-center
npx playwright test tests/src/signup-login-vscode.spec.js --config tests/playwright.config.ts
```

Run a specific module:

```powershell
npx playwright test tests/src/todos.spec.ts --config tests/playwright.config.ts
```

Open HTML report:

```powershell
npx playwright show-report tests/playwright-report
```
