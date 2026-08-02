"use client";

import { cn, formatDate, PRIORITY_COLORS, PRIORITY_LABELS, STATUS_COLORS, STATUS_LABELS } from "@/lib/utils";
import { Badge } from "@/components/ui";
import { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
  onConvert?: (task: Task) => void;
  compact?: boolean;
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange, onConvert, compact }: TaskCardProps) {
  return (
    <div
      className={cn(
        "card p-3 card-hover group cursor-pointer",
        task.status === "done" && "opacity-60"
      )}
      onClick={() => onEdit?.(task)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <button
              className={cn(
                "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
                task.status === "done"
                  ? "bg-moss-500 border-moss-500 text-white"
                  : "border-ink-hint hover:border-moss-400"
              )}
              onClick={(e) => {
                e.stopPropagation();
                if (onStatusChange) {
                  onStatusChange(task.id, task.status === "done" ? "todo" : "done");
                }
              }}
            >
              {task.status === "done" && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 5l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <h4 className={cn(
              "text-sm font-medium text-ink-primary truncate",
              task.status === "done" && "line-through"
            )}>
              {task.title}
            </h4>
          </div>
          {!compact && task.description && (
            <p className="text-xs text-ink-tertiary ml-6 mb-2 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center gap-1.5 ml-6 flex-wrap">
            <span className={cn("tag", STATUS_COLORS[task.status])}>
              {STATUS_LABELS[task.status]}
            </span>
            <span className={cn("tag", PRIORITY_COLORS[task.priority])}>
              {PRIORITY_LABELS[task.priority]}
            </span>
            {task.category && (
              <span className="tag bg-bg-tertiary text-ink-tertiary">{task.category}</span>
            )}
            {task.project && (
              <Badge color="blue">{task.project.name}</Badge>
            )}
            {task.dueDate && (
              <span className="text-2xs text-ink-hint">
                {formatDate(task.dueDate, "MM-dd")}
              </span>
            )}
            {task.isConverted && (
              <Badge color="moss">已转成果</Badge>
            )}
          </div>
        </div>
      </div>

      {!compact && (onEdit || onDelete || onConvert) && (
        <div className="flex items-center gap-1 mt-2 ml-6 opacity-0 group-hover:opacity-100 transition-opacity">
          {onConvert && task.status === "done" && !task.isConverted && (
            <button
              className="text-2xs text-moss-600 hover:text-moss-700 px-1.5 py-0.5 rounded hover:bg-moss-50"
              onClick={(e) => {
                e.stopPropagation();
                onConvert(task);
              }}
            >
              转成果
            </button>
          )}
          {onEdit && (
            <button
              className="text-2xs text-ink-tertiary hover:text-ink-primary px-1.5 py-0.5 rounded hover:bg-bg-secondary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
            >
              编辑
            </button>
          )}
          {onDelete && (
            <button
              className="text-2xs text-coral-500 hover:text-coral-600 px-1.5 py-0.5 rounded hover:bg-coral-50"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
            >
              删除
            </button>
          )}
        </div>
      )}
    </div>
  );
}
