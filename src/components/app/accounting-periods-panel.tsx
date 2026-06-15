"use client";

import { useState, useTransition } from "react";
import { Lock, LockOpen, Plus } from "lucide-react";
import { closePeriod, reopenPeriod, ensurePeriod } from "@/lib/contabilidad-actions";
import { cn } from "@/lib/utils";

interface Period {
  id: string;
  year: number;
  month: number;
  status: string;
  closedAt: Date | null;
}

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function AccountingPeriodsPanel({ periods: initial }: { periods: Period[] }) {
  const [periods, setPeriods] = useState(initial);
  const [pending, start] = useTransition();
  const today = new Date();

  function handleClose(year: number, month: number) {
    start(async () => {
      await closePeriod(year, month);
      setPeriods((prev) =>
        prev.map((p) =>
          p.year === year && p.month === month
            ? { ...p, status: "closed", closedAt: new Date() }
            : p,
        ),
      );
    });
  }

  function handleReopen(year: number, month: number) {
    start(async () => {
      await reopenPeriod(year, month);
      setPeriods((prev) =>
        prev.map((p) =>
          p.year === year && p.month === month
            ? { ...p, status: "open", closedAt: null }
            : p,
        ),
      );
    });
  }

  function handleCreate() {
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const exists = periods.some((p) => p.year === year && p.month === month);
    if (exists) return;
    start(async () => {
      await ensurePeriod(year, month);
      setPeriods((prev) => [
        { id: crypto.randomUUID(), year, month, status: "open", closedAt: null },
        ...prev,
      ]);
    });
  }

  const thisYear = today.getFullYear();
  const thisMonth = today.getMonth() + 1;
  const hasCurrentPeriod = periods.some((p) => p.year === thisYear && p.month === thisMonth);

  return (
    <div className="space-y-4">
      {!hasCurrentPeriod && (
        <button
          onClick={handleCreate}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          Abrir período {MONTHS[thisMonth - 1]} {thisYear}
        </button>
      )}

      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Período</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Estado</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Cerrado el</th>
              <th className="px-4 py-2.5 w-32" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {periods.map((p) => (
              <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <span className="font-mono text-sm font-medium text-foreground">
                    {MONTHS[p.month - 1]} {p.year}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                      p.status === "closed"
                        ? "bg-muted text-muted-foreground"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                    )}
                  >
                    {p.status === "closed" ? (
                      <><Lock className="h-2.5 w-2.5" /> Cerrado</>
                    ) : (
                      <><LockOpen className="h-2.5 w-2.5" /> Abierto</>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {p.closedAt
                    ? new Date(p.closedAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  {p.status === "open" ? (
                    <button
                      onClick={() => handleClose(p.year, p.month)}
                      disabled={pending}
                      className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors disabled:opacity-40"
                    >
                      <Lock className="h-3 w-3" /> Cerrar período
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReopen(p.year, p.month)}
                      disabled={pending}
                      className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-amber-400/40 hover:text-foreground transition-colors disabled:opacity-40"
                    >
                      <LockOpen className="h-3 w-3" /> Reabrir
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {periods.length === 0 && (
          <div className="py-10 text-center text-sm text-muted-foreground">Sin períodos registrados</div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Los asientos en períodos cerrados no pueden modificarse. Reabrir un período queda registrado en el diario de auditoría.
      </p>
    </div>
  );
}
