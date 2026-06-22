"use client";

import { useState, useTransition, useRef } from "react";
import { Upload, Check, X, Trash2 } from "lucide-react";
import { importBankLines, reconcileLine, deleteBankLine } from "@/lib/contabilidad-actions";
import { cn } from "@/lib/utils";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DataTable, type Column } from "@/components/ui/data-table";

interface BankLine {
  id: string;
  statementDate: string;
  description: string;
  amount: string;
  currency: string;
  reconciled: boolean;
  journalEntryId: string | null;
}

interface JournalEntryOption {
  id: string;
  reference: string;
  date: string;
  description: string;
}

const fmt = (n: number) =>
  n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function parseCSV(text: string): Array<{ statementDate: string; description: string; amount: number }> {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  // Skip header if present (detect by checking if first field looks like a date)
  const start = /^\d{4}-\d{2}-\d{2}/.test(lines[0] ?? "") ? 0 : 1;
  return lines.slice(start).map((line) => {
    const parts = line.split(/[,;]/).map((p) => p.trim().replace(/^"|"$/g, ""));
    return {
      statementDate: parts[0] ?? "",
      description: parts[1] ?? "",
      amount: parseFloat((parts[2] ?? "0").replace(",", ".")),
    };
  }).filter((l) => l.statementDate && !isNaN(l.amount));
}

export function BankReconciliationPanel({
  lines: initial,
  journalEntries,
}: {
  lines: BankLine[];
  journalEntries: JournalEntryOption[];
}) {
  const [lines, setLines] = useState(initial);
  const [pending, start] = useTransition();
  const [matchingId, setMatchingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "reconciled">("pending");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = typeof ev.target?.result === "string" ? ev.target.result : "";
      if (!text) return;
      const parsed = parseCSV(text);
      if (parsed.length === 0) return;
      start(async () => {
        await importBankLines(parsed);
        setLines((prev) => [
          ...parsed.map((l) => ({
            id: crypto.randomUUID(),
            statementDate: l.statementDate,
            description: l.description,
            amount: String(l.amount),
            currency: "EUR",
            reconciled: false,
            journalEntryId: null,
          })),
          ...prev,
        ]);
      });
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function handleMatch(lineId: string, journalEntryId: string) {
    start(async () => {
      await reconcileLine(lineId, journalEntryId);
      setLines((prev) =>
        prev.map((l) => l.id === lineId ? { ...l, reconciled: true, journalEntryId } : l),
      );
      setMatchingId(null);
    });
  }

  function handleUnmatch(lineId: string) {
    start(async () => {
      await reconcileLine(lineId, null);
      setLines((prev) =>
        prev.map((l) => l.id === lineId ? { ...l, reconciled: false, journalEntryId: null } : l),
      );
    });
  }

  function handleDelete(id: string) {
    start(async () => {
      await deleteBankLine(id);
      setLines((prev) => prev.filter((l) => l.id !== id));
    });
  }

  const filtered = lines.filter((l) => {
    if (filter === "pending") return !l.reconciled;
    if (filter === "reconciled") return l.reconciled;
    return true;
  });

  const pendingCount = lines.filter((l) => !l.reconciled).length;
  const reconciledCount = lines.filter((l) => l.reconciled).length;

  const columns: Column<BankLine>[] = [
    {
      key: "date",
      header: "Fecha",
      cell: (l) => (
        <span className="font-mono text-xs text-muted-foreground">
          {new Date(l.statementDate).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
        </span>
      ),
    },
    {
      key: "description",
      header: "Descripción",
      card: "title",
      cell: (l) => <span className="block max-w-xs truncate text-xs text-foreground">{l.description}</span>,
    },
    {
      key: "amount",
      header: "Importe",
      align: "right",
      cell: (l) => {
        const amount = Number(l.amount);
        return (
          <span className={cn("font-mono text-xs font-medium", amount >= 0 ? "text-success" : "text-destructive")}>
            {amount >= 0 ? "+" : ""}{fmt(amount)} {l.currency}
          </span>
        );
      },
    },
    {
      key: "entry",
      header: "Asiento",
      cell: (l) => {
        const isMatching = matchingId === l.id;
        if (l.reconciled) {
          return (
            <span className="inline-flex items-center gap-1 text-xs text-success">
              <Check className="h-3 w-3" />
              {journalEntries.find((j) => j.id === l.journalEntryId)?.reference ?? "Conciliado"}
            </span>
          );
        }
        if (isMatching) {
          return (
            <Select value="" onValueChange={(v) => { if (v) handleMatch(l.id, v); }}>
              <SelectTrigger className="w-full border-primary px-2 py-0.5 text-xs" aria-label="Seleccionar asiento">
                <SelectValue placeholder="Seleccionar asiento…" />
              </SelectTrigger>
              <SelectContent>
                {journalEntries.map((j) => (
                  <SelectItem key={j.id} value={j.id}>{j.reference} — {j.description}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }
        return <span className="text-xs text-muted-foreground/65">—</span>;
      },
    },
    {
      key: "actions",
      header: "",
      align: "right",
      card: "hidden",
      cell: (l) => {
        const isMatching = matchingId === l.id;
        return (
          <div className="flex items-center justify-end gap-1">
            {l.reconciled ? (
              <button
                onClick={() => handleUnmatch(l.id)}
                disabled={pending}
                aria-label="Deshacer conciliación"
                className="inline-flex items-center justify-center min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 text-muted-foreground hover:text-warning transition-colors"
                title="Deshacer conciliación"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={() => setMatchingId(isMatching ? null : l.id)}
                disabled={pending}
                aria-label={isMatching ? "Cancelar conciliación" : "Conciliar línea"}
                className={cn(
                  "inline-flex items-center justify-center min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 rounded px-2 py-0.5 text-xs font-medium transition-colors",
                  isMatching ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                Conciliar
              </button>
            )}
            <button
              onClick={() => handleDelete(l.id)}
              disabled={pending}
              aria-label="Eliminar línea"
              className="inline-flex items-center justify-center min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Filter tabs */}
        <div className="flex items-center gap-1 rounded-md border border-border bg-muted/30 p-1">
          {(["all", "pending", "reconciled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-current={filter === f ? "true" : undefined}
              className={cn(
                "rounded px-3 py-1 text-xs font-medium transition-colors",
                filter === f ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f === "all" ? `Todas (${lines.length})` : f === "pending" ? `Pendiente (${pendingCount})` : `Conciliado (${reconciledCount})`}
            </button>
          ))}
        </div>

        {/* Import */}
        <div>
          <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFileImport} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
          >
            <Upload className="h-3.5 w-3.5" /> Importar CSV
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Formato CSV: <span className="font-mono">fecha,descripción,importe</span> (positivo = ingreso, negativo = pago). Separador coma o punto y coma.
      </p>

      <DataTable
        columns={columns}
        rows={filtered}
        getRowKey={(l) => l.id}
        empty={lines.length === 0 ? "Importa un extracto bancario para empezar" : "Sin líneas en este filtro"}
        caption="Líneas de extracto bancario"
      />
    </div>
  );
}
