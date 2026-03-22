import { spawn } from "node:child_process";
import { writeFile, unlink, mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const CLI_PATH = process.env["MCP_WORKBENCH_CLI"] ?? "mcp-workbench";

export interface RunCliResult {
  stdout: string;
  stderr: string;
}

export function runCli(
  args: string[],
  opts?: { timeoutMs?: number; cwd?: string },
): Promise<RunCliResult> {
  const timeoutMs = (opts?.timeoutMs ?? 30_000) + 5_000;

  return new Promise((resolve, reject) => {
    let proc;
    try {
      proc = spawn(CLI_PATH, args, {
        cwd: opts?.cwd,
        stdio: ["ignore", "pipe", "pipe"],
        env: process.env,
      });
    } catch (err) {
      reject(
        new Error(
          `Failed to spawn "${CLI_PATH}". Is mcp-workbench installed and on your PATH?\n` +
            `Install it with: npm install -g mcp-workbench\n` +
            `Or set MCP_WORKBENCH_CLI to the path of the binary.\n` +
            `Original error: ${err instanceof Error ? err.message : String(err)}`,
        ),
      );
      return;
    }

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];

    proc.stdout.on("data", (chunk: Buffer) => stdoutChunks.push(chunk));
    proc.stderr.on("data", (chunk: Buffer) => stderrChunks.push(chunk));

    const timer = setTimeout(() => {
      proc.kill("SIGKILL");
      reject(new Error(`CLI timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    proc.on("error", (err) => {
      clearTimeout(timer);
      reject(
        new Error(
          `Failed to spawn "${CLI_PATH}". Is mcp-workbench installed and on your PATH?\n` +
            `Install it with: npm install -g mcp-workbench\n` +
            `Or set MCP_WORKBENCH_CLI to the path of the binary.\n` +
            `Original error: ${err.message}`,
        ),
      );
    });

    proc.on("close", (code) => {
      clearTimeout(timer);
      const stdout = Buffer.concat(stdoutChunks).toString("utf-8");
      const stderr = Buffer.concat(stderrChunks).toString("utf-8");

      if (code !== 0) {
        const detail = stderr.trim() || stdout.trim() || `exit code ${code}`;
        reject(new Error(`CLI exited with code ${code}: ${detail}`));
        return;
      }

      resolve({ stdout, stderr });
    });
  });
}

export async function withTempFile<R>(
  content: string,
  fn: (path: string) => Promise<R>,
): Promise<R> {
  const dir = await mkdtemp(join(tmpdir(), "mcp-workbench-"));
  const filePath = join(dir, "spec.yaml");
  await writeFile(filePath, content, "utf-8");
  try {
    return await fn(filePath);
  } finally {
    try {
      await unlink(filePath);
    } catch {
      // ignore cleanup errors
    }
  }
}
