"use strict";

const fs = require("fs");
const path = require("path");

async function readStdinJson() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};
  return JSON.parse(raw);
}

function respond(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

function getProjectRoot(input) {
  const roots = input.workspace_roots;
  if (Array.isArray(roots) && roots.length > 0) {
    return roots[0];
  }
  return process.cwd();
}

function normalizePath(filePath) {
  return filePath.replace(/\\/g, "/");
}

function getSessionStatePath(conversationId) {
  const stateDir = path.join(__dirname, "state");
  fs.mkdirSync(stateDir, { recursive: true });
  const safeId = (conversationId || "default").replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(stateDir, `${safeId}.json`);
}

function readSessionState(conversationId) {
  const statePath = getSessionStatePath(conversationId);
  if (!fs.existsSync(statePath)) {
    return {
      testFilesEdited: [],
      testsRun: false,
    };
  }
  try {
    return JSON.parse(fs.readFileSync(statePath, "utf8"));
  } catch {
    return {
      testFilesEdited: [],
      testsRun: false,
    };
  }
}

function writeSessionState(conversationId, state) {
  const statePath = getSessionStatePath(conversationId);
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

function isTestSpecFile(filePath) {
  const normalized = normalizePath(filePath).toLowerCase();
  return (
    normalized.endsWith(".spec.ts") ||
    normalized.endsWith(".spec.js") ||
    normalized.includes("/tests/") && normalized.endsWith(".ts") ||
    normalized.includes("/tests/") && normalized.endsWith(".js")
  );
}

function isGeneratedApiPath(filePath) {
  const normalized = normalizePath(filePath);
  return (
    /[/\\]lib[/\\]api-zod[/\\]src[/\\]generated[/\\]/.test(normalized) ||
    /[/\\]lib[/\\]api-client-react[/\\]src[/\\]generated[/\\]/.test(normalized) ||
    /[/\\]generated[/\\]/.test(normalized) &&
      (normalized.includes("api-zod") || normalized.includes("api-client-react"))
  );
}

function getToolFilePath(toolInput) {
  if (!toolInput || typeof toolInput !== "object") return "";
  return toolInput.path || toolInput.file_path || toolInput.target_file || "";
}

function resolvePrettierCommand(projectRoot) {
  const localPrettier = path.join(
    projectRoot,
    "command-center",
    "node_modules",
    "prettier",
    "bin",
    "prettier.cjs",
  );
  if (fs.existsSync(localPrettier)) {
    return { command: process.execPath, args: [localPrettier] };
  }
  return { command: "npx", args: ["prettier"] };
}

module.exports = {
  readStdinJson,
  respond,
  getProjectRoot,
  normalizePath,
  readSessionState,
  writeSessionState,
  isTestSpecFile,
  isGeneratedApiPath,
  getToolFilePath,
  resolvePrettierCommand,
};
