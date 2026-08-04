import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/api-utils";
import { scheduleCommand } from "@/lib/cli/scheduler";
import { Skill } from "@/lib/skills/types";

export async function POST(request: NextRequest) {
  try {
    const userId = requireUserId(request);
    const body = await request.json();
    let skill: Skill;

    try {
      skill = JSON.parse(body.skillJson);
    } catch (e) {
      return NextResponse.json({ error: "无效的Skill JSON格式" }, { status: 400 });
    }

    if (!skill.name || !skill.command) {
      return NextResponse.json({ error: "Skill缺少必填字段（name/command）" }, { status: 400 });
    }

    // Create CLI command from imported skill
    const command = await prisma.cliCommand.create({
      data: {
        name: skill.name,
        command: skill.command,
        cwd: skill.cwd || null,
        schedule: skill.defaultSchedule || "0 0 18 * * 1-5",
        outputType: skill.outputType || "text",
        fieldMapping: JSON.stringify(skill.defaultFieldMapping || {}),
        importType: skill.defaultImportType || "auto",
        useAI: skill.useAI !== false,
        enabled: true,
        userId,
      },
    });

    scheduleCommand(command.id, command.schedule);

    return NextResponse.json({ data: command });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "导入失败" },
      { status: 500 }
    );
  }
}
