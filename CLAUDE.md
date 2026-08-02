# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

```bash
# 开发
npm run dev          # 启动开发服务器 http://localhost:3000
npm run build        # 生产构建
npm run start        # 启动生产服务器
npm run lint         # 代码检查

# 数据库
npm run db:generate  # 生成 Prisma 客户端
npm run db:push      # 同步 schema 到数据库
npm run db:seed      # 导入种子数据 (示例项目/任务/成果)
npm run db:studio    # 打开 Prisma Studio 可视化管理数据
```

## 技术栈

- Next.js 14 (App Router) + TypeScript
- Prisma ORM + SQLite (本地文件数据库)
- Tailwind CSS + shadcn/ui 风格基础组件
- Zustand (客户端状态管理)
- Recharts (数据可视化图表)
- react-hook-form + zod (表单校验)
- date-fns (日期处理)
- clsx + tailwind-merge (类名工具)

## 架构与代码结构

```
src/
├── app/               # Next.js App Router 路由
│   ├── api/           # REST API 路由 (按资源划分，标准 CRUD)
│   ├── tasks/         # 任务管理页
│   ├── projects/      # 项目管理页
│   ├── achievements/  # 工作成果页
│   ├── reports/       # 周报/月报页
│   ├── review/        # 绩效复盘页
│   ├── statistics/    # 数据统计页
│   ├── notes/         # 每日小记页
│   └── settings/      # 设置中心页
├── components/
│   ├── layout/        # 布局组件 (侧边栏、顶部导航等)
│   ├── ui/            # 可复用基础 UI 组件
│   ├── features/      # 业务功能组件
│   └── charts/        # 封装的图表组件
├── lib/
│   ├── db.ts          # Prisma 客户端单例
│   ├── api.ts         # API 请求工具
│   ├── utils.ts       # 通用工具函数 (含 cn 类名合并)
│   └── aggregation.ts # 核心数据聚合逻辑 (周报/月报/统计计算)
├── store/             # Zustand 全局状态
└── types/             # TypeScript 类型定义
prisma/
├── schema.prisma      # 数据库模型定义
└── seed.ts            # 种子数据脚本
```

## 核心数据模型与业务规则

1.  **核心实体关系**:
    - `Project` 1:N `Task`
    - `Task` 1:1 `Achievement` (通过 `isConverted` 标记是否已转为成果)
    - `DailyNote` 可关联到单个 `Task`
    - `Achievement` 可关联到 `Project` 和 `Task`

2.  **任务转成果 4 维度 (核心业务约定)**:
    - `scenario`: 场景 — 为什么要做？
    - `result`: 结果 — 做了什么？
    - `output`: 输出 — 产出物是什么？
    - `value`: 价值 — 可以复用在哪里？

3.  **数据流转链路**:
    每日记录(DailyNote) → 任务(Task) → 工作成果(Achievement) → 自动汇总周报(WeeklyReport)/月报(MonthlyReport) → 绩效复盘(Review) 统计数据

4.  **数据库约定**:
    - 所有 ID 使用 `cuid()` 自动生成
    - 时间字段统一使用 `DateTime`，`createdAt`/`updatedAt` 自动维护
    - 删除关联使用 `onDelete: SetNull`，避免误删关联数据
    - 配置项存储在 `Setting` 表，key-value 结构
    - 分类使用 `Category` 表，`type` 字段区分分类类型
