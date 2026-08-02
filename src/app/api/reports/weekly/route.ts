import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateWeeklyReport } from "@/lib/aggregation";
import { requireUserId } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const userId = requireUserId(request);
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get("date");

  const date = dateStr ? new Date(dateStr) : new Date();
  const autoData = await generateWeeklyReport(userId, date);

  const { start, end } = { start: autoData.weekStart, end: autoData.weekEnd };

  const existing = await prisma.weeklyReport.findFirst({
    where: { userId, weekStart: { gte: start }, weekEnd: { lte: end } },
  });

  return NextResponse.json({
    data: {
      auto: autoData,
      saved: existing,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const userId = requireUserId(request);
    const body = await request.json();
    const report = await prisma.weeklyReport.upsert({
      where: { id: body.id || "nonexistent" },
      create: {
        weekStart: new Date(body.weekStart),
        weekEnd: new Date(body.weekEnd),
        tasksCompleted: body.tasksCompleted || 0,
        projectsCount: body.projectsCount || 0,
        achievementsCount: body.achievementsCount || 0,
        summary: body.summary || "",
        issues: body.issues || "",
        nextPlan: body.nextPlan || "",
        isAuto: false,
        userId,
      },
      update: {
        summary: body.summary,
        issues: body.issues,
        nextPlan: body.nextPlan,
        isAuto: false,
      },
    });
    return NextResponse.json({ data: report });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "保存失败" },
      { status: 500 }
    );
  }
}
