import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50");

  const notes = await prisma.dailyNote.findMany({
    include: { task: true },
    orderBy: { date: "desc" },
    take: limit,
  });

  return NextResponse.json({ data: notes });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const note = await prisma.dailyNote.create({
      data: {
        content: body.content,
        date: body.date ? new Date(body.date) : new Date(),
        taskId: body.taskId || null,
        mood: body.mood || "",
      },
      include: { task: true },
    });
    return NextResponse.json({ data: note });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "创建失败" },
      { status: 500 }
    );
  }
}
