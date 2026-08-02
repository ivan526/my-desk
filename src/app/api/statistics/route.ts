import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31, 23, 59, 59);

  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { completedAt: { gte: yearStart, lte: yearEnd } },
        { createdAt: { gte: yearStart, lte: yearEnd } },
      ],
    },
  });

  const achievements = await prisma.achievement.findMany({
    where: { date: { gte: yearStart, lte: yearEnd } },
  });

  const projects = await prisma.project.findMany({
    where: { createdAt: { gte: yearStart, lte: yearEnd } },
  });

  const monthlyData = [];
  for (let m = 0; m < 12; m++) {
    const mStart = new Date(year, m, 1);
    const mEnd = new Date(year, m + 1, 0, 23, 59, 59);

    const monthTasks = tasks.filter(
      (t) => t.completedAt && new Date(t.completedAt) >= mStart && new Date(t.completedAt) <= mEnd
    );
    const monthAchievements = achievements.filter(
      (a) => new Date(a.date) >= mStart && new Date(a.date) <= mEnd
    );

    monthlyData.push({
      month: `${m + 1}月`,
      tasks: monthTasks.length,
      achievements: monthAchievements.length,
    });
  }

  const taskStatusData = {
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  const achievementCategoryData: Record<string, number> = {};
  achievements.forEach((a) => {
    const cat = a.category || "其他";
    achievementCategoryData[cat] = (achievementCategoryData[cat] || 0) + 1;
  });

  const priorityData = {
    high: tasks.filter((t) => t.priority === "high").length,
    medium: tasks.filter((t) => t.priority === "medium").length,
    low: tasks.filter((t) => t.priority === "low").length,
  };

  const lastYearTasks = await prisma.task.count({
    where: { completedAt: { gte: new Date(year - 1, 0, 1), lte: new Date(year - 1, 11, 31, 23, 59, 59) } },
  });
  const lastYearAchievements = await prisma.achievement.count({
    where: { date: { gte: new Date(year - 1, 0, 1), lte: new Date(year - 1, 11, 31, 23, 59, 59) } },
  });

  const thisYearTasks = tasks.filter((t) => t.status === "done").length;
  const thisYearAchievements = achievements.length;

  return NextResponse.json({
    data: {
      year,
      totalTasks: tasks.length,
      completedTasks: thisYearTasks,
      totalAchievements: thisYearAchievements,
      totalProjects: projects.length,
      monthlyData,
      taskStatusData,
      achievementCategoryData: Object.entries(achievementCategoryData).map(([category, count]) => ({ category, count })),
      priorityData,
      yearOverYear: {
        tasksGrowth: lastYearTasks > 0 ? Math.round(((thisYearTasks - lastYearTasks) / lastYearTasks) * 100) : 0,
        achievementsGrowth: lastYearAchievements > 0 ? Math.round(((thisYearAchievements - lastYearAchievements) / lastYearAchievements) * 100) : 0,
        lastYearTasks,
        lastYearAchievements,
      },
    },
  });
}
