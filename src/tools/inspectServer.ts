import { runCli } from "../cli/runner.js";

export interface InspectServerInput {
  transport: "stdio" | "streamable-http";
  url?: string;
  command?: string;
  args?: string | string[];
  headers?: Record<string, string>;
  timeoutMs?: number;
}

export interface InspectServerOutput {
  text: string;
  structured: {
    serverName: string;
    serverVersion: string;
    protocolVersion: string;
    capabilities: {
      tools: boolean;
      resources: boolean;
      prompts: boolean;
      completions: boolean;
      logging: boolean;
    };
    instructions?: string;
  };
}

interface NegotiatedSession {
  serverInfo: { name: string; version: string };
  protocolVersion: string;
  serverCapabilities: Record<string, unknown>;
  serverInstructions?: string;
}

export async function inspectServer(
  input: InspectServerInput,
): Promise<InspectServerOutput> {
  const args = buildArgs(input);
  const result = await runCli(args, { timeoutMs: input.timeoutMs });

  const session: NegotiatedSession = JSON.parse(result.stdout);

  const caps = session.serverCapabilities;
  const capabilities = {
    tools: "tools" in caps,
    resources: "resources" in caps,
    prompts: "prompts" in caps,
    completions: "completions" in caps,
    logging: "logging" in caps,
  };

  const structured: InspectServerOutput["structured"] = {
    serverName: session.serverInfo.name,
    serverVersion: session.serverInfo.version,
    protocolVersion: session.protocolVersion,
    capabilities,
  };
  if (session.serverInstructions) {
    structured.instructions = session.serverInstructions;
  }

  const capLines = (
    ["tools", "resources", "prompts", "completions", "logging"] as const
  )
    .map((c) => `  ${capabilities[c] ? "\u2713" : "\u25CB"} ${c}`)
    .join("\n");

  const text = [
    `Server: ${structured.serverName} v${structured.serverVersion}`,
    `Protocol: ${structured.protocolVersion}`,
    "",
    "Capabilities:",
    capLines,
  ].join("\n");

  return { text, structured };
}

export function buildArgs(input: InspectServerInput): string[] {
  const args = ["inspect", "--json", "--transport", input.transport];

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
  if (input.timeoutMs !== undefined) {
    args.push("--timeout", String(input.timeoutMs));
  }

  return args;
}
