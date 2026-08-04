import { prisma } from "@/lib/db";
import { MappedResult } from "./mapper";
import { parseContentWithAI } from "@/lib/ai/parser";

export async function importData(
  userId: string,
  mapped: MappedResult
): Promise<number> {
  let importedCount = 0;
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  switch (mapped.type) {
    case "note":
      // Avoid duplicate note import for same day
      const existingNote = await prisma.dailyNote.findFirst({
        where: {
          userId,
          createdAt: { gte: todayStart, lte: todayEnd },
          content: mapped.data.content as string,
        },
      });

      if (!existingNote) {
        await prisma.dailyNote.create({
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
        await prisma.task.create({
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
        await prisma.achievement.create({
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
  }
): Promise<number> {
  let count = 0;
  const today = new Date();

  // Import notes
  for (const content of parsed.notes) {
    if (!content.trim()) continue;
    const existing = await prisma.dailyNote.findFirst({
      where: {
        userId,
        date: { gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()) },
        content: content.trim(),
      },
    });
    if (!existing) {
      await prisma.dailyNote.create({
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
    await prisma.task.create({
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
    await prisma.achievement.create({
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

export async function runCliCommand(
  commandId: string
): Promise<{ success: boolean; importedCount: number; output: string; error?: string; durationMs: number; aiUsed?: boolean }> {
  const { executeCommand } = await import("./executor");
  const { parseOutput } = await import("./parser");
  const { mapOutput } = await import("./mapper");

  const command = await prisma.cliCommand.findUnique({
    where: { id: commandId },
  });

  if (!command) {
    return { success: false, importedCount: 0, output: "", error: "Command not found", durationMs: 0 };
  }

  const startTime = Date.now();

  // Execute command
  const execResult = await executeCommand(command.command, command.cwd || undefined);
  if (!execResult.success) {
    await prisma.cliExecutionLog.create({
      data: {
        commandId: command.id,
        status: "failed",
        output: execResult.output,
        error: execResult.error,
        durationMs: execResult.durationMs,
        userId: command.userId,
      },
    });

    await prisma.cliCommand.update({
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
  let aiUsed = false;

  // Try AI parsing first if enabled
  if (command.importType === "auto" || !command.importType) {
    const aiParsed = await parseContentWithAI(command.userId, execResult.output);
    if (aiParsed) {
      aiUsed = true;
      importedCount = await importParsedAIContent(command.userId, aiParsed);
    }
  }

  // Fallback to manual mapping if AI not used or failed
  if (!aiUsed) {
    // Parse output
    const parsed = parseOutput(execResult.output, command.outputType as "text" | "json");

    // Map fields
    const mapped = mapOutput(
      parsed,
      command.importType as "note" | "task" | "achievement",
      command.fieldMapping
    );

    // Import data
    importedCount = await importData(command.userId, mapped);
  }

  // Save log
  await prisma.cliExecutionLog.create({
    data: {
      commandId: command.id,
      status: "success",
      output: execResult.output,
      importedCount,
      durationMs: Date.now() - startTime,
      userId: command.userId,
    },
  });

  await prisma.cliCommand.update({
    where: { id: command.id },
    data: { lastRunAt: new Date() },
  });

  return {
    success: true,
    importedCount,
    output: execResult.output,
    durationMs: Date.now() - startTime,
    aiUsed,
  };
}
