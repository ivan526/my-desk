import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const userId = requireUserId(request);
  const { searchParams } = new URL(request.url);
  const commandId = searchParams.get("commandId");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: Record<string, unknown> = { userId };
  if (commandId) where.commandId = commandId;

  const logs = await prisma.cliExecutionLog.findMany({
    where,
    orderBy: { executedAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ data: logs });
}
