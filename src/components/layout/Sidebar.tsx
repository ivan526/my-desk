"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store";

const NAV_ITEMS = [
  { href: "/", label: "首页", icon: HomeIcon },
  { href: "/tasks", label: "任务管理", icon: TaskIcon },
  { href: "/projects", label: "项目管理", icon: ProjectIcon },
  { href: "/achievements", label: "工作成果", icon: AchievementIcon },
  { href: "/reports", label: "周报月报", icon: ReportIcon },
  { href: "/review", label: "绩效复盘", icon: ReviewIcon },
  { href: "/statistics", label: "数据统计", icon: StatIcon },
  { href: "/notes", label: "每日小记", icon: NoteIcon },
  { href: "/settings", label: "设置中心", icon: SettingsIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="w-56 h-screen bg-bg-card border-r border-bg-tertiary flex flex-col flex-shrink-0">
      <div className="px-5 py-5 border-b border-bg-tertiary">
        <h1 className="text-lg font-medium text-ink-primary">工作成果管理台</h1>
        <p className="text-2xs text-ink-hint mt-0.5">可复盘 · 可汇报 · 可沉淀</p>
      </div>

      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-5 py-2 text-sm transition-colors",
                isActive
                  ? "bg-moss-50 text-moss-700 font-medium border-r-2 border-moss-500"
                  : "text-ink-secondary hover:bg-bg-secondary hover:text-ink-primary"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {user?.role === "ADMIN" && (
          <>
            <div className="px-5 py-2 mt-2 text-2xs text-ink-hint">管理</div>
            <Link
              href="/admin/users"
              className={cn(
                "flex items-center gap-2.5 px-5 py-2 text-sm transition-colors",
                pathname.startsWith("/admin")
                  ? "bg-coral-50 text-coral-700 font-medium border-r-2 border-coral-500"
                  : "text-ink-secondary hover:bg-bg-secondary hover:text-ink-primary"
              )}
            >
              <UserIcon className="w-4 h-4 flex-shrink-0" />
              <span>用户管理</span>
            </Link>
          </>
        )}
      </nav>

      <div className="px-5 py-3 border-t border-bg-tertiary">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm font-medium text-ink-primary truncate max-w-[120px]">
              {user?.username}
            </p>
            <p className="text-2xs text-ink-hint">
              {user?.role === "ADMIN" ? "管理员" : "普通用户"}
            </p>
          </div>
          <button
            onClick={logout}
            className="text-2xs text-coral-600 hover:text-coral-700"
          >
            退出
          </button>
        </div>
        <p className="text-2xs text-ink-hint">
          {new Date().getFullYear()} · 个人工作台
        </p>
      </div>
    </aside>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 7l6-5 6 5v6a1 1 0 01-1 1H3a1 1 0 01-1-1V7z" strokeLinejoin="round" />
      <path d="M6 14V9h4v5" strokeLinejoin="round" />
    </svg>
  );
}

function TaskIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="12" height="10" rx="1.5" />
      <path d="M5 7l1.5 1.5L9 6M5 11h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProjectIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4h5l1 2h6v7a1 1 0 01-1 1H2a1 1 0 01-1-1V4z" strokeLinejoin="round" />
    </svg>
  );
}

function AchievementIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 1.5l2 4 4 .5-3 3 .5 4-3.5-2-3.5 2 .5-4-3-3 4-.5 2-4z" strokeLinejoin="round" />
    </svg>
  );
}

function ReportIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="12" height="12" rx="1.5" />
      <path d="M5 6h6M5 9h6M5 12h3" strokeLinecap="round" />
    </svg>
  );
}

function ReviewIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 14V8m4 6V4m4 10v-7m-9 7h12" strokeLinecap="round" />
    </svg>
  );
}

function StatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 2v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NoteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 2h7l3 3v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" strokeLinejoin="round" />
      <path d="M9 2v3h4M5 8h6M5 11h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="2" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M3 13l1.5-1.5M11.5 4.5L13 3" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="5" r="3" />
      <path d="M2 14c0-3 3-5 6-5s6 2 6 5" strokeLinecap="round" />
    </svg>
  );
}
