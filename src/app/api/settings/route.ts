import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const userId = requireUserId(request);
  const settings = await prisma.setting.findMany({
    where: { userId }
  });
  const settingsMap: Record<string, string> = {};
  settings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });
  return NextResponse.json({ data: settingsMap });
}

export async function PUT(request: NextRequest) {
  try {
    const userId = requireUserId(request);
    const body = await request.json();
    const results = [];
    for (const [key, value] of Object.entries(body)) {
      const setting = await prisma.setting.upsert({
        where: { userId_key: { userId, key } },
        create: { key, value: String(value), userId },
        update: { value: String(value) },
      });
      results.push(setting);
    }
    return NextResponse.json({ data: results });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "更新失败" },
      { status: 500 }
    );
  }
}
