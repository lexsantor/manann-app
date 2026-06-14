import { TrendingUp, TrendingDown, Minus, Truck } from "lucide-react";
import { Icon } from "@/components/icon";
import type { CarrierScorecardRow } from "@/lib/erp";
import { cn } from "@/lib/utils";

interface CarrierScorecardProps {
  rows: CarrierScorecardRow[];
}

function OnTimeBadge({ rate }: { rate: number }) {
  const pct = rate;
  const good = pct >= 80;
  const ok = pct >= 60;
  return (
    <div className={cn(
      "flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-xs font-semibold",
      good ? "text-emerald-400 bg-emerald-500/10" : ok ? "text-amber-400 bg-amber-500/10" : "text-red-400 bg-red-500/10",
    )}>
      <Icon icon={good ? TrendingUp : ok ? Minus : TrendingDown} size={12} />
      {pct}%
    </div>
  );
}

export function CarrierScorecard({ rows }: CarrierScorecardProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card px-5 py-12 text-center">
        <Icon icon={Truck} size={28} className="text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground/60">Sin datos de carriers — crea expedientes con ETA para ver el scorecard</p>
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <Icon icon={Truck} size={15} className="text-muted-foreground" />
        <h2 className="font-display text-base font-medium tracking-tight">Scorecard de proveedores</h2>
        <span className="rounded-full bg-muted/60 px-2 py-0.5 font-mono text-xs text-muted-foreground">{rows.length}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40">
              <th className="px-5 py-2.5 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">Carrier</th>
              <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">Modo</th>
              <th className="px-4 py-2.5 text-right font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">Expedientes</th>
              <th className="px-4 py-2.5 text-right font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">Puntualidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {rows.map((r) => (
              <tr key={r.carrier} className="hover:bg-surface-2/30 transition-colors">
                <td className="px-5 py-3 font-medium text-foreground">{r.carrier}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground capitalize">{r.mode}</td>
                <td className="px-4 py-3 text-right font-mono text-muted-foreground">{r.total}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end">
                    {r.onTimeRate !== null ? <OnTimeBadge rate={r.onTimeRate} /> : (
                      <span className="font-mono text-xs text-muted-foreground/40">—</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 border-t border-border/40">
        <p className="font-mono text-[10px] text-muted-foreground/40">
          Calculado con expedientes que tienen ETA y fecha de llegada real registrada · Simulación — datos reales en producción
        </p>
      </div>
    </section>
  );
}
