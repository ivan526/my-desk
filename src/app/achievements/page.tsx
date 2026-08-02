"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button, Select, EmptyState, Loading } from "@/components/ui";
import { AchievementForm } from "@/components/features/AchievementForm";
import { AchievementCard } from "@/components/features/AchievementCard";
import { fetchAPI } from "@/lib/api";
import { Achievement, Project, Task } from "@/types";
import { ACHIEVEMENT_CATEGORIES } from "@/lib/utils";

export default function AchievementsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AchievementsContent />
    </Suspense>
  );
}

function AchievementsContent() {
  const searchParams = useSearchParams();
  const convertTaskId = searchParams.get("convert");

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [convertTask, setConvertTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Achievement | null>(null);
  const [filter, setFilter] = useState({ category: "" });

  const loadAchievements = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.category) params.set("category", filter.category);
    const { data } = await fetchAPI<Achievement[]>(`/api/achievements?${params}`);
    if (data) setAchievements(data);
    setLoading(false);
  }, [filter]);

  const loadProjects = async () => {
    const { data } = await fetchAPI<Project[]>("/api/projects");
    if (data) setProjects(data);
  };

  const loadConvertTask = async (taskId: string) => {
    const { data } = await fetchAPI<Task>(`/api/tasks/${taskId}`);
    if (data) {
      setConvertTask(data);
      setFormOpen(true);
    }
  };

  useEffect(() => {
    loadAchievements();
    loadProjects();
    if (convertTaskId) {
      loadConvertTask(convertTaskId);
    }
  }, [loadAchievements, convertTaskId]);

  const handleSubmit = async (formData: Record<string, unknown>) => {
    if (editingItem) {
      await fetchAPI(`/api/achievements/${editingItem.id}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });
    } else {
      await fetchAPI("/api/achievements", {
        method: "POST",
        body: JSON.stringify(formData),
      });
    }
    setFormOpen(false);
    setEditingItem(null);
    setConvertTask(null);
    loadAchievements();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除这个成果吗？")) return;
    await fetchAPI(`/api/achievements/${id}`, { method: "DELETE" });
    loadAchievements();
  };

  return (
    <>
      <PageContainer
        title="工作成果"
        subtitle="完成任务后，顺手沉淀成工作成果。场景 → 结果 → 输出 → 价值"
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setEditingItem(null);
              setConvertTask(null);
              setFormOpen(true);
            }}
          >
            + 新建成果
          </Button>
        }
      >
        <div className="flex items-center gap-3 mb-4">
          <Select
            value={filter.category}
            onChange={(e) => setFilter({ category: e.target.value })}
            options={[
              { value: "", label: "全部分类" },
              ...ACHIEVEMENT_CATEGORIES.map((c) => ({ value: c, label: c })),
            ]}
            className="w-auto"
          />
          <div className="ml-auto text-sm text-ink-hint">
            共 {achievements.length} 项成果
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : achievements.length === 0 ? (
          <EmptyState
            title="还没有工作成果"
            description="完成任务后，把有价值的工作沉淀为成果"
            action={
              <Button variant="primary" onClick={() => setFormOpen(true)}>
                + 新建成果
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((a) => (
              <AchievementCard
                key={a.id}
                achievement={a}
                onEdit={(item) => {
                  setEditingItem(item);
                  setFormOpen(true);
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </PageContainer>

      <AchievementForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingItem(null);
          setConvertTask(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingItem}
        convertTask={convertTask}
        projects={projects}
      />
    </>
  );
}
