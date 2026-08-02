# 个人工作成果管理台 - 项目计划

> 本文件是项目的唯一真实来源。每次任务完成后更新进度。
> 如果上下文丢失，读本文件即可恢复全部上下文。

## 项目概述

一个个人工作成果管理系统，核心解决"做了很多但没有可复盘、可汇报、可沉淀的工作记录"的问题。

**核心机制**：任务 → 成果的转化链（场景→结果→输出→价值）
**数据流**：每日记录 → 自动汇总周报 → 自动汇总月报 → 绩效复盘

## 技术栈

- **框架**：Next.js 14 (App Router) + TypeScript
- **数据库**：SQLite + Prisma ORM
- **样式**：Tailwind CSS
- **图表**：Recharts
- **状态**：Zustand
- **表单**：React Hook Form + Zod
- **日期**：date-fns

## 数据库模型

```
Task (任务)        → id, title, desc, status, priority, projectId, category, dueDate, completedAt, isConverted
Project (项目)     → id, name, desc, status, progress, priority, startDate, endDate
Achievement (成果) → id, title, taskId, projectId, scenario, result, output, value, category, date
DailyNote (小记)   → id, content, date, taskId, mood
WeeklyReport (周报)→ id, weekStart, weekEnd, tasksCompleted, achievementsCount, summary, issues, nextPlan, isAuto
MonthlyReport (月报)→ id, month, tasksCompleted, projectsCount, achievementsCount, collaborationsCount, summary, isAuto
Review (复盘)      → id, month, achievementCategories(JSON), investmentDistribution(JSON), trends(JSON), summary
Category (分类)    → id, name, type, color
Setting (设置)     → id, key, value
```

## 模块清单 (8大模块)

| # | 模块 | 页面路由 | 核心 API |
|---|------|----------|----------|
| 1 | 首页工作台 | / | GET /api/dashboard |
| 2 | 任务管理 | /tasks | /api/tasks (CRUD) |
| 3 | 项目管理 | /projects | /api/projects (CRUD) |
| 4 | 工作成果 | /achievements | /api/achievements (CRUD) |
| 5 | 周报月报 | /reports | /api/reports/weekly, /api/reports/monthly |
| 6 | 绩效复盘 | /review | /api/review |
| 7 | 数据统计 | /statistics | /api/statistics |
| 8 | 设置中心 | /settings | /api/settings, /api/categories |

## 任务拆分 (12个任务)

### Task 1: 项目初始化与基础配置 ✅ 进行中
- [ ] package.json + 依赖
- [ ] tsconfig.json, next.config.js, tailwind.config.ts, postcss.config.js
- [ ] prisma/schema.prisma (完整数据模型)
- [ ] src/app/globals.css (设计系统：配色、字体、间距)
- [ ] src/app/layout.tsx (根布局)
- [ ] src/lib/db.ts (Prisma 客户端)
- [ ] src/lib/utils.ts (工具函数)
- [ ] src/types/index.ts (TypeScript 类型)
- [ ] .env, .gitignore

