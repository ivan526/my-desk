import { WebSocketServer, WebSocket } from "ws";
import { prisma } from "@/lib/db";
import { verifyApiKey } from "./auth";
import { WSMessage, AgentHelloData, TaskResultData } from "./types";
import { dispatchPendingTasks } from "./task-dispatcher";
import { processCommandResult } from "../cli/importer";

interface AgentConnection {
  ws: WebSocket;
  userId: string;
  agentId: string;
  lastPong: number;
}

const connectedAgents = new Map<string, AgentConnection>(); // agentId -> connection
const userAgents = new Map<string, Set<string>>(); // userId -> Set<agentId>

let wss: WebSocketServer | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;

export function initWebSocketServer(server?: any) {
  if (wss) return wss;

  const port = parseInt(process.env.AGENT_WS_PORT || "3001");
  wss = new WebSocketServer({
    port: server ? undefined : port,
    server,
    path: "/api/agent/ws",
  });

  wss.on("connection", async (ws, req) => {
    // Extract API key from query params or authorization header
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const apiKey = url.searchParams.get("key") || req.headers.authorization?.replace("Bearer ", "");

    if (!apiKey) {
      ws.close(4001, "Missing API key");
      return;
    }

    const authResult = await verifyApiKey(apiKey);
    if (!authResult) {
      ws.close(4001, "Invalid API key");
      return;
    }

    const { userId } = authResult;

    // Send hello message first, expect agent to send hello
    ws.send(JSON.stringify({ type: "server:auth_success" }));

    let agentId: string | null = null;

    ws.on("message", async (raw) => {
      try {
        const message: WSMessage = JSON.parse(raw.toString());

        switch (message.type) {
          case "agent:hello": {
            const data = message.data as AgentHelloData;
            // Find existing agent by name+userId or create new
            const agentName = data.name || data.hostname || "Default Agent";
            let agent = await prisma.agent.findFirst({
              where: { userId, name: agentName },
            });

            if (!agent) {
              agent = await prisma.agent.create({
                data: {
                  name: agentName,
                  userId,
                  status: "online",
                  version: data.version,
                  hostname: data.hostname,
                  os: data.os,
                  arch: data.arch,
                  lastSeenAt: new Date(),
                },
              });
            } else {
              agent = await prisma.agent.update({
                where: { id: agent.id },
                data: {
                  status: "online",
                  version: data.version,
                  hostname: data.hostname,
                  os: data.os,
                  arch: data.arch,
                  lastSeenAt: new Date(),
                },
              });
            }

            agentId = agent.id;

            // Register connection
            const conn: AgentConnection = {
              ws,
              userId,
              agentId: agent.id,
              lastPong: Date.now(),
            };
            connectedAgents.set(agent.id, conn);
            if (!userAgents.has(userId)) {
              userAgents.set(userId, new Set());
            }
            userAgents.get(userId)?.add(agent.id);

            // Send welcome message
            const pendingCount = await prisma.agentPendingTask.count({
              where: { agentId: agent.id, status: "pending" },
            });
            send(ws, "server:welcome", {
              agentId: agent.id,
              pendingTaskCount: pendingCount,
            });

            console.log(`Agent connected: ${agent.name} (user: ${userId})`);

            // Dispatch pending tasks for this agent
            await dispatchPendingTasks(agent.id);
            break;
          }

          case "agent:pong": {
            if (agentId) {
              const conn = connectedAgents.get(agentId);
              if (conn) {
                conn.lastPong = Date.now();
              }
            }
            break;
          }

          case "task:result": {
            const data = message.data as TaskResultData;
            if (!agentId) break;

            // Update pending task status
            const pendingTask = await prisma.agentPendingTask.findUnique({
              where: { id: data.taskId },
              include: { command: true },
            });

            if (pendingTask) {
              await prisma.agentPendingTask.update({
                where: { id: data.taskId },
                data: {
                  status: data.success ? "completed" : "failed",
                  output: data.output,
                  error: data.error,
                  durationMs: data.durationMs,
                  completedAt: new Date(),
                },
              });

              // Process result and import data
              if (data.success) {
                await prisma.$transaction(async (tx) => {
                  await processCommandResult(
                    userId,
                    pendingTask.commandId,
                    data.output,
                    data.durationMs,
                    agentId!,
                    tx
                  );
                });
              }
            }
            break;
          }
        }
      } catch (e) {
        console.error("WebSocket message error:", e);
      }
    });

    ws.on("close", async () => {
      if (agentId) {
        connectedAgents.delete(agentId);
        userAgents.get(userId)?.delete(agentId);
        await prisma.agent.update({
          where: { id: agentId },
          data: { status: "offline" },
        });
        console.log(`Agent disconnected: ${agentId}`);
      }
    });

    ws.on("error", (err) => {
      console.error("WebSocket error:", err);
    });
  });

  // Heartbeat: ping every 30s, timeout after 90s no pong
  heartbeatInterval = setInterval(() => {
    const now = Date.now();
    for (const [agentId, conn] of connectedAgents.entries()) {
      if (now - conn.lastPong > 90_000) {
        conn.ws.terminate();
        continue;
      }
      send(conn.ws, "server:ping", { timestamp: now });
    }
  }, 30_000);

  console.log(`WebSocket server ready on ws://localhost:${port}/api/agent/ws`);
  return wss;
}

export function send(ws: WebSocket, type: string, data: any) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, data }));
  }
}

export function sendToAgent(agentId: string, type: string, data: any): boolean {
  const conn = connectedAgents.get(agentId);
  if (!conn || conn.ws.readyState !== WebSocket.OPEN) {
    return false;
  }
  send(conn.ws, type, data);
  return true;
}

export function getOnlineAgentForUser(userId: string): string | null {
  const agentIds = userAgents.get(userId);
  if (!agentIds || agentIds.size === 0) return null;
  // Return first online agent
  return Array.from(agentIds)[0];
}

export function isAgentOnline(agentId: string): boolean {
  return connectedAgents.has(agentId);
}

export function closeWebSocketServer() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  if (wss) {
    wss.close();
    wss = null;
  }
}
