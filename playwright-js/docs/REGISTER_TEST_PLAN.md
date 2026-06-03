# Signup Page Test Plan — http://localhost:3005/register

## Scope

Functional, API, security, accessibility, and integration coverage for the **Create an account** registration flow.

## Assumptions

- App running on `BASE_URL` (default `http://localhost:3005`)
- Client validation: Zod — name min 1, email format, password min 6
- Server: email lowercased; duplicate email → 409 `Email already in use`
- Success → redirect to `/dashboard`

---

## Smoke Testing (@smoke)

| ID | Title | Description | Preconditions | Steps | Expected |
|----|-------|-------------|---------------|-------|----------|
| REG-SMOKE-01 | Page loads at /register | Sanity URL | App up | Navigate to /register | URL matches `/register` |
| REG-SMOKE-02 | Document title set | Tab title | On register | Observe title | Non-empty title |
| REG-SMOKE-03 | Heading and subtitle | Core copy | On register | Check text | "Create an account", subtitle visible |
| REG-SMOKE-04 | All inputs visible | Form renders | On register | Inspect fields | Name, email, password visible |
| REG-SMOKE-05 | Sign Up enabled | CTA ready | On register | Inspect button | Visible and enabled |
| REG-SMOKE-06 | Sign in link | Navigation | On register | Check footer link | "Sign in" visible |

---

## Positive Testing (@positive)

| ID | Title | Preconditions | Steps | Expected |
|----|-------|---------------|-------|----------|
| REG-POS-01 | Standard signup | App up | Fill valid name/email/password → Sign Up | Dashboard |
| REG-POS-02 | Welcome shows name | REG-POS-01 | Register "James Bond" | Welcome contains name |
| REG-POS-03 | Plus-address email | App up | email `user+tag@domain.com` | Dashboard |
| REG-POS-04 | Hyphenated name | App up | Name "Mary-Jane" | Dashboard |
| REG-POS-05 | Enter submits form | App up | Fill fields → Enter on password | Dashboard |
| REG-POS-06 | Sign in → login | On register | Click Sign in | `/login` |

---

## Negative Testing (@negative)

| ID | Title | Steps | Expected |
|----|-------|-------|----------|
| REG-NEG-01 | Empty submit | Click Sign Up empty | Stay on register |
| REG-NEG-02 | Empty name | name="" | "Name is required" |
| REG-NEG-03 | Invalid email | bad-email | "Invalid email" |
| REG-NEG-04 | Short password | 5 chars | Min 6 message |
| REG-NEG-05 | Duplicate email | Register twice same email | `register-error` Email in use |
| REG-NEG-06 | Whitespace only | spaces in all fields | Stay on register |

---

## Boundary Value Analysis (@bva)

| ID | Field | Boundary | Input | Expected |
|----|-------|----------|-------|----------|
| REG-BVA-01 | password | min-1 (5) | 5 chars | Rejected |
| REG-BVA-02 | password | min (6) | 6 chars | Accepted |
| REG-BVA-03 | password | min+1 (7) | 7 chars | Accepted |
| REG-BVA-04 | name | min (1) | "A" | Accepted |
| REG-BVA-05 | email | long (100+) | long local@domain.com | No crash; reject or accept |

---

## Equivalence Partitioning (@ep)

| ID | Partition | Class | Expected |
|----|-----------|-------|----------|
| REG-EP-01 | Email | Valid standard | Dashboard |
| REG-EP-02 | Email | Invalid (no @) | Invalid email |
| REG-EP-03 | Password | Valid (≥6) | Dashboard |
| REG-EP-04 | Password | Invalid (<6) | Error |
| REG-EP-05 | Name | Valid (letters+space) | Dashboard |
| REG-EP-06 | Name | Invalid (empty) | Name required |

---

## Decision Table Testing (@decision)

| ID | Name | Email | Password | Expected outcome |
|----|------|-------|----------|----------------|
| REG-DT-01 | valid | valid | valid | Dashboard |
| REG-DT-02 | empty | valid | valid | Name error |
| REG-DT-03 | valid | invalid | valid | Email error |
| REG-DT-04 | valid | valid | short | Password error |
| REG-DT-05 | empty | empty | empty | Multiple errors / stay |

---

## Form Field Validation (@validation)

| ID | Check | Expected |
|----|-------|----------|
| REG-FFV-01 | Placeholders | John Doe, you@example.com |
| REG-FFV-02 | Password type=password | Masked |
| REG-FFV-03 | Fields empty on load | "" |
| REG-FFV-04 | Typing updates values | Values match input |
| REG-FFV-05 | Labels visible | Name, Email, Password |

---

## Error Message Validation (@error)

| ID | Trigger | Expected message visible |
|----|---------|-------------------------|
| REG-ERR-01 | bad email | Invalid email |
| REG-ERR-02 | empty password | Password min message |
| REG-ERR-03 | duplicate | Email already in use (banner) |
| REG-ERR-04 | Errors clear after fix | Error hidden after valid resubmit |

---

## Regression Testing (@regression)

| ID | Check | Expected |
|----|-------|----------|
| REG-REG-01 | Layout unchanged | All controls present |
| REG-REG-02 | Password still masked | type=password |
| REG-REG-03 | Signup still reaches dashboard | Happy path |

---

## Security Testing (@security)

| ID | Attack | Expected |
|----|--------|----------|
| REG-SEC-01 | SQLi in email | No dashboard |
| REG-SEC-02 | XSS in name | No script execution; stay safe |
| REG-SEC-03 | Rapid submit (10x) | App stable; no crash |

---

## Usability Testing (@usability)

| ID | Check | Expected |
|----|-------|----------|
| REG-USE-01 | Tab order | Name → Email → Password → Sign Up |
| REG-USE-02 | Sign in discoverable | Link visible |

---

## Accessibility Testing (@accessibility)

| ID | Check | Expected |
|----|-------|----------|
| REG-A11Y-01 | Labels for inputs | getByLabel works |
| REG-A11Y-02 | Sign Up is button role | button "Sign Up" |
| REG-A11Y-03 | Heading present | Create an account |

---

## API Testing (@api)

| ID | Case | Expected status |
|----|------|-----------------|
| REG-API-01 | Valid body | 201 + user |
| REG-API-02 | Duplicate | 409 |
| REG-API-03 | Missing fields | 400 |
| REG-API-04 | Invalid email | 400 |
| REG-API-05 | Short password | 400 |

---

## Integration Testing (@integration)

| ID | Flow | Expected |
|----|------|----------|
| REG-INT-01 | Signup → logout → login | Login with new credentials |
| REG-INT-02 | Signup → Sign in link → login page | Can navigate to login |

---

**Total planned cases: 58**
