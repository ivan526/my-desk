export type OutputType = "text" | "json";

export interface ParsedOutput {
  isJson: boolean;
  text: string;
  data?: Record<string, unknown>;
}

export function parseOutput(output: string, expectedType: OutputType): ParsedOutput {
  const trimmed = output.trim();

  if (expectedType === "json") {
    try {
      const data = JSON.parse(trimmed);
      return {
        isJson: true,
        text: trimmed,
        data: typeof data === "object" ? data : { value: data },
      };
    } catch {
      // If JSON parse fails, fall back to text
      return {
        isJson: false,
        text: trimmed,
      };
    }
  }

  // Auto detect JSON if it looks like JSON
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const data = JSON.parse(trimmed);
      return {
        isJson: true,
        text: trimmed,
        data: typeof data === "object" ? data : { value: data },
      };
    } catch {
      // Not valid JSON, treat as text
    }
  }

  return {
    isJson: false,
    text: trimmed,
  };
}
