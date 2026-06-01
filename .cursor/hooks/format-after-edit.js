#!/usr/bin/env node
"use strict";

const { spawnSync } = require("child_process");
const path = require("path");
const {
  readStdinJson,
  getProjectRoot,
  resolvePrettierCommand,
} = require("./_utils");

const FORMAT_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".json"]);

async function main() {
  const input = await readStdinJson();
  const filePath = input.file_path;
  if (!filePath) {
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  if (!FORMAT_EXTENSIONS.has(ext)) {
    return;
  }

  const projectRoot = getProjectRoot(input);
  const prettier = resolvePrettierCommand(projectRoot);
  const result = spawnSync(
    prettier.command,
    [...prettier.args, "--write", filePath],
    {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  if (result.status !== 0) {
    process.stderr.write(
      `format-after-edit: prettier failed for ${filePath}\n${result.stderr || ""}\n`,
    );
  }
}

main().catch((error) => {
  process.stderr.write(`format-after-edit hook failed: ${error.message}\n`);
  process.exit(0);
});
