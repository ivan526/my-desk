"use client";

import { useState, useEffect } from "react";
import { Modal, Input, Textarea, Select, Button } from "@/components/ui";
import { ACHIEVEMENT_CATEGORIES } from "@/lib/utils";
import { Achievement, Project, Task } from "@/types";

interface AchievementFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
  initialData?: Achievement | null;
  convertTask?: Task | null;
  projects?: Project[];
}

export function AchievementForm({
  open,
  onClose,
  onSubmit,
  initialData,
  convertTask,
  projects = [],
}: AchievementFormProps) {
  const [form, setForm] = useState({
    title: "",
    scenario: "",
    result: "",
    output: "",
    value: "",
    category: "",
    projectId: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title,
        scenario: initialData.scenario,
        result: initialData.result,
        output: initialData.output,
        value: initialData.value,
        category: initialData.category,
        projectId: initialData.projectId || "",
        date: initialData.date ? initialData.date.split("T")[0] : new Date().toISOString().split("T")[0],
      });
    } else if (convertTask) {
      setForm({
        title: convertTask.title,
        scenario: convertTask.description || "",
        result: "",
        output: "",
        value: "",
        category: "",
        projectId: convertTask.projectId || "",
        date: new Date().toISOString().split("T")[0],
      });
    } else {
      setForm({
        title: "",
        scenario: "",
        result: "",
        output: "",
        value: "",
        category: "",
        projectId: "",
        date: new Date().toISOString().split("T")[0],
      });
    }
  }, [initialData, convertTask, open]);

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onSubmit({
      ...form,
      taskId: convertTask?.id || initialData?.taskId || null,
      projectId: form.projectId || null,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? "编辑成果" : convertTask ? "任务转成果" : "新建成果"}
      size="lg"
    >
      <div className="space-y-4">
        {convertTask && (
          <div className="bg-moss-50 border border-moss-100 rounded-md p-3 mb-2">
            <p className="text-xs text-moss-700">
              从任务「{convertTask.title}」转化，请补充成果的四个维度
            </p>
          </div>
        )}

        <Input
          label="成果标题"
          placeholder="一句话概括这个成果..."
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="成果分类"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            options={[
              { value: "", label: "请选择" },
              ...ACHIEVEMENT_CATEGORIES.map((c) => ({ value: c, label: c })),
            ]}
          />
          <Select
            label="关联项目"
            value={form.projectId}
            onChange={(e) => setForm({ ...form, projectId: e.target.value })}
            options={[
              { value: "", label: "无关联项目" },
              ...projects.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
        </div>

        <div className="bg-bg-secondary rounded-md p-3 space-y-3">
          <p className="text-sm font-medium text-ink-primary">成果四维度</p>

          <Textarea
            label="场景 — 为什么要做？"
            placeholder="描述当时的背景、问题或机会..."
            value={form.scenario}
            onChange={(e) => setForm({ ...form, scenario: e.target.value })}
          />

          <Textarea
            label="结果 — 做了什么？"
            placeholder="描述具体的行动和产出..."
            value={form.result}
            onChange={(e) => setForm({ ...form, result: e.target.value })}
          />

          <Textarea
            label="输出 — 产出物是什么？"
            placeholder="如：分析报告、流程文档、数据看板..."
            value={form.output}
            onChange={(e) => setForm({ ...form, output: e.target.value })}
          />

          <Textarea
            label="价值 — 可以复用在哪里？"
            placeholder="这个成果对后续工作的参考价值..."
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
          />
        </div>

        <Input
          label="成果日期"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!form.title.trim()}>
            {initialData ? "保存" : "创建成果"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
