#!/usr/bin/env node
"use strict";

const { readStdinJson, respond } = require("./_utils");

const PROJECT_CONTEXT = `
# automation-suite project context

## Layout
- \`command-center/\` — Full-stack app (Express API + React frontend). Uses npm workspaces.
- \`command-center/tests/\` — Playwright E2E tests (TypeScript, Page Object Model). Config starts the app via \`webServer\`.
- \`playwright-js/\` — Standalone Playwright tests (JavaScript). CI runs these against a manually started server on port 3005.

## Running the app
- App URL: http://localhost:3005
- From \`command-center/\`: \`npm start\` (production) or run API + frontend dev servers separately.
- Health check: http://localhost:3005/api/healthz

## Running tests
- \`command-center/tests/\`: \`npm test\` from that folder (or \`pnpm test\` per tests README). Playwright config auto-starts the server.
- \`playwright-js/\`: App must already be running on :3005. Run \`npx playwright test\` from \`playwright-js/\`.
- CI (see \`.github/workflows/playwright.yml\`): build app → start server → run \`playwright-js\` tests.

## Generated code — do not edit directly
- \`command-center/lib/api-zod/src/generated/\`
- \`command-center/lib/api-client-react/src/generated/\`
Edit \`command-center/lib/api-spec/openapi.yaml\` and regenerate via Orval instead.

## Package managers
- Root CI and \`command-center/package.json\` use **npm**.
- Some docs mention **pnpm**; prefer npm unless working in a pnpm-specific script.

## Formatting
- Prettier is installed in \`command-center/\`. Format TS/JS/JSON after edits.
`.trim();

async function main() {
  await readStdinJson();
  respond({ additional_context: PROJECT_CONTEXT });
}

main().catch((error) => {
  process.stderr.write(`session-context hook failed: ${error.message}\n`);
  respond({});
  process.exit(0);
});
