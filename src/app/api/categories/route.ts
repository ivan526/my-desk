import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { type: "asc" },
  });
  return NextResponse.json({ data: categories });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const category = await prisma.category.create({
      data: {
        name: body.name,
        type: body.type,
        color: body.color || "",
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
