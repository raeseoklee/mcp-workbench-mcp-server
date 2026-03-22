import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { inspectServer } from "./tools/inspectServer.js";
import { generateSpec } from "./tools/generateSpec.js";
import { runSpec } from "./tools/runSpec.js";
import { explainFailure } from "./tools/explainFailure.js";

export function createServer(): Server {
  const server = new Server(
    { name: "mcp-workbench-server", version: "0.1.0" },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "inspect_server",
        description:
          "Connect to an MCP server and inspect its capabilities, version, and supported features.",
        inputSchema: {
          type: "object" as const,
          properties: {
            transport: {
              type: "string",
              enum: ["stdio", "streamable-http"],
              description: "Transport type to use for connecting to the server",
            },
            url: {
              type: "string",
              description:
                "Server URL (required for streamable-http transport)",
            },
            command: {
              type: "string",
              description:
                "Command to launch the server (required for stdio transport)",
            },
            args: {
              oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }],
              description: "Arguments to pass to the server command",
            },
            headers: {
              type: "object",
              additionalProperties: { type: "string" },
              description: "HTTP headers to send (e.g. Authorization)",
            },
            timeoutMs: {
              type: "number",
              description: "Timeout in milliseconds (default: 30000)",
            },
          },
          required: ["transport"],
        },
      },
      {
        name: "generate_spec",
        description:
          "Generate a YAML test spec by discovering the capabilities of an MCP server. Returns a ready-to-run spec.",
        inputSchema: {
          type: "object" as const,
          properties: {
            transport: {
              type: "string",
              enum: ["stdio", "streamable-http"],
              description: "Transport type to use for connecting to the server",
            },
            url: {
              type: "string",
              description:
                "Server URL (required for streamable-http transport)",
            },
            command: {
              type: "string",
              description:
                "Command to launch the server (required for stdio transport)",
            },
            args: {
              oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }],
              description: "Arguments to pass to the server command",
            },
            headers: {
              type: "object",
              additionalProperties: { type: "string" },
              description: "HTTP headers to send (e.g. Authorization)",
            },
            include: {
              type: "array",
              items: {
                type: "string",
                enum: ["tools", "resources", "prompts"],
              },
              description: "Only include these capability types in the spec",
            },
            exclude: {
              type: "array",
              items: {
                type: "string",
                enum: ["tools", "resources", "prompts"],
              },
              description: "Exclude these capability types from the spec",
            },
            depth: {
              type: "string",
              enum: ["shallow", "deep"],
              description:
                "Discovery depth: shallow (list only) or deep (call each tool/resource/prompt)",
            },
            timeoutMs: {
              type: "number",
              description: "Timeout in milliseconds (default: 30000)",
            },
          },
          required: ["transport"],
        },
      },
      {
        name: "run_spec",
        description:
          "Run a YAML test spec against an MCP server and return results. Provide either specText (inline YAML) or specPath (path to a file). At least one is required.",
        inputSchema: {
          type: "object" as const,
          properties: {
            specText: {
              type: "string",
              description: "Inline YAML spec content to run",
            },
            specPath: {
              type: "string",
              description: "Path to a YAML spec file to run",
            },
            timeoutMs: {
              type: "number",
              description: "Timeout in milliseconds (default: 30000)",
            },
          },
        },
      },
      {
        name: "explain_failure",
        description:
          "Analyze test run results and explain failures with heuristic classification and actionable recommendations. Pass the structured result from run_spec.",
        inputSchema: {
          type: "object" as const,
          properties: {
            runResult: {
              type: "object",
              description: "The RunReport object from a run_spec call",
              properties: {
                total: { type: "number" },
                passed: { type: "number" },
                failed: { type: "number" },
                skipped: { type: "number" },
                errors: { type: "number" },
                durationMs: { type: "number" },
                tests: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      testId: { type: "string" },
                      description: { type: "string" },
                      status: {
                        type: "string",
                        enum: ["passed", "failed", "skipped", "error"],
                      },
                      durationMs: { type: "number" },
                      error: { type: "string" },
                      assertionResults: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            passed: { type: "boolean" },
                            message: { type: "string" },
                            diff: { type: "string" },
                          },
                          required: ["passed"],
                        },
                      },
                    },
                    required: [
                      "testId",
                      "status",
                      "durationMs",
                      "assertionResults",
                    ],
                  },
                },
              },
              required: [
                "total",
                "passed",
                "failed",
                "skipped",
                "errors",
                "durationMs",
                "tests",
              ],
            },
          },
          required: ["runResult"],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;

    try {
      switch (name) {
        case "inspect_server": {
          const output = await inspectServer(
            args as unknown as Parameters<typeof inspectServer>[0],
          );
          return {
            content: [
              { type: "text" as const, text: output.text },
              { type: "text" as const, text: JSON.stringify(output.structured, null, 2) },
            ],
          };
        }
        case "generate_spec": {
          const output = await generateSpec(
            args as unknown as Parameters<typeof generateSpec>[0],
          );
          return {
            content: [
              { type: "text" as const, text: output.text },
              { type: "text" as const, text: JSON.stringify(output.structured, null, 2) },
            ],
          };
        }
        case "run_spec": {
          const output = await runSpec(
            args as unknown as Parameters<typeof runSpec>[0],
          );
          return {
            content: [
              { type: "text" as const, text: output.text },
              { type: "text" as const, text: JSON.stringify(output.structured, null, 2) },
            ],
          };
        }
        case "explain_failure": {
          const output = explainFailure(
            args as unknown as Parameters<typeof explainFailure>[0],
          );
          return {
            content: [
              { type: "text" as const, text: output.text },
              { type: "text" as const, text: JSON.stringify(output.structured, null, 2) },
            ],
          };
        }
        default:
          return {
            isError: true,
            content: [
              { type: "text" as const, text: `Unknown tool: ${name}` },
            ],
          };
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : String(err);
      return {
        isError: true,
        content: [{ type: "text" as const, text: message }],
      };
    }
  });

  return server;
}
