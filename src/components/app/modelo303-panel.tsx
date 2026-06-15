"use client";

import { useState, useTransition } from "react";
import { getModelo303Data } from "@/lib/contabilidad-actions";
import { cn } from "@/lib/utils";

const currentYear = new Date().getFullYear();
const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3) as 1 | 2 | 3 | 4;

interface Modelo303Data {
  year: number;
  quarter: number;
  repercutidas: Array<{ taxRate: number; base: number; cuota: number }>;
  soportadas: Array<{ taxRate: number; base: number; cuota: number }>;
  totalRepercutida: number;
  totalSoportada: number;
  resultado: number;
}

const QUARTERS = [
  { value: 1 as const, label: "1T — Enero a Marzo" },
  { value: 2 as const, label: "2T — Abril a Junio" },
  { value: 3 as const, label: "3T — Julio a Septiembre" },
  { value: 4 as const, label: "4T — Octubre a Diciembre" },
];

const fmt = (n: number) =>
  n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function Modelo303Panel() {
  const [year, setYear] = useState(currentYear);
  const [quarter, setQuarter] = useState<1 | 2 | 3 | 4>(currentQuarter);
  const [data, setData] = useState<Modelo303Data | null>(null);
  const [pending, start] = useTransition();

  function handleCalc() {
    start(async () => {
      const result = await getModelo303Data(year, quarter);
      setData(result);
    });
  }

  return (
    <div className="space-y-5">
      {/* Selector */}
      <div className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-card p-4">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Año</label>
          <select
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[currentYear - 1, currentYear].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Trimestre</label>
          <select
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={quarter}
            onChange={(e) => setQuarter(Number(e.target.value) as 1 | 2 | 3 | 4)}
          >
            {QUARTERS.map((q) => (
              <option key={q.value} value={q.value}>{q.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleCalc}
          disabled={pending}
          className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? "Calculando…" : "Calcular 303"}
        </button>
      </div>

      {data && (
        <div className="space-y-5">
          {/* IVA Repercutido */}
          <section className="rounded-md border border-border overflow-hidden">
            <div className="border-b border-border bg-muted/30 px-4 py-2.5">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                IVA Repercutido (ventas)
              </h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-4 py-2 text-left text-xs text-muted-foreground">Tipo IVA</th>
                  <th className="px-4 py-2 text-right text-xs text-muted-foreground">Base imponible</th>
                  <th className="px-4 py-2 text-right text-xs text-muted-foreground">Cuota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {data.repercutidas.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-4 text-center text-xs text-muted-foreground">
                      Sin facturas en el período
                    </td>
                  </tr>
                ) : (
                  data.repercutidas.map((r) => (
                    <tr key={r.taxRate} className="hover:bg-muted/20">
                      <td className="px-4 py-2.5 text-xs font-medium text-foreground">{r.taxRate}%</td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground">{fmt(r.base)} €</td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs text-foreground">{fmt(r.cuota)} €</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="border-t border-border bg-muted/30">
                  <td colSpan={2} className="px-4 py-2.5 text-xs font-medium text-foreground">Total cuota repercutida</td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm font-bold text-foreground">{fmt(data.totalRepercutida)} €</td>
                </tr>
              </tfoot>
            </table>
          </section>

          {/* IVA Soportado */}
          <section className="rounded-md border border-border overflow-hidden">
            <div className="border-b border-border bg-muted/30 px-4 py-2.5 flex items-center justify-between">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                IVA Soportado (compras)
              </h3>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                Estimado — módulo compras pendiente
              </span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-4 py-2 text-left text-xs text-muted-foreground">Tipo IVA</th>
                  <th className="px-4 py-2 text-right text-xs text-muted-foreground">Base imponible</th>
                  <th className="px-4 py-2 text-right text-xs text-muted-foreground">Cuota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {data.soportadas.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-4 text-center text-xs text-muted-foreground">
                      Sin datos de compras
                    </td>
                  </tr>
                ) : (
                  data.soportadas.map((r) => (
                    <tr key={r.taxRate} className="hover:bg-muted/20">
                      <td className="px-4 py-2.5 text-xs font-medium text-foreground">{r.taxRate}%</td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground">{fmt(r.base)} €</td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs text-foreground">{fmt(r.cuota)} €</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="border-t border-border bg-muted/30">
                  <td colSpan={2} className="px-4 py-2.5 text-xs font-medium text-foreground">Total cuota soportada</td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm font-bold text-foreground">{fmt(data.totalSoportada)} €</td>
                </tr>
              </tfoot>
            </table>
          </section>

          {/* Resultado */}
          <div className={cn(
            "rounded-md border p-5 flex items-center justify-between",
            data.resultado >= 0
              ? "border-red-500/20 bg-red-500/5"
              : "border-emerald-500/20 bg-emerald-500/5",
          )}>
            <div>
              <p className="text-sm font-medium text-foreground">
                Resultado {data.resultado >= 0 ? "a ingresar" : "a devolver"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Modelo 303 — {QUARTERS.find((q) => q.value === data.quarter)?.label} {data.year}
              </p>
            </div>
            <p className={cn(
              "font-mono text-2xl font-bold",
              data.resultado >= 0 ? "text-red-500" : "text-emerald-600 dark:text-emerald-400",
            )}>
              {data.resultado >= 0 ? "+" : ""}{fmt(data.resultado)} €
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
