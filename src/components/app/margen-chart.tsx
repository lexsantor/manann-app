"use client";

import { formatMoney } from "@/lib/erp-format";
import { cn } from "@/lib/utils";

type Charge = { direction: "cost" | "revenue"; amount: string; buyAmount?: string | null };

// Resumen visual del resultado del expediente: ingresos vs costes (barras
// proporcionales) + margen (GP) destacado. Replica la logica de GP de
// finanzas-panel: el buyAmount por linea de ingreso tiene prioridad sobre las
// filas de coste sueltas.
export function MargenChart({ charges }: { charges: Charge[] }) {
  const revenues = charges.filter((c) => c.direction === "revenue");
  const costs = charges.filter((c) => c.direction === "cost");
  const revenue = revenues.reduce((s, c) => s + Number(c.amount), 0);
  const totalBuy = revenues.reduce((s, c) => s + (c.buyAmount != null ? Number(c.buyAmount) : 0), 0);
  const totalCostOnly = costs.reduce((s, c) => s + Number(c.amount), 0);
  const cost = revenues.some((c) => c.buyAmount != null) ? totalBuy : totalCostOnly;

  const margen = revenue - cost;
  const pct = revenue > 0 ? (margen / revenue) * 100 : null;
  const max = Math.max(revenue, cost, 1);
  const empty = revenue === 0 && cost === 0;
  const positive = margen >= 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="label-mono text-muted-foreground">Resultado del expediente</p>
      {empty ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Sin importes todavía. Se calcula al añadir ingresos y costes.
        </p>
      ) : (
        <>
          <div className="mt-4 space-y-3">
            <ResultBar label="Ingresos" value={revenue} pct={(revenue / max) * 100} tone="bg-success" />
            <ResultBar label="Costes" value={cost} pct={(cost / max) * 100} tone="bg-destructive" />
          </div>
          <div className="mt-4 flex items-end justify-between border-t border-border pt-3">
            <span className="text-sm text-muted-foreground">Margen (GP)</span>
            <div className="text-right">
              <span
                className={cn(
                  "font-display text-2xl font-semibold tabular-nums",
                  positive ? "text-success" : "text-destructive",
                )}
              >
                {formatMoney(String(margen.toFixed(2)), "EUR")}
              </span>
              {pct != null && (
                <span
                  className={cn(
                    "ml-2 text-sm font-medium tabular-nums",
                    positive ? "text-success" : "text-destructive",
                  )}
                >
                  {pct >= 0 ? "+" : ""}
                  {pct.toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ResultBar({ label, value, pct, tone }: { label: string; value: number; pct: number; tone: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums text-foreground">
          {formatMoney(String(value.toFixed(2)), "EUR")}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${Math.max(pct, 2)}%` }} />
      </div>
    </div>
  );
}
