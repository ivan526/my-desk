export interface Skill {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
  homepage?: string;
  // Command template with placeholders like {{args}}
  command: string;
  // Default working directory
  cwd?: string;
  // Default cron schedule
  defaultSchedule?: string;
  // Default output type
  outputType?: "text" | "json";
  // Default import type: auto(AI)/note/task/achievement
  defaultImportType?: "auto" | "note" | "task" | "achievement";
  // Whether to enable AI parsing by default
  useAI?: boolean;
  // Default field mapping for non-AI mode
  defaultFieldMapping?: Record<string, string>;
  // Tags
  tags?: string[];
  // Icon (emoji)
  icon?: string;
}
