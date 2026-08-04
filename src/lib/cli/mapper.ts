import { ParsedOutput } from "./parser";

export interface FieldMapping {
  [targetField: string]: string; // template string, e.g. "${content}" or "今日工作：${summary}"
}

export interface MappedResult {
  type: "note" | "task" | "achievement";
  data: Record<string, unknown>;
}

export function mapOutput(
  parsed: ParsedOutput,
  importType: "note" | "task" | "achievement",
  mappingConfig: string
): MappedResult {
  let mapping: FieldMapping = {};
  try {
    mapping = JSON.parse(mappingConfig);
  } catch {
    // Use default mapping if config is invalid
  }

  const data: Record<string, unknown> = {};
  const context = parsed.isJson && parsed.data ? parsed.data : { content: parsed.text };

  // Default mappings
  const defaultMappings: Record<string, FieldMapping> = {
    note: {
      content: "${content}",
    },
    task: {
      title: "${title}",
      description: "${content}",
      priority: "medium",
      status: "todo",
    },
    achievement: {
      title: "${title}",
      result: "${content}",
      category: "其他",
    },
  };

  const finalMapping = Object.assign({}, defaultMappings[importType], mapping);

  for (const [field, template] of Object.entries(finalMapping)) {
    data[field] = renderTemplate(template, context);
  }

  return {
    type: importType,
    data,
  };
}

function renderTemplate(template: string, context: Record<string, unknown>): string {
  return template.replace(/\$\{(\w+)\}/g, (_, key) => {
    const value = context[key];
    if (value === undefined || value === null) return "";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  });
}
