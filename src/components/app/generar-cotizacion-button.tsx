"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Plus, Trash2, Tag } from "lucide-react";
import { createQuotation, type CreateQuotationInput } from "@/lib/erp-actions";
import { type RateItem } from "@/lib/erp";
import { cn } from "@/lib/utils";

const UNIT_LABELS: Record<string, string> = {
  contenedor: "contenedor", bl: "BL", kg: "kg",
  cbm: "CBM", unidad: "ud.", plano: "fijo",
};

interface Line {
  concept: string;
  unit: CreateQuotationInput["lines"][number]["unit"];
  quantity: string;
  unitPrice: string;
}

interface GenerarCotizacionButtonProps {
  rates: RateItem[];
}

export function GenerarCotizacionButton({ rates }: GenerarCotizacionButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/15 transition-colors"
      >
        <Plus className="size-4" />
        Nueva cotización
      </button>
      {open && <CotizacionForm rates={rates} onClose={() => setOpen(false)} />}
    </>
  );
}

function CotizacionForm({ rates, onClose }: { rates: RateItem[]; onClose: () => void }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [taxRate, setTaxRate] = useState<"21" | "10" | "4" | "0">("21");
  const [currency, setCurrency] = useState("EUR");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<Line[]>([
    { concept: "", unit: "plano", quantity: "1", unitPrice: "0" },
  ]);
  const [showRates, setShowRates] = useState(false);

  const fmt = (n: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency }).format(n);

  const subtotal = lines.reduce((s, l) => s + Number(l.quantity) * Number(l.unitPrice), 0);
  const tax = subtotal * (Number(taxRate) / 100);
  const total = subtotal + tax;

  function addLine() {
    setLines((ls) => [...ls, { concept: "", unit: "plano", quantity: "1", unitPrice: "0" }]);
  }

  function removeLine(i: number) {
    setLines((ls) => ls.filter((_, idx) => idx !== i));
  }

  function updateLine(i: number, field: keyof Line, value: string) {
    setLines((ls) => ls.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
  }

  function importRate(r: RateItem) {
    setLines((ls) => [
      ...ls,
      { concept: r.concept, unit: r.unit as Line["unit"], quantity: "1", unitPrice: r.basePrice },
    ]);
    setShowRates(false);
  }

  function handleSubmit() {
    if (!clientName.trim()) { setError("El nombre del cliente es obligatorio"); return; }
    if (lines.length === 0) { setError("Añade al menos una línea"); return; }
    if (lines.some((l) => !l.concept.trim())) { setError("Todos los conceptos son obligatorios"); return; }
    setError("");

    const input: CreateQuotationInput = {
      clientName,
      clientEmail: clientEmail || null,
      validUntil: validUntil || null,
      taxRate,
      currency,
      notes: notes || null,
      lines: lines.map((l) => ({
        concept: l.concept,
        unit: l.unit,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
      })),
    };

    startTransition(async () => {
      try {
        const { reference } = await createQuotation(input);
        router.push(`/cotizaciones?created=${reference}`);
        onClose();
      } catch {
        setError("No se pudo crear la cotización");
      }
    });
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[540px] flex-col border-l border-border bg-background shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-base font-semibold text-foreground">Nueva cotización</h2>
          <button onClick={onClose} className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors">
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

          {/* Cliente */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Cliente *</label>
              <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)}
                placeholder="Nombre del cliente"
                className="w-full rounded-md border border-border bg-surface-2/30 px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary transition-colors" />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Email del cliente</label>
              <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)}
                placeholder="cliente@empresa.com"
                className="w-full rounded-md border border-border bg-surface-2/30 px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary transition-colors" />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Válida hasta</label>
              <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)}
                className="w-full rounded-md border border-border bg-surface-2/30 px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary transition-colors" />
            </div>
          </div>

          {/* Líneas */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Líneas *</label>
              <div className="flex items-center gap-2">
                {rates.length > 0 && (
                  <button onClick={() => setShowRates((v) => !v)}
                    className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground border border-border/60 transition-colors">
                    <Tag className="size-3" />
                    Importar tarifa
                  </button>
                )}
                <button onClick={addLine}
                  className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-primary hover:bg-primary/5 transition-colors">
                  <Plus className="size-3" />
                  Añadir línea
                </button>
              </div>
            </div>

            {/* Rate picker */}
            {showRates && (
              <div className="mb-3 rounded-lg border border-border/60 bg-surface-2/20 p-3">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
                  Selecciona una tarifa para importar
                </p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {rates.filter((r) => r.active).map((r) => (
                    <button key={r.id} onClick={() => importRate(r)}
                      className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left hover:bg-primary/5 transition-colors">
                      <span className="text-sm text-foreground">{r.concept}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {new Intl.NumberFormat("es-ES", { style: "currency", currency: r.currency }).format(Number(r.basePrice))} / {UNIT_LABELS[r.unit] ?? r.unit}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cabecera tabla */}
            <div className="grid gap-2 pb-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground/50"
              style={{ gridTemplateColumns: "1fr 70px 90px 90px 28px" }}>
              <span>Concepto</span><span className="text-center">Unidad</span>
              <span className="text-right">Cant.</span><span className="text-right">Precio</span><span />
            </div>

            <div className="space-y-1.5">
              {lines.map((l, i) => (
                <div key={i} className="grid gap-2 items-center" style={{ gridTemplateColumns: "1fr 70px 90px 90px 28px" }}>
                  <input type="text" value={l.concept} onChange={(e) => updateLine(i, "concept", e.target.value)}
                    placeholder="Concepto"
                    className="rounded border border-border bg-surface-2/30 px-2 py-1.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary transition-colors" />
                  <select value={l.unit} onChange={(e) => updateLine(i, "unit", e.target.value)}
                    className="rounded border border-border bg-surface-2/30 px-1.5 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary transition-colors">
                    {Object.entries(UNIT_LABELS).map(([v, label]) => (
                      <option key={v} value={v}>{label}</option>
                    ))}
                  </select>
                  <input type="number" value={l.quantity} onChange={(e) => updateLine(i, "quantity", e.target.value)}
                    min="0" step="1"
                    className="rounded border border-border bg-surface-2/30 px-2 py-1.5 text-right text-sm text-foreground outline-none focus:ring-1 focus:ring-primary transition-colors" />
                  <input type="number" value={l.unitPrice} onChange={(e) => updateLine(i, "unitPrice", e.target.value)}
                    min="0" step="0.01"
                    className="rounded border border-border bg-surface-2/30 px-2 py-1.5 text-right text-sm text-foreground outline-none focus:ring-1 focus:ring-primary transition-colors" />
                  <button onClick={() => removeLine(i)} disabled={lines.length === 1}
                    className="flex size-7 items-center justify-center rounded text-muted-foreground/30 hover:text-destructive transition-colors disabled:pointer-events-none">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* IVA + Moneda + Totales */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">IVA</label>
              <select value={taxRate} onChange={(e) => setTaxRate(e.target.value as typeof taxRate)}
                className="w-full rounded-md border border-border bg-surface-2/30 px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary transition-colors">
                <option value="21">21%</option><option value="10">10%</option>
                <option value="4">4%</option><option value="0">0%</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Moneda</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-md border border-border bg-surface-2/30 px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary transition-colors">
                <option value="EUR">EUR</option><option value="USD">USD</option><option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          {/* Resumen totales */}
          <div className="rounded-lg border border-border/50 bg-surface-2/20 px-4 py-3 space-y-1">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Base imponible</span><span className="font-mono">{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>IVA {taxRate}%</span><span className="font-mono">{fmt(tax)}</span>
            </div>
            <div className="flex justify-between border-t border-border/40 pt-1.5 font-semibold text-foreground">
              <span>Total estimado</span><span className="font-mono">{fmt(total)}</span>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Notas</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              placeholder="Condiciones, exclusiones, notas para el cliente..."
              className="w-full resize-none rounded-md border border-border bg-surface-2/30 px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary transition-colors" />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-5 py-4 flex items-center justify-end gap-3">
          <button onClick={onClose}
            className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={pending}
            className="flex items-center gap-1.5 rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/15 transition-colors disabled:opacity-50">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Crear cotización
          </button>
        </div>
      </div>
    </>
  );
}
