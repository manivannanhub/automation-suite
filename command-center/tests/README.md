# Playwright Tests

End-to-end tests for the Command Center app using [Playwright](https://playwright.dev/) with the Page Object Model pattern.

## Prerequisites

- Node.js 20+ and pnpm installed locally
- The full app running locally (see root README)

## Setup

```bash
# From the project root, install all deps
pnpm install

# Install Playwright browsers (first time only)
cd tests
pnpm exec playwright install chromium
pnpm exec playwright install-deps
```

## Running Tests

Make sure the app is running first:

```bash
# Terminal 1 — API server
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Frontend
pnpm --filter @workspace/app run dev
```

Then in a third terminal:

```bash
cd tests

# Run all tests (headless)
pnpm test

# Run with visible browser
pnpm test:headed

# Run with Playwright UI (interactive mode)
pnpm test:ui

# Run a specific spec file
pnpm exec playwright test src/auth.spec.ts

# Run a single test by name
pnpm exec playwright test --grep "registers a new user"
```

## Test Structure

```
tests/
├── playwright.config.ts          # Playwright config (base URL, browser, etc.)
├── src/
│   ├── helpers/
│   │   └── auth.ts               # Shared register+login helper
│   ├── pages/                    # Page Object Models
│   │   ├── auth.page.ts          # LoginPage, RegisterPage
│   │   ├── dashboard.page.ts     # DashboardPage
│   │   ├── todos.page.ts         # TodosPage
│   │   ├── notes.page.ts         # NotesPage
│   │   ├── contact.page.ts       # ContactPage
│   │   └── products.page.ts      # ProductsPage
│   ├── auth.spec.ts              # Register, login, logout tests + negative cases
│   ├── dashboard.spec.ts         # Dashboard stats, quick-add, sidebar nav
│   ├── todos.spec.ts             # Todo CRUD (add, edit, delete, toggle)
│   ├── notes.spec.ts             # Notes CRUD + localStorage persistence
│   ├── contact.spec.ts           # Contact form validation + success
│   └── products.spec.ts          # Product search, sort, filter
```

## Test Coverage

| Module   | Tests | What's covered |
|----------|-------|----------------|
| Auth     | 12    | Register, login, logout, redirect guards, negative cases (bad email, wrong password, duplicate email, short password) |
| Dashboard | 5   | Welcome message, todo stats, quick-add, sidebar nav |
| Todos    | 8    | Add, mark complete/incomplete, edit title, delete, empty input guard, multiple items |
| Notes    | 6    | Create, edit, delete, multiple notes, localStorage persistence after reload |
| Contact  | 7    | Valid submit, success banner, missing name/email, invalid email, short message, empty form, form reset |
| Products | 9    | List on load, search filter, no results, clear search, sort name asc/desc, combined search+sort, case-insensitive search |

## Configuration

Edit `playwright.config.ts` to change:
- `baseURL` — defaults to `http://localhost:80` (the shared proxy port). Change to `http://localhost:3000` or wherever your app runs.
- `workers` — increase to run tests in parallel (tests use unique emails so they don't conflict)
- `retries` — set higher for flaky CI environments
