import { describe, it, expect, afterEach } from "vitest";
import { explainFailure } from "../tools/explainFailure.js";
import type { RunReport } from "../tools/runSpec.js";
import { setLang } from "../i18n.js";

function makeReport(overrides: Partial<RunReport> = {}): RunReport {
  return {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    errors: 0,
    durationMs: 100,
    tests: [],
    ...overrides,
  };
}

describe("explainFailure", () => {
  it("returns no causes when there are no failures", () => {
    const report = makeReport({ total: 2, passed: 2 });
    const result = explainFailure({ runResult: report });

    expect(result.structured.causes).toHaveLength(0);
    expect(result.structured.recommendations).toHaveLength(0);
    expect(result.text).toContain("All tests passed");
  });

  it("classifies auth failures", () => {
    const report = makeReport({
      total: 1,
      failed: 1,
      tests: [
        {
          testId: "test-1",
          status: "failed",
          durationMs: 50,
          error: "Request failed: 401 Unauthorized",
          assertionResults: [],
        },
      ],
    });
    const result = explainFailure({ runResult: report });

    expect(result.structured.causes).toHaveLength(1);
    expect(result.structured.causes[0]!.type).toBe("auth");
    expect(result.structured.causes[0]!.count).toBe(1);
    expect(result.structured.recommendations[0]).toContain("authentication");
  });

  it("classifies placeholder failures", () => {
    const report = makeReport({
      total: 1,
      failed: 1,
      tests: [
        {
          testId: "test-TODO-placeholder",
          status: "failed",
          durationMs: 50,
          assertionResults: [{ passed: false, message: "value is TODO_VALUE" }],
        },
      ],
    });
    const result = explainFailure({ runResult: report });

    expect(result.structured.causes).toHaveLength(1);
    expect(result.structured.causes[0]!.type).toBe("placeholder");
  });

  it("classifies protocol errors", () => {
    const report = makeReport({
      total: 1,
      errors: 1,
      tests: [
        {
          testId: "test-conn",
          status: "error",
          durationMs: 5000,
          error: "ECONNREFUSED: connection refused",
          assertionResults: [],
        },
      ],
    });
    const result = explainFailure({ runResult: report });

    expect(result.structured.causes).toHaveLength(1);
    expect(result.structured.causes[0]!.type).toBe("protocol");
    expect(result.structured.recommendations[0]).toContain("running");
  });

  it("classifies discovery errors", () => {
    const report = makeReport({
      total: 1,
      errors: 1,
      tests: [
        {
          testId: "test-method",
          status: "error",
          durationMs: 50,
          error: "method not found: prompts/list",
          assertionResults: [],
        },
      ],
    });
    const result = explainFailure({ runResult: report });

    expect(result.structured.causes).toHaveLength(1);
    expect(result.structured.causes[0]!.type).toBe("discovery");
  });

  it("classifies assertion failures", () => {
    const report = makeReport({
      total: 1,
      failed: 1,
      tests: [
        {
          testId: "test-assert",
          status: "failed",
          durationMs: 50,
          assertionResults: [
            { passed: false, message: "Expected 42 but got 0" },
          ],
        },
      ],
    });
    const result = explainFailure({ runResult: report });

    expect(result.structured.causes).toHaveLength(1);
    expect(result.structured.causes[0]!.type).toBe("assertion");
  });

  it("handles mixed failures with multiple cause types", () => {
    const report = makeReport({
      total: 3,
      failed: 2,
      errors: 1,
      tests: [
        {
          testId: "test-auth",
          status: "failed",
          durationMs: 50,
          error: "403 Forbidden",
          assertionResults: [],
        },
        {
          testId: "test-conn",
          status: "error",
          durationMs: 5000,
          error: "connection timeout after 30s",
          assertionResults: [],
        },
        {
          testId: "test-assert",
          status: "failed",
          durationMs: 50,
          assertionResults: [
            { passed: false, message: "Expected true but got false" },
          ],
        },
      ],
    });
    const result = explainFailure({ runResult: report });

    const types = result.structured.causes.map((c) => c.type);
    expect(types).toContain("auth");
    expect(types).toContain("protocol");
    expect(types).toContain("assertion");
    expect(result.structured.recommendations.length).toBe(
      result.structured.causes.length,
    );
  });

  it("structured output does not change across locales", () => {
    const report = makeReport({
      total: 1,
      failed: 1,
      tests: [
        {
          testId: "test-auth",
          status: "failed",
          durationMs: 50,
          error: "401 Unauthorized",
          assertionResults: [],
        },
      ],
    });

    setLang("en");
    const enResult = explainFailure({ runResult: report });

    setLang("ko");
    const koResult = explainFailure({ runResult: report });

    setLang("en");

    expect(koResult.structured).toEqual(enResult.structured);
  });
});
