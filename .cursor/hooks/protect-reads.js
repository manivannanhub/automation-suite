#!/usr/bin/env node
"use strict";

const path = require("path");
const { readStdinJson, respond, normalizePath } = require("./_utils");

const SENSITIVE_PATTERNS = [
  /(^|[/\\])\.env(\.|$)/i,
  /(^|[/\\])\.env\.[^/\\]+$/i,
  /\.pem$/i,
  /credentials\.json$/i,
  /(^|[/\\])secrets[/\\]/i,
  /id_rsa$/i,
  /\.pfx$/i,
  /\.p12$/i,
];

function isSensitivePath(filePath) {
  const normalized = normalizePath(filePath);
  const basename = path.basename(normalized).toLowerCase();
  if (basename === ".npmrc" && /\/auth/i.test(normalized)) {
    return true;
  }
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(normalized));
}

async function main() {
  const input = await readStdinJson();
  const filePath = input.file_path || "";

  if (isSensitivePath(filePath)) {
    respond({
      permission: "deny",
      user_message:
        "Blocked: this file looks like a secret or credential file and cannot be read by the agent.",
    });
    return;
  }

  respond({ permission: "allow" });
}

main().catch((error) => {
  process.stderr.write(`protect-reads hook failed: ${error.message}\n`);
  respond({ permission: "allow" });
  process.exit(0);
});
