import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  eachDayOfInterval,
  isWithinInterval,
  parseISO,
  differenceInDays,
} from "date-fns";
import { zhCN } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, fmt: string = "yyyy-MM-dd"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, fmt, { locale: zhCN });
}

export function formatDateTime(date: Date | string): string {
  return formatDate(date, "MM-dd HH:mm");
}

export function getWeekRange(date: Date = new Date()): { start: Date; end: Date } {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  };
}

export function getMonthRange(date: Date = new Date()): { start: Date; end: Date } {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

export function getLast7Days(): Date[] {
  const today = new Date();
  return eachDayOfInterval({
    start: subDays(today, 6),
    end: today,
  });
}

export function getLast30Days(): Date[] {
  const today = new Date();
  return eachDayOfInterval({
    start: subDays(today, 29),
    end: today,
  });
}

export function isInRange(date: Date, start: Date, end: Date): boolean {
  return isWithinInterval(date, { start, end });
}

export function daysBetween(start: Date, end: Date): number {
  return differenceInDays(end, start);
}

export function relativeTime(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return formatDate(d);
}

export const PRIORITY_LABELS: Record<string, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

export const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-coral-100 text-coral-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-blue-100 text-blue-700",
};

export const STATUS_LABELS: Record<string, string> = {
  todo: "待办",
  in_progress: "进行中",
  done: "已完成",
};

export const STATUS_COLORS: Record<string, string> = {
  todo: "bg-bg-tertiary text-ink-secondary",
  in_progress: "bg-blue-100 text-blue-700",
  done: "bg-moss-100 text-moss-700",
};

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  active: "进行中",
  paused: "已暂停",
  completed: "已完成",
  archived: "已归档",
};

export const ACHIEVEMENT_CATEGORIES = [
  "分析报告",
  "项目推进",
  "流程优化",
  "团队协作",
  "技术突破",
  "其他",
];

export const TASK_CATEGORIES = [
  "日常任务",
  "项目任务",
  "临时任务",
  "会议沟通",
  "学习提升",
];

export function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len) + "...";
}
