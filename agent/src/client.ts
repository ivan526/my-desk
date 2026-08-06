import WebSocket from "ws";
import os from "os";
import { executeCommand } from "./executor";

interface ClientOptions {
  serverUrl: string;
  apiKey: string;
  name?: string;
}

export class AgentClient {
  private ws: WebSocket | null = null;
  private options: ClientOptions;
  private reconnectDelay = 1000;
  private maxReconnectDelay = 300000; // 5 minutes
  private pingInterval: NodeJS.Timeout | null = null;
  private connected = false;
  private running = false;

  constructor(options: ClientOptions) {
    this.options = options;
  }

  connect() {
    this.running = true;
    this.startConnection();
  }

  disconnect() {
    this.running = false;
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
  }

  private startConnection() {
    if (!this.running) return;

    console.log(`Connecting to ${this.options.serverUrl}...`);

    const url = new URL(this.options.serverUrl);
    url.searchParams.set("key", this.options.apiKey);

    this.ws = new WebSocket(url.toString());

    this.ws.on("open", () => {
      console.log("Connected to server");
      this.connected = true;
      this.reconnectDelay = 1000;

      // Send hello message
      this.send("agent:hello", {
        version: "1.0.0",
        hostname: os.hostname(),
        os: process.platform,
        arch: process.arch,
        name: this.options.name || os.hostname(),
      });

      // Start heartbeat
      if (this.pingInterval) clearInterval(this.pingInterval);
      this.pingInterval = setInterval(() => {
        if (this.ws && this.connected) {
          this.send("agent:pong", { timestamp: Date.now() });
        }
      }, 30000);
    });

    this.ws.on("message", async (raw) => {
      try {
        const message = JSON.parse(raw.toString());
        await this.handleMessage(message);
      } catch (e) {
        console.error("Failed to parse message:", e);
      }
    });

    this.ws.on("close", () => {
      console.log("Disconnected from server");
      this.connected = false;
      if (this.pingInterval) {
        clearInterval(this.pingInterval);
        this.pingInterval = null;
      }
      if (this.running) {
        console.log(`Reconnecting in ${Math.round(this.reconnectDelay / 1000)}s...`);
        setTimeout(() => {
          this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
          this.startConnection();
        }, this.reconnectDelay);
      }
    });

    this.ws.on("error", (err) => {
      console.error("WebSocket error:", err.message);
    });
  }

  private async handleMessage(message: any) {
    switch (message.type) {
      case "server:auth_success":
        console.log("Authenticated successfully");
        break;

      case "server:welcome":
        console.log(`Welcome! Agent ID: ${message.data.agentId}`);
        console.log(`Pending tasks: ${message.data.pendingTaskCount}`);
        break;

      case "server:error":
        console.error("Server error:", message.data.message);
        break;

      case "server:ping":
        this.send("agent:pong", { timestamp: message.data.timestamp });
        break;

      case "task:execute":
        await this.handleTaskExecute(message.data);
        break;

      case "task:cancel":
        // TODO: implement task cancellation
        break;
    }
  }

  private async handleTaskExecute(data: {
    taskId: string;
    commandId: string;
    command: string;
    cwd?: string;
    timeout: number;
  }) {
    console.log(`Executing task: ${data.command}`);

    const result = await executeCommand(data.command, data.cwd, data.timeout);

    console.log(
      result.success
        ? `Task completed in ${result.durationMs}ms, output length: ${result.output.length}`
        : `Task failed: ${result.error}`
    );

    this.send("task:result", {
      taskId: data.taskId,
      success: result.success,
      output: result.output,
      error: result.error,
      exitCode: result.exitCode,
      durationMs: result.durationMs,
    });
  }

  private send(type: string, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}
