"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface TarifasChartProps {
  data: { name: string; value: number }[];
}

// Barras horizontales: nº de tarifas por tipo de servicio. De un vistazo se ve
// dónde se concentra el tarifario. Patrón de recharts igual que dashboard-charts.
export function TarifasChart({ data }: TarifasChartProps) {
  if (data.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-3 label-mono text-muted-foreground">Tarifas por tipo de servicio</p>
      <ResponsiveContainer width="100%" height={Math.max(160, data.length * 30)}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={108}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--surface-2))" }}
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
              fontSize: 12,
              color: "hsl(var(--foreground))",
            }}
            formatter={(value) => `${value} tarifa${Number(value) === 1 ? "" : "s"}`}
          />
          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 3, 3, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
