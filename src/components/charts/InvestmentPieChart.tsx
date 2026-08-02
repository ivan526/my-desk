"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#2D8354", "#2264A0", "#BE9229", "#D85230", "#4F96D4", "#888780"];

interface InvestmentPieChartProps {
  data: { category: string; percentage: number }[];
}

export function InvestmentPieChart({ data }: InvestmentPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[240px] text-sm text-ink-hint">
        暂无数据
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={2}
          dataKey="percentage"
          nameKey="category"
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => `${value}%`}
          contentStyle={{
            fontSize: "12px",
            borderRadius: "8px",
            border: "1px solid #EFEDE7",
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={32}
          formatter={(value: string) => (
            <span style={{ fontSize: "11px", color: "#5F5E5A" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
