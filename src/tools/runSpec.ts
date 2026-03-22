import { runCli, withTempFile } from "../cli/runner.js";
import { t } from "../i18n.js";

export interface RunSpecInput {
  specText?: string;
  specPath?: string;
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
    t("server.run.completed"),
    "",
    t("server.run.tests", { total: report.total }),
    t("server.run.passed", { passed: report.passed }),
    t("server.run.failed", { failed: report.failed }),
    t("server.run.skipped", { skipped: report.skipped }),
    t("server.run.errors", { errors: report.errors }),
    t("server.run.duration", { ms: report.durationMs }),
  ];

  const failures = report.tests.filter(
    (tr) => tr.status === "failed" || tr.status === "error",
  );

  if (failures.length > 0) {
    lines.push("");
    lines.push(t("server.run.failures"));
    for (const tr of failures) {
      const reason =
        tr.error ?? findFirstFailedMessage(tr.assertionResults) ?? "unknown";
      lines.push(`  \u2717 ${tr.testId}: ${reason}`);
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
