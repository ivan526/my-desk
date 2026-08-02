"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, Button, Input, Badge, EmptyState, Loading } from "@/components/ui";
import { fetchAPI } from "@/lib/api";

interface Category {
  id: string;
  name: string;
  type: string;
  color: string;
}

export default function SettingsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ name: "", type: "task", color: "" });
  const [weeklyGoal, setWeeklyGoal] = useState("10");
  const [activeTab, setActiveTab] = useState<"categories" | "preferences" | "data">("categories");

  const loadCategories = async () => {
    setLoading(true);
    const { data } = await fetchAPI<Category[]>("/api/categories");
    if (data) setCategories(data);
    setLoading(false);
  };

  const loadSettings = async () => {
    const { data } = await fetchAPI<Record<string, string>>("/api/settings");
    if (data) {
      setWeeklyGoal(data.weeklyGoal || "10");
    }
  };

  useEffect(() => {
    loadCategories();
    loadSettings();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) return;
    await fetchAPI("/api/categories", {
      method: "POST",
      body: JSON.stringify(newCategory),
    });
    setNewCategory({ name: "", type: "task", color: "" });
    loadCategories();
  };

  const handleDeleteCategory = async (id: string) => {
    await fetchAPI(`/api/categories/${id}`, {
      method: "DELETE",
    });
    loadCategories();
  };

  const handleSavePreferences = async () => {
    await fetchAPI("/api/settings", {
      method: "PUT",
      body: JSON.stringify({ weeklyGoal }),
    });
  };

  const handleExport = async () => {
    const [tasksRes, projectsRes, achievementsRes] = await Promise.all([
      fetchAPI("/api/tasks"),
      fetchAPI("/api/projects"),
      fetchAPI("/api/achievements"),
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      tasks: tasksRes.data || [],
      projects: projectsRes.data || [],
      achievements: achievementsRes.data || [],
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `work-data-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { key: "categories", label: "分类管理" },
    { key: "preferences", label: "偏好设置" },
    { key: "data", label: "数据管理" },
  ];

  return (
    <PageContainer title="设置中心" subtitle="管理分类、偏好设置和数据">
      <div className="flex gap-1 mb-4 bg-bg-secondary rounded-md p-0.5 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-1.5 text-sm rounded transition-colors ${
              activeTab === tab.key
                ? "bg-bg-card text-ink-primary shadow-card"
                : "text-ink-tertiary hover:text-ink-secondary"
            }`}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "categories" && (
        <Card>
          {loading ? (
            <Loading />
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Input
                  placeholder="分类名称"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="flex-1"
                />
                <select
                  value={newCategory.type}
                  onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
                  className="input w-auto"
                >
                  <option value="task">任务分类</option>
                  <option value="achievement">成果分类</option>
                  <option value="project">项目分类</option>
                </select>
                <Button variant="primary" onClick={handleAddCategory} disabled={!newCategory.name.trim()}>
                  添加
                </Button>
              </div>

              {categories.length === 0 ? (
                <EmptyState title="暂无自定义分类" description="添加分类来更好地组织你的工作" />
              ) : (
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between py-2 px-3 bg-bg-secondary rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-ink-primary">{cat.name}</span>
                        <Badge color="gray">{cat.type}</Badge>
                      </div>
                      <button
                        className="text-2xs text-coral-500 hover:text-coral-600"
                        onClick={() => handleDeleteCategory(cat.id)}
                      >
                        删除
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {activeTab === "preferences" && (
        <Card>
          <div className="space-y-4">
            <div>
              <label className="label">每周目标任务数</label>
              <Input
                type="number"
                value={weeklyGoal}
                onChange={(e) => setWeeklyGoal(e.target.value)}
                className="w-32"
              />
              <p className="text-2xs text-ink-hint mt-1">用于首页工作台的本周目标进度</p>
            </div>
            <Button variant="primary" onClick={handleSavePreferences}>
              保存设置
            </Button>
          </div>
        </Card>
      )}

      {activeTab === "data" && (
        <Card>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-ink-primary mb-2">导出数据</h4>
              <p className="text-xs text-ink-hint mb-3">
                导出所有任务、项目和成果数据为 JSON 文件
              </p>
              <Button variant="secondary" onClick={handleExport}>
                导出数据
              </Button>
            </div>
            <div className="border-t border-bg-tertiary pt-4">
              <h4 className="text-sm font-medium text-ink-primary mb-2">数据库信息</h4>
              <p className="text-xs text-ink-hint">
                数据存储在 SQLite 文件中，路径：prisma/dev.db
              </p>
            </div>
          </div>
        </Card>
      )}
    </PageContainer>
  );
}
