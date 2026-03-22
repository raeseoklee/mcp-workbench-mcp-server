import { runCli } from "../cli/runner.js";

export interface GenerateSpecInput {
  transport: "stdio" | "streamable-http";
  url?: string;
  command?: string;
  args?: string | string[];
  headers?: Record<string, string>;
  include?: Array<"tools" | "resources" | "prompts">;
  exclude?: Array<"tools" | "resources" | "prompts">;
  depth?: "shallow" | "deep";
  timeoutMs?: number;
}

export interface GenerateSpecOutput {
  text: string;
  structured: {
    yaml: string;
    testCount: number;
    warnings: string[];
  };
}

export async function generateSpec(
  input: GenerateSpecInput,
): Promise<GenerateSpecOutput> {
  const args = buildArgs(input);
  const result = await runCli(args, { timeoutMs: input.timeoutMs });

  const yaml = result.stdout;
  const testCount = countTests(yaml);
  const warnings = detectWarnings(yaml);

  const textParts = [`Generated spec \u2014 ${testCount} tests`];
  if (warnings.length > 0) {
    textParts.push("");
    textParts.push("Warnings:");
    for (const w of warnings) {
      textParts.push(`  - ${w}`);
    }
  }

  return {
    text: textParts.join("\n"),
    structured: { yaml, testCount, warnings },
  };
}

export function buildArgs(input: GenerateSpecInput): string[] {
  const args = ["generate", "--stdout", "--transport", input.transport];

  if (input.command) {
    args.push("--command", input.command);
  }
  if (input.url) {
    args.push("--url", input.url);
  }
  if (input.args) {
    const argsValue = Array.isArray(input.args)
      ? input.args.join(" ")
      : input.args;
    args.push("--args", argsValue);
  }
  if (input.headers) {
    for (const [key, value] of Object.entries(input.headers)) {
      args.push("--header", `${key}: ${value}`);
    }
  }
  if (input.include && input.include.length > 0) {
    args.push("--include", input.include.join(","));
  }
  if (input.exclude && input.exclude.length > 0) {
    args.push("--exclude", input.exclude.join(","));
  }
  if (input.depth) {
    args.push("--depth", input.depth);
  }
  if (input.timeoutMs !== undefined) {
    args.push("--timeout", String(input.timeoutMs));
  }

  return args;
}

function countTests(yaml: string): number {
  const lines = yaml.split("\n");
  let count = 0;
  for (const line of lines) {
    if (/^ {2}- id:/.test(line)) {
      count++;
    }
  }
  return count;
}

function detectWarnings(yaml: string): string[] {
  const lines = yaml.split("\n");
  const seen = new Set<string>();
  const warnings: string[] = [];

  for (const line of lines) {
    if (warnings.length >= 5) break;
    const trimmed = line.trim();
    if (/# TODO|TODO_/.test(trimmed) && !seen.has(trimmed)) {
      seen.add(trimmed);
      warnings.push(trimmed);
    }
  }

  return warnings;
}
