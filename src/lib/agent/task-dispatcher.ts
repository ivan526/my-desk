import { prisma } from "@/lib/db";
import { sendToAgent, isAgentOnline } from "./server";
import { TaskExecuteData } from "./types";

export interface DispatchOptions {
  userId: string;
  commandId: string;
  command: string;
  cwd?: string;
  timeout?: number;
  triggeredBy?: "schedule" | "manual";
}

export async function dispatchTaskToAgent(
  agentId: string,
  options: Omit<DispatchOptions, "userId">
): Promise<boolean> {
  // Create pending task
  const pendingTask = await prisma.agentPendingTask.create({
    data: {
      agentId,
      commandId: options.commandId,
      command: options.command,
      cwd: options.cwd,
      timeout: options.timeout || 30000,
      triggeredBy: options.triggeredBy || "manual",
      status: "pending",
    },
  });

  if (isAgentOnline(agentId)) {
    // Send to agent immediately
    const taskData: TaskExecuteData = {
      taskId: pendingTask.id,
      commandId: options.commandId,
      command: options.command,
      cwd: options.cwd,
      timeout: options.timeout || 30000,
    };
    const sent = sendToAgent(agentId, "task:execute", taskData);
    if (sent) {
      await prisma.agentPendingTask.update({
        where: { id: pendingTask.id },
        data: { status: "sent" },
      });
      return true;
    }
  }

  return false; // Will be dispatched when agent comes online
}

export async function dispatchPendingTasks(agentId: string) {
  // Get all pending tasks for this agent, ordered by creation time
  const pendingTasks = await prisma.agentPendingTask.findMany({
    where: { agentId, status: "pending" },
    orderBy: { createdAt: "asc" },
    take: 10, // Process 10 at a time
  });

  for (const task of pendingTasks) {
    if (!isAgentOnline(agentId)) break;

    const taskData: TaskExecuteData = {
      taskId: task.id,
      commandId: task.commandId,
      command: task.command,
      cwd: task.cwd || undefined,
      timeout: task.timeout,
    };

    const sent = sendToAgent(agentId, "task:execute", taskData);
    if (sent) {
      await prisma.agentPendingTask.update({
        where: { id: task.id },
        data: {
          status: "sent",
          executedAt: new Date(),
        },
      });
    }
  }
}
