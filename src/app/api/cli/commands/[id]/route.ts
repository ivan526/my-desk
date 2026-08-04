import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/api-utils";
import { scheduleCommand, unscheduleCommand } from "@/lib/cli/scheduler";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = requireUserId(request);
  const command = await prisma.cliCommand.findFirst({
    where: { id: params.id, userId },
  });
  if (!command) {
    return NextResponse.json({ error: "命令不存在" }, { status: 404 });
  }
  return NextResponse.json({ data: command });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = requireUserId(request);
    const body = await request.json();

    const existing = await prisma.cliCommand.findFirst({
      where: { id: params.id, userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "命令不存在" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.command !== undefined) data.command = body.command;
    if (body.cwd !== undefined) data.cwd = body.cwd || null;
    if (body.schedule !== undefined) data.schedule = body.schedule;
    if (body.outputType !== undefined) data.outputType = body.outputType;
    if (body.fieldMapping !== undefined) data.fieldMapping = body.fieldMapping;
    if (body.importType !== undefined) data.importType = body.importType;
    if (body.enabled !== undefined) data.enabled = body.enabled;

    const command = await prisma.cliCommand.update({
      where: { id: params.id },
      data,
    });

    // Update schedule
    unscheduleCommand(command.id);
    if (command.enabled) {
      scheduleCommand(command.id, command.schedule);
    }

    return NextResponse.json({ data: command });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "更新失败" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = requireUserId(request);

    const existing = await prisma.cliCommand.findFirst({
      where: { id: params.id, userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "命令不存在" }, { status: 404 });
    }

    unscheduleCommand(params.id);
    await prisma.cliCommand.delete({ where: { id: params.id } });
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "删除失败" },
      { status: 500 }
    );
  }
}
