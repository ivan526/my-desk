import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("开始种子数据...");

  await prisma.dailyNote.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.weeklyReport.deleteMany();
  await prisma.monthlyReport.deleteMany();
  await prisma.review.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.category.deleteMany();
  await prisma.setting.deleteMany();

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: "用户增长项目",
        description: "Q3 用户增长专项，目标 DAU 提升 20%",
        status: "active",
        priority: "high",
        progress: 65,
        startDate: new Date(thisYear, thisMonth - 1, 1),
        endDate: new Date(thisYear, thisMonth + 2, 30),
      },
    }),
    prisma.project.create({
      data: {
        name: "数据看板重构",
        description: "重构核心数据看板，提升查询性能",
        status: "active",
        priority: "medium",
        progress: 40,
        startDate: new Date(thisYear, thisMonth, 1),
      },
    }),
    prisma.project.create({
      data: {
        name: "流程自动化",
        description: "将手动报表流程自动化",
        status: "active",
        priority: "medium",
        progress: 80,
      },
    }),
    prisma.project.create({
      data: {
        name: "Q2 复盘",
        description: "Q2 季度复盘和总结",
        status: "completed",
        priority: "low",
        progress: 100,
        startDate: new Date(thisYear, thisMonth - 1, 15),
        endDate: new Date(thisYear, thisMonth - 1, 25),
      },
    }),
  ]);

  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: "分析高风险SKU数据",
        description: "定位12个高风险SKU，输出处理建议",
        status: "done",
        priority: "high",
        category: "项目任务",
        projectId: projects[0].id,
        completedAt: new Date(thisYear, thisMonth, 3),
      },
    }),
    prisma.task.create({
      data: {
        title: "完成数据看板原型设计",
        description: "设计新版数据看板的原型",
        status: "done",
        priority: "medium",
        category: "项目任务",
        projectId: projects[1].id,
        completedAt: new Date(thisYear, thisMonth, 5),
      },
    }),
    prisma.task.create({
      data: {
        title: "编写自动化脚本",
        description: "将周报表导出流程自动化",
        status: "done",
        priority: "medium",
        category: "流程优化",
        projectId: projects[2].id,
        completedAt: new Date(thisYear, thisMonth, 7),
      },
    }),
    prisma.task.create({
      data: {
        title: "组织团队周会",
        description: "本周团队同步会议",
        status: "done",
        priority: "low",
        category: "会议沟通",
        completedAt: new Date(thisYear, thisMonth, 8),
      },
    }),
    prisma.task.create({
      data: {
        title: "用户增长方案评审",
        description: "评审用户增长方案的可行性",
        status: "in_progress",
        priority: "high",
        category: "项目任务",
        projectId: projects[0].id,
      },
    }),
    prisma.task.create({
      data: {
        title: "看板前端开发",
        description: "开发新版数据看板的前端页面",
        status: "in_progress",
        priority: "medium",
        category: "项目任务",
        projectId: projects[1].id,
      },
    }),
    prisma.task.create({
      data: {
        title: "学习 Recharts 框架",
        description: "学习图表库的使用",
        status: "todo",
        priority: "low",
        category: "学习提升",
      },
    }),
    prisma.task.create({
      data: {
        title: "整理本月工作总结",
        description: "整理本月的工作成果和复盘",
        status: "todo",
        priority: "high",
        category: "日常任务",
      },
    }),
  ]);

  await Promise.all([
    prisma.achievement.create({
      data: {
        title: "高风险SKU分析报告",
        taskId: tasks[0].id,
        projectId: projects[0].id,
        scenario: "发现部分SKU存在高风险，需要快速定位和处理",
        result: "定位12个高风险SKU，输出3类处理建议",
        output: "1份分析报告 + 处理建议清单",
        value: "处理建议可直接复用于后续SKU风险监控流程",
        category: "分析报告",
        date: new Date(thisYear, thisMonth, 3),
      },
    }),
    prisma.achievement.create({
      data: {
        title: "数据看板原型完成",
        taskId: tasks[1].id,
        projectId: projects[1].id,
        scenario: "旧版看板查询慢、交互差，需要重构",
        result: "完成新版看板原型设计，通过评审",
        output: "原型设计稿 + 交互说明文档",
        value: "设计方案可直接指导后续开发",
        category: "项目推进",
        date: new Date(thisYear, thisMonth, 5),
      },
    }),
    prisma.achievement.create({
      data: {
        title: "周报表自动化",
        taskId: tasks[2].id,
        projectId: projects[2].id,
        scenario: "每周手动导出报表耗时且容易出错",
        result: "编写自动化脚本，实现一键导出",
        output: "自动化脚本 + 使用说明",
        value: "每周节省2小时手动操作时间",
        category: "流程优化",
        date: new Date(thisYear, thisMonth, 7),
      },
    }),
    prisma.achievement.create({
      data: {
        title: "团队周会组织",
        taskId: tasks[3].id,
        scenario: "需要同步本周进展和下周计划",
        result: "组织团队周会，对齐了3个重点事项",
        output: "会议纪要 + 行动项清单",
        value: "行动项模板可复用于后续会议",
        category: "团队协作",
        date: new Date(thisYear, thisMonth, 8),
      },
    }),
  ]);

  await Promise.all([
    prisma.dailyNote.create({
      data: {
        content: "今天完成了高风险SKU分析，发现12个问题SKU，输出了处理建议。",
        date: new Date(thisYear, thisMonth, 3),
        mood: "great",
      },
    }),
    prisma.dailyNote.create({
      data: {
        content: "看板原型设计通过评审，但有几个交互细节需要调整。",
        date: new Date(thisYear, thisMonth, 5),
        mood: "good",
      },
    }),
    prisma.dailyNote.create({
      data: {
        content: "自动化脚本跑通了，测试通过。下周可以正式启用。",
        date: new Date(thisYear, thisMonth, 7),
        mood: "great",
      },
    }),
    prisma.dailyNote.create({
      data: {
        content: "今天组织了团队周会，大家对齐了重点事项。下午开始准备增长方案评审。",
        date: new Date(thisYear, thisMonth, 8),
        mood: "normal",
      },
    }),
  ]);

  await prisma.setting.create({
    data: { key: "weeklyGoal", value: "10" },
  });

  console.log("种子数据完成！");
  console.log(`- ${projects.length} 个项目`);
  console.log(`- ${tasks.length} 个任务`);
  console.log(`- 4 项工作成果`);
  console.log(`- 4 条每日小记`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
