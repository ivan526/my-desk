import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface ExecResult {
  success: boolean;
  output: string;
  error?: string;
  durationMs: number;
  exitCode?: number;
}

export async function executeCommand(
  command: string,
  cwd?: string,
  timeout: number = 30000
): Promise<ExecResult> {
  const startTime = Date.now();

  try {
    // Basic security: block dangerous commands
    const dangerousPatterns = [
      /rm\s+(-rf?|--recursive)\s+[\/~]/i,
      /del\s+\/[fsq]\s+[a-z]:/i,
      /format\s+[a-z]:/i,
      /mkfs\./i,
      /dd\s+if=/i,
      /:(){ :|:& };:/i, // fork bomb
    ];

    if (dangerousPatterns.some((p) => p.test(command))) {
      return {
        success: false,
        output: "",
        error: "Command blocked by security policy: potentially dangerous command",
        durationMs: Date.now() - startTime,
        exitCode: 1,
      };
    }

    const { stdout, stderr } = await execAsync(command, {
      cwd,
      timeout,
      encoding: "utf8",
      windowsHide: true,
      maxBuffer: 1024 * 1024 * 10, // 10MB output limit
    });

    return {
      success: true,
      output: stdout || stderr,
      durationMs: Date.now() - startTime,
      exitCode: 0,
    };
  } catch (err: any) {
    return {
      success: false,
      output: err.stdout || "",
      error: err.message || err.stderr || "Command execution failed",
      durationMs: Date.now() - startTime,
      exitCode: err.code || 1,
    };
  }
}
