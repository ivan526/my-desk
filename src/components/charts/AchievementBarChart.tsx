"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

interface AchievementBarChartProps {
  data: { category: string; count: number }[];
}

export function AchievementBarChart({ data }: AchievementBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[240px] text-sm text-ink-hint">
        暂无数据
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EFEDE7" vertical={false} />
        <XAxis
          dataKey="category"
          tick={{ fontSize: 11, fill: "#5F5E5A" }}
          axisLine={{ stroke: "#EFEDE7" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#5F5E5A" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            fontSize: "12px",
            borderRadius: "8px",
            border: "1px solid #EFEDE7",
          }}
        />
        <Bar dataKey="count" fill="#2D8354" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
