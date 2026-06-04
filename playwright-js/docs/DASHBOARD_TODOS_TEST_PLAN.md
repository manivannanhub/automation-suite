# Dashboard + Todos — Full Test Plan

**Target:** http://localhost:3005  
**Login:** admin@admin.com / admin123  
**Routes:** `/dashboard`, `/todos`  
**API:** `GET/POST /api/todos`, `GET /api/todos/stats`, `PUT/DELETE /api/todos/:id`

## Assumptions

- Admin account exists and can log in
- Todo title: trimmed, minimum 1 character
- Dashboard stats: `total`, `completed`, `pending` (pending = total − completed)
- SIT tests use **baseline counts** before each flow (admin may have existing todos)

---

## Dashboard — Smoke (@smoke)

| ID | Title | Description | Preconditions | Steps | Expected | Tags |
|----|-------|-------------|---------------|-------|----------|------|
| DASH-SMOKE-01 | Page loads | Route sanity | Logged in as admin | Open /dashboard | URL `/dashboard` | @smoke |
| DASH-SMOKE-02 | Welcome visible | Greeting | On dashboard | Read welcome | "Welcome back" text | @smoke |
| DASH-SMOKE-03 | Stat cards | Summary UI | On dashboard | Inspect cards | Total, Completed, Pending visible | @smoke |
| DASH-SMOKE-04 | Quick-add controls | Quick capture | On dashboard | Inspect quick-add | Input + button visible | @smoke |
| DASH-SMOKE-05 | Sidebar nav | Navigation | On dashboard | Inspect sidebar | Todos, Notes, Products links | @smoke |

## Dashboard — Positive (@positive)

| ID | Title | Steps | Expected | Tags |
|----|-------|-------|----------|------|
| DASH-POS-01 | Quick-add on Todos | Quick-add → Todos page | Task visible | @positive |
| DASH-POS-02 | User email shown | Inspect shell | admin@admin.com visible | @positive |
| DASH-POS-03 | Todos nav | Click Todos | `/todos` | @positive |

## Dashboard — Negative (@negative)

| ID | Title | Steps | Expected | Tags |
|----|-------|-------|----------|------|
| DASH-NEG-01 | Empty quick-add | Click Add empty | Stats unchanged | @negative |
| DASH-NEG-02 | Whitespace quick-add | Submit spaces | Stats unchanged | @negative |

## Dashboard — BVA / EP / Validation / Regression / Usability / A11y

| ID | Technique | Expected | Tags |
|----|-----------|----------|------|
| DASH-BVA-01 | 1-char title quick-add | Total +1 | @bva |
| DASH-EP-01 | Valid title | Total +1 | @ep |
| DASH-EP-02 | Empty title | No change | @ep |
| DASH-FFV-01 | Input typing | Value retained | @validation |
| DASH-REG-01 | Layout | Welcome + stats | @regression |
| DASH-REG-02 | Todos link | Link visible | @regression |
| DASH-USE-01 | Logout | Button visible | @usability |
| DASH-A11Y-01 | Welcome region | Visible | @accessibility |
| DASH-A11Y-02 | Quick-add focus | Button focusable | @accessibility |

## Dashboard — SIT Integration (@integration @sit)

| ID | Title | Steps | Expected | Tags |
|----|-------|-------|----------|------|
| DASH-SIT-01 | Add task → dashboard | Baseline → add on Todos → dashboard | total +1, pending +1 | @integration @sit |
| DASH-SIT-02 | Modify task | Add → edit title → dashboard | total +1 (counts stable) | @integration @sit |
| DASH-SIT-03 | Complete task | Add → complete → dashboard | completed +1 | @integration @sit |
| DASH-SIT-04 | Delete task | Add → delete → dashboard | Stats return to baseline | @integration @sit |

## Todos — Smoke / Positive / Negative / BVA / EP / Validation / Error / Regression / Usability / A11y

| ID | Title | Tags |
|----|-------|------|
| TOD-SMOKE-01 | Page + add form | @smoke |
| TOD-SMOKE-02 | Heading visible | @smoke |
| TOD-POS-01 … 06 | CRUD UI flows | @positive |
| TOD-NEG-01 | Empty add blocked | @negative |
| TOD-NEG-02 | Whitespace rejected | @negative |
| TOD-BVA-01 | 1-char title | @bva |
| TOD-EP-01 / 02 | Valid / empty partitions | @ep |
| TOD-FFV-01 | Input typing | @validation |
| TOD-ERR-01 | Empty state message | @error |
| TOD-REG-01 | Add form regression | @regression |
| TOD-USE-01 | Placeholder | @usability |
| TOD-A11Y-01 / 02 | Heading + focus | @accessibility |

## Todos — API (@api)

| ID | Title | Expected | Tags |
|----|-------|----------|------|
| TOD-API-01 | POST valid | 201 | @api |
| TOD-API-02 | GET list | 200 array | @api |
| TOD-API-03 | GET stats | total/completed/pending | @api |
| TOD-API-04 | PUT title | 200 updated | @api |
| TOD-API-05 | PUT completed | completed true | @api |
| TOD-API-06 | DELETE | removed from list | @api |
| TOD-API-07 | POST missing title | 400 | @api |
| TOD-API-08 | POST empty title | 400 | @api |
| TOD-API-09 | POST whitespace | 400 | @api |
| TOD-API-10 | No session | 401 | @api |
| TOD-API-11 | PUT unknown id | 404 | @api |
| TOD-API-12 | DELETE unknown id | 404 | @api |

## Access control

| ID | Route | Expected |
|----|-------|----------|
| DASH-AUTH-01 | /dashboard guest | Redirect login |
| TOD-AUTH-01 | /todos guest | Redirect login |

**Total: 52 test cases**
