#!/usr/bin/env node
"use strict";

const { readStdinJson, respond } = require("./_utils");

const BLOCKED_PROMPT_PATTERNS = [
  {
    pattern: /\b(skip|disable|bypass|ignore)\b[^\n]{0,40}\b(tests?|ci|checks?|hooks?)\b/i,
    message:
      "This prompt appears to ask the agent to skip tests or CI checks. Revise if you still want to proceed.",
  },
  {
    pattern: /\b(commit|push|add)\b[^\n]{0,60}\b(\.env|credentials|secrets?|api[_ -]?keys?|passwords?)\b/i,
    message:
      "This prompt may involve committing secrets. Remove credentials from the request before submitting.",
  },
  {
    pattern: /\b--no-verify\b|\bno-verify\b|\bskip hooks\b/i,
    message:
      "This prompt asks to bypass git hooks. That is discouraged for this repository.",
  },
];

async function main() {
  const input = await readStdinJson();
  const prompt = input.prompt || "";

  for (const rule of BLOCKED_PROMPT_PATTERNS) {
    if (rule.pattern.test(prompt)) {
      respond({
        continue: false,
        user_message: rule.message,
      });
      return;
    }
  }

  respond({ continue: true });
}

main().catch((error) => {
  process.stderr.write(`validate-prompt hook failed: ${error.message}\n`);
  respond({ continue: true });
  process.exit(0);
});
