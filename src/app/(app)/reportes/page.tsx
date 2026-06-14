import Link from "next/link";
import { notFound } from "next/navigation";
import { Printer, TrendingUp, Users, Ship, MapPin, Leaf } from "lucide-react";
import {
  getOrgContext,
  getMonthlyGP,
  getTopClientsByGP,
  getShipmentsByMode,
  getTopRoutes,
  getCarrierKPIs,
  getEsgRaw,
} from "@/lib/erp";
import { estimateCo2 } from "@/lib/erp-format";
import { EsgExportButton } from "@/components/app/esg-export-button";
import { Icon } from "@/components/icon";
import { portLabel } from "@/lib/erp-format";
import { cn } from "@/lib/utils";
import { GPAreaChart, ModeBarChart, ClientGPBarChart } from "@/components/app/report-charts";

export const metadata = { title: "Reportes — Manann" };

const PERIODS = [
  { key: "mes",       label: "Este mes",   months: 1  },
  { key: "trimestre", label: "Trimestre",  months: 3  },
  { key: "año",       label: "Año",        months: 12 },
] as const;

type Period = "mes" | "trimestre" | "año";

function dateFrom(period: Period): Date {
  const months = PERIODS.find((p) => p.key === period)?.months ?? 12;
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d;
}

function fmt(n: number | string) {
  const v = Number(n);
  if (isNaN(v)) return "—";
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);
}

function tier(rank: number, total: number): "A" | "B" | "C" {
  const pct = rank / total;
  if (pct <= 0.2) return "A";
  if (pct <= 0.5) return "B";
  return "C";
}

const TIER_COLOR = {
  A: "bg-primary/10 text-primary",
  B: "bg-sky-500/10 text-sky-600",
  C: "bg-muted/60 text-muted-foreground",
};

