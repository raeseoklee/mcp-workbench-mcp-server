import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../cli/runner.js", () => ({
  runCli: vi.fn(),
}));

import { inspectServer, buildArgs } from "../tools/inspectServer.js";
import { runCli } from "../cli/runner.js";

const mockRunCli = vi.mocked(runCli);

const sampleSession = {
  serverInfo: { name: "test-server", version: "1.0.0" },
  protocolVersion: "2025-11-25",
  serverCapabilities: {
    tools: { listChanged: false },
    resources: { subscribe: false },
  },
};

describe("inspectServer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds correct args for stdio transport", () => {
    const args = buildArgs({
      transport: "stdio",
      command: "node",
      args: ["server.js", "--port", "3000"],
    });

    expect(args).toEqual([
      "inspect",
      "--json",
      "--transport",
      "stdio",
      "--command",
      "node",
      "--args",
      "server.js --port 3000",
    ]);
  });

  it("builds correct args for streamable-http transport", () => {
    const args = buildArgs({
      transport: "streamable-http",
      url: "http://localhost:3000/mcp",
      timeoutMs: 5000,
    });

    expect(args).toEqual([
      "inspect",
      "--json",
      "--transport",
      "streamable-http",
      "--url",
      "http://localhost:3000/mcp",
      "--timeout",
      "5000",
    ]);
  });

  it("formats headers as Key: Value", () => {
    const args = buildArgs({
      transport: "streamable-http",
      url: "http://localhost:3000/mcp",
      headers: { Authorization: "Bearer token123", "X-Custom": "value" },
    });

    expect(args).toContain("--header");
    expect(args).toContain("Authorization: Bearer token123");
    expect(args).toContain("X-Custom: value");
  });

  it("handles string args", () => {
    const args = buildArgs({
      transport: "stdio",
      command: "node",
      args: "server.js --port 3000",
    });

    expect(args).toContain("--args");
    expect(args).toContain("server.js --port 3000");
  });

  it("parses NegotiatedSession JSON correctly", async () => {
    mockRunCli.mockResolvedValue({
      stdout: JSON.stringify(sampleSession),
      stderr: "",
    });

    const result = await inspectServer({
      transport: "stdio",
      command: "node",
      args: "server.js",
    });

    expect(result.structured.serverName).toBe("test-server");
    expect(result.structured.serverVersion).toBe("1.0.0");
    expect(result.structured.protocolVersion).toBe("2025-11-25");
    expect(result.structured.capabilities.tools).toBe(true);
    expect(result.structured.capabilities.resources).toBe(true);
    expect(result.structured.capabilities.prompts).toBe(false);
    expect(result.structured.capabilities.completions).toBe(false);
    expect(result.structured.capabilities.logging).toBe(false);
  });

  it("includes capability indicators in text output", async () => {
    mockRunCli.mockResolvedValue({
      stdout: JSON.stringify(sampleSession),
      stderr: "",
    });

    const result = await inspectServer({
      transport: "stdio",
      command: "node",
    });

    expect(result.text).toContain("Server: test-server v1.0.0");
    expect(result.text).toContain("Protocol: 2025-11-25");
    expect(result.text).toContain("\u2713 tools");
    expect(result.text).toContain("\u2713 resources");
    expect(result.text).toContain("\u25CB prompts");
  });
});
