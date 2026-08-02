"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { MetricCard, Loading, EmptyState } from "@/components/ui";
import { InvestmentPieChart } from "@/components/charts/InvestmentPieChart";
import { AchievementBarChart } from "@/components/charts/AchievementBarChart";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { fetchAPI } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui";

interface ReviewData {
  month: string;
  achievementCategories: { category: string; count: number }[];
  investmentDistribution: { category: string; percentage: number }[];
  trends: { month: string; tasks: number; achievements: number }[];
  summary: string;
}

export default function ReviewPage() {
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const { data: result } = await fetchAPI<ReviewData>(`/api/review?date=${date}`);
      if (result) setData(result);
      setLoading(false);
    };
    loadData();
  }, [date]);

  const totalAchievements = data?.achievementCategories.reduce((sum, c) => sum + c.count, 0) || 0;

  return (
    <PageContainer
      title="绩效复盘"
      subtitle="月底直接查看自己的工作成果，一页看清"
      actions={
        <input
          type="month"
          value={date.slice(0, 7)}
          onChange={(e) => setDate(e.target.value + "-01")}
          className="input w-auto"
        />
      }
    >
      {loading ? (
        <Loading />
      ) : !data ? (
        <EmptyState title="暂无复盘数据" description="完成任务并沉淀成果后即可生成复盘" />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard
              label="本月成果"
              value={totalAchievements}
              sublabel={formatDate(data.month, "yyyy年MM月")}
              color="moss"
            />
            <MetricCard
              label="成果分类"
              value={data.achievementCategories.length}
              sublabel="个类别"
              color="blue"
            />
            <MetricCard
              label="投入分布"
              value={data.investmentDistribution.length}
              sublabel="个方向"
              color="amber"
            />
            <MetricCard
              label="趋势月份"
              value={data.trends.length}
              sublabel="个月数据"
              color="coral"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <h3 className="text-sm font-medium text-ink-primary mb-3">成果分类</h3>
              <AchievementBarChart data={data.achievementCategories} />
            </Card>

            <Card>
              <h3 className="text-sm font-medium text-ink-primary mb-3">工作投入分布</h3>
              <InvestmentPieChart data={data.investmentDistribution} />
            </Card>
          </div>

          <Card>
            <h3 className="text-sm font-medium text-ink-primary mb-3">月度趋势</h3>
            <TrendLineChart data={data.trends} />
          </Card>

          {data.achievementCategories.length > 0 && (
            <Card>
              <h3 className="text-sm font-medium text-ink-primary mb-3">成果明细</h3>
              <div className="space-y-2">
                {data.achievementCategories.map((item) => (
                  <div
                    key={item.category}
                    className="flex items-center justify-between py-2 px-3 bg-bg-secondary rounded-md"
                  >
                    <span className="text-sm text-ink-primary">{item.category}</span>
                    <span className="text-sm font-medium text-moss-600">{item.count} 项</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </PageContainer>
  );
}
