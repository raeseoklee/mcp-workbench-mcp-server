import { describe, it, expect, vi, beforeEach } from "vitest";
import type { RunReport } from "../tools/runSpec.js";

// Mock the runner module before importing runSpec
vi.mock("../cli/runner.js", () => ({
  runCli: vi.fn(),
  withTempFile: vi.fn(),
}));

import { runSpec } from "../tools/runSpec.js";
import { runCli, withTempFile } from "../cli/runner.js";

const mockRunCli = vi.mocked(runCli);
const mockWithTempFile = vi.mocked(withTempFile);

const sampleReport: RunReport = {
  total: 2,
  passed: 1,
  failed: 1,
  skipped: 0,
  errors: 0,
  durationMs: 500,
  tests: [
    {
      testId: "test-1",
      status: "passed",
      durationMs: 200,
      assertionResults: [{ passed: true }],
    },
    {
      testId: "test-2",
      status: "failed",
      durationMs: 300,
      assertionResults: [{ passed: false, message: "Expected 1, got 2" }],
    },
  ],
};

describe("runSpec", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses temp file when specText is provided", async () => {
    mockWithTempFile.mockImplementation(async (_content, fn) => {
      return fn("/tmp/mock-spec.yaml");
    });
    mockRunCli.mockResolvedValue({
      stdout: JSON.stringify(sampleReport),
      stderr: "",
    });

    const result = await runSpec({ specText: "apiVersion: v1\ntests: []" });

    expect(mockWithTempFile).toHaveBeenCalledWith(
      "apiVersion: v1\ntests: []",
      expect.any(Function),
    );
    expect(mockRunCli).toHaveBeenCalledWith(
      ["run", "/tmp/mock-spec.yaml", "--json"],
      { timeoutMs: undefined },
    );
    expect(result.structured.total).toBe(2);
    expect(result.text).toContain("Spec run completed");
  });

  it("uses specPath directly when provided", async () => {
    mockRunCli.mockResolvedValue({
      stdout: JSON.stringify(sampleReport),
      stderr: "",
    });

    const result = await runSpec({ specPath: "/path/to/spec.yaml" });

    expect(mockWithTempFile).not.toHaveBeenCalled();
    expect(mockRunCli).toHaveBeenCalledWith(
      ["run", "/path/to/spec.yaml", "--json"],
      { timeoutMs: undefined },
    );
    expect(result.structured.passed).toBe(1);
    expect(result.structured.failed).toBe(1);
  });

  it("throws when neither specText nor specPath is provided", async () => {
    await expect(runSpec({})).rejects.toThrow(
      "Either specText or specPath must be provided",
    );
  });

  it("includes failure details in text output", async () => {
    mockRunCli.mockResolvedValue({
      stdout: JSON.stringify(sampleReport),
      stderr: "",
    });

    const result = await runSpec({ specPath: "/path/to/spec.yaml" });

    expect(result.text).toContain("Failed: 1");
    expect(result.text).toContain("test-2");
    expect(result.text).toContain("Expected 1, got 2");
  });
});
