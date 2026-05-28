# Command Center

A multi-feature productivity web app with auth, todos, notes, a contact form, and a product catalog — all in one clean interface.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/app run dev` — run the React frontend (port 23863)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — express-session secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + wouter + TanStack Query
- API: Express 5 + express-session (cookie-based auth, no JWT)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (server routes use `zod`, not `zod/v4` — esbuild can't resolve `zod/v4` subpath)
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all API contracts)
- `lib/db/src/schema/index.ts` — Drizzle schema (users, todos, contacts, products)
- `artifacts/api-server/src/routes/` — Express route handlers (auth, todos, contact, products)
- `artifacts/app/src/` — React frontend (pages/, components/)
- `lib/api-client-react/src/generated/` — Generated React Query hooks
- `lib/api-zod/src/generated/` — Generated Zod schemas for server validation

## Architecture decisions

- Session auth via express-session + cookie (not JWT) — simpler and works well with same-origin proxied requests
- `credentials: "include"` set globally in `lib/api-client-react/src/custom-fetch.ts` so session cookies are always sent
- Notes module is localStorage-only (no backend) — fast, offline-capable, no DB overhead
- Products are seeded at startup — read-only catalog, no user mutations needed
- Server routes import from `zod` not `zod/v4` — esbuild can't resolve the `zod/v4` subpath export

## Product

- **Auth**: Register (name, email, password), login, logout, persisted session
- **Dashboard**: Welcome message, live todo stats (total/completed/pending), quick-add todo
- **Todos**: Full CRUD — add, edit, delete, toggle complete
- **Notes**: Create/edit/delete personal notes, stored in localStorage (no sync)
- **Contact form**: Name, email, message with validation and success banner
- **Products**: Searchable, sortable product catalog (by name or price)

## User preferences

_Populate as needed._

## Gotchas

- Always import `zod` not `zod/v4` in server-side route files — esbuild bundle step fails otherwise
- After spec changes, always run codegen before writing route handlers (grep exact Zod schema names from `lib/api-zod/src/generated/api.ts`)
- `pnpm --filter @workspace/db run push` to apply schema changes to dev DB
- The frontend workflow (`artifacts/app: web`) must be restarted after design subagent completes

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
