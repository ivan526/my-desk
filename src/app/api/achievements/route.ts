import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const projectId = searchParams.get("projectId");

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (projectId) where.projectId = projectId;

  const achievements = await prisma.achievement.findMany({
    where,
    include: { task: true, project: true },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ data: achievements });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const achievement = await prisma.achievement.create({
      data: {
        title: body.title,
        taskId: body.taskId || null,
        projectId: body.projectId || null,
        scenario: body.scenario || "",
        result: body.result || "",
        output: body.output || "",
        value: body.value || "",
        category: body.category || "",
        date: body.date ? new Date(body.date) : new Date(),
      },
      include: { task: true, project: true },
    });

    if (body.taskId) {
      await prisma.task.update({
        where: { id: body.taskId },
        data: { isConverted: true },
      });
    }

    return NextResponse.json({ data: achievement });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "创建失败" },
      { status: 500 }
    );
  }
}
