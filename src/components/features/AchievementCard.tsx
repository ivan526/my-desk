"use client";

import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui";
import { Achievement } from "@/types";

interface AchievementCardProps {
  achievement: Achievement;
  onEdit?: (a: Achievement) => void;
  onDelete?: (id: string) => void;
}

const CATEGORY_COLORS: Record<string, "moss" | "amber" | "coral" | "blue" | "gray"> = {
  "分析报告": "blue",
  "项目推进": "moss",
  "流程优化": "amber",
  "团队协作": "coral",
  "技术突破": "moss",
  "其他": "gray",
};

export function AchievementCard({ achievement, onEdit, onDelete }: AchievementCardProps) {
  const hasDetails = achievement.scenario || achievement.result || achievement.output || achievement.value;

  return (
    <div
      className="card p-4 card-hover group cursor-pointer"
      onClick={() => onEdit?.(achievement)}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-ink-primary">{achievement.title}</h4>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {achievement.category && (
              <Badge color={CATEGORY_COLORS[achievement.category] || "gray"}>
                {achievement.category}
              </Badge>
            )}
            {achievement.project && (
              <Badge color="blue">{achievement.project.name}</Badge>
            )}
            <span className="text-2xs text-ink-hint">
              {formatDate(achievement.date, "MM-dd")}
            </span>
          </div>
        </div>
      </div>

      {hasDetails && (
        <div className="mt-3 space-y-1.5">
          {achievement.scenario && (
            <div className="flex gap-2">
              <span className="text-2xs text-ink-hint w-10 flex-shrink-0">场景</span>
              <p className="text-xs text-ink-secondary line-clamp-2">{achievement.scenario}</p>
            </div>
          )}
          {achievement.result && (
            <div className="flex gap-2">
              <span className="text-2xs text-ink-hint w-10 flex-shrink-0">结果</span>
              <p className="text-xs text-ink-secondary line-clamp-2">{achievement.result}</p>
            </div>
          )}
          {achievement.output && (
            <div className="flex gap-2">
              <span className="text-2xs text-ink-hint w-10 flex-shrink-0">输出</span>
              <p className="text-xs text-ink-secondary line-clamp-2">{achievement.output}</p>
            </div>
          )}
          {achievement.value && (
            <div className="flex gap-2">
              <span className="text-2xs text-ink-hint w-10 flex-shrink-0">价值</span>
              <p className="text-xs text-ink-secondary line-clamp-2">{achievement.value}</p>
            </div>
          )}
        </div>
      )}

      {(onEdit || onDelete) && (
        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              className="text-2xs text-ink-tertiary hover:text-ink-primary px-1.5 py-0.5 rounded hover:bg-bg-secondary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(achievement);
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
                onDelete(achievement.id);
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
