"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, MetricCard, Loading, EmptyState, ProgressBar, Badge, Button } from "@/components/ui";
import { TaskCard } from "@/components/features/TaskCard";
import { AchievementCard } from "@/components/features/AchievementCard";
import { fetchAPI } from "@/lib/api";
import { DashboardData, Task, Achievement } from "@/types";
import { cn, PRIORITY_LABELS } from "@/lib/utils";

export default function HomePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const { data: result } = await fetchAPI<DashboardData>("/api/dashboard");
      if (result) setData(result);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <>
        <PageContainer title="首页工作台" subtitle="加载中...">
          <Loading />
        </PageContainer>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <PageContainer title="首页工作台">
          <EmptyState title="暂无数据" />
        </PageContainer>
      </>
    );
  }

  return (
    <PageContainer
      title="工作台"
      subtitle="把每天做过的事，变成可复盘、可汇报、可沉淀的工作记录"
      actions={
        <Link href="/tasks">
          <Button variant="primary">+ 新建任务</Button>
        </Link>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            label="重点工作"
            value={data.keyTasks.length}
            sublabel="高优先级任务"
            color="coral"
          />
          <MetricCard
            label="今日任务"
            value={`${data.todayTaskDone}/${data.todayTaskTotal}`}
            sublabel="已完成/总计"
            color="moss"
          />
          <MetricCard
            label="工作成果"
            value={data.monthlyAchievementCount}
            sublabel="本月沉淀"
            color="amber"
          />
          <MetricCard
            label="本周目标"
            value={`${data.weeklyProgress}%`}
            sublabel={`${data.weeklyTasksDone}/${data.weeklyTasksTotal} 已完成`}
            color="blue"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-ink-primary">今日待办</h3>
              <Link href="/tasks" className="text-xs text-moss-600 hover:text-moss-700">
                查看全部 →
              </Link>
            </div>
            {data.todayTasks.length === 0 ? (
              <p className="text-xs text-ink-hint py-4 text-center">今天没有待办任务</p>
            ) : (
              <div className="space-y-2">
                {data.todayTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center gap-2 py-1.5">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full flex-shrink-0",
                      task.status === "done" ? "bg-moss-500" : task.status === "in_progress" ? "bg-blue-400" : "bg-ink-hint"
                    )} />
                    <span className={cn(
                      "text-sm flex-1 truncate",
                      task.status === "done" ? "text-ink-hint line-through" : "text-ink-primary"
                    )}>
                      {task.title}
                    </span>
                    {task.priority === "high" && (
                      <span className="tag bg-coral-100 text-coral-700">{PRIORITY_LABELS[task.priority]}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-ink-primary">项目进度</h3>
              <Link href="/projects" className="text-xs text-moss-600 hover:text-moss-700">
                查看全部 →
              </Link>
            </div>
            {data.activeProjects.length === 0 ? (
              <p className="text-xs text-ink-hint py-4 text-center">暂无进行中的项目</p>
            ) : (
              <div className="space-y-3">
                {data.activeProjects.map((project) => (
                  <div key={project.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-ink-primary truncate">{project.name}</span>
                      <span className="text-2xs text-ink-hint ml-2">{project.progress}%</span>
                    </div>
                    <ProgressBar
                      value={project.progress}
                      color={project.progress === 100 ? "moss" : "blue"}
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-ink-primary">本周概览</h3>
              <Link href="/reports" className="text-xs text-moss-600 hover:text-moss-700">
                查看周报 →
              </Link>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-ink-secondary">本周目标进度</span>
                  <span className="text-xs text-ink-hint">{data.weeklyTasksDone}/{data.weeklyTasksTotal}</span>
                </div>
                <ProgressBar value={data.weeklyProgress} color="moss" />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="text-center p-2 bg-bg-secondary rounded-md">
                  <p className="text-lg font-medium text-moss-600">{data.weeklyTasksDone}</p>
                  <p className="text-2xs text-ink-hint">完成任务</p>
                </div>
                <div className="text-center p-2 bg-bg-secondary rounded-md">
                  <p className="text-lg font-medium text-blue-600">{data.activeProjects.length}</p>
                  <p className="text-2xs text-ink-hint">活跃项目</p>
                </div>
                <div className="text-center p-2 bg-bg-secondary rounded-md">
                  <p className="text-lg font-medium text-amber-600">{data.monthlyAchievementCount}</p>
                  <p className="text-2xs text-ink-hint">月度成果</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-ink-primary">月度成果</h3>
              <Link href="/achievements" className="text-xs text-moss-600 hover:text-moss-700">
                查看全部 →
              </Link>
            </div>
            {data.monthlyAchievements.length === 0 ? (
              <p className="text-xs text-ink-hint py-4 text-center">本月暂无成果，完成任务后可沉淀</p>
            ) : (
              <div className="space-y-2">
                {data.monthlyAchievements.slice(0, 4).map((a) => (
                  <div key={a.id} className="flex items-center gap-2 py-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    <span className="text-sm text-ink-primary truncate flex-1">{a.title}</span>
                    {a.category && (
                      <span className="tag bg-amber-100 text-amber-700">{a.category}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {data.keyTasks.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-ink-primary">重点工作</h3>
              <Link href="/tasks?priority=high" className="text-xs text-moss-600 hover:text-moss-700">
                查看全部 →
              </Link>
            </div>
            <div className="space-y-2">
              {data.keyTasks.map((task) => (
                <TaskCard key={task.id} task={task} compact />
              ))}
            </div>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
