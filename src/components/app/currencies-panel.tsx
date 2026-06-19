"use client";

import { useState, useTransition } from "react";
import { Edit2, Check } from "lucide-react";
import { upsertExchangeRate } from "@/lib/maestros-actions";
import type { MasterCurrency } from "@/lib/master-currencies";
import { DataTable, type Column } from "@/components/ui/data-table";
import { SearchField } from "@/components/ui/search-field";

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

  // COLUMNS dentro del componente: las celdas T/C y acciones leen estado
  // (editing/editRate/savedMap/referenceRates/pending) y handlers vía closure.
  const COLUMNS: Column<MasterCurrency>[] = [
    {
      key: "code",
      header: "Código",
      cell: (c) => <span className="font-mono text-xs font-bold text-primary">{c.code}</span>,
    },
    { key: "name", header: "Divisa", card: "title", cell: (c) => c.name },
    {
      key: "symbol",
      header: "Símbolo",
      card: "hidden",
      cell: (c) => <span className="font-mono text-xs text-muted-foreground">{c.symbol}</span>,
    },
    {
      key: "rate",
      header: "T/C vs EUR",
      align: "right",
      card: "hidden",
      cell: (c) => {
        const saved = savedMap[c.code];
        const refRate = referenceRates[c.code];
        const displayRate = saved ? Number(saved.rate) : refRate;
        const isEditing = editing === c.code;
        return isEditing ? (
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
        );
      },
    },
    {
      key: "actions",
      header: "",
      align: "center",
      card: "hidden",
      cell: (c) => {
        const isEditing = editing === c.code;
        return isEditing ? (
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
        );
      },
    },
  ];

  return (
    <div className="space-y-3">
      <SearchField
        value={q}
        onChange={setQ}
        placeholder="Buscar divisa…"
        className="max-w-xs"
        aria-label="Buscar divisa"
      />

      <DataTable
        columns={COLUMNS}
        rows={filtered}
        getRowKey={(c) => c.code}
        caption="Divisas y tipos de cambio"
        empty="Sin resultados"
      />
      <p className="text-xs text-muted-foreground">
        Los tipos de cambio personalizados (marcados en ámbar) sobreescriben los valores de referencia.
        En producción se actualizan automáticamente vía ECB o Fixer.
      </p>
    </div>
  );
}
