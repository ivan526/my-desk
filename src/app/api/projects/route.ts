import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const userId = requireUserId(request);
  const projects = await prisma.project.findMany({
    where: { userId },
    include: {
      _count: { select: { tasks: true, achievements: true } },
    },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });
  return NextResponse.json({ data: projects });
}

export async function POST(request: NextRequest) {
  try {
    const userId = requireUserId(request);
    const body = await request.json();
    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description || "",
        status: body.status || "active",
        priority: body.priority || "medium",
        progress: body.progress || 0,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        userId,
      },
    });
    return NextResponse.json({ data: project });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "创建失败" },
      { status: 500 }
    );
  }
}
