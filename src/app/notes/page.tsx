"use client";

import { useState, useEffect, useCallback } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button, Textarea, EmptyState, Loading, Badge } from "@/components/ui";
import { fetchAPI } from "@/lib/api";
import { DailyNote, Task } from "@/types";
import { formatDate, relativeTime, cn } from "@/lib/utils";

const MOODS = [
  { value: "great", label: "很棒", emoji: "😄" },
  { value: "good", label: "不错", emoji: "🙂" },
  { value: "normal", label: "一般", emoji: "😐" },
  { value: "tired", label: "疲惫", emoji: "😴" },
  { value: "stressed", label: "压力大", emoji: "😣" },
];

export default function NotesPage() {
  const [notes, setNotes] = useState<DailyNote[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [taskId, setTaskId] = useState("");

  const loadNotes = useCallback(async () => {
    setLoading(true);
    const { data } = await fetchAPI<DailyNote[]>("/api/notes");
    if (data) setNotes(data);
    setLoading(false);
  }, []);

  const loadTasks = async () => {
    const { data } = await fetchAPI<Task[]>("/api/tasks");
    if (data) setTasks(data.filter((t) => t.status !== "done"));
  };

  useEffect(() => {
    loadNotes();
    loadTasks();
  }, [loadNotes]);

  const handleAdd = async () => {
    if (!content.trim()) return;
    await fetchAPI("/api/notes", {
      method: "POST",
      body: JSON.stringify({
        content,
        mood,
        taskId: taskId || null,
        date: new Date().toISOString(),
      }),
    });
    setContent("");
    setMood("");
    setTaskId("");
    loadNotes();
  };

  const handleDelete = async (id: string) => {
    await fetchAPI(`/api/notes/${id}`, { method: "DELETE" });
    loadNotes();
  };

  const groupedByDate = notes.reduce((acc, note) => {
    const dateKey = formatDate(note.date, "yyyy-MM-dd");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(note);
    return acc;
  }, {} as Record<string, DailyNote[]>);

  return (
    <PageContainer
      title="每日小记"
      subtitle="每天记一点，周报不用临时补"
    >
      <div className="mb-4">
        <div className="card p-4">
          <Textarea
            placeholder="今天做了什么？记录一下..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[60px] mb-3"
          />
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  className={cn(
                    "px-2 py-1 rounded text-xs transition-colors",
                    mood === m.value
                      ? "bg-moss-100 text-moss-700"
                      : "text-ink-tertiary hover:bg-bg-secondary"
                  )}
                  onClick={() => setMood(mood === m.value ? "" : m.value)}
                >
                  {m.emoji} {m.label}
                </button>
              ))}
            </div>
            <select
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              className="input w-auto text-xs"
            >
              <option value="">不关联任务</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
            <Button
              variant="primary"
              onClick={handleAdd}
              disabled={!content.trim()}
              className="ml-auto"
            >
              记录
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : notes.length === 0 ? (
        <EmptyState
          title="还没有小记"
          description="每天记一点，周报月报自动汇总"
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([date, dateNotes]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-medium text-ink-secondary">
                  {formatDate(date, "yyyy年MM月dd日 EEEE")}
                </h3>
                <span className="text-2xs text-ink-hint">{dateNotes.length} 条记录</span>
              </div>
              <div className="space-y-2 ml-4 border-l-2 border-bg-tertiary pl-4">
                {dateNotes.map((note) => (
                  <div key={note.id} className="card p-3 group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm text-ink-primary whitespace-pre-wrap">{note.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {note.mood && (
                            <Badge color="amber">
                              {MOODS.find((m) => m.value === note.mood)?.label}
                            </Badge>
                          )}
                          {note.task && (
                            <Badge color="blue">{note.task.title}</Badge>
                          )}
                          <span className="text-2xs text-ink-hint">
                            {relativeTime(note.createdAt)}
                          </span>
                        </div>
                      </div>
                      <button
                        className="text-2xs text-coral-500 hover:text-coral-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDelete(note.id)}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
