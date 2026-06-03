# Playwright JS — Functional Test Framework

Scalable E2E structure for the Command Center app (`http://localhost:3005`).

## Folder tree

```text
playwright-js/
├── config/
│   └── env.js
├── fixtures/
│   └── baseTest.js            # POM fixtures + email cleanup
├── locators/
│   ├── login.locators.js
│   ├── register.locators.js
│   ├── dashboard.locators.js
│   ├── todos.locators.js
│   ├── products.locators.js
│   └── layout.locators.js
├── pages/
│   ├── LoginPage.js
│   ├── RegisterPage.js
│   ├── DashboardPage.js
│   ├── TodosPage.js
│   ├── ProductsPage.js
│   └── AppLayout.js
├── tests/
│   ├── auth/
│   │   ├── login.ui.spec.js
│   │   ├── login.api.spec.js
│   │   ├── register.ui.spec.js
│   │   └── register.api.spec.js
│   ├── dashboard/
│   ├── todos/
│   └── products/
├── test-data/
│   └── users.json
├── utils/
│   ├── constants.js
│   ├── helpers.js
│   ├── testData.js
│   ├── authApi.js
│   ├── apiAssertions.js
│   └── userCleanup.js
├── reports/
├── playwright.config.js
└── package.json
```

## Auth tests (replaces legacy login/register specs)

| File | Coverage |
|------|----------|
| `login.ui.spec.js` | Smoke, positive, negative, logout, access |
| `login.api.spec.js` | `POST /api/auth/login` contract tests |
| `register.ui.spec.js` | Smoke, positive, negative, boundary |
| `register.api.spec.js` | `POST /api/auth/register` contract tests |

Legacy monolithic `tests/legacy/login.spec.js` and `register.spec.js` were removed and replaced by these files.

## Running tests

Prerequisites: app on port 3005 (`npm start` in `command-center/`). Restart the server after pulling changes so `POST /api/test/cleanup` is available.

```bash
cd playwright-js
npm test
npm run test:auth
npm run test:login
npm run test:register
npm run report
```

Seeded user for login tests: see `test-data/users.json` (CI seeds via `.github/workflows/playwright.yml`).

## Writing tests

```javascript
import { test, expect } from '../../fixtures/baseTest.js';
import { uniqueEmail } from '../../utils/helpers.js';

test('registers a user', async ({ registerPage, trackEmail }) => {
  const email = uniqueEmail('my');
  trackEmail(email);
  await registerPage.register('Name', email, 'Password123');
  await registerPage.expectOnDashboard();
});
```
