"use client";

import { useState, useEffect } from "react";
import { Modal, Input, Textarea, Select, Button } from "@/components/ui";
import { TASK_CATEGORIES } from "@/lib/utils";
import { Task, Project } from "@/types";

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
  initialData?: Task | null;
  projects?: Project[];
}

export function TaskForm({ open, onClose, onSubmit, initialData, projects = [] }: TaskFormProps) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    category: "",
    dueDate: "",
    projectId: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title,
        description: initialData.description,
        status: initialData.status,
        priority: initialData.priority,
        category: initialData.category,
        dueDate: initialData.dueDate ? initialData.dueDate.split("T")[0] : "",
        projectId: initialData.projectId || "",
      });
    } else {
      setForm({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        category: "",
        dueDate: "",
        projectId: "",
      });
    }
  }, [initialData, open]);

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onSubmit({
      ...form,
      projectId: form.projectId || null,
      dueDate: form.dueDate || null,
    });
  };

  const projectOptions = [
    { value: "", label: "无关联项目" },
    ...projects.map((p) => ({ value: p.id, label: p.name })),
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? "编辑任务" : "新建任务"}
      size="md"
    >
      <div className="space-y-4">
        <Input
          label="任务标题"
          placeholder="输入任务标题..."
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <Textarea
          label="任务描述"
          placeholder="描述任务详情..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="状态"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={[
              { value: "todo", label: "待办" },
              { value: "in_progress", label: "进行中" },
              { value: "done", label: "已完成" },
            ]}
          />
          <Select
            label="优先级"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            options={[
              { value: "high", label: "高" },
              { value: "medium", label: "中" },
              { value: "low", label: "低" },
            ]}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="分类"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            options={[
              { value: "", label: "不分类" },
              ...TASK_CATEGORIES.map((c) => ({ value: c, label: c })),
            ]}
          />
          <Input
            label="截止日期"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
        </div>
        <Select
          label="关联项目"
          value={form.projectId}
          onChange={(e) => setForm({ ...form, projectId: e.target.value })}
          options={projectOptions}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!form.title.trim()}>
            {initialData ? "保存" : "创建"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
