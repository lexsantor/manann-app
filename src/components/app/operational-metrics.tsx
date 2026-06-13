import { Clock, TrendingUp, Ship, Layers, type LucideIcon } from "lucide-react";
import { Icon } from "@/components/icon";
import type { OperationalStats } from "@/lib/erp";

interface Props {
  stats: OperationalStats;
}

export function OperationalMetrics({ stats }: Props) {
  const hasData =
    stats.avgTransitDays !== null ||
    stats.onTimeRate !== null ||
    stats.topCarriers.length > 0 ||
    stats.byMode.length > 0;

  if (!hasData) return null;

  const maxCarrierCount = stats.topCarriers[0]?.count ?? 1;

  return (
    <section className="space-y-4">
      <h2 className="font-display text-lg font-medium tracking-tight text-foreground">
        Métricas operativas
      </h2>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          icon={Clock}
          label="Tránsito medio"
          value={stats.avgTransitDays !== null ? `${stats.avgTransitDays} días` : "—"}
          sub="ETD → ETA"
        />
        <MetricCard
          icon={TrendingUp}
          label="Puntualidad"
          value={stats.onTimeRate !== null ? `${stats.onTimeRate}%` : "—"}
          sub="ETAs en plazo"
          highlight={stats.onTimeRate !== null && stats.onTimeRate >= 80}
        />
        <MetricCard
          icon={Ship}
          label="Navieras activas"
          value={stats.topCarriers.length > 0 ? String(stats.topCarriers.length) : "—"}
          sub="con expedientes"
        />
        <MetricCard
          icon={Layers}
          label="Modos"
          value={stats.byMode.length > 0 ? String(stats.byMode.length) : "—"}
          sub="de transporte"
        />
      </div>

      {/* Bottom row: top carriers + mode breakdown */}
      {(stats.topCarriers.length > 0 || stats.byMode.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Top navieras */}
          {stats.topCarriers.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
              <p className="mb-4 font-mono text-sm uppercase tracking-wide text-muted-foreground">
                Top navieras / transportistas
              </p>
              <div className="space-y-2.5">
                {stats.topCarriers.map(({ carrier, count }, i) => (
                  <div key={carrier} className="flex items-center gap-3">
                    <span className="w-4 text-right font-mono text-base text-muted-foreground/50">
                      {i + 1}
                    </span>
                    <span className="w-36 truncate text-base text-foreground">{carrier}</span>
                    <div className="flex flex-1 items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                        <div
                          className="h-full rounded-full bg-primary/60 transition-all"
                          style={{ width: `${Math.round((count / maxCarrierCount) * 100)}%` }}
                        />
                      </div>
                      <span className="w-6 text-right font-mono text-base text-muted-foreground">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Por modo */}
          {stats.byMode.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="mb-4 font-mono text-sm uppercase tracking-wide text-muted-foreground">
                Por modo de transporte
              </p>
              <div className="space-y-2.5">
                {stats.byMode.map(({ mode, count }) => (
                  <div key={mode} className="flex items-center justify-between">
                    <span className="text-base text-foreground">{mode}</span>
                    <span className="font-mono text-base text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function MetricCard({
  icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon icon={icon} size={14} />
        <span className="font-mono text-sm uppercase tracking-wide">{label}</span>
      </div>
      <p
        className={`mt-2 font-display text-2xl font-semibold tracking-tight ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </p>
      <p className="mt-0.5 text-base text-muted-foreground">{sub}</p>
    </div>
  );
}
