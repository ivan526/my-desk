import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const DEFAULT_TIMEOUT = 30000; // 30 seconds

export interface ExecResult {
  success: boolean;
  output: string;
  error?: string;
  durationMs: number;
}

export async function executeCommand(
  command: string,
  cwd?: string,
  timeout: number = DEFAULT_TIMEOUT
): Promise<ExecResult> {
  const startTime = Date.now();

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd,
      timeout,
      encoding: "utf8",
      windowsHide: true,
    });

    return {
      success: true,
      output: stdout || stderr,
      durationMs: Date.now() - startTime,
    };
  } catch (err: any) {
    return {
      success: false,
      output: err.stdout || "",
      error: err.message || err.stderr || "Command execution failed",
      durationMs: Date.now() - startTime,
    };
  }
}
