"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button, MetricCard, Loading, Textarea } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type ReportType = "weekly" | "monthly";

interface ReportData {
  auto: {
    weekStart?: string;
    weekEnd?: string;
    month?: string;
    tasksCompleted: number;
    projectsCount: number;
    achievementsCount: number;
    collaborationsCount?: number;
    summary: string;
    issues?: string;
    nextPlan?: string;
    _categoryCount?: Record<string, number>;
    _investmentDistribution?: { category: string; percentage: number }[];
  };
  saved: { id: string; summary: string; issues?: string; nextPlan?: string } | null;
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("weekly");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editSummary, setEditSummary] = useState("");
  const [editIssues, setEditIssues] = useState("");
  const [editNextPlan, setEditNextPlan] = useState("");

  const loadReport = async () => {
    setLoading(true);
    const { data: result } = await fetchAPI<ReportData>(
      `/api/reports/${reportType}?date=${date}`
    );
    if (result) {
      setData(result);
      setEditSummary(result.saved?.summary || result.auto.summary || "");
      setEditIssues(result.saved?.issues || result.auto.issues || "");
      setEditNextPlan(result.saved?.nextPlan || result.auto.nextPlan || "");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadReport();
  }, [reportType, date]);

  const handleSave = async () => {
    const payload: Record<string, unknown> = {
      summary: editSummary,
      issues: editIssues,
      nextPlan: editNextPlan,
    };
    if (data?.saved?.id) payload.id = data.saved.id;

    if (reportType === "weekly") {
      payload.weekStart = data?.auto.weekStart;
      payload.weekEnd = data?.auto.weekEnd;
      payload.tasksCompleted = data?.auto.tasksCompleted;
      payload.projectsCount = data?.auto.projectsCount;
      payload.achievementsCount = data?.auto.achievementsCount;
    } else {
      payload.month = data?.auto.month;
      payload.tasksCompleted = data?.auto.tasksCompleted;
      payload.projectsCount = data?.auto.projectsCount;
      payload.achievementsCount = data?.auto.achievementsCount;
      payload.collaborationsCount = data?.auto.collaborationsCount;
    }

    await fetchAPI(`/api/reports/${reportType}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setEditing(false);
    loadReport();
  };

  const auto = data?.auto;
  const isWeekly = reportType === "weekly";

  return (
    <PageContainer
      title="周报月报"
      subtitle="系统自动汇总，每天记一点，周报不用临时补"
      actions={
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input w-auto"
          />
          <div className="flex bg-bg-secondary rounded-md p-0.5">
            <button
              className={cn(
                "px-3 py-1 text-xs rounded transition-colors",
                reportType === "weekly" ? "bg-bg-card text-ink-primary shadow-card" : "text-ink-tertiary"
              )}
              onClick={() => setReportType("weekly")}
            >
              周报
            </button>
            <button
              className={cn(
                "px-3 py-1 text-xs rounded transition-colors",
                reportType === "monthly" ? "bg-bg-card text-ink-primary shadow-card" : "text-ink-tertiary"
              )}
              onClick={() => setReportType("monthly")}
            >
              月报
            </button>
          </div>
        </div>
      }
    >
      {loading || !auto ? (
        <Loading />
      ) : (
        <div className="space-y-4">
          <div className="bg-bg-card rounded-lg border border-bg-tertiary p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-medium text-ink-primary">
                {isWeekly
                  ? `${formatDate(auto.weekStart!, "MM-dd")} - ${formatDate(auto.weekEnd!, "MM-dd")} 周报`
                  : `${formatDate(auto.month!, "yyyy年MM月")} 月报`}
              </h3>
              <div className="flex items-center gap-2">
                {editing ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                      取消
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleSave}>
                      保存
                    </Button>
                  </>
                ) : (
                  <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                    编辑
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <MetricCard label="完成任务" value={auto.tasksCompleted} color="moss" />
              <MetricCard label="推进项目" value={auto.projectsCount} color="blue" />
              <MetricCard label="工作成果" value={auto.achievementsCount} color="amber" />
              {!isWeekly && (
                <MetricCard label="协作次数" value={auto.collaborationsCount || 0} color="coral" />
              )}
            </div>

            {editing ? (
              <div className="space-y-3">
                <Textarea
                  label="本周/本月总结"
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  className="min-h-[120px]"
                />
                {isWeekly && (
                  <>
                    <Textarea
                      label="未解决问题"
                      value={editIssues}
                      onChange={(e) => setEditIssues(e.target.value)}
                    />
                    <Textarea
                      label="下周计划"
                      value={editNextPlan}
                      onChange={(e) => setEditNextPlan(e.target.value)}
                    />
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-ink-hint mb-1">{isWeekly ? "本周完成" : "本月总结"}</p>
                  <div className="text-sm text-ink-secondary whitespace-pre-wrap bg-bg-secondary rounded-md p-3">
                    {data?.saved?.summary || auto.summary || "暂无"}
                  </div>
                </div>
                {isWeekly && (
                  <>
                    <div>
                      <p className="text-xs text-ink-hint mb-1">未解决问题</p>
                      <div className="text-sm text-ink-secondary whitespace-pre-wrap bg-bg-secondary rounded-md p-3 min-h-[60px]">
                        {data?.saved?.issues || auto.issues || "暂无"}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-ink-hint mb-1">下周计划</p>
                      <div className="text-sm text-ink-secondary whitespace-pre-wrap bg-bg-secondary rounded-md p-3 min-h-[60px]">
                        {data?.saved?.nextPlan || auto.nextPlan || "暂无"}
                      </div>
                    </div>
                  </>
                )}
                {!isWeekly && auto._categoryCount && Object.keys(auto._categoryCount).length > 0 && (
                  <div>
                    <p className="text-xs text-ink-hint mb-1">成果分类</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(auto._categoryCount).map(([cat, count]) => (
                        <span key={cat} className="tag bg-blue-100 text-blue-700">
                          {cat} {count}项
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
