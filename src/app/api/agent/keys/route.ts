import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/api-utils";
import { generateApiKey } from "@/lib/agent/auth";
import "@/lib/agent/init";

export async function GET(request: NextRequest) {
  const userId = requireUserId(request);
  const keys = await prisma.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      lastUsedAt: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ data: keys });
}

export async function POST(request: NextRequest) {
  try {
    const userId = requireUserId(request);
    const body = await request.json();
    const name = body.name || `Agent ${new Date().toLocaleDateString()}`;

    const { rawKey, keyHash, keyPrefix } = generateApiKey();

    const key = await prisma.apiKey.create({
      data: {
        name,
        keyHash,
        keyPrefix,
        userId,
      },
    });

    return NextResponse.json({
      data: {
        id: key.id,
        name: key.name,
        key: rawKey, // Only returned once!
        keyPrefix: key.keyPrefix,
        createdAt: key.createdAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "创建失败" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = requireUserId(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "缺少Key ID" }, { status: 400 });
    }

    await prisma.apiKey.deleteMany({
      where: { id, userId },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "删除失败" },
      { status: 500 }
    );
  }
}
