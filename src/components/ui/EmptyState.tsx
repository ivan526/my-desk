import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      {icon && <div className="text-ink-hint mb-3">{icon}</div>}
      <p className="text-sm font-medium text-ink-secondary">{title}</p>
      {description && <p className="text-xs text-ink-hint mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface LoadingProps {
  text?: string;
}

export function Loading({ text = "加载中..." }: LoadingProps) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex items-center gap-2 text-ink-hint">
        <svg className="animate-spin w-4 h-4" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
          <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="text-sm">{text}</span>
      </div>
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: "moss" | "amber" | "coral" | "blue";
  showLabel?: boolean;
}

export function ProgressBar({ value, max = 100, color = "moss", showLabel }: ProgressBarProps) {
  const percent = Math.min(100, Math.round((value / max) * 100));
  const colorMap = {
    moss: "bg-moss-500",
    amber: "bg-amber-500",
    coral: "bg-coral-500",
    blue: "bg-blue-500",
  };
  return (
    <div className="w-full">
      <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", colorMap[color])}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-2xs text-ink-hint mt-1 text-right">{percent}%</p>
      )}
    </div>
  );
}
