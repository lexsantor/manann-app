"use client";

import { useState, useTransition } from "react";
import { Search, Edit2, Check } from "lucide-react";
import { upsertExchangeRate } from "@/lib/maestros-actions";
import type { MasterCurrency } from "@/lib/master-currencies";

interface SavedRate {
  id: string;
  targetCurrency: string;
  rate: string;
  validFrom: string;
}

interface Props {
  currencies: MasterCurrency[];
  referenceRates: Record<string, number>;
  savedRates: SavedRate[];
}

export function CurrenciesPanel({ currencies, referenceRates, savedRates }: Props) {
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editRate, setEditRate] = useState("");
  const [pending, start] = useTransition();

  const savedMap = Object.fromEntries(savedRates.map((r) => [r.targetCurrency, r]));

  const filtered = q.trim()
    ? currencies.filter(
        (c) =>
          c.code.toLowerCase().includes(q.toLowerCase()) ||
          c.name.toLowerCase().includes(q.toLowerCase()),
      )
    : currencies;

  function startEdit(code: string) {
    const saved = savedMap[code];
    const ref = referenceRates[code];
    setEditRate(saved ? saved.rate : ref ? ref.toFixed(6) : "");
    setEditing(code);
  }

  function saveRate(code: string) {
    start(async () => {
      await upsertExchangeRate({
        targetCurrency: code,
        rate: editRate,
        validFrom: new Date().toISOString().slice(0, 10),
      });
      setEditing(null);
    });
  }

  return (
    <div className="space-y-3">
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
        <input
          className="h-11 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:h-10 md:text-sm"
          placeholder="Buscar divisa..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Código</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Divisa</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Símbolo</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">T/C vs EUR</th>
              <th className="px-3 py-2 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((c) => {
              const saved = savedMap[c.code];
              const refRate = referenceRates[c.code];
              const displayRate = saved ? Number(saved.rate) : refRate;
              const isEditing = editing === c.code;

              return (
                <tr key={c.code} className="hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2 font-mono text-xs font-bold text-primary">{c.code}</td>
                  <td className="px-3 py-2 text-foreground">{c.name}</td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{c.symbol}</td>
                  <td className="px-3 py-2 text-right">
                    {isEditing ? (
                      <input
                        className="w-28 rounded border border-primary px-2 py-0.5 text-xs font-mono text-right bg-background focus:outline-none"
                        value={editRate}
                        onChange={(e) => setEditRate(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveRate(c.code)}
                        autoFocus
                      />
                    ) : (
                      <span className={`font-mono text-xs tabular-nums ${saved ? "text-accent" : "text-muted-foreground"}`}>
                        {displayRate ? displayRate.toFixed(4) : "—"}
                        {saved && <span className="ml-1 text-[10px] opacity-60">org</span>}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {isEditing ? (
                      <button
                        onClick={() => saveRate(c.code)}
                        disabled={pending}
                        className="text-primary hover:text-primary/70 transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                    ) : (
                      <button
                        onClick={() => startEdit(c.code)}
                        className="text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Edit2 className="h-3 w-3" strokeWidth={1.5} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Los tipos de cambio personalizados (marcados en ámbar) sobreescriben los valores de referencia.
        En producción se actualizan automáticamente vía ECB o Fixer.
      </p>
    </div>
  );
}
