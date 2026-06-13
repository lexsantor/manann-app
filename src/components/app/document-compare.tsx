"use client";

import { useState, useTransition } from "react";
import { GitCompare, Loader2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { compareDocuments, type CompareResult } from "@/lib/erp-actions";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

interface DocumentCompareProps {
  shipmentId: string;
  hasBl: boolean;
  hasFactura: boolean;
}

const FIELD_LABELS: Record<keyof Omit<CompareResult, "discrepancySummary">, string> = {
  shipper: "Exportador / Shipper",
  consignee: "Importador / Consignee",
  description: "Descripción mercancía",
  hsCode: "Código HS",
  grossWeight: "Peso bruto",
  quantity: "Cantidad / Bultos",
  country: "País de origen",
  incoterm: "Incoterm",
};

export function DocumentCompare({ shipmentId, hasBl, hasFactura }: DocumentCompareProps) {
  const [result, setResult] = useState<CompareResult | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  if (!hasBl || !hasFactura) return null;

  function handleCompare() {
    setError("");
    setResult(null);
    startTransition(async () => {
      try {
        const r = await compareDocuments(shipmentId);
        setResult(r);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al comparar documentos");
      }
    });
  }

  const fields = result
    ? (Object.keys(FIELD_LABELS) as (keyof typeof FIELD_LABELS)[]).map((key) => ({
        key,
        label: FIELD_LABELS[key],
        ...result[key],
      }))
    : [];

  const discrepancies = fields.filter((f) => !f.match && (f.blValue || f.invoiceValue));

  return (
    <div className="mt-4 border-t border-border/60 pt-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon icon={GitCompare} size={14} className="text-muted-foreground" />
          <span className="font-mono text-base text-muted-foreground">
            Comparativa IA: BL vs. Factura comercial
          </span>
          {result && discrepancies.length === 0 && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-base text-emerald-400">
              <CheckCircle2 className="size-3" /> Sin discrepancias
            </span>
          )}
          {result && discrepancies.length > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 font-mono text-base text-amber-500">
              <AlertTriangle className="size-3" /> {discrepancies.length} discrepancia{discrepancies.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <button
          onClick={handleCompare}
          disabled={pending}
          className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-base text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors disabled:opacity-50"
        >
          {pending ? <Loader2 className="size-3 animate-spin" /> : <GitCompare className="size-3" />}
          {result ? "Volver a comparar" : "Comparar documentos"}
        </button>
      </div>

      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-base text-destructive">
          <XCircle className="size-3.5" /> {error}
        </p>
      )}

      {!result && !pending && !error && (
        <p className="mt-2 text-base text-muted-foreground/50">
          Pulsa el botón para cruzar los campos del BL con la factura comercial.
        </p>
      )}

      {result && (
        <div className="mt-3 space-y-2">
          {result.discrepancySummary && (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-base text-amber-600 dark:text-amber-400">
              {result.discrepancySummary}
            </div>
          )}
          <div className="overflow-x-auto overflow-hidden rounded-lg border border-border/60">
            <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-border/40 bg-surface-2/30 px-3 py-1.5 font-mono text-base uppercase tracking-wider text-muted-foreground/60">
              <span>Campo</span>
              <span>BL</span>
              <span>Factura</span>
            </div>
            {fields.map((f) => (
              <div
                key={f.key}
                className={cn(
                  "grid grid-cols-[1fr_1fr_1fr] border-b border-border/30 px-3 py-2 text-base last:border-0",
                  !f.match && (f.blValue || f.invoiceValue)
                    ? "bg-amber-500/5"
                    : "",
                )}
              >
                <span className="text-muted-foreground">{f.label}</span>
                <span className={cn("font-mono", !f.match && f.blValue ? "text-amber-600 dark:text-amber-400 font-medium" : "text-foreground")}>
                  {f.blValue ?? <span className="text-muted-foreground/40 italic">—</span>}
                </span>
                <span className={cn("flex items-center gap-1 font-mono", !f.match && f.invoiceValue ? "text-amber-600 dark:text-amber-400 font-medium" : "text-foreground")}>
                  {f.invoiceValue ?? <span className="text-muted-foreground/40 italic">—</span>}
                  {!f.match && (f.blValue || f.invoiceValue) && (
                    <AlertTriangle className="size-3 shrink-0 text-amber-500" />
                  )}
                  {f.match && f.blValue && (
                    <CheckCircle2 className="size-3 shrink-0 text-emerald-500/50" />
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
