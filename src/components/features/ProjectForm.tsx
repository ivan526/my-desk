"use client";

import { useState, useEffect } from "react";
import { Modal, Input, Textarea, Select, Button } from "@/components/ui";
import { Project } from "@/types";

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
  initialData?: Project | null;
}

export function ProjectForm({ open, onClose, onSubmit, initialData }: ProjectFormProps) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "active",
    priority: "medium",
    progress: 0,
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        description: initialData.description,
        status: initialData.status,
        priority: initialData.priority,
        progress: initialData.progress,
        startDate: initialData.startDate ? initialData.startDate.split("T")[0] : "",
        endDate: initialData.endDate ? initialData.endDate.split("T")[0] : "",
      });
    } else {
      setForm({
        name: "",
        description: "",
        status: "active",
        priority: "medium",
        progress: 0,
        startDate: "",
        endDate: "",
      });
    }
  }, [initialData, open]);

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSubmit({
      ...form,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={initialData ? "编辑项目" : "新建项目"} size="md">
      <div className="space-y-4">
        <Input
          label="项目名称"
          placeholder="输入项目名称..."
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Textarea
          label="项目描述"
          placeholder="描述项目目标..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="状态"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={[
              { value: "active", label: "进行中" },
              { value: "paused", label: "已暂停" },
              { value: "completed", label: "已完成" },
              { value: "archived", label: "已归档" },
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
        <div>
          <label className="label">进度: {form.progress}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={form.progress}
            onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
            className="w-full accent-moss-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="开始日期"
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
          <Input
            label="结束日期"
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!form.name.trim()}>
            {initialData ? "保存" : "创建"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
