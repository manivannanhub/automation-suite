#!/usr/bin/env node
"use strict";

const { readStdinJson, respond, readSessionState, writeSessionState } =
  require("./_utils");

async function main() {
  const input = await readStdinJson();
  const conversationId = input.conversation_id || "default";
  const loopCount = input.loop_count ?? 0;
  const status = input.status || "completed";

  if (status !== "completed" || loopCount > 0) {
    respond({});
    return;
  }

  const state = readSessionState(conversationId);
  const editedTests = state.testFilesEdited || [];

  if (editedTests.length > 0 && !state.testsRun) {
    const fileList = editedTests.map((f) => `- ${f}`).join("\n");
    respond({
      followup_message: [
        "Project hooks detected Playwright test file edits without a test run in this session.",
        "Please run the relevant tests and report the results:",
        fileList,
        "",
        "command-center/tests/: `npm test`",
        "playwright-js/: ensure app is on :3005, then `npx playwright test`",
      ].join("\n"),
    });

    state.testsRun = true;
    writeSessionState(conversationId, state);
    return;
  }

  respond({});
}

main().catch((error) => {
  process.stderr.write(`stop-verify hook failed: ${error.message}\n`);
  respond({});
  process.exit(0);
});
