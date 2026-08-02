"use client";

import { useState, useEffect, useCallback } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button, Select, EmptyState, Loading } from "@/components/ui";
import { TaskForm } from "@/components/features/TaskForm";
import { TaskCard } from "@/components/features/TaskCard";
import { fetchAPI } from "@/lib/api";
import { Task, Project } from "@/types";
import { cn } from "@/lib/utils";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState({ status: "", priority: "", category: "" });
  const [viewMode, setViewMode] = useState<"list" | "board">("list");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.status) params.set("status", filter.status);
    if (filter.priority) params.set("priority", filter.priority);
    if (filter.category) params.set("category", filter.category);
    const { data } = await fetchAPI<Task[]>(`/api/tasks?${params}`);
    if (data) setTasks(data);
    setLoading(false);
  }, [filter]);

  const loadProjects = async () => {
    const { data } = await fetchAPI<Project[]>("/api/projects");
    if (data) setProjects(data);
  };

  useEffect(() => {
    loadTasks();
    loadProjects();
  }, [loadTasks]);

  const handleSubmit = async (formData: Record<string, unknown>) => {
    if (editingTask) {
      await fetchAPI(`/api/tasks/${editingTask.id}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });
    } else {
      await fetchAPI("/api/tasks", {
        method: "POST",
        body: JSON.stringify(formData),
      });
    }
    setFormOpen(false);
    setEditingTask(null);
    loadTasks();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除这个任务吗？")) return;
    await fetchAPI(`/api/tasks/${id}`, { method: "DELETE" });
    loadTasks();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await fetchAPI(`/api/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    loadTasks();
  };

  const handleConvert = (task: Task) => {
    window.location.href = `/achievements?convert=${task.id}`;
  };

  const columns = [
    { key: "todo", label: "待办", color: "bg-bg-tertiary" },
    { key: "in_progress", label: "进行中", color: "bg-blue-100" },
    { key: "done", label: "已完成", color: "bg-moss-100" },
  ];

  return (
    <>
      <PageContainer
        title="任务管理"
        subtitle="日常任务记录和管理，完成任务后可转化为工作成果"
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setEditingTask(null);
              setFormOpen(true);
            }}
          >
            + 新建任务
          </Button>
        }
      >
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <Select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            options={[
              { value: "", label: "全部状态" },
              { value: "todo", label: "待办" },
              { value: "in_progress", label: "进行中" },
              { value: "done", label: "已完成" },
            ]}
            className="w-auto"
          />
          <Select
            value={filter.priority}
            onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
            options={[
              { value: "", label: "全部优先级" },
              { value: "high", label: "高" },
              { value: "medium", label: "中" },
              { value: "low", label: "低" },
            ]}
            className="w-auto"
          />
          <div className="flex bg-bg-secondary rounded-md p-0.5 ml-auto">
            <button
              className={cn(
                "px-3 py-1 text-xs rounded transition-colors",
                viewMode === "list" ? "bg-bg-card text-ink-primary shadow-card" : "text-ink-tertiary"
              )}
              onClick={() => setViewMode("list")}
            >
              列表
            </button>
            <button
              className={cn(
                "px-3 py-1 text-xs rounded transition-colors",
                viewMode === "board" ? "bg-bg-card text-ink-primary shadow-card" : "text-ink-tertiary"
              )}
              onClick={() => setViewMode("board")}
            >
              看板
            </button>
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : tasks.length === 0 ? (
          <EmptyState
            title="还没有任务"
            description="创建第一个任务，开始记录你的工作"
            action={
              <Button variant="primary" onClick={() => setFormOpen(true)}>
                + 新建任务
              </Button>
            }
          />
        ) : viewMode === "list" ? (
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(t) => {
                  setEditingTask(t);
                  setFormOpen(true);
                }}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                onConvert={handleConvert}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {columns.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.key);
              return (
                <div key={col.key} className="flex flex-col">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <span className={cn("w-2 h-2 rounded-full", col.color)} />
                    <span className="text-sm font-medium text-ink-secondary">{col.label}</span>
                    <span className="text-xs text-ink-hint">{colTasks.length}</span>
                  </div>
                  <div className="space-y-2 min-h-[100px] bg-bg-secondary/50 rounded-lg p-2">
                    {colTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        compact
                        onEdit={(t) => {
                          setEditingTask(t);
                          setFormOpen(true);
                        }}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                        onConvert={handleConvert}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PageContainer>

      <TaskForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingTask}
        projects={projects}
      />
    </>
  );
}
