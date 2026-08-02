import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getWeekRange, getMonthRange, isInRange } from "@/lib/utils";

export async function GET() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const { start: weekStart, end: weekEnd } = getWeekRange(now);
  const { start: monthStart, end: monthEnd } = getMonthRange(now);

  // 加载设置中的每周目标
  const weeklyGoalSetting = await prisma.setting.findUnique({
    where: { key: "weeklyGoal" }
  });
  const weeklyGoal = weeklyGoalSetting?.value ? parseInt(weeklyGoalSetting.value) : 10;

  const todayTasks = await prisma.task.findMany({
    where: {
      OR: [
        { status: { in: ["todo", "in_progress"] } },
        { completedAt: { gte: todayStart, lte: todayEnd } },
      ],
    },
    include: { project: true },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    take: 10,
  });

  const todayTaskDone = todayTasks.filter((t) => t.status === "done").length;

  const activeProjects = await prisma.project.findMany({
    where: { status: "active" },
    include: { _count: { select: { tasks: true } } },
    orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
    take: 5,
  });

  const weeklyTasks = await prisma.task.findMany({
    where: {
      OR: [
        { completedAt: { gte: weekStart, lte: weekEnd } },
        { createdAt: { gte: weekStart, lte: weekEnd } },
      ],
    },
  });

  const weeklyTasksDone = weeklyTasks.filter(
    (t) => t.completedAt && isInRange(new Date(t.completedAt), weekStart, weekEnd)
  ).length;

  const monthlyAchievements = await prisma.achievement.findMany({
    where: { date: { gte: monthStart, lte: monthEnd } },
    include: { project: true },
    orderBy: { date: "desc" },
  });

  const monthlyTaskCount = await prisma.task.count({
    where: { completedAt: { gte: monthStart, lte: monthEnd } },
  });

  const monthlyProjectCount = await prisma.project.count({
    where: { createdAt: { gte: monthStart, lte: monthEnd } },
  });

  const keyTasks = await prisma.task.findMany({
    where: { status: { in: ["todo", "in_progress"] }, priority: "high" },
    include: { project: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const weeklyProgress = Math.min(100, Math.round((weeklyTasksDone / weeklyGoal) * 100));

  return NextResponse.json({
    data: {
      todayTasks,
      todayTaskTotal: todayTasks.length,
      todayTaskDone,
      activeProjects,
      weeklyProgress,
      weeklyTasksDone,
      weeklyTasksTotal: weeklyGoal,
      monthlyAchievements,
      monthlyAchievementCount: monthlyAchievements.length,
      monthlyTaskCount,
      monthlyProjectCount,
      keyTasks,
    },
  });
}
