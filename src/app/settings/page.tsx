"use client";

import { useState, useEffect, useCallback } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, Button, Input, Select, Badge, EmptyState, Loading, Modal, Textarea } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { CliCommand, CliExecutionLog } from "@/types";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  type: string;
  color: string;
}

const PRESET_SCHEDULES = [
  { label: "工作日18:00", value: "0 0 18 * * 1-5" },
  { label: "每天20:00", value: "0 0 20 * * *" },
  { label: "每小时", value: "0 0 * * * *" },
  { label: "每周五17:00", value: "0 0 17 * * 5" },
  { label: "自定义", value: "custom" },
];

const IMPORT_TYPES = [
  { value: "auto", label: "AI智能识别（推荐）" },
  { value: "note", label: "导入到每日小记" },
  { value: "task", label: "导入为新任务" },
  { value: "achievement", label: "导入为工作成果" },
];

const OUTPUT_TYPES = [
  { value: "text", label: "纯文本" },
  { value: "json", label: "JSON" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"categories" | "preferences" | "data" | "cli" | "ai" | "skills">("categories");

  // AI config state
  const [aiConfig, setAiConfig] = useState({
    apiKey: "",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-3.5-turbo",
  });
  const [presetSkills, setPresetSkills] = useState<{ id: string; name: string; description: string; icon: string; tags: string[]; version: string }[]>([]);
  const [importJsonOpen, setImportJsonOpen] = useState(false);
  const [importJson, setImportJson] = useState("");

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ name: "", type: "task", color: "" });

  // Preferences state
  const [weeklyGoal, setWeeklyGoal] = useState("10");

  // CLI state
  const [cliCommands, setCliCommands] = useState<CliCommand[]>([]);
  const [cliLoading, setCliLoading] = useState(true);
  const [cliFormOpen, setCliFormOpen] = useState(false);
  const [editingCommand, setEditingCommand] = useState<CliCommand | null>(null);
  const [cliForm, setCliForm] = useState({
    name: "",
    command: "",
    cwd: "",
    schedule: PRESET_SCHEDULES[0].value,
    customSchedule: "",
    outputType: "text" as "text" | "json",
    importType: "auto" as "auto" | "note" | "task" | "achievement",
    fieldMapping: "{}",
    enabled: true,
    useAI: true,
  });
  const [cliLogs, setCliLogs] = useState<CliExecutionLog[]>([]);
  const [logsOpen, setLogsOpen] = useState(false);
  const [runningCommand, setRunningCommand] = useState<string | null>(null);

  const tabs = [
    { key: "categories", label: "分类管理" },
    { key: "preferences", label: "偏好设置" },
    { key: "cli", label: "CLI集成" },
    { key: "skills", label: "技能市场" },
    { key: "ai", label: "AI配置" },
    { key: "data", label: "数据管理" },
  ] as const;

  // Load categories
  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);
    const { data } = await fetchAPI<Category[]>("/api/categories");
    if (data) setCategories(data);
    setCategoriesLoading(false);
  }, []);

  // Load settings
  const loadSettings = async () => {
    const { data } = await fetchAPI<Record<string, string>>("/api/settings");
    if (data) {
      setWeeklyGoal(data.weeklyGoal || "10");
      setAiConfig({
        apiKey: data.ai_api_key || "",
        baseUrl: data.ai_base_url || "https://api.openai.com/v1",
        model: data.ai_model || "gpt-3.5-turbo",
      });
    }
  };

  // Load preset skills
  const loadPresetSkills = async () => {
    const { data } = await fetchAPI<typeof presetSkills>("/api/cli/skills");
    if (data) setPresetSkills(data);
  };

  const handleSaveAIConfig = async () => {
    await fetchAPI("/api/settings", {
      method: "PUT",
      body: JSON.stringify({
        ai_api_key: aiConfig.apiKey,
        ai_base_url: aiConfig.baseUrl,
        ai_model: aiConfig.model,
      }),
    });
    alert("AI配置已保存");
  };

  const handleInstallSkill = async (skillId: string) => {
    const skill = presetSkills.find(s => s.id === skillId);
    if (!skill) return;

    const customSchedule = prompt("请输入定时规则（cron表达式，默认工作日18点）：", "0 0 18 * * 1-5");
    if (customSchedule === null) return;

    await fetchAPI("/api/cli/skills", {
      method: "POST",
      body: JSON.stringify({
        skill,
        customizations: {
          schedule: customSchedule || "0 0 18 * * 1-5",
        },
      }),
    });

    alert(`技能「${skill.name}」安装成功！`);
    loadCliCommands();
  };

  const handleImportSkill = async () => {
    if (!importJson.trim()) {
      alert("请输入Skill JSON内容");
      return;
    }
    await fetchAPI("/api/cli/skills/import", {
      method: "POST",
      body: JSON.stringify({ skillJson: importJson }),
    });
    setImportJsonOpen(false);
    setImportJson("");
    alert("Skill导入成功！");
    loadCliCommands();
  };

  // Load CLI commands
  const loadCliCommands = useCallback(async () => {
    setCliLoading(true);
    const { data } = await fetchAPI<CliCommand[]>("/api/cli/commands");
    if (data) setCliCommands(data);
    setCliLoading(false);
  }, []);

  const loadCliLogs = async (commandId?: string) => {
    const { data } = await fetchAPI<CliExecutionLog[]>(
      `/api/cli/logs${commandId ? `?commandId=${commandId}` : ""}`
    );
    if (data) setCliLogs(data);
  };

  useEffect(() => {
    loadCategories();
    loadSettings();
    loadCliCommands();
    loadPresetSkills();
  }, [loadCategories, loadCliCommands]);

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
    await fetchAPI(`/api/categories/${id}`, { method: "DELETE" });
    loadCategories();
  };

  const handleSavePreferences = async () => {
    await fetchAPI("/api/settings", {
      method: "PUT",
      body: JSON.stringify({ weeklyGoal }),
    });
    alert("设置已保存");
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

  const openCliForm = (cmd?: CliCommand) => {
    if (cmd) {
      setEditingCommand(cmd);
      const preset = PRESET_SCHEDULES.find(p => p.value === cmd.schedule);
      setCliForm({
        name: cmd.name,
        command: cmd.command,
        cwd: cmd.cwd || "",
        schedule: preset ? preset.value : "custom",
        customSchedule: preset ? "" : cmd.schedule,
        outputType: cmd.outputType as "text" | "json",
        importType: cmd.importType as "auto" | "note" | "task" | "achievement",
        fieldMapping: cmd.fieldMapping,
        enabled: cmd.enabled,
        useAI: cmd.useAI ?? true,
      });
    } else {
      setEditingCommand(null);
      setCliForm({
        name: "",
        command: "welink-cli today",
        cwd: "",
        schedule: PRESET_SCHEDULES[0].value,
        customSchedule: "",
        outputType: "text",
        importType: "auto",
        fieldMapping: "{}",
        enabled: true,
        useAI: true,
      });
    }
    setCliFormOpen(true);
  };

  const handleSaveCliCommand = async () => {
    if (!cliForm.name.trim() || !cliForm.command.trim()) {
      alert("请填写名称和命令");
      return;
    }

    const schedule = cliForm.schedule === "custom" ? cliForm.customSchedule : cliForm.schedule;
    if (!schedule) {
      alert("请填写定时规则");
      return;
    }

    const payload = {
      ...cliForm,
      schedule,
    };
    delete (payload as any).customSchedule;

    if (editingCommand) {
      await fetchAPI(`/api/cli/commands/${editingCommand.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } else {
      await fetchAPI("/api/cli/commands", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }

    setCliFormOpen(false);
    loadCliCommands();
  };

  const handleDeleteCliCommand = async (id: string) => {
    if (!confirm("确定删除这个CLI命令吗？")) return;
    await fetchAPI(`/api/cli/commands/${id}`, { method: "DELETE" });
    loadCliCommands();
  };

  const handleToggleCliCommand = async (cmd: CliCommand) => {
    await fetchAPI(`/api/cli/commands/${cmd.id}`, {
      method: "PUT",
      body: JSON.stringify({ enabled: !cmd.enabled }),
    });
    loadCliCommands();
  };

  const handleRunCliCommand = async (id: string) => {
    setRunningCommand(id);
    const result = await fetchAPI<{ success: boolean; importedCount: number; output: string; error?: string }>(
      `/api/cli/commands/${id}/run`,
      { method: "POST" }
    );
    setRunningCommand(null);

    if (result.data) {
      if (result.data.success) {
        alert(`执行成功，导入了 ${result.data.importedCount} 条数据`);
      } else {
        alert(`执行失败: ${result.data.error || "未知错误"}`);
      }
    }
    loadCliCommands();
  };

  const openLogs = async () => {
    await loadCliLogs();
    setLogsOpen(true);
  };

  return (
    <PageContainer title="设置中心" subtitle="管理分类、偏好设置、CLI集成和数据">
      <div className="flex gap-1 mb-4 bg-bg-secondary rounded-md p-0.5 w-fit flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-1.5 text-sm rounded transition-colors ${
              activeTab === tab.key
                ? "bg-bg-card text-ink-primary shadow-card"
                : "text-ink-tertiary hover:text-ink-secondary"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "categories" && (
        <Card>
          {categoriesLoading ? (
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

      {activeTab === "cli" && (
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-ink-primary">外部CLI命令集成</h3>
                <p className="text-xs text-ink-hint mt-1">
                  配置外部CLI命令（如welink-cli），定时执行自动导入工作内容
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={openLogs}>
                  执行日志
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openCliForm()}
                >
                  + 添加命令
                </Button>
              </div>
            </div>

            {cliLoading ? (
              <Loading />
            ) : cliCommands.length === 0 ? (
              <EmptyState
                title="暂无CLI命令"
                description="添加外部CLI命令，实现自动同步工作内容"
              />
            ) : (
              <div className="space-y-2">
                {cliCommands.map((cmd) => (
                  <div
                    key={cmd.id}
                    className="flex items-center justify-between p-3 bg-bg-secondary rounded-md"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-ink-primary">{cmd.name}</span>
                        <Badge color={cmd.enabled ? "moss" : "gray"}>
                          {cmd.enabled ? "已启用" : "已禁用"}
                        </Badge>
                        <Badge color="blue">
                          {IMPORT_TYPES.find(t => t.value === cmd.importType)?.label}
                        </Badge>
                      </div>
                      <code className="text-xs text-ink-tertiary mt-1 block truncate font-mono bg-bg-tertiary/50 px-2 py-0.5 rounded">
                        {cmd.command}
                      </code>
                      <p className="text-2xs text-ink-hint mt-1">
                        调度: {cmd.schedule}
                        {cmd.lastRunAt && ` · 上次执行: ${formatDate(cmd.lastRunAt, "MM-dd HH:mm")}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <button
                        className={cn(
                          "text-2xs px-2 py-1 rounded",
                          runningCommand === cmd.id
                            ? "bg-bg-tertiary text-ink-hint cursor-wait"
                            : "text-moss-600 hover:bg-moss-50"
                        )}
                        onClick={() => handleRunCliCommand(cmd.id)}
                        disabled={runningCommand === cmd.id}
                      >
                        {runningCommand === cmd.id ? "执行中..." : "立即执行"}
                      </button>
                      <button
                        className="text-2xs text-ink-tertiary hover:text-ink-primary px-2 py-1 rounded hover:bg-bg-tertiary"
                        onClick={() => openCliForm(cmd)}
                      >
                        编辑
                      </button>
                      <button
                        className="text-2xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
                        onClick={() => handleToggleCliCommand(cmd)}
                      >
                        {cmd.enabled ? "禁用" : "启用"}
                      </button>
                      <button
                        className="text-2xs text-coral-500 hover:text-coral-600 px-2 py-1 rounded hover:bg-coral-50"
                        onClick={() => handleDeleteCliCommand(cmd.id)}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h4 className="text-sm font-medium text-ink-primary mb-2">使用说明</h4>
            <div className="text-xs text-ink-tertiary space-y-1.5">
              <p>1. 确保要调用的CLI已经安装在系统中，并且在PATH环境变量中可访问</p>
              <p>2. 命令执行工作目录默认是项目根目录，可以自定义cwd</p>
              <p>3. 纯文本输出会直接作为内容导入，JSON输出会按照字段映射解析</p>
              <p>4. 定时规则使用标准cron表达式：分 时 日 月 周</p>
              <p>5. 执行超时时间为30秒，超时会自动终止进程</p>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "skills" && (
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-ink-primary">技能市场</h3>
                <p className="text-xs text-ink-hint mt-1">
                  一键安装预置技能，自动配置CLI命令，支持AI自动解析导入
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setImportJsonOpen(true)}
              >
                导入本地Skill
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {presetSkills.map((skill) => (
                <div key={skill.id} className="p-3 border border-bg-tertiary rounded-lg hover:border-moss-300 transition-colors">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-2xl">{skill.icon || "🔧"}</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-ink-primary">{skill.name}</h4>
                      <p className="text-2xs text-ink-hint">v{skill.version}</p>
                    </div>
                  </div>
                  <p className="text-xs text-ink-secondary mb-3 line-clamp-2">{skill.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {skill.tags?.map(tag => (
                      <span key={tag} className="text-2xs bg-bg-secondary text-ink-tertiary px-1.5 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => handleInstallSkill(skill.id)}
                  >
                    一键安装
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "ai" && (
        <Card>
          <h3 className="text-sm font-medium text-ink-primary mb-2">AI 智能解析配置</h3>
          <p className="text-xs text-ink-hint mb-4">
            配置大模型API后，将自动使用AI解析CLI输出内容，智能识别待办任务、工作成果、每日记录，无需手动配置字段映射。
            支持所有OpenAI兼容接口（OpenAI、豆包、通义千问、DeepSeek等）。
          </p>
          <div className="space-y-4">
            <Input
              label="API Key"
              type="password"
              value={aiConfig.apiKey}
              onChange={(e) => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
              placeholder="sk-xxxxxxxxxxxxxxxx"
            />
            <Input
              label="API Base URL"
              value={aiConfig.baseUrl}
              onChange={(e) => setAiConfig({ ...aiConfig, baseUrl: e.target.value })}
              placeholder="https://api.openai.com/v1"
            />
            <Input
              label="模型名称"
              value={aiConfig.model}
              onChange={(e) => setAiConfig({ ...aiConfig, model: e.target.value })}
              placeholder="gpt-3.5-turbo / doubao-pro-32k / qwen-plus 等"
            />
            <div className="bg-blue-50 text-blue-700 text-2xs p-3 rounded-md">
              <p className="font-medium mb-1">💡 常用API地址参考：</p>
              <p>• OpenAI：https://api.openai.com/v1</p>
              <p>• 豆包（火山引擎）：https://ark.cn-beijing.volces.com/api/v3</p>
              <p>• 通义千问：https://dashscope.aliyuncs.com/compatible-mode/v1</p>
              <p>• DeepSeek：https://api.deepseek.com/v1</p>
            </div>
            <Button variant="primary" onClick={handleSaveAIConfig}>
              保存AI配置
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

      {/* CLI Command Form Modal */}
      <Modal
        open={cliFormOpen}
        onClose={() => setCliFormOpen(false)}
        title={editingCommand ? "编辑CLI命令" : "添加CLI命令"}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="命令名称"
            value={cliForm.name}
            onChange={(e) => setCliForm({ ...cliForm, name: e.target.value })}
            placeholder="如：welink每日同步"
          />
          <Input
            label="执行命令"
            value={cliForm.command}
            onChange={(e) => setCliForm({ ...cliForm, command: e.target.value })}
            placeholder="如：welink-cli today --output json"
          />
          <Input
            label="工作目录（可选）"
            value={cliForm.cwd}
            onChange={(e) => setCliForm({ ...cliForm, cwd: e.target.value })}
            placeholder="默认使用项目根目录"
          />

          <div>
            <label className="label">定时规则</label>
            <Select
              value={cliForm.schedule}
              onChange={(e) => setCliForm({ ...cliForm, schedule: e.target.value })}
              options={[...PRESET_SCHEDULES.map(p => ({ value: p.value, label: p.label }))]}
              className="mb-2"
            />
            {cliForm.schedule === "custom" && (
              <Input
                placeholder="cron表达式，如：0 30 18 * * 1-5"
                value={cliForm.customSchedule}
                onChange={(e) => setCliForm({ ...cliForm, customSchedule: e.target.value })}
              />
            )}
            <p className="text-2xs text-ink-hint mt-1">
              格式：分 时 日 月 周，例如 0 0 18 * * 1-5 表示工作日18点整
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="输出格式"
              value={cliForm.outputType}
              onChange={(e) => setCliForm({ ...cliForm, outputType: e.target.value as "text" | "json" })}
              options={OUTPUT_TYPES}
            />
            <Select
              label="导入到"
              value={cliForm.importType}
              onChange={(e) => setCliForm({ ...cliForm, importType: e.target.value as "auto" | "note" | "task" | "achievement" })}
              options={IMPORT_TYPES}
            />
          </div>

          {cliForm.outputType === "json" && cliForm.importType !== "auto" && (
            <Textarea
              label="字段映射（JSON格式）"
              value={cliForm.fieldMapping}
              onChange={(e) => setCliForm({ ...cliForm, fieldMapping: e.target.value })}
              placeholder='{"title": "${title}", "content": "${summary}"}'
              className="min-h-[80px] font-mono text-xs"
            />
          )}

          {cliForm.importType === "auto" && (
            <div className="bg-amber-50 text-amber-700 text-2xs p-3 rounded-md">
              <p>🤖 AI智能识别模式：会自动解析CLI输出内容，区分待办任务、工作成果、每日记录，自动导入到对应模块。需要在「AI配置」页配置大模型API Key。</p>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="cli-enabled"
                checked={cliForm.enabled}
                onChange={(e) => setCliForm({ ...cliForm, enabled: e.target.checked })}
                className="w-4 h-4 text-moss-600 rounded"
              />
              <label htmlFor="cli-enabled" className="text-sm text-ink-secondary">
                启用该命令
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="cli-use-ai"
                checked={cliForm.useAI}
                onChange={(e) => setCliForm({ ...cliForm, useAI: e.target.checked })}
                className="w-4 h-4 text-moss-600 rounded"
              />
              <label htmlFor="cli-use-ai" className="text-sm text-ink-secondary">
                使用AI增强解析
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setCliFormOpen(false)}>取消</Button>
            <Button variant="primary" onClick={handleSaveCliCommand}>保存</Button>
          </div>
        </div>
      </Modal>

      {/* Logs Modal */}
      <Modal
        open={logsOpen}
        onClose={() => setLogsOpen(false)}
        title="执行日志"
        size="lg"
      >
        {cliLogs.length === 0 ? (
          <EmptyState title="暂无执行日志" />
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {cliLogs.map((log) => (
              <div
                key={log.id}
                className={cn(
                  "p-3 rounded-md text-xs",
                  log.status === "success" ? "bg-moss-50" : "bg-coral-50"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    "font-medium",
                    log.status === "success" ? "text-moss-700" : "text-coral-700"
                  )}>
                    {log.status === "success" ? "执行成功" : "执行失败"}
                    {log.importedCount > 0 && ` · 导入${log.importedCount}条`}
                  </span>
                  <span className="text-ink-hint">
                    {formatDate(log.executedAt, "MM-dd HH:mm:ss")} · {log.durationMs}ms
                  </span>
                </div>
                {log.error && <p className="text-coral-600 mb-1">{log.error}</p>}
                <pre className="whitespace-pre-wrap text-ink-tertiary bg-white/50 p-2 rounded text-2xs overflow-x-auto">
                  {log.output || "(无输出)"}
                </pre>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
