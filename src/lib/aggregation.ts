import { prisma } from "@/lib/db";
import {
  getWeekRange,
  getMonthRange,
  isInRange,
  ACHIEVEMENT_CATEGORIES,
} from "@/lib/utils";

export async function generateWeeklyReport(userId: string, date: Date = new Date()) {
  const { start, end } = getWeekRange(date);

  const tasks = await prisma.task.findMany({
    where: {
      userId,
      OR: [
        { completedAt: { gte: start, lte: end } },
        { createdAt: { gte: start, lte: end } },
      ],
    },
    include: { project: true },
  });

  const completedTasks = tasks.filter(
    (t) => t.completedAt && isInRange(new Date(t.completedAt), start, end)
  );

  const achievements = await prisma.achievement.findMany({
    where: { userId, date: { gte: start, lte: end } },
    include: { project: true },
  });

  const projectIds = new Set<string>();
  tasks.forEach((t) => {
    if (t.projectId) projectIds.add(t.projectId);
  });
  achievements.forEach((a) => {
    if (a.projectId) projectIds.add(a.projectId);
  });

  const taskSummary = completedTasks
    .map((t) => `- ${t.title}${t.project ? `（${t.project.name}）` : ""}`)
    .join("\n");

  const achievementSummary = achievements
    .map((a) => `- ${a.title}${a.category ? `【${a.category}】` : ""}`)
    .join("\n");

  return {
    weekStart: start,
    weekEnd: end,
    tasksCompleted: completedTasks.length,
    projectsCount: projectIds.size,
    achievementsCount: achievements.length,
    summary: taskSummary || "本周无完成任务",
    issues: "",
    nextPlan: "",
    isAuto: true,
  };
}

export async function generateMonthlyReport(userId: string, date: Date = new Date()) {
  const { start, end } = getMonthRange(date);

  const tasks = await prisma.task.findMany({
    where: {
      userId,
      OR: [
        { completedAt: { gte: start, lte: end } },
        { createdAt: { gte: start, lte: end } },
      ],
    },
    include: { project: true },
  });

  const completedTasks = tasks.filter(
    (t) => t.completedAt && isInRange(new Date(t.completedAt), start, end)
  );

  const achievements = await prisma.achievement.findMany({
    where: { userId, date: { gte: start, lte: end } },
    include: { project: true, task: true },
  });

  const projectIds = new Set<string>();
  tasks.forEach((t) => {
    if (t.projectId) projectIds.add(t.projectId);
  });
  achievements.forEach((a) => {
    if (a.projectId) projectIds.add(a.projectId);
  });

  const collaborationCount = tasks.filter((t) => t.category === "会议沟通" || t.tags).length;

  const categoryCount: Record<string, number> = {};
  achievements.forEach((a) => {
    const cat = a.category || "其他";
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });

  const investmentDistribution = calculateInvestmentDistribution(tasks);

  const summary = `本月完成 ${completedTasks.length} 项任务，推进 ${projectIds.size} 个项目，沉淀 ${achievements.length} 项工作成果。`;

  return {
    month: start,
    tasksCompleted: completedTasks.length,
    projectsCount: projectIds.size,
    achievementsCount: achievements.length,
    collaborationsCount: collaborationCount,
    summary,
    isAuto: true,
    _categoryCount: categoryCount,
    _investmentDistribution: investmentDistribution,
  };
}

function calculateInvestmentDistribution(tasks: { category: string }[]) {
  const categoryMap: Record<string, number> = {};
  tasks.forEach((t) => {
    const cat = t.category || "日常任务";
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });

  const total = tasks.length || 1;
  return Object.entries(categoryMap).map(([category, count]) => ({
    category,
    percentage: Math.round((count / total) * 100),
  }));
}

export async function generateReviewData(userId: string, date: Date = new Date()) {
  const { start, end } = getMonthRange(date);

  const achievements = await prisma.achievement.findMany({
    where: { userId, date: { gte: start, lte: end } },
  });

  const tasks = await prisma.task.findMany({
    where: {
      userId,
      OR: [
        { completedAt: { gte: start, lte: end } },
        { createdAt: { gte: start, lte: end } },
      ],
    },
  });

  const achievementCategories = ACHIEVEMENT_CATEGORIES.map((cat) => ({
    category: cat,
    count: achievements.filter((a) => a.category === cat).length,
  })).filter((item) => item.count > 0);

  const investmentDistribution = calculateInvestmentDistribution(tasks);

  const last6Months: { month: string; tasks: number; achievements: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(date);
    d.setMonth(d.getMonth() - i);
    const { start: ms, end: me } = getMonthRange(d);

    const monthTasks = await prisma.task.count({
      where: { userId, completedAt: { gte: ms, lte: me } },
    });
    const monthAchievements = await prisma.achievement.count({
      where: { userId, date: { gte: ms, lte: me } },
    });

    last6Months.push({
      month: `${d.getMonth() + 1}月`,
      tasks: monthTasks,
      achievements: monthAchievements,
    });
  }

  return {
    month: start,
    achievementCategories,
    investmentDistribution,
    trends: last6Months,
    summary: "",
  };
}
