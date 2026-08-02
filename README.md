# 工作成果管理台

> 把每天做过的事，变成可复盘、可汇报、可沉淀的工作记录。

## 核心功能

- 首页工作台：今日任务、项目进度、本周概览、月度成果一览
- 任务管理：日常任务 CRUD，列表/看板双视图，优先级和分类
- 项目管理：重点项目跟进，进度条，关联任务和成果
- 工作成果：任务转成果（场景→结果→输出→价值），4维度沉淀
- 周报月报：自动汇总本周/本月任务、成果和计划
- 绩效复盘：成果分类、投入分布饼图、月度趋势折线图
- 数据统计：多维分析、同比环比、年度趋势
- 每日小记：每天记一点，周报不用临时补
- 设置中心：分类管理、偏好设置、数据导出

## 技术栈

- Next.js 14 (App Router) + TypeScript
- Prisma + SQLite
- Tailwind CSS
- Recharts
- Zustand

## 快速开始

```bash
# 安装依赖
npm install

# 生成 Prisma 客户端
npx prisma generate

# 创建数据库
npx prisma db push

# 导入种子数据（可选，含示例项目/任务/成果）
npm run db:seed

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 核心机制

任务转成果的4个维度：
1. 场景 — 为什么要做？
2. 结果 — 做了什么？
3. 输出 — 产出物是什么？
4. 价值 — 可以复用在哪里？

数据自动流转：
每日记录 → 自动汇总周报 → 自动汇总月报 → 绩效复盘

## 项目结构

```
src/
├── app/
│   ├── api/          # API 路由
│   ├── tasks/        # 任务管理
│   ├── projects/     # 项目管理
│   ├── achievements/ # 工作成果
│   ├── reports/      # 周报月报
│   ├── review/       # 绩效复盘
│   ├── statistics/   # 数据统计
│   ├── notes/        # 每日小记
│   └── settings/     # 设置中心
├── components/
│   ├── layout/       # 布局组件
│   ├── ui/           # UI 组件库
│   ├── features/     # 功能组件
│   └── charts/       # 图表组件
├── lib/              # 工具函数和核心逻辑
├── store/            # 状态管理
└── types/            # 类型定义
```
