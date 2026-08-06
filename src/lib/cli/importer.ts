import { Prisma, PrismaClient } from "@prisma/client";
import { MappedResult } from "./mapper";
import { parseContentWithAI } from "@/lib/ai/parser";

const prismaDefault = new PrismaClient();

export async function importData(
  userId: string,
  mapped: MappedResult,
  tx: Prisma.TransactionClient = prismaDefault
): Promise<number> {
  let importedCount = 0;
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  switch (mapped.type) {
    case "note":
      // Avoid duplicate note import for same day
      const existingNote = await tx.dailyNote.findFirst({
        where: {
          userId,
          createdAt: { gte: todayStart, lte: todayEnd },
          content: mapped.data.content as string,
        },
      });

      if (!existingNote) {
        await tx.dailyNote.create({
          data: {
            content: mapped.data.content as string,
            mood: "",
            date: today,
            userId,
          },
        });
        importedCount++;
      }
      break;

    case "task":
      if (mapped.data.title) {
        await tx.task.create({
          data: {
            title: mapped.data.title as string,
            description: (mapped.data.description as string) || "",
            priority: (mapped.data.priority as string) || "medium",
            status: "todo",
            category: (mapped.data.category as string) || "",
            userId,
          },
        });
        importedCount++;
      }
      break;

    case "achievement":
      if (mapped.data.title) {
        await tx.achievement.create({
          data: {
            title: mapped.data.title as string,
            result: (mapped.data.result as string) || "",
            scenario: (mapped.data.scenario as string) || "",
            output: (mapped.data.output as string) || "",
            value: (mapped.data.value as string) || "",
            category: (mapped.data.category as string) || "其他",
            date: today,
            userId,
          },
        });
        importedCount++;
      }
      break;
  }

  return importedCount;
}

export async function importParsedAIContent(
  userId: string,
  parsed: {
    notes: string[];
    tasks: Array<{
      title: string;
      description?: string;
      priority?: "high" | "medium" | "low";
      dueDate?: string;
      tags?: string[];
    }>;
    achievements: Array<{
      title: string;
      result?: string;
      category?: string;
    }>;
  },
  tx: Prisma.TransactionClient = prismaDefault
): Promise<number> {
  let count = 0;
  const today = new Date();

  // Import notes
  for (const content of parsed.notes) {
    if (!content.trim()) continue;
    const existing = await tx.dailyNote.findFirst({
      where: {
        userId,
        date: { gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()) },
        content: content.trim(),
      },
    });
    if (!existing) {
      await tx.dailyNote.create({
        data: {
          content: content.trim(),
          date: today,
          userId,
        },
      });
      count++;
    }
  }

  // Import tasks
  for (const task of parsed.tasks) {
    if (!task.title?.trim()) continue;
    await tx.task.create({
      data: {
        title: task.title.trim(),
        description: task.description || "",
        priority: task.priority || "medium",
        status: "todo",
        category: task.tags?.[0] || "",
        tags: (task.tags || []).join(","),
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        userId,
      },
    });
    count++;
  }

  // Import achievements
  for (const ach of parsed.achievements) {
    if (!ach.title?.trim()) continue;
    await tx.achievement.create({
      data: {
        title: ach.title.trim(),
        result: ach.result || "",
        category: ach.category || "其他",
        date: today,
        userId,
      },
    });
    count++;
  }

  return count;
}

/**
 * Process command output and import data, create execution log
 */
