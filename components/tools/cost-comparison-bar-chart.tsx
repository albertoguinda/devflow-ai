"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#f43f5e", "#84cc16"];

interface CostComparisonBarChartProps {
  data: { name: string; costPerRequest: number; dailyCost: number }[];
  mode: "perRequest" | "daily";
  currencySymbol: string;
  costPerRequestLabel: string;
  dailyCostLabel: string;
}

export function CostComparisonBarChart({
  data,
  mode,
  currencySymbol,
  costPerRequestLabel,
  dailyCostLabel,
}: CostComparisonBarChartProps) {
  const dataKey = mode === "perRequest" ? "costPerRequest" : "dailyCost";
  const label = mode === "perRequest" ? costPerRequestLabel : dailyCostLabel;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
        <defs>
          {data.map((_, i) => (
            <linearGradient key={`barGrad${i}`} id={`barGrad${i}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.85} />
              <stop offset="100%" stopColor={COLORS[i % COLORS.length]} stopOpacity={1} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" opacity={0.5} />
        <XAxis
          type="number"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
          tickFormatter={(val: number) =>
            val < 0.01 ? `${currencySymbol}${val.toFixed(4)}` : `${currencySymbol}${val.toFixed(2)}`
          }
        />
        <YAxis
          type="category"
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "var(--color-foreground)", fontWeight: 500 }}
          width={140}
        />
        <RechartsTooltip
          contentStyle={{
            backgroundColor: "var(--color-background)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            fontSize: "12px",
            color: "var(--color-foreground)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
            padding: "10px 14px",
          }}
          cursor={{ fill: "var(--color-muted)", opacity: 0.3 }}
          formatter={(value: number | undefined) => {
            const v = value ?? 0;
            return [
              v < 0.01
                ? `${currencySymbol}${v.toFixed(6)}`
                : `${currencySymbol}${v.toFixed(4)}`,
              label,
            ];
          }}
          labelStyle={{ fontWeight: "bold", marginBottom: "4px", color: "var(--color-foreground)" }}
          itemStyle={{ color: "var(--color-foreground)" }}
        />
        <Bar dataKey={dataKey} radius={[0, 6, 6, 0]} barSize={24}>
          {data.map((_, i) => (
            <Cell key={`cell${i}`} fill={`url(#barGrad${i})`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
