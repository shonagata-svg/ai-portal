"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// ===================== Department Bar Chart =====================

type DeptData = { name: string; hours: number; fte: number };

export function DepartmentBarChart({ data }: { data: DeptData[] }) {
  const filtered = data.filter((d) => d.hours > 0);
  if (filtered.length === 0)
    return <EmptyChart message="データがありません" />;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={filtered}
        layout="vertical"
        margin={{ top: 0, right: 40, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}h`}
        />
        <YAxis
          dataKey="name"
          type="category"
          width={120}
          tick={{ fontSize: 11, fill: "#475569" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          formatter={(value) => [`${Number(value).toLocaleString()}h`, "年間削減時間"]}
          labelStyle={{ color: "#1e293b", fontWeight: 600 }}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
          }}
        />
        <Bar dataKey="hours" radius={[0, 6, 6, 0]} maxBarSize={24}>
          {filtered.map((_, i) => (
            <Cell
              key={i}
              fill={i === 0 ? "#3b82f6" : i === 1 ? "#6366f1" : "#8b5cf6"}
              opacity={1 - i * 0.06}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ===================== Category Pie Chart =====================

const PIE_COLORS = [
  "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b",
  "#ef4444", "#ec4899", "#06b6d4", "#84cc16",
];

type CatData = { name: string; minutes: number };

export function CategoryPieChart({ data }: { data: CatData[] }) {
  const filtered = data.filter((d) => d.minutes > 0);
  if (filtered.length === 0)
    return <EmptyChart message="データがありません" />;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={filtered}
          dataKey="minutes"
          nameKey="name"
          cx="50%"
          cy="46%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
        >
          {filtered.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`${value}min`, "削減時間"]}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ===================== Tool Bar Chart =====================

type ToolData = { name: string; count: number };

export function ToolBarChart({ data }: { data: ToolData[] }) {
  const filtered = data.slice(0, 8);
  if (filtered.length === 0)
    return <EmptyChart message="データがありません" />;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={filtered}
        margin={{ top: 0, right: 16, left: 0, bottom: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: "#475569" }}
          tickLine={false}
          axisLine={false}
          angle={-35}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          formatter={(value) => [`${value}件`, "事例数"]}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
          }}
        />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
          {filtered.map((_, i) => (
            <Cell
              key={i}
              fill={PIE_COLORS[i % PIE_COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ===================== Helpers =====================

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-40 items-center justify-center text-sm text-slate-400">
      {message}
    </div>
  );
}