### Task 2: 布局与导航系统
- [ ] src/components/layout/Sidebar.tsx (侧边栏导航 8个入口)
- [ ] src/components/layout/Header.tsx (顶部栏)
- [ ] src/components/layout/AppLayout.tsx (整体布局)
- [ ] src/components/ui/* (Card, Button, Badge, Modal, Input, Select, EmptyState)
- [ ] src/app/page.tsx 占位

### Task 3: 任务管理模块
- [ ] src/app/api/tasks/route.ts (GET, POST)
- [ ] src/app/api/tasks/[id]/route.ts (GET, PUT, DELETE)
- [ ] src/app/tasks/page.tsx (任务列表 + 筛选 + 看板视图)
- [ ] src/components/features/TaskForm.tsx (创建/编辑表单)
- [ ] src/components/features/TaskCard.tsx (任务卡片)

### Task 4: 项目管理模块
- [ ] src/app/api/projects/route.ts (GET, POST)
- [ ] src/app/api/projects/[id]/route.ts (GET, PUT, DELETE)
- [ ] src/app/projects/page.tsx (项目列表 + 进度条)
- [ ] src/components/features/ProjectForm.tsx
- [ ] src/components/features/ProjectCard.tsx

### Task 5: 工作成果模块（核心）
- [ ] src/app/api/achievements/route.ts (GET, POST)
- [ ] src/app/api/achievements/[id]/route.ts (GET, PUT, DELETE)
- [ ] src/app/api/achievements/convert/route.ts (任务转成果)
- [ ] src/app/achievements/page.tsx (成果列表 + 分类筛选)
- [ ] src/components/features/AchievementForm.tsx (4字段表单：场景/结果/输出/价值)
- [ ] src/components/features/AchievementCard.tsx

### Task 6: 周报月报模块
- [ ] src/lib/aggregation.ts (汇总逻辑核心)
- [ ] src/app/api/reports/weekly/route.ts (GET, POST, PUT)
- [ ] src/app/api/reports/monthly/route.ts (GET, POST, PUT)
- [ ] src/app/reports/page.tsx (周报/月报切换 + 内容展示)
- [ ] src/components/features/WeeklyReportView.tsx
- [ ] src/components/features/MonthlyReportView.tsx

### Task 7: 绩效复盘模块
- [ ] src/app/api/review/route.ts (GET, POST)
- [ ] src/app/review/page.tsx (复盘看板)
- [ ] src/components/charts/InvestmentPieChart.tsx (投入分布饼图)
- [ ] src/components/charts/AchievementBarChart.tsx (成果分类柱状图)
- [ ] src/components/charts/TrendLineChart.tsx (月度趋势折线图)

### Task 8: 数据统计模块
- [ ] src/app/api/statistics/route.ts (GET 多维统计)
- [ ] src/app/statistics/page.tsx (统计看板)
- [ ] src/components/charts/ComparisonChart.tsx (同比环比)

### Task 9: 首页工作台
- [ ] src/app/api/dashboard/route.ts (聚合数据)
- [ ] src/app/page.tsx (完整首页)
- [ ] 今日任务卡片 / 项目进度卡片 / 本周概览卡片 / 月度成果卡片
- [ ] 快捷操作入口

### Task 10: 设置中心
- [ ] src/app/api/settings/route.ts
- [ ] src/app/api/categories/route.ts
- [ ] src/app/settings/page.tsx (分类管理 + 偏好设置 + 数据导入导出)

### Task 11: 每日小记模块
- [ ] src/app/api/notes/route.ts
- [ ] src/app/notes/page.tsx (每日小记 + 时间线)
- [ ] src/components/features/DailyNoteForm.tsx

### Task 12: 集成与优化
- [ ] 数据流验证 (任务→成果→周报→月报→复盘)
- [ ] 种子数据脚本 (prisma/seed.ts)
- [ ] 响应式适配
- [ ] 空状态设计
- [ ] 加载/错误状态
- [ ] README.md

## 进度日志

| 时间 | 完成任务 | 备注 |
|------|----------|------|
| 2026-08-02 13:12 | - | 项目启动，创建计划 |
| 2026-08-02 13:20 | Task 1 完成 | 项目初始化、Prisma schema、设计系统、类型定义、工具函数全部就位，数据库已创建 |
| 2026-08-02 13:30 | Task 2 完成 | Sidebar(9入口)、Header、AppLayout、PageContainer、UI组件库(Card/Button/Badge/Modal/Input/Select/EmptyState/Loading/ProgressBar)、构建通过 |
| 2026-08-02 13:45 | Task 3 完成 | 任务CRUD API、任务列表+看板视图、TaskForm、TaskCard、状态管理、任务转成果入口 |
| 2026-08-02 13:50 | Task 4 完成 | 项目CRUD API、项目列表页(进度条)、ProjectForm、ProjectCard |
| 2026-08-02 13:55 | Task 5 完成 | 成果CRUD API、任务转成果API、AchievementForm(4维度)、AchievementCard |
| 2026-08-02 14:00 | Task 6 完成 | aggregation.ts汇总逻辑、周报/月报API、报告页面(切换+编辑) |
| 2026-08-02 14:05 | Task 7 完成 | 复盘API、复盘看板、投入分布饼图、成果分类柱状图、月度趋势折线图 |
| 2026-08-02 14:10 | Task 8 完成 | 统计API(多维分析)、统计看板、同比环比、任务状态分布 |
| 2026-08-02 14:15 | Task 9 完成 | Dashboard聚合API、完整首页(4数据卡片+今日待办+项目进度+本周概览+月度成果+重点工作) |
| 2026-08-02 14:20 | Task 10 完成 | 设置API、分类管理API、设置页(分类管理+偏好设置+数据导出) |
| 2026-08-02 14:25 | Task 11 完成 | 小记API、小记页面(时间线视图+心情+关联任务) |
| 2026-08-02 14:30 | Task 12 完成 | 分类删除路由修复、Suspense修复、种子数据(4项目/8任务/4成果/4小记)、README、构建全部通过 |

## 技术决策记录

1. **选择 SQLite 而非 PostgreSQL**：个人工具，无需独立数据库服务，文件即数据库
2. **选择 Next.js App Router**：全栈一体，API Routes 处理后端，部署简单
3. **选择 Recharts 而非 ECharts**：React 原生集成，体积更小，够用
4. **选择 Zustand 而非 Redux**：轻量，个人项目不需要复杂状态管理
5. **任务转成果是手动触发**：不是所有任务都值得沉淀，用户自行判断
