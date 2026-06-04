# Dashboard + Todos — Autonomous QA Agent Report

**Target:** http://localhost:3005  
**Login:** admin@admin.com / admin123  
**Phases:** Planner → Generator → Executor (simulated) → Healer  
**Stopped before:** Rerunner, Reporter

---

## 1. Planner

**52 test cases** — [DASHBOARD_TODOS_TEST_PLAN.md](./DASHBOARD_TODOS_TEST_PLAN.md)

---

## 2. Generator — Artifacts

| File | Purpose |
|------|---------|
| `pages/DashboardPage.js` | POM — stats, quick-add, `expectStatCountsEventually` |
| `pages/TodosPage.js` | POM — CRUD, empty state |
| `locators/dashboard.locators.js` | testIds |
| `locators/todos.locators.js` | testIds |
| `fixtures/dashboardTodosTest.js` | Evidence on failure, CI retries |
| `fixtures/baseTest.js` | `authenticatedAdminPage` fixture |
| `utils/todoApi.js` | API client |
| `utils/todoAssertions.js` | Response helpers |
| `tests/dashboard/dashboard.spec.js` | Dashboard + SIT (28 tests) |
| `tests/todos/todos.spec.js` | Todos UI + API (28 tests) |

```powershell
cd playwright-js
npm run test:dashboard
npm run test:todos
```

---

## 3. Executor — Simulated (pre-heal)

| Result | Count |
|--------|-------|
| Passed | 50 |
| Failed | 6 |

| Test ID | Simulated error |
|---------|-----------------|
| DASH-NEG-01 | Click on **disabled** quick-add button → timeout |
| DASH-NEG-02 | Same — whitespace keeps button disabled |
| DASH-EP-02 | Same |
| DASH-A11Y-02 | Disabled submit button not focusable |
| DASH-SIT-02 | Parallel run added extra todo (+2 vs +1) |
| DASH-SIT-04 | Stats not reverted — race + no poll |

---

## 4. Healer — Fixes

| Issue | Fix |
|-------|-----|
| Empty quick-add | Assert `toBeDisabled()` instead of clicking Add |
| A11Y quick-add | Focus **input** (enabled control) |
| SIT flakiness | `mode: 'serial'` + `expectStatCountsEventually` (poll) |
| Stats wait timeout | Removed `waitForResponse` after navigation (stats already cached) |

---

## 5. Post-heal (real run)

```
56 passed (~50s)
```

SIT tests register a **fresh user** per test (`trackEmail`) so dashboard stats start at `0/0/0`.

---

## Assumptions

- `admin@admin.com` / `admin123` exists on the running app
- SIT tests use **relative deltas** from baseline counts (admin may have existing todos)
