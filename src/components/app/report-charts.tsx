"use client";

import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(0)}k€`;
  return `${n.toFixed(0)}€`;
}

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  color: "hsl(var(--foreground))",
  fontSize: 12,
  boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
};

// ─── GP mensual (área) ───────────────────────────────────────────────────────

interface MonthlyData {
  month: string;
  gp: number;
  revenue: number;
}

export function GPAreaChart({ data }: { data: MonthlyData[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="gpGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.25} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="hsl(var(--muted-foreground))" stopOpacity={0.12} />
            <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
          axisLine={false} tickLine={false}
          tickFormatter={(v) => v.slice(5)} // show MM only
        />
        <YAxis
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
          axisLine={false} tickLine={false}
          tickFormatter={fmt} width={44}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          labelStyle={{ color: "hsl(var(--muted-foreground))", marginBottom: 4 }}
          formatter={(v, name) => [fmt(Number(v ?? 0)), name === "gp" ? "GP" : "Ingresos"]}
        />
        <Area type="monotone" dataKey="revenue" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} fill="url(#revGrad)" dot={false} name="revenue" />
        <Area type="monotone" dataKey="gp" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#gpGrad)" dot={false} name="gp" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Distribución por modo (barras horizontales) ─────────────────────────────

interface ModeData {
  mode: string;
  total: number;
}

const MODE_LABEL: Record<string, string> = {
  maritimo: "Marítimo", aereo: "Aéreo", terrestre: "Terrestre", ferroviario: "Ferroviario",
};

export function ModeBarChart({ data }: { data: ModeData[] }) {
  const displayData = data.map((d) => ({ ...d, label: MODE_LABEL[d.mode] ?? d.mode }));
  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={displayData} layout="vertical" margin={{ top: 0, right: 8, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
        <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="label" tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }} axisLine={false} tickLine={false} width={72} />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "hsl(var(--surface-2))" }}
          formatter={(v) => [Number(v ?? 0), "Expedientes"]} />
        <Bar dataKey="total" radius={[0, 4, 4, 0]} fill="hsl(var(--primary))" barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── GP por cliente (barras) ─────────────────────────────────────────────────

interface ClientData {
  name: string;
  gp: number;
  revenue: number;
  tier: string;
}

export function ClientGPBarChart({ data }: { data: ClientData[] }) {
  const display = data.slice(0, 8).map((d) => ({
    ...d,
    label: d.name.length > 18 ? d.name.slice(0, 16) + "…" : d.name,
  }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={display} margin={{ top: 4, right: 8, left: 4, bottom: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" interval={0} />
        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmt} width={44} />
        <Tooltip contentStyle={TOOLTIP_STYLE}
          formatter={(v, name) => [fmt(Number(v ?? 0)), name === "gp" ? "GP" : "Ingresos"]} />
        <Bar dataKey="revenue" fill="hsl(var(--muted-foreground) / 0.3)" radius={[4, 4, 0, 0]} barSize={14} name="revenue" />
        <Bar dataKey="gp"      fill="hsl(var(--primary))"               radius={[4, 4, 0, 0]} barSize={14} name="gp" />
      </BarChart>
    </ResponsiveContainer>
  );
}
