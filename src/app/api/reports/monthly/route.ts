import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateMonthlyReport } from "@/lib/aggregation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get("date");

  const date = dateStr ? new Date(dateStr) : new Date();
  const autoData = await generateMonthlyReport(date);

  const { start } = { start: autoData.month };
  const endOfMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);

  const existing = await prisma.monthlyReport.findFirst({
    where: { month: { gte: start, lte: endOfMonth } },
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
    const body = await request.json();
    const report = await prisma.monthlyReport.upsert({
      where: { id: body.id || "nonexistent" },
      create: {
        month: new Date(body.month),
        tasksCompleted: body.tasksCompleted || 0,
        projectsCount: body.projectsCount || 0,
        achievementsCount: body.achievementsCount || 0,
        collaborationsCount: body.collaborationsCount || 0,
        summary: body.summary || "",
        isAuto: false,
      },
      update: {
        summary: body.summary,
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
