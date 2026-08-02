"use client";

import { formatDate } from "@/lib/utils";

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-bg-card border-b border-bg-tertiary">
      <div>
        <h2 className="text-lg font-medium text-ink-primary">{title}</h2>
        {subtitle && <p className="text-xs text-ink-hint mt-0.5">{subtitle}</p>}
      </div>
      <div className="text-sm text-ink-tertiary">
        {formatDate(new Date(), "yyyy年MM月dd日 EEEE")}
      </div>
    </header>
  );
}
