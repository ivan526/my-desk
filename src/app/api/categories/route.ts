import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const userId = requireUserId(request);
  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: { type: "asc" },
  });
  return NextResponse.json({ data: categories });
}

export async function POST(request: NextRequest) {
  try {
    const userId = requireUserId(request);
    const body = await request.json();
    const category = await prisma.category.create({
      data: {
        name: body.name,
        type: body.type,
        color: body.color || "",
        userId,
      },
    });
    return NextResponse.json({ data: category });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "创建失败" },
      { status: 500 }
    );
  }
}
