"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Trash2, Loader2, FileText } from "lucide-react";
import { createInvoice, type CreateInvoiceInput } from "@/lib/erp-actions";
import { formatMoney } from "@/lib/erp-format";
import { cn } from "@/lib/utils";

interface RevenueLine {
  concept: string;
  unitPrice: string;
}

interface GenerarFacturaButtonProps {
  shipmentId: string;
  clientName?: string;
  defaultLines?: RevenueLine[];
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function GenerarFacturaButton({
  shipmentId,
  clientName = "",
  defaultLines = [],
}: GenerarFacturaButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const [client, setClient] = useState(clientName);
  const [clientNif, setClientNif] = useState("");
  const [issueDate, setIssueDate] = useState(today());
  const [dueDate, setDueDate] = useState(addDays(30));
  const [taxRate, setTaxRate] = useState("21");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<{ concept: string; quantity: string; unitPrice: string }[]>(
    defaultLines.length > 0
      ? defaultLines.map((l) => ({ concept: l.concept, quantity: "1", unitPrice: l.unitPrice }))
      : [{ concept: "", quantity: "1", unitPrice: "" }],
  );
  const [error, setError] = useState<string | null>(null);

  function addLine() {
    setLines((prev) => [...prev, { concept: "", quantity: "1", unitPrice: "" }]);
  }

  function removeLine(i: number) {
    setLines((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateLine(i: number, field: string, val: string) {
    setLines((prev) => prev.map((l, idx) => idx === i ? { ...l, [field]: val } : l));
  }

  const subtotal = lines.reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0);
  const taxAmount = subtotal * (Number(taxRate) / 100);
  const total = subtotal + taxAmount;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!client.trim()) { setError("El nombre del cliente es obligatorio."); return; }
    const validLines = lines.filter((l) => l.concept.trim() && Number(l.unitPrice) > 0);
    if (validLines.length === 0) { setError("Añade al menos una línea con concepto e importe."); return; }
    setError(null);

    const input: CreateInvoiceInput = {
      clientName: client.trim(),
      clientNif: clientNif.trim() || undefined,
      issueDate,
      dueDate: dueDate || undefined,
      taxRate,
      currency: "EUR",
      notes: notes.trim() || undefined,
      lines: validLines.map((l) => ({
        concept: l.concept.trim(),
        quantity: l.quantity || "1",
        unitPrice: Number(l.unitPrice).toFixed(2),
        taxRate,
      })),
    };

    startTransition(async () => {
      try {
        const { reference } = await createInvoice(shipmentId, input);
        setOpen(false);
        router.push(`/facturas?created=${encodeURIComponent(reference)}`);
      } catch {
        setError("No se ha podido crear la factura. Inténtalo de nuevo.");
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-base font-medium text-primary hover:bg-primary/15 transition-colors"
      >
        <FileText className="size-3.5" />
        Generar factura
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-start" aria-modal aria-label="Crear factura">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            onClick={() => !pending && setOpen(false)}
          />

          {/* Panel */}
          <div className="relative z-10 flex h-full w-full flex-col overflow-hidden border-l border-border bg-card shadow-2xl sm:w-[520px]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-base font-medium tracking-tight">Nueva factura</h2>
              <button
                onClick={() => !pending && setOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground"
                aria-label="Cerrar"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
              <div className="flex-1 space-y-5 p-5">
                {/* Cliente */}
                <fieldset className="space-y-3">
                  <legend className="font-mono text-base uppercase tracking-wider text-muted-foreground">Cliente</legend>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="mb-1 block text-base text-muted-foreground">Nombre / Razón social</label>
                      <input
                        type="text"
                        value={client}
                        onChange={(e) => setClient(e.target.value)}
                        placeholder="Importaciones García S.L."
                        className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-base text-muted-foreground">NIF / CIF</label>
                      <input
                        type="text"
                        value={clientNif}
                        onChange={(e) => setClientNif(e.target.value)}
                        placeholder="B-12345678"
                        className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-base text-muted-foreground">IVA (%)</label>
                      <select
                        value={taxRate}
                        onChange={(e) => setTaxRate(e.target.value)}
                        className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-base text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="21">21% (general)</option>
                        <option value="10">10% (reducido)</option>
                        <option value="4">4% (superreducido)</option>
                        <option value="0">0% (exportación)</option>
                      </select>
                    </div>
                  </div>
                </fieldset>

                {/* Fechas */}
                <fieldset className="space-y-3">
                  <legend className="font-mono text-base uppercase tracking-wider text-muted-foreground">Fechas</legend>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-base text-muted-foreground">Emisión</label>
                      <input
                        type="date"
                        value={issueDate}
                        onChange={(e) => setIssueDate(e.target.value)}
                        className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-base text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-base text-muted-foreground">Vencimiento</label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-base text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Líneas */}
                <fieldset className="space-y-2">
                  <div className="flex items-center justify-between">
                    <legend className="font-mono text-base uppercase tracking-wider text-muted-foreground">Líneas</legend>
                    <button type="button" onClick={addLine} className="flex items-center gap-1 text-base text-muted-foreground hover:text-foreground">
                      <Plus className="size-3" /> Añadir línea
                    </button>
                  </div>

                  {/* Cabecera de columnas */}
                  <div className="grid grid-cols-[1fr_56px_88px_24px] gap-2 font-mono text-base uppercase tracking-wider text-muted-foreground/60 px-1">
                    <span>Concepto</span>
                    <span className="text-right">Cant.</span>
                    <span className="text-right">Precio</span>
                    <span />
                  </div>

                  {lines.map((l, i) => (
                    <div key={i} className="grid grid-cols-[1fr_56px_88px_24px] items-center gap-2">
                      <input
                        type="text"
                        value={l.concept}
                        onChange={(e) => updateLine(i, "concept", e.target.value)}
                        placeholder="Flete marítimo FCL"
                        className="rounded-md border border-border bg-background px-2 py-1.5 text-base text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <input
                        type="number"
                        min="0.001"
                        step="0.001"
                        value={l.quantity}
                        onChange={(e) => updateLine(i, "quantity", e.target.value)}
                        className="rounded-md border border-border bg-background px-2 py-1.5 text-right font-mono text-base text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={l.unitPrice}
                        onChange={(e) => updateLine(i, "unitPrice", e.target.value)}
                        placeholder="0,00"
                        className="rounded-md border border-border bg-background px-2 py-1.5 text-right font-mono text-base text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => removeLine(i)}
                        disabled={lines.length === 1}
                        className="flex size-6 items-center justify-center rounded text-muted-foreground/40 hover:text-destructive disabled:pointer-events-none"
                        aria-label="Eliminar línea"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))}
                </fieldset>

                {/* Notas */}
                <fieldset>
                  <legend className="mb-1 font-mono text-base uppercase tracking-wider text-muted-foreground">Notas (opcional)</legend>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Condiciones de pago, referencia del cliente..."
                    className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </fieldset>
              </div>

              {/* Footer: totales + botón */}
              <div className="border-t border-border bg-surface-2/30 p-5">
                <div className="mb-4 space-y-1 text-base">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Base imponible</span>
                    <span className="font-mono">{formatMoney(subtotal.toFixed(2))}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>IVA {taxRate}%</span>
                    <span className="font-mono">{formatMoney(taxAmount.toFixed(2))}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-1 font-medium text-foreground">
                    <span>Total</span>
                    <span className="font-mono text-base">{formatMoney(total.toFixed(2))}</span>
                  </div>
                </div>

                {error && <p className="mb-3 text-base text-destructive">{error}</p>}

                <button
                  type="submit"
                  disabled={pending}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-base font-medium transition-colors",
                    "bg-primary text-background hover:bg-primary/90 disabled:opacity-50",
                  )}
                >
                  {pending && <Loader2 className="size-4 animate-spin" />}
                  Crear borrador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
