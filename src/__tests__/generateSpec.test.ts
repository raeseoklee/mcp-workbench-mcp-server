import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../cli/runner.js", () => ({
  runCli: vi.fn(),
}));

import { generateSpec, buildArgs } from "../tools/generateSpec.js";
import { runCli } from "../cli/runner.js";

const mockRunCli = vi.mocked(runCli);

const sampleYaml = `apiVersion: mcp-workbench.dev/v0alpha1
server:
  transport: stdio
  command: node
  args: server.js
tests:
  - id: test-list-tools
    description: List available tools
    act:
      method: tools/list
    assert:
      - kind: contains
  - id: test-call-weather
    description: Call get_weather tool
    act:
      method: tools/call
      params:
        name: get_weather
        arguments:
          city: TODO_CITY_NAME
    assert:
      - kind: equals
  - id: test-list-resources
    description: List resources
    act:
      method: resources/list
    assert:
      - kind: contains
`;

describe("generateSpec", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("counts test cases correctly", async () => {
    mockRunCli.mockResolvedValue({ stdout: sampleYaml, stderr: "" });

    const result = await generateSpec({
      transport: "stdio",
      command: "node",
      args: "server.js",
    });

    expect(result.structured.testCount).toBe(3);
    expect(result.text).toContain("3 tests");
  });

  it("detects TODO warnings", async () => {
    mockRunCli.mockResolvedValue({ stdout: sampleYaml, stderr: "" });

    const result = await generateSpec({
      transport: "stdio",
      command: "node",
    });

    expect(result.structured.warnings.length).toBeGreaterThan(0);
    expect(result.structured.warnings[0]).toContain("TODO_CITY_NAME");
    expect(result.text).toContain("Warnings:");
  });

  it("returns no warnings for clean YAML", async () => {
    const cleanYaml = `apiVersion: mcp-workbench.dev/v0alpha1
tests:
  - id: test-1
    act:
      method: tools/list
`;
    mockRunCli.mockResolvedValue({ stdout: cleanYaml, stderr: "" });

    const result = await generateSpec({
      transport: "stdio",
      command: "node",
    });

    expect(result.structured.warnings).toHaveLength(0);
    expect(result.text).not.toContain("Warnings:");
  });

  it("builds correct CLI args with include/exclude/depth", () => {
    const args = buildArgs({
      transport: "streamable-http",
      url: "http://localhost:3000",
      include: ["tools", "prompts"],
      depth: "deep",
      timeoutMs: 10000,
    });

    expect(args).toEqual([
      "generate",
      "--stdout",
      "--transport",
      "streamable-http",
      "--url",
      "http://localhost:3000",
      "--include",
      "tools,prompts",
      "--depth",
      "deep",
      "--timeout",
      "10000",
    ]);
  });

  it("returns the raw YAML in structured output", async () => {
    mockRunCli.mockResolvedValue({ stdout: sampleYaml, stderr: "" });

    const result = await generateSpec({
      transport: "stdio",
      command: "node",
    });

    expect(result.structured.yaml).toBe(sampleYaml);
  });
});