const MODE_LABEL: Record<string, string> = {
  maritimo: "Marítimo", aereo: "Aéreo", terrestre: "Terrestre", ferroviario: "Ferroviario",
};

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: rawPeriod = "año" } = await searchParams;
  const period = (["mes", "trimestre", "año"].includes(rawPeriod) ? rawPeriod : "año") as Period;

  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const from = dateFrom(period);

  const [monthlyGP, topClients, byMode, topRoutes, carriers, esgRaw] = await Promise.all([
    getMonthlyGP(ctx.org.id, 12),
    getTopClientsByGP(ctx.org.id, from, 10),
    getShipmentsByMode(ctx.org.id, from),
    getTopRoutes(ctx.org.id, from, 8),
    getCarrierKPIs(ctx.org.id, from, 8),
    getEsgRaw(ctx.org.id, from),
  ]);

  // Compute CO₂ in the server component (keeps erp.ts free of erp-format imports)
  const esgRows = esgRaw.map((r) => {
    const co2 = estimateCo2(r.pol, r.pod, r.mode, r.totalWeightKg);
    return { ...r, co2Kg: co2?.kg ?? 0, distanceKm: co2?.distanceKm ?? 0 };
  });
  const esgTotalCo2 = esgRows.reduce((s, r) => s + r.co2Kg, 0);
  const esgByMode = Object.entries(
    esgRows.reduce<Record<string, { co2Kg: number; count: number }>>((acc, r) => {
      if (!acc[r.mode]) acc[r.mode] = { co2Kg: 0, count: 0 };
      acc[r.mode].co2Kg += r.co2Kg;
      acc[r.mode].count += 1;
      return acc;
    }, {}),
  ).map(([mode, data]) => ({ mode, ...data })).sort((a, b) => b.co2Kg - a.co2Kg);

  // Totales del período
  const totalGP = topClients.reduce((s, c) => s + Number(c.gp), 0);
  const totalRevenue = topClients.reduce((s, c) => s + Number(c.revenue), 0);
  const totalShipments = byMode.reduce((s, m) => s + Number(m.total), 0);
  const marginPct = totalRevenue > 0 ? ((totalGP / totalRevenue) * 100).toFixed(1) : "0.0";

  // Datos para chart GP mensual — rellenar meses vacíos
  const gpChartData = (() => {
    const map = new Map(monthlyGP.map((r) => [r.month, r]));
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - 11 + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return { month: key, gp: Number(map.get(key)?.gp ?? 0), revenue: Number(map.get(key)?.revenue ?? 0) };
    });
  })();

  // Clientes con tier
  const clientsWithTier = topClients.map((c, i) => ({
    ...c,
    tier: tier(i + 1, topClients.length),
    margin: Number(c.revenue) > 0 ? ((Number(c.gp) / Number(c.revenue)) * 100).toFixed(1) : "0.0",
  }));

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">Reportes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Análisis de {ctx.org.name}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
            {PERIODS.map((p) => (
              <Link
                key={p.key}
                href={`/reportes?period=${p.key}`}
                prefetch={false}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  period === p.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {p.label}
              </Link>
            ))}
          </div>
          {/* Print / Export PDF */}
          <button
            onClick={() => typeof window !== "undefined" && window.print()}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground print:hidden"
          >
            <Icon icon={Printer} size={13} />
            PDF
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
        {[
          { label: "Expedientes", value: String(totalShipments) },
          { label: "Ingresos",    value: fmt(totalRevenue) },
          { label: "GP",          value: fmt(totalGP) },
          { label: "Margen GP",   value: `${marginPct}%` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card px-5 py-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="mt-1 font-display text-xl font-semibold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* GP mensual */}
      <div className="overflow-hidden rounded-xl border border-border bg-card px-5 py-5">
        <div className="mb-4 flex items-center gap-2">
          <Icon icon={TrendingUp} size={14} className="text-muted-foreground" />
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">GP mensual — 12 meses</p>
        </div>
        {gpChartData.every((d) => d.gp === 0 && d.revenue === 0) ? (
          <div className="flex h-[220px] items-center justify-center">
            <p className="text-sm text-muted-foreground">Sin datos de cargos en el período</p>
          </div>
        ) : (
          <GPAreaChart data={gpChartData} />
        )}
      </div>

      {/* 2-col: Top clientes + Distribución modo */}
      <div className="grid gap-4 sm:grid-cols-[1fr_260px]">
        {/* Top clientes */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-5 py-3">
            <Icon icon={Users} size={14} className="text-muted-foreground" />
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Top clientes por GP</p>
          </div>
          {topClients.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-muted-foreground">Sin datos en el período</p>
            </div>
          ) : (
            <>
              <div className="hidden grid-cols-[1fr_60px_90px_70px_40px] gap-3 border-b border-border/40 px-5 py-2 sm:grid">
                {["Cliente", "Envíos", "Ingresos", "GP", "Tier"].map((h) => (
                  <span key={h} className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{h}</span>
                ))}
              </div>
              <div className="divide-y divide-border/60">
                {clientsWithTier.map((c, i) => (
                  <div key={c.name} className="grid grid-cols-[1fr_auto] items-center gap-3 px-5 py-3 sm:grid-cols-[1fr_60px_90px_70px_40px]">
                    <span className="truncate text-sm font-medium text-foreground">{c.name}</span>
                    <span className="hidden text-center font-mono text-sm text-muted-foreground sm:block">{Number(c.shipments)}</span>
                    <span className="hidden text-right font-mono text-sm text-muted-foreground sm:block">{fmt(c.revenue)}</span>
                    <span className={cn("hidden text-right font-mono text-sm sm:block", Number(c.gp) < 0 ? "text-accent" : "text-foreground")}>{fmt(c.gp)}</span>
                    <span className={cn("inline-flex items-center justify-center rounded-full px-2 py-0.5 font-mono text-xs font-bold", TIER_COLOR[c.tier])}>
                      {c.tier}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Distribución modo */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-5 py-3">
            <Icon icon={Ship} size={14} className="text-muted-foreground" />
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Por modo</p>
          </div>
          {byMode.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-muted-foreground">Sin datos</p>
            </div>
          ) : (
            <div className="px-5 py-5">
              <ModeBarChart data={byMode.map((m) => ({ mode: m.mode, total: Number(m.total) }))} />
            </div>
          )}
        </div>
      </div>

      {/* Top rutas */}
      {topRoutes.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-5 py-3">
            <Icon icon={MapPin} size={14} className="text-muted-foreground" />
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Rutas más frecuentes</p>
          </div>
          <div className="divide-y divide-border/60">
            {topRoutes.map((r, i) => {
              const pol3 = r.pol?.slice(-3) ?? "—";
              const pod3 = r.pod?.slice(-3) ?? "—";
              const polLabel = r.pol ? portLabel(r.pol) : "—";
              const podLabel = r.pod ? portLabel(r.pod) : "—";
              const maxTotal = Number(topRoutes[0]?.total ?? 1);
              const pct = Math.round((Number(r.total) / maxTotal) * 100);
              return (
                <div key={i} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold text-foreground w-8">{pol3}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-mono text-sm font-semibold text-foreground w-8">{pod3}</span>
                      <span className="hidden text-xs text-muted-foreground sm:block">
                        {polLabel.split(" · ")[0]} → {podLabel.split(" · ")[0]}
                      </span>
                    </div>
                    <span className="font-mono text-sm text-foreground">{Number(r.total)} exp.</span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-border">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* KPIs navieras */}
      {carriers.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-3">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">KPIs de tránsito por naviera</p>
          </div>
          <div className="hidden grid-cols-[1fr_80px_120px_80px] gap-4 border-b border-border/40 px-5 py-2 sm:grid">
            {["Naviera", "Envíos", "Días tránsito (media)", "Demorados"].map((h) => (
              <span key={h} className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{h}</span>
            ))}
          </div>
          <div className="divide-y divide-border/60">
            {carriers.map((c) => {
              const delayed = Number(c.delayed ?? 0);
              const total = Number(c.total);
              return (
                <div key={c.carrier} className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-3 sm:grid-cols-[1fr_80px_120px_80px]">
                  <span className="text-sm font-medium text-foreground">{c.carrier}</span>
                  <span className="text-center font-mono text-sm text-muted-foreground">{total}</span>
                  <span className="hidden text-center font-mono text-sm text-foreground sm:block">
                    {c.avgTransitDays != null ? `${Number(c.avgTransitDays).toFixed(1)} d` : "—"}
                  </span>
                  <span className={cn(
                    "text-right font-mono text-sm sm:block",
                    delayed > 0 ? "text-accent" : "text-muted-foreground",
                  )}>
                    {delayed > 0 ? delayed : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ESG & Sostenibilidad */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <Icon icon={Leaf} size={14} className="text-emerald-500" />
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">ESG — Huella de carbono</p>
          </div>
          <EsgExportButton data={{ rows: esgRows }} period={period} />
        </div>

        {esgTotalCo2 === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-muted-foreground">Sin datos de rutas con peso declarado en el período</p>
          </div>
        ) : (
          <div className="grid gap-px bg-border sm:grid-cols-[200px_1fr]">
            {/* KPI total */}
            <div className="bg-card px-5 py-5 flex flex-col justify-center">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">CO₂ total estimado</p>
              <p className="mt-1 font-display text-2xl font-semibold text-foreground">
                {esgTotalCo2 >= 1000
                  ? `${(esgTotalCo2 / 1000).toFixed(1)} t`
                  : `${Math.round(esgTotalCo2)} kg`}
              </p>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">CO₂e · GLEC Framework</p>
            </div>

            {/* Breakdown por modo */}
            <div className="bg-card px-5 py-5 space-y-3">
              {esgByMode.map((m) => {
                const pct = esgTotalCo2 > 0 ? Math.round((m.co2Kg / esgTotalCo2) * 100) : 0;
                const modeLabels: Record<string, string> = {
                  maritimo: "Marítimo", aereo: "Aéreo", terrestre: "Terrestre",
                  ferroviario: "Ferroviario", multimodal: "Multimodal",
                };
                const co2Fmt = m.co2Kg >= 1000
                  ? `${(m.co2Kg / 1000).toFixed(1)} t CO₂e`
                  : `${Math.round(m.co2Kg)} kg CO₂e`;
                return (
                  <div key={m.mode}>
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <span className="font-mono text-sm text-foreground">{modeLabels[m.mode] ?? m.mode}</span>
                      <span className="font-mono text-sm text-muted-foreground">{co2Fmt} · {pct}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="border-t border-border/40 px-5 py-2">
          <p className="font-mono text-[10px] text-muted-foreground/50">
            Estimación basada en distancia haversine, peso declarado en líneas de carga y factores de emisión GLEC (marítimo 10 g/t·km, aéreo 602 g/t·km, terrestre 96 g/t·km). No constituye informe oficial GHG.
          </p>
        </div>
      </div>

      {/* Print footer */}
      <div className="hidden print:block text-center text-xs text-muted-foreground pt-4">
        Generado por Manann ERP · {new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
      </div>
    </div>
  );
}
