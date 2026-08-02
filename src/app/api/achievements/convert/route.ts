import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json({ error: "缺少 taskId" }, { status: 400 });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) {
      return NextResponse.json({ error: "任务不存在" }, { status: 404 });
    }

    if (task.isConverted) {
      const existing = await prisma.achievement.findUnique({
        where: { taskId },
      });
      if (existing) {
        return NextResponse.json({ data: existing, message: "任务已转化为成果" });
      }
    }

    const achievement = await prisma.achievement.create({
      data: {
        title: task.title,
        taskId: task.id,
        projectId: task.projectId,
        scenario: task.description || "",
        result: "",
        output: "",
        value: "",
        category: "其他",
        date: task.completedAt || new Date(),
      },
      include: { task: true, project: true },
    });

    await prisma.task.update({
      where: { id: taskId },
      data: { isConverted: true },
    });

    return NextResponse.json({ data: achievement });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "转化失败" },
      { status: 500 }
    );
  }
}
