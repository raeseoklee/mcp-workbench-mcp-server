import type { RunReport, TestResult, AssertionResult } from "./runSpec.js";
import { t } from "../i18n.js";

export { type RunReport, type TestResult, type AssertionResult };

export interface ExplainFailureInput {
  runResult: RunReport;
}

export interface ExplainFailureOutput {
  text: string;
  structured: {
    summary: string;
    causes: FailureCause[];
    recommendations: string[];
  };
}

export interface FailureCause {
  type: "auth" | "placeholder" | "discovery" | "protocol" | "assertion" | "unknown";
  count: number;
  description: string;
}

type CauseType = FailureCause["type"];

const CAUSE_DESCRIPTIONS: Record<CauseType, string> = {
  auth: "Authentication or authorization failures",
  placeholder: "Placeholder / TODO values that need replacing",
  discovery: "Capability not supported or method not found",
  protocol: "Connection or protocol-level errors",
  assertion: "Assertion mismatches in test expectations",
  unknown: "Unclassified failures",
};

const RECOMMENDATIONS: Record<CauseType, string> = {
  auth: "Add authentication headers to the server config or pass them via headers parameter",
  placeholder: "Replace TODO_ placeholder values in the spec with actual test data",
  discovery: "This capability may not be supported \u2014 check inspect_server results first",
  protocol: "Check that the server is running and accessible",
  assertion: "Review the expected values in the spec assertions",
  unknown: "Examine the full test output for details",
};

const AUTH_PATTERNS = [
  "unauthorized",
  "403",
  "401",
  "authentication",
  "forbidden",
  "token",
  "api key",
];

export function explainFailure(
  input: ExplainFailureInput,
): ExplainFailureOutput {
  const { runResult } = input;

  const failedTests = runResult.tests.filter(
    (t) => t.status === "failed" || t.status === "error",
  );

  if (failedTests.length === 0) {
    return {
      text: t("server.explain.allPassed"),
      structured: {
        summary: "All tests passed",
        causes: [],
        recommendations: [],
      },
    };
  }

  const counts = new Map<CauseType, number>();

  for (const test of failedTests) {
    const cause = classifyCause(test);
    counts.set(cause, (counts.get(cause) ?? 0) + 1);
  }

  const causes: FailureCause[] = [];
  const recommendations: string[] = [];

  for (const [type, count] of counts) {
    causes.push({
      type,
      count,
      description: CAUSE_DESCRIPTIONS[type],
    });
    recommendations.push(RECOMMENDATIONS[type]);
  }

  const summary = causes
    .map((c) => `${c.count} ${c.type} failure${c.count > 1 ? "s" : ""}`)
    .join(", ");

  const causeKey = (type: CauseType): string =>
    `server.explain.cause.${type}`;
  const recKey = (type: CauseType): string =>
    `server.explain.rec.${type}`;

  const textParts = [t("server.explain.summary"), ""];
  textParts.push(t("server.explain.causes"));
  for (const c of causes) {
    textParts.push(`  \u2022 ${t(causeKey(c.type), { count: c.count })}`);
  }
  textParts.push("");
  textParts.push(t("server.explain.recommendations"));
  for (const c of causes) {
    const rec = t(recKey(c.type));
    textParts.push(`  \u2022 ${rec}`);
  }

  return {
    text: textParts.join("\n"),
    structured: { summary, causes, recommendations },
  };
}

function classifyCause(test: TestResult): CauseType {
  const errorText = gatherErrorText(test).toLowerCase();

  // auth
  if (AUTH_PATTERNS.some((p) => errorText.includes(p))) {
    return "auth";
  }

  // placeholder
  const idAndError = `${test.testId} ${errorText}`.toLowerCase();
  if (
    idAndError.includes("todo") ||
    idAndError.includes("placeholder") ||
    idAndError.includes("todo_")
  ) {
    return "placeholder";
  }

  // discovery
  if (
    test.status === "error" &&
    (errorText.includes("method not found") ||
      errorText.includes("not supported") ||
      errorText.includes("capability"))
  ) {
    return "discovery";
  }

  // protocol
  if (
    errorText.includes("timeout") ||
    errorText.includes("connection") ||
    errorText.includes("econnrefused") ||
    errorText.includes("parse error")
  ) {
    return "protocol";
  }

  // assertion
  if (
    test.status === "failed" &&
    test.assertionResults.some((a) => !a.passed)
  ) {
    return "assertion";
  }

  return "unknown";
}

function gatherErrorText(test: TestResult): string {
  const parts: string[] = [];
  if (test.error) {
    parts.push(test.error);
  }
  for (const a of test.assertionResults) {
    if (!a.passed && a.message) {
      parts.push(a.message);
    }
    if (a.diff) {
      parts.push(a.diff);
    }
  }
  return parts.join(" ");
}
