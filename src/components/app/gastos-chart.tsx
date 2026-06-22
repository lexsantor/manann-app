"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

import { formatMoney } from "@/lib/erp-format";

// Paleta de chart (tokens) ciclada por porcion.
const CHART_FILLS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
  "hsl(var(--chart-7))",
  "hsl(var(--chart-8))",
];

interface GastosChartProps {
  data: { name: string; value: number }[];
}

export function GastosChart({ data }: GastosChartProps) {
  if (data.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-3 label-mono text-muted-foreground">Gasto por categoria</p>
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={42}
              outerRadius={66}
              paddingAngle={2}
              stroke="hsl(var(--card))"
              strokeWidth={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_FILLS[i % CHART_FILLS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
                fontSize: 12,
                color: "hsl(var(--foreground))",
              }}
              formatter={(value) => formatMoney(String(Number(value).toFixed(2)), "EUR")}
            />
          </PieChart>
        </ResponsiveContainer>

        <ul className="w-full min-w-0 flex-1 space-y-1.5">
          {data.map((d, i) => (
            <li key={d.name} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: CHART_FILLS[i % CHART_FILLS.length] }}
                />
                <span className="truncate text-muted-foreground">{d.name}</span>
              </span>
              <span className="shrink-0 font-mono tabular-nums text-foreground">
                {formatMoney(String(d.value.toFixed(2)), "EUR")}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
