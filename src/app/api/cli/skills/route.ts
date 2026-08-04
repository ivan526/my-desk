import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/api-utils";
import { PRESET_SKILLS } from "@/lib/skills/presets";
import { scheduleCommand } from "@/lib/cli/scheduler";
import { Skill } from "@/lib/skills/types";

export async function GET() {
  // Return list of preset and installed skills
  return NextResponse.json({ data: PRESET_SKILLS });
}

export async function POST(request: NextRequest) {
  try {
    const userId = requireUserId(request);
    const body = await request.json();
    const skill: Skill = body.skill;
    const customizations: Record<string, unknown> = body.customizations || {};

    if (!skill) {
      return NextResponse.json({ error: "缺少skill配置" }, { status: 400 });
    }

    // Create CLI command from skill template
    const command = await prisma.cliCommand.create({
      data: {
        name: customizations.name || skill.name,
        command: customizations.command || skill.command,
        cwd: (customizations.cwd as string) || skill.cwd || null,
        schedule: (customizations.schedule as string) || skill.defaultSchedule || "0 0 18 * * 1-5",
        outputType: (customizations.outputType as "text" | "json") || skill.outputType || "text",
        fieldMapping: JSON.stringify(skill.defaultFieldMapping || {}),
        importType: (customizations.importType as any) || skill.defaultImportType || "auto",
        useAI: skill.useAI !== false,
        enabled: customizations.enabled !== false,
        userId,
      },
    });

    if (command.enabled) {
      scheduleCommand(command.id, command.schedule);
    }

    return NextResponse.json({ data: command });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "安装失败" },
      { status: 500 }
    );
  }
}
