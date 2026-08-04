import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/api-utils";
import { scheduleCommand } from "@/lib/cli/scheduler";

export async function GET(request: NextRequest) {
  const userId = requireUserId(request);
  const commands = await prisma.cliCommand.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ data: commands });
}

export async function POST(request: NextRequest) {
  try {
    const userId = requireUserId(request);
    const body = await request.json();

    const command = await prisma.cliCommand.create({
      data: {
        name: body.name,
        command: body.command,
        cwd: body.cwd || null,
        schedule: body.schedule || "0 0 18 * * 1-5", // Default: 18:00 on weekdays
        outputType: body.outputType || "text",
        fieldMapping: body.fieldMapping || "{}",
        importType: body.importType || "note",
        enabled: body.enabled !== false,
        userId,
      },
    });

    if (command.enabled) {
      scheduleCommand(command.id, command.schedule);
    }

    return NextResponse.json({ data: command });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "创建失败" },
      { status: 500 }
    );
  }
}
