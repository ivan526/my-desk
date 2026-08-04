import cron from "node-cron";
import { prisma } from "@/lib/db";
import { runCliCommand } from "./importer";

const scheduledTasks = new Map<string, cron.ScheduledTask>();

export async function initScheduler() {
  // Stop all existing tasks
  for (const task of scheduledTasks.values()) {
    task.stop();
  }
  scheduledTasks.clear();

  // Load all enabled commands
  const commands = await prisma.cliCommand.findMany({
    where: { enabled: true },
  });

  for (const cmd of commands) {
    scheduleCommand(cmd.id, cmd.schedule);
  }

  console.log(`CLI scheduler initialized, ${commands.length} commands scheduled`);
}

export function scheduleCommand(commandId: string, cronExpression: string) {
  // Stop existing task for this command
  if (scheduledTasks.has(commandId)) {
    scheduledTasks.get(commandId)?.stop();
    scheduledTasks.delete(commandId);
  }

  if (!cron.validate(cronExpression)) {
    console.error(`Invalid cron expression for command ${commandId}: ${cronExpression}`);
    return false;
  }

  const task = cron.schedule(cronExpression, async () => {
    console.log(`Running scheduled CLI command: ${commandId}`);
    try {
      await runCliCommand(commandId);
    } catch (err) {
      console.error(`Failed to run command ${commandId}:`, err);
    }
  });

  scheduledTasks.set(commandId, task);
  return true;
}

export function unscheduleCommand(commandId: string) {
  if (scheduledTasks.has(commandId)) {
    scheduledTasks.get(commandId)?.stop();
    scheduledTasks.delete(commandId);
  }
}
