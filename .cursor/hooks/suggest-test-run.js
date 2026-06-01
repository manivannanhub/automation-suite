#!/usr/bin/env node
"use strict";

const {
  readStdinJson,
  respond,
  getToolFilePath,
  isTestSpecFile,
  normalizePath,
  readSessionState,
  writeSessionState,
} = require("./_utils");

function trackTestEdit(state, filePath) {
  if (!isTestSpecFile(filePath)) {
    return null;
  }
  if (!state.testFilesEdited.includes(filePath)) {
    state.testFilesEdited.push(filePath);
  }
  state.testsRun = false;
  return filePath;
}

function trackShellCommand(state, command) {
  const normalized = normalizePath(command).toLowerCase();
  if (
    normalized.includes("playwright test") ||
    normalized.includes("npm test") ||
    normalized.includes("pnpm test") ||
    normalized.includes("npx playwright")
  ) {
    state.testsRun = true;
  }
}

function testRunInstructions(filePath) {
  const normalized = normalizePath(filePath);
  if (normalized.includes("command-center/tests")) {
    return [
      "You edited a Playwright test under command-center/tests/.",
      "Run tests from that directory: `npm test` (config auto-starts the app on :3005).",
      "Or: `npx playwright test` with a specific spec file.",
    ].join(" ");
  }
  if (normalized.includes("playwright-js")) {
    return [
      "You edited a Playwright test under playwright-js/.",
      "Ensure the app is running on http://localhost:3005 (`npm start` from command-center/).",
      "Then run: `npx playwright test` from playwright-js/.",
    ].join(" ");
  }
  return [
    "You edited a test file. Verify with Playwright before finishing.",
    "command-center/tests/: `npm test`. playwright-js/: start app first, then `npx playwright test`.",
  ].join(" ");
}

async function main() {
  const input = await readStdinJson();
  const conversationId = input.conversation_id || "default";
  const state = readSessionState(conversationId);
  const toolName = input.tool_name || "";

  if (toolName === "Shell") {
    trackShellCommand(state, input.tool_input?.command || "");
    writeSessionState(conversationId, state);
    respond({});
    return;
  }

  if (toolName === "Write" || toolName === "StrReplace") {
    const filePath = getToolFilePath(input.tool_input);
    const editedTest = trackTestEdit(state, filePath);
    writeSessionState(conversationId, state);

    if (editedTest) {
      respond({
        additional_context: testRunInstructions(editedTest),
      });
      return;
    }
  }

  respond({});
}

main().catch((error) => {
  process.stderr.write(`suggest-test-run hook failed: ${error.message}\n`);
  respond({});
  process.exit(0);
});
