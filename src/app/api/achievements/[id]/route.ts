import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = requireUserId(request);
  const achievement = await prisma.achievement.findFirst({
    where: { id: params.id, userId },
    include: { task: true, project: true },
  });
  if (!achievement) {
    return NextResponse.json({ error: "成果不存在" }, { status: 404 });
  }
  return NextResponse.json({ data: achievement });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = requireUserId(request);

    const existing = await prisma.achievement.findFirst({
      where: { id: params.id, userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "成果不存在" }, { status: 404 });
    }

    const body = await request.json();
    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.scenario !== undefined) data.scenario = body.scenario;
    if (body.result !== undefined) data.result = body.result;
    if (body.output !== undefined) data.output = body.output;
    if (body.value !== undefined) data.value = body.value;
    if (body.category !== undefined) data.category = body.category;
    if (body.projectId !== undefined) data.projectId = body.projectId || null;
    if (body.date !== undefined) data.date = new Date(body.date);

    const achievement = await prisma.achievement.update({
      where: { id: params.id },
      data,
      include: { task: true, project: true },
    });
    return NextResponse.json({ data: achievement });
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

    const achievement = await prisma.achievement.findFirst({
      where: { id: params.id, userId },
      select: { taskId: true },
    });
    if (!achievement) {
      return NextResponse.json({ error: "成果不存在" }, { status: 404 });
    }

    if (achievement.taskId) {
      await prisma.task.update({
        where: { id: achievement.taskId },
        data: { isConverted: false },
      });
    }
    await prisma.achievement.delete({ where: { id: params.id } });
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "删除失败" },
      { status: 500 }
    );
  }
}