export async function processCommandResult(
  userId: string,
  commandId: string,
  rawOutput: string,
  durationMs: number,
  agentId: string | null = null,
  tx: Prisma.TransactionClient = prismaDefault
) {
  const command = await tx.cliCommand.findUnique({
    where: { id: commandId },
  });

  if (!command) return;

  let importedCount = 0;

  // Try AI parsing first if enabled and import type is auto
  if (command.useAI && command.importType === "auto") {
    const aiParsed = await parseContentWithAI(userId, rawOutput);
    if (aiParsed) {
      importedCount = await importParsedAIContent(userId, aiParsed, tx);
    }
  }

  // Fallback to manual mapping if AI not used or failed
  if (importedCount === 0 && command.importType !== "auto") {
    const { parseOutput } = await import("./parser");
    const { mapOutput } = await import("./mapper");
    const parsed = parseOutput(rawOutput, command.outputType as "text" | "json");
    const mapped = mapOutput(
      parsed,
      command.importType as "note" | "task" | "achievement",
      command.fieldMapping
    );
    importedCount = await importData(userId, mapped, tx);
  }

  // Create execution log
  await tx.cliExecutionLog.create({
    data: {
      commandId: command.id,
      status: "success",
      output: rawOutput,
      importedCount,
      durationMs,
      userId,
      agentId,
    },
  });

  await tx.cliCommand.update({
    where: { id: command.id },
    data: { lastRunAt: new Date() },
  });
}

export async function runCliCommandLocally(
  commandId: string
): Promise<{ success: boolean; importedCount: number; output: string; error?: string; durationMs: number }> {
  const { executeCommand } = await import("./executor");
  const { parseOutput } = await import("./parser");
  const { mapOutput } = await import("./mapper");

  const command = await prismaDefault.cliCommand.findUnique({
    where: { id: commandId },
  });

  if (!command) {
    return { success: false, importedCount: 0, output: "", error: "Command not found", durationMs: 0 };
  }

  const startTime = Date.now();

  // Execute command locally (server-side fallback)
  const execResult = await executeCommand(command.command, command.cwd || undefined);
  if (!execResult.success) {
    await prismaDefault.cliExecutionLog.create({
      data: {
        commandId: command.id,
        status: "failed",
        output: execResult.output,
        error: execResult.error,
        durationMs: execResult.durationMs,
        userId: command.userId,
      },
    });

    await prismaDefault.cliCommand.update({
      where: { id: command.id },
      data: { lastRunAt: new Date() },
    });

    return {
      success: false,
      importedCount: 0,
      output: execResult.output,
      error: execResult.error,
      durationMs: execResult.durationMs,
    };
  }

  let importedCount = 0;
  await prismaDefault.$transaction(async (tx) => {
    await processCommandResult(command.userId, commandId, execResult.output, Date.now() - startTime, null, tx);
  });

  // Get imported count from log
  const latestLog = await prismaDefault.cliExecutionLog.findFirst({
    where: { commandId },
    orderBy: { executedAt: "desc" },
  });
  importedCount = latestLog?.importedCount || 0;

  return {
    success: true,
    importedCount,
    output: execResult.output,
    durationMs: Date.now() - startTime,
  };
}

export async function runCliCommand(
  commandId: string,
  agentId?: string
): Promise<{ success: boolean; importedCount: number; output: string; error?: string; durationMs: number; queued?: boolean }> {
  const command = await prismaDefault.cliCommand.findUnique({
    where: { id: commandId },
  });

  if (!command) {
    return { success: false, importedCount: 0, output: "", error: "Command not found", durationMs: 0 };
  }

  // If runTarget is server or no agent specified and no online agent, run locally
  if (command.runTarget === "server") {
    return runCliCommandLocally(commandId);
  }

  // Run on agent
  const { getOnlineAgentForUser } = await import("@/lib/agent/server");
  const { dispatchTaskToAgent } = await import("@/lib/agent/task-dispatcher");

  const targetAgentId = agentId || getOnlineAgentForUser(command.userId);
  if (!targetAgentId) {
    return {
      success: false,
      importedCount: 0,
      output: "",
      error: "本地Agent未启动，请启动work-agent后再试，或修改命令为服务端执行模式",
      durationMs: 0,
      queued: false,
    };
  }

  // Dispatch to agent
  await dispatchTaskToAgent(targetAgentId, {
    commandId: command.id,
    command: command.command,
    cwd: command.cwd || undefined,
    triggeredBy: "manual",
  });

  return {
    success: true,
    importedCount: 0,
    output: "",
    durationMs: 0,
    queued: true, // Task is queued, result will come later via websocket
  };
}
