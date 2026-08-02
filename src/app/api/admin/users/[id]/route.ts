import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, hashPassword } from "@/lib/auth";

// Helper to verify admin
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return null;
  }
  return user;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "权限不足" }, { status: 403 });
  }

  // Prevent admin from modifying themselves (e.g., disabling own account or demoting self)
  if (params.id === admin.id) {
    return NextResponse.json(
      { error: "不能修改自己的账号" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const data: Record<string, unknown> = {};

    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
    if (body.role !== undefined) data.role = body.role === "ADMIN" ? "ADMIN" : "USER";
    if (body.password) data.passwordHash = await hashPassword(body.password);

    const user = await prisma.user.update({
      where: { id: params.id },
      data,
      select: {
        id: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ data: user });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "更新失败" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "权限不足" }, { status: 403 });
  }

  // Prevent admin from deleting themselves
  if (params.id === admin.id) {
    return NextResponse.json(
      { error: "不能删除自己的账号" },
      { status: 400 }
    );
  }

  try {
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "删除失败" },
      { status: 500 }
    );
  }
}
