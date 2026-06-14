"use client";

import { useState } from "react";
import { ScrollText, ChevronDown, ChevronUp } from "lucide-react";
import { Icon } from "@/components/icon";
import { CrearAsientoButton } from "@/components/app/crear-asiento-button";
import { cn } from "@/lib/utils";

function fmt(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(n);
}

function formatDate(d: string | Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const STATUS_COLOR: Record<string, string> = {
  borrador: "text-muted-foreground bg-muted/60",
  contabilizado: "text-emerald-400 bg-emerald-500/10",
  anulado: "text-accent/60 bg-accent/10",
};
const STATUS_LABEL: Record<string, string> = {
  borrador: "Borrador",
  contabilizado: "Contabilizado",
  anulado: "Anulado",
};

interface JournalLine {
  id: string;
  accountCode: string;
  accountName: string;
  debit: string | number;
  credit: string | number;
  description: string | null;
  sortOrder: number;
}

interface JournalEntry {
  id: string;
  reference: string;
  date: string | Date | null;
  description: string;
  period: string;
  status: string;
  invoiceId: string | null;
  lines: JournalLine[];
  totalDebit: number;
}

interface AccountRow {
  id: string;
  code: string;
  name: string;
  type: string;
}

interface DiarioContableProps {
  entries: JournalEntry[];
  accounts: AccountRow[];
}

function EntryRow({ entry }: { entry: JournalEntry }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("border-b border-border/50 last:border-0")}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-2/40 transition-colors"
      >
        <div className="min-w-0 flex-1 grid grid-cols-[80px_1fr_90px_100px_80px] items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground">{formatDate(entry.date)}</span>
          <span className="truncate text-sm text-foreground">{entry.description}</span>
          <span className="font-mono text-xs text-muted-foreground">{entry.period}</span>
          <span className="text-right font-mono text-sm text-foreground">{fmt(entry.totalDebit)}</span>
          <span className={cn("rounded-full px-1.5 py-0.5 font-mono text-[10px] text-center", STATUS_COLOR[entry.status] ?? "text-muted-foreground bg-muted/60")}>
            {STATUS_LABEL[entry.status] ?? entry.status}
          </span>
        </div>
        <Icon icon={open ? ChevronUp : ChevronDown} size={12} className="shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="border-t border-border/30 bg-surface-2/20 px-4 pb-3 pt-2">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
            Ref: {entry.reference}
          </p>
          <div className="overflow-hidden rounded-md border border-border/50">
            <div className="grid grid-cols-[40px_1fr_100px_100px] gap-2 border-b border-border/50 bg-surface-2/40 px-3 py-1.5">
              {["Cta.", "Concepto", "Debe", "Haber"].map((h) => (
                <span key={h} className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">{h}</span>
              ))}
            </div>
            {entry.lines.map((l) => (
              <div key={l.id} className="grid grid-cols-[40px_1fr_100px_100px] gap-2 border-b border-border/30 px-3 py-2 last:border-0">
                <span className="font-mono text-xs font-medium text-foreground">{l.accountCode}</span>
                <span className="text-xs text-muted-foreground">{l.accountName}{l.description ? ` — ${l.description}` : ""}</span>
                <span className="text-right font-mono text-xs text-foreground">
                  {Number(l.debit) > 0 ? fmt(Number(l.debit)) : ""}
                </span>
                <span className="text-right font-mono text-xs text-muted-foreground">
                  {Number(l.credit) > 0 ? fmt(Number(l.credit)) : ""}
                </span>
              </div>
            ))}
            <div className="grid grid-cols-[40px_1fr_100px_100px] gap-2 border-t border-border/60 bg-surface-2/60 px-3 py-1.5">
              <span />
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">Total</span>
              <span className="text-right font-mono text-xs font-semibold text-foreground">{fmt(entry.totalDebit)}</span>
              <span className="text-right font-mono text-xs font-semibold text-muted-foreground">{fmt(entry.totalDebit)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function DiarioContable({ entries, accounts }: DiarioContableProps) {
  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Icon icon={ScrollText} size={14} className="text-muted-foreground" />
          <span className="font-display text-sm font-medium text-foreground">Diario contable</span>
          <span className="font-mono text-xs text-muted-foreground">({entries.length})</span>
        </div>
        <CrearAsientoButton accounts={accounts} />
      </div>

      {/* Column headers */}
      {entries.length > 0 && (
        <div className="hidden grid-cols-[80px_1fr_90px_100px_80px] gap-3 border-b border-border/50 px-4 py-2 sm:grid">
          {["Fecha", "Descripción", "Período", "Importe", "Estado"].map((h) => (
            <span key={h} className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{h}</span>
          ))}
        </div>
      )}

      {entries.length === 0 ? (
        <div className="px-5 py-14 text-center">
          <p className="text-sm text-muted-foreground">
            Sin asientos. Los asientos se generan automáticamente al emitir facturas.
          </p>
        </div>
      ) : (
        <div>
          {entries.map((e) => (
            <EntryRow key={e.id} entry={e} />
          ))}
        </div>
      )}
    </section>
  );
}
