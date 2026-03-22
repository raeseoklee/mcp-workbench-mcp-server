import { runCli, withTempFile } from "../cli/runner.js";

export interface RunSpecInput {
  specText?: string;
  specPath?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

export interface RunSpecOutput {
  text: string;
  structured: RunReport;
}

export interface RunReport {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  errors: number;
  durationMs: number;
  tests: TestResult[];
}

export interface TestResult {
  testId: string;
  description?: string;
  status: "passed" | "failed" | "skipped" | "error";
  durationMs: number;
  error?: string;
  assertionResults: AssertionResult[];
}

export interface AssertionResult {
  passed: boolean;
  message?: string;
  diff?: string;
}

export async function runSpec(input: RunSpecInput): Promise<RunSpecOutput> {
  if (!input.specText && !input.specPath) {
    throw new Error(
      "Either specText or specPath must be provided to run a spec.",
    );
  }

  let report: RunReport;

  if (input.specText) {
    report = await withTempFile(input.specText, async (tmpPath) => {
      const args = ["run", tmpPath, "--json"];
      if (input.timeoutMs !== undefined) {
        args.push("--timeout", String(input.timeoutMs));
      }
      const result = await runCli(args, { timeoutMs: input.timeoutMs });
      return JSON.parse(result.stdout) as RunReport;
    });
  } else {
    const args = ["run", input.specPath!, "--json"];
    if (input.timeoutMs !== undefined) {
      args.push("--timeout", String(input.timeoutMs));
    }
    const result = await runCli(args, { timeoutMs: input.timeoutMs });
    report = JSON.parse(result.stdout) as RunReport;
  }

  const text = formatReport(report);
  return { text, structured: report };
}

function formatReport(report: RunReport): string {
  const lines = [
    "Spec run completed.",
    "",
    `Tests:  ${report.total}`,
    `Passed: ${report.passed}`,
    `Failed: ${report.failed}`,
    `Skipped: ${report.skipped}`,
    `Errors: ${report.errors}`,
    `Duration: ${report.durationMs}ms`,
  ];

  const failures = report.tests.filter(
    (t) => t.status === "failed" || t.status === "error",
  );

  if (failures.length > 0) {
    lines.push("");
    lines.push("Failures:");
    for (const t of failures) {
      const reason =
        t.error ?? findFirstFailedMessage(t.assertionResults) ?? "unknown";
      lines.push(`  \u2717 ${t.testId}: ${reason}`);
    }
  }

  return lines.join("\n");
}

function findFirstFailedMessage(
  results: AssertionResult[],
): string | undefined {
  for (const r of results) {
    if (!r.passed && r.message) {
      return r.message;
    }
  }
  return undefined;
}
