"use client";

import { cn, formatDate, PRIORITY_COLORS, PRIORITY_LABELS, PROJECT_STATUS_LABELS } from "@/lib/utils";
import { ProgressBar, Badge } from "@/components/ui";
import { Project } from "@/types";

interface ProjectCardProps {
  project: Project & { _count?: { tasks: number; achievements: number } };
  onEdit?: (project: Project) => void;
  onDelete?: (id: string) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const statusColors: Record<string, "moss" | "amber" | "coral" | "blue" | "gray"> = {
    active: "blue",
    paused: "amber",
    completed: "moss",
    archived: "gray",
  };

  return (
    <div
      className="card p-4 card-hover group cursor-pointer"
      onClick={() => onEdit?.(project)}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-ink-primary truncate">{project.name}</h4>
          {project.description && (
            <p className="text-xs text-ink-tertiary mt-1 line-clamp-2">{project.description}</p>
          )}
        </div>
        <Badge color={statusColors[project.status]}>
          {PROJECT_STATUS_LABELS[project.status]}
        </Badge>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-2xs text-ink-hint">进度</span>
          <span className="text-2xs text-ink-secondary font-medium">{project.progress}%</span>
        </div>
        <ProgressBar
          value={project.progress}
          color={project.progress === 100 ? "moss" : "blue"}
        />
      </div>

      <div className="flex items-center gap-3 text-2xs text-ink-hint">
        <span className={cn("tag", PRIORITY_COLORS[project.priority])}>
          {PRIORITY_LABELS[project.priority]}
        </span>
        {project._count && (
          <>
            <span>{project._count.tasks} 任务</span>
            <span>{project._count.achievements} 成果</span>
          </>
        )}
        {project.startDate && (
          <span>{formatDate(project.startDate, "MM-dd")} 开始</span>
        )}
      </div>

      {(onEdit || onDelete) && (
        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              className="text-2xs text-ink-tertiary hover:text-ink-primary px-1.5 py-0.5 rounded hover:bg-bg-secondary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(project);
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
                onDelete(project.id);
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
