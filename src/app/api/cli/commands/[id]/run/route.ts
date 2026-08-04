import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/api-utils";
import { runCliCommand } from "@/lib/cli/importer";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = requireUserId(request);

  const existing = await prisma.cliCommand.findFirst({
    where: { id: params.id, userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "命令不存在" }, { status: 404 });
  }

  try {
    const result = await runCliCommand(params.id);
    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "执行失败" },
      { status: 500 }
    );
  }
}
