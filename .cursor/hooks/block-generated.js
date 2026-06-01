#!/usr/bin/env node
"use strict";

const { readStdinJson, respond, getToolFilePath, isGeneratedApiPath } =
  require("./_utils");

async function main() {
  const input = await readStdinJson();
  const toolName = input.tool_name || "";
  if (toolName !== "Write" && toolName !== "StrReplace") {
    respond({ permission: "allow" });
    return;
  }

  const filePath = getToolFilePath(input.tool_input);
  if (filePath && isGeneratedApiPath(filePath)) {
    respond({
      permission: "deny",
      user_message:
        "Blocked: generated API client files cannot be edited directly.",
      agent_message:
        "Edit command-center/lib/api-spec/openapi.yaml (and Orval config if needed), then regenerate the clients under lib/api-zod and lib/api-client-react instead of editing files in */generated/*.",
    });
    return;
  }

  respond({ permission: "allow" });
}

main().catch((error) => {
  process.stderr.write(`block-generated hook failed: ${error.message}\n`);
  respond({ permission: "allow" });
  process.exit(0);
});
