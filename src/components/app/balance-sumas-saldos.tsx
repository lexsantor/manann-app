"use client";

import { useState, useTransition } from "react";
import { getBalanceSumasSaldos } from "@/lib/contabilidad-actions";
import { cn } from "@/lib/utils";

const MONTHS = ["", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

interface BalanceRow {
  accountCode: string;
  accountName: string;
  totalDebit: number;
  totalCredit: number;
  balance: number;
}

const currentYear = new Date().getFullYear();

export function BalanceSumasSaldos() {
  const [rows, setRows] = useState<BalanceRow[]>([]);
  const [year, setYear] = useState(currentYear);
  const [monthFrom, setMonthFrom] = useState(1);
  const [monthTo, setMonthTo] = useState(new Date().getMonth() + 1);
  const [loaded, setLoaded] = useState(false);
  const [pending, start] = useTransition();

  function handleLoad() {
    start(async () => {
      const data = await getBalanceSumasSaldos(year, monthFrom, monthTo);
      setRows(data);
      setLoaded(true);
    });
  }

  const totalDebit = rows.reduce((s, r) => s + r.totalDebit, 0);
  const totalCredit = rows.reduce((s, r) => s + r.totalCredit, 0);
  const fmt = (n: number) =>
    n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-card p-4">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Año</label>
          <select
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Desde</label>
          <select
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={monthFrom}
            onChange={(e) => setMonthFrom(Number(e.target.value))}
          >
            {MONTHS.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Hasta</label>
          <select
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={monthTo}
            onChange={(e) => setMonthTo(Number(e.target.value))}
          >
            {MONTHS.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <button
          onClick={handleLoad}
          disabled={pending}
          className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? "Calculando…" : "Generar balance"}
        </button>
      </div>

      {loaded && (
        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Cuenta</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Nombre</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Debe</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Haber</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.accountCode} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-xs font-bold text-foreground">{r.accountCode}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.accountName}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-foreground">{fmt(r.totalDebit)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-foreground">{fmt(r.totalCredit)}</td>
                  <td className={cn(
                    "px-4 py-2.5 text-right font-mono text-xs font-medium",
                    r.balance > 0 ? "text-foreground" : r.balance < 0 ? "text-red-500" : "text-muted-foreground",
                  )}>
                    {fmt(Math.abs(r.balance))}
                    {r.balance < 0 && " Cr"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-muted/30">
                <td colSpan={2} className="px-4 py-2.5 text-xs font-medium text-foreground">Total</td>
                <td className="px-4 py-2.5 text-right font-mono text-xs font-bold text-foreground">{fmt(totalDebit)}</td>
                <td className="px-4 py-2.5 text-right font-mono text-xs font-bold text-foreground">{fmt(totalCredit)}</td>
                <td className={cn(
                  "px-4 py-2.5 text-right font-mono text-xs font-bold",
                  Math.abs(totalDebit - totalCredit) < 0.01 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500",
                )}>
                  {Math.abs(totalDebit - totalCredit) < 0.01 ? "Cuadrado ✓" : fmt(Math.abs(totalDebit - totalCredit))}
                </td>
              </tr>
            </tfoot>
          </table>
          {rows.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Sin movimientos en el período seleccionado
            </div>
          )}
        </div>
      )}
    </div>
  );
}
