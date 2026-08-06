export interface WSMessage<T = any> {
  type: string;
  requestId?: string;
  data: T;
}

export interface AgentHelloData {
  version: string;
  hostname: string;
  os: string;
  arch: string;
  name?: string;
}

export interface TaskExecuteData {
  taskId: string;
  commandId: string;
  command: string;
  cwd?: string;
  timeout: number;
}

export interface TaskResultData {
  taskId: string;
  success: boolean;
  output: string;
  error?: string;
  exitCode?: number;
  durationMs: number;
}

export type AgentStatus = "online" | "offline";
