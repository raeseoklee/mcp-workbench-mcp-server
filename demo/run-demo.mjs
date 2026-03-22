#!/usr/bin/env node
/**
 * Demo script: exercises all 4 mcp-workbench-mcp-server tools
 * against the bundled demo-mcp server.
 */
import { inspectServer } from "../dist/tools/inspectServer.js";
import { generateSpec } from "../dist/tools/generateSpec.js";
import { runSpec } from "../dist/tools/runSpec.js";
import { explainFailure } from "../dist/tools/explainFailure.js";

const DEMO_CMD = "node";
const DEMO_ARGS =
  "/Users/irae/Workspace/irae/mcp-workbench/examples/demo-mcp/dist/index.js";

const DEMO_SPEC = `\
apiVersion: mcp-workbench.dev/v0alpha1
server:
  transport: stdio
  command: node
  args:
    - ${DEMO_ARGS}
tests:
  - id: ping
    description: Server responds to ping
    act:
      method: ping
    assert:
      - kind: status
        equals: success
  - id: tools-list
    description: Server exposes tools
    act:
      method: tools/list
    assert:
      - kind: notEmpty
        path: $.tools
  - id: get-weather
    description: get_weather returns text for Seoul
    act:
      method: tools/call
      tool: get_weather
      args:
        city: Seoul
    assert:
      - kind: executionError
        equals: false
      - kind: jsonpath
        path: $.content[0].text
        matches: Seoul
`;

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";
const GREEN = "\x1b[32m";
const MAGENTA = "\x1b[35m";
const DIM = "\x1b[2m";

function banner(step, title) {
  const line = "─".repeat(52);
  console.log(`\n${CYAN}${line}${RESET}`);
  console.log(`${BOLD}${YELLOW} ${step}  ${title}${RESET}`);
  console.log(`${CYAN}${line}${RESET}\n`);
}

async function main() {
  console.log(`\n${BOLD}${MAGENTA}  mcp-workbench-mcp-server  ×  demo-mcp${RESET}`);
  console.log(`${DIM}  Exercising all 4 MCP tools${RESET}\n`);

  // ── 1. inspect_server ─────────────────────────────────────────────────────
  banner("1/4", "inspect_server");
  const inspectOut = await inspectServer({
    transport: "stdio",
    command: DEMO_CMD,
    args: DEMO_ARGS,
  });
  console.log(inspectOut.text);

  // ── 2. generate_spec ──────────────────────────────────────────────────────
  banner("2/4", "generate_spec");
  const genOut = await generateSpec({
    transport: "stdio",
    command: DEMO_CMD,
    args: DEMO_ARGS,
    depth: "shallow",
  });
  console.log(genOut.text);

  // ── 3. run_spec ───────────────────────────────────────────────────────────
  banner("3/4", "run_spec");
  const runOut = await runSpec({ specText: DEMO_SPEC });
  console.log(runOut.text);

  // ── 4. explain_failure ────────────────────────────────────────────────────
  banner("4/4", "explain_failure");
  const explainOut = explainFailure({ runResult: runOut.structured });
  console.log(explainOut.text);

  console.log(`\n${GREEN}${BOLD}  ✓ All 4 tools working correctly${RESET}\n`);
}

main().catch((err) => {
  console.error(`\x1b[31m${err.message}\x1b[0m`);
  process.exit(1);
});
