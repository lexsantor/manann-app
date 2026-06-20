"use client";

import { useState, useTransition } from "react";
import { GitCompare, Loader2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { compareDocuments, type CompareResult } from "@/lib/erp-actions";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
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
            <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 font-mono text-base text-success">
              <CheckCircle2 className="size-3" /> Sin discrepancias
            </span>
          )}
          {result && discrepancies.length > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 font-mono text-base text-warning">
              <AlertTriangle className="size-3" /> {discrepancies.length} discrepancia{discrepancies.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={handleCompare} disabled={pending}>
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : <GitCompare className="size-3.5" />}
          {result ? "Volver a comparar" : "Comparar documentos"}
        </Button>
      </div>

      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-base text-destructive">
          <XCircle className="size-3.5" /> {error}
        </p>
      )}

      {!result && !pending && !error && (
        <p className="mt-2 text-base text-muted-foreground/65">
          Pulsa el botón para cruzar los campos del BL con la factura comercial.
        </p>
      )}

      {result && (
        <div className="mt-3 space-y-2">
          {result.discrepancySummary && (
            <div className="rounded-md border border-warning/30 bg-warning/5 px-3 py-2 text-base text-warning">
              {result.discrepancySummary}
            </div>
          )}
          <div className="overflow-x-auto overflow-hidden rounded-xl border border-border/60">
            <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-border/40 bg-surface-2/30 px-3 py-1.5 font-mono text-sm uppercase tracking-wider text-muted-foreground/60">
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
                    ? "bg-warning/5"
                    : "",
                )}
              >
                <span className="text-muted-foreground">{f.label}</span>
                <span className={cn("font-mono", !f.match && f.blValue ? "text-warning font-medium" : "text-foreground")}>
                  {f.blValue ?? <span className="text-muted-foreground/60 italic">—</span>}
                </span>
                <span className={cn("flex items-center gap-1 font-mono", !f.match && f.invoiceValue ? "text-warning font-medium" : "text-foreground")}>
                  {f.invoiceValue ?? <span className="text-muted-foreground/60 italic">—</span>}
                  {!f.match && (f.blValue || f.invoiceValue) && (
                    <AlertTriangle className="size-3 shrink-0 text-warning" />
                  )}
                  {f.match && f.blValue && (
                    <CheckCircle2 className="size-3 shrink-0 text-success/50" />
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
