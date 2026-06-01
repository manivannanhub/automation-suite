#!/usr/bin/env node
"use strict";

const { readStdinJson, respond } = require("./_utils");

const DENY_PATTERNS = [
  /\bgit\s+push\b[^\n]*--force\b/i,
  /\bgit\s+push\b[^\n]*\s-f\b/i,
  /\bgit\s+push\s+-f\b/i,
  /\bgit\s+reset\s+--hard\b/i,
];

const ASK_PATTERNS = [
  {
    test: (cmd) => /\b(curl|wget)\b/i.test(cmd),
    unless: (cmd) =>
      /\b(localhost|127\.0\.0\.1|0\.0\.0\.0)\b/i.test(cmd) ||
      /curl\s+-s?\s+http:\/\/localhost/i.test(cmd),
    userMessage:
      "This command may make an external network request. Please review before continuing.",
    agentMessage:
      "A project hook flagged this as a possible external network call. Prefer localhost for this repo's app (http://localhost:3005).",
  },
  {
    test: (cmd) => /\brm\s+-rf\b/i.test(cmd) || /\bRemove-Item\b[^\n]*-Recurse\b/i.test(cmd),
    unless: () => false,
    userMessage:
      "This command may delete files recursively. Please confirm the target path is correct.",
    agentMessage:
      "A project hook flagged a recursive delete. Double-check paths before proceeding.",
  },
  {
    test: (cmd) => /\bdel\s+\/s\b/i.test(cmd) || /\brmdir\s+\/s\b/i.test(cmd),
    unless: () => false,
    userMessage:
      "This command may delete files recursively. Please confirm the target path is correct.",
    agentMessage:
      "A project hook flagged a recursive delete on Windows. Double-check paths before proceeding.",
  },
];

async function main() {
  const input = await readStdinJson();
  const command = input.command || "";

  for (const pattern of DENY_PATTERNS) {
    if (pattern.test(command)) {
      respond({
        permission: "deny",
        user_message:
          "Blocked: destructive git operations (force push / hard reset) are not allowed by project hooks.",
        agent_message:
          "The shell command was blocked. Do not force-push or hard-reset. Use safer git workflows.",
      });
      return;
    }
  }

  for (const rule of ASK_PATTERNS) {
    if (rule.test(command) && !rule.unless(command)) {
      respond({
        permission: "ask",
        user_message: rule.userMessage,
        agent_message: rule.agentMessage,
      });
      return;
    }
  }

  respond({ permission: "allow" });
}

main().catch((error) => {
  process.stderr.write(`guard-shell hook failed: ${error.message}\n`);
  respond({ permission: "allow" });
  process.exit(0);
});
