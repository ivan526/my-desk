"use client";

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from "recharts";

interface TrendLineChartProps {
  data: { month: string; tasks: number; achievements: number }[];
}

export function TrendLineChart({ data }: TrendLineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[240px] text-sm text-ink-hint">
        暂无数据
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EFEDE7" vertical={false} />
        <XAxis
          dataKey="month"
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
        <Legend
          verticalAlign="top"
          height={28}
          formatter={(value: string) => (
            <span style={{ fontSize: "11px", color: "#5F5E5A" }}>
              {value === "tasks" ? "任务" : "成果"}
            </span>
          )}
        />
        <Line
          type="monotone"
          dataKey="tasks"
          stroke="#2264A0"
          strokeWidth={2}
          dot={{ r: 3, fill: "#2264A0" }}
        />
        <Line
          type="monotone"
          dataKey="achievements"
          stroke="#2D8354"
          strokeWidth={2}
          dot={{ r: 3, fill: "#2D8354" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
