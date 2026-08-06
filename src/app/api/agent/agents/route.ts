import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/api-utils";
import "@/lib/agent/init";

export async function GET(request: NextRequest) {
  const userId = requireUserId(request);
  const agents = await prisma.agent.findMany({
    where: { userId },
    orderBy: { lastSeenAt: "desc" },
  });
  return NextResponse.json({ data: agents });
}

export async function PUT(request: NextRequest) {
  try {
    const userId = requireUserId(request);
    const body = await request.json();
    const { id, name, commandWhitelist, allowCustomCommands } = body;

    if (!id) {
      return NextResponse.json({ error: "缺少Agent ID" }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (commandWhitelist !== undefined) data.commandWhitelist = JSON.stringify(commandWhitelist);
    if (allowCustomCommands !== undefined) data.allowCustomCommands = allowCustomCommands;

    const agent = await prisma.agent.updateMany({
      where: { id, userId },
      data,
    });

    // TODO: Notify agent to update whitelist config via websocket

    return NextResponse.json({ data: agent });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "更新失败" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = requireUserId(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "缺少Agent ID" }, { status: 400 });
    }

    await prisma.agent.deleteMany({
      where: { id, userId },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "删除失败" },
      { status: 500 }
    );
  }
}
