"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, MetricCard, Loading, EmptyState } from "@/components/ui";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { AchievementBarChart } from "@/components/charts/AchievementBarChart";
import { fetchAPI } from "@/lib/api";
import { cn } from "@/lib/utils";

interface StatisticsData {
  year: number;
  totalTasks: number;
  completedTasks: number;
  totalAchievements: number;
  totalProjects: number;
  monthlyData: { month: string; tasks: number; achievements: number }[];
  taskStatusData: { todo: number; in_progress: number; done: number };
  achievementCategoryData: { category: string; count: number }[];
  priorityData: { high: number; medium: number; low: number };
  yearOverYear: {
    tasksGrowth: number;
    achievementsGrowth: number;
    lastYearTasks: number;
    lastYearAchievements: number;
  };
}

export default function StatisticsPage() {
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const { data: result } = await fetchAPI<StatisticsData>(`/api/statistics?year=${year}`);
      if (result) setData(result);
      setLoading(false);
    };
    loadData();
  }, [year]);

  return (
    <PageContainer
      title="数据统计"
      subtitle="多维度分析你的工作数据"
      actions={
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="input w-auto"
        >
          {Array.from({ length: 5 }, (_, i) => {
            const y = new Date().getFullYear() - i;
            return (
              <option key={y} value={y}>
                {y} 年
              </option>
            );
          })}
        </select>
      }
    >
      {loading ? (
        <Loading />
      ) : !data ? (
        <EmptyState title="暂无统计数据" />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard label="总任务数" value={data.totalTasks} color="moss" />
            <MetricCard label="已完成" value={data.completedTasks} color="blue" />
            <MetricCard label="工作成果" value={data.totalAchievements} color="amber" />
            <MetricCard label="推进项目" value={data.totalProjects} color="coral" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <h3 className="text-sm font-medium text-ink-primary mb-3">月度趋势</h3>
              <TrendLineChart data={data.monthlyData} />
            </Card>

            <Card>
              <h3 className="text-sm font-medium text-ink-primary mb-3">成果分类分布</h3>
              <AchievementBarChart data={data.achievementCategoryData} />
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <h3 className="text-sm font-medium text-ink-primary mb-4">任务状态分布</h3>
              <div className="space-y-3">
                {[
                  { label: "待办", value: data.taskStatusData.todo, color: "bg-bg-tertiary" },
                  { label: "进行中", value: data.taskStatusData.in_progress, color: "bg-blue-400" },
                  { label: "已完成", value: data.taskStatusData.done, color: "bg-moss-500" },
                ].map((item) => {
                  const total = data.totalTasks || 1;
                  const percent = Math.round((item.value / total) * 100);
                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-ink-secondary">{item.label}</span>
                        <span className="text-xs text-ink-hint">{item.value} ({percent}%)</span>
                      </div>
                      <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", item.color)} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card>
              <h3 className="text-sm font-medium text-ink-primary mb-4">同比数据</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-bg-secondary rounded-md">
                  <div>
                    <p className="text-xs text-ink-hint">任务完成数</p>
                    <p className="text-lg font-medium text-ink-primary mt-1">
                      {data.completedTasks}
                      <span className="text-xs text-ink-hint ml-2">去年 {data.yearOverYear.lastYearTasks}</span>
                    </p>
                  </div>
                  <span className={cn(
                    "text-sm font-medium",
                    data.yearOverYear.tasksGrowth >= 0 ? "text-moss-600" : "text-coral-600"
                  )}>
                    {data.yearOverYear.tasksGrowth >= 0 ? "+" : ""}{data.yearOverYear.tasksGrowth}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-bg-secondary rounded-md">
                  <div>
                    <p className="text-xs text-ink-hint">工作成果数</p>
                    <p className="text-lg font-medium text-ink-primary mt-1">
                      {data.totalAchievements}
                      <span className="text-xs text-ink-hint ml-2">去年 {data.yearOverYear.lastYearAchievements}</span>
                    </p>
                  </div>
                  <span className={cn(
                    "text-sm font-medium",
                    data.yearOverYear.achievementsGrowth >= 0 ? "text-moss-600" : "text-coral-600"
                  )}>
                    {data.yearOverYear.achievementsGrowth >= 0 ? "+" : ""}{data.yearOverYear.achievementsGrowth}%
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
