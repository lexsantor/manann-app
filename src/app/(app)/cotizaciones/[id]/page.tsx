import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getOrgContext, getQuotationDetail } from "@/lib/erp";
import { formatMoney, formatDate } from "@/lib/erp-format";
import { CotizacionActions } from "@/components/app/cotizacion-actions";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  borrador: "Borrador",
  enviada: "Enviada",
  aceptada: "Aceptada",
  rechazada: "Rechazada",
  expirada: "Expirada",
};

const STATUS_COLOR: Record<string, string> = {
  borrador: "bg-border/40 text-muted-foreground",
  enviada: "bg-blue-500/10 text-blue-400",
  aceptada: "bg-emerald-500/10 text-emerald-400",
  rechazada: "bg-red-500/10 text-red-400",
  expirada: "bg-border/30 text-muted-foreground/65 line-through",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CotizacionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const quot = await getQuotationDetail(ctx.org.id, id);
  if (!quot) notFound();

  const taxAmount = Number(quot.total) - Number(quot.subtotal);

  return (
    <div className="min-h-full">
      {/* Barra de acciones */}
      <div className="print:hidden sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-3">
          <Link href="/cotizaciones"
            className="flex items-center gap-1.5 text-base text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" />
            Cotizaciones
          </Link>
          <div className="flex items-center gap-3">
            <span className={cn(
              "rounded-full px-2.5 py-0.5 font-mono text-base font-semibold",
              STATUS_COLOR[quot.status] ?? "bg-border/30 text-muted-foreground",
            )}>
              {STATUS_LABEL[quot.status] ?? quot.status}
            </span>
            <CotizacionActions
              quotationId={quot.id}
              status={quot.status}
              clientEmail={quot.clientEmail}
              shipmentId={quot.shipmentId}
            />
          </div>
        </div>
      </div>

      {/* Documento */}
      <div className="mx-auto max-w-4xl print:px-0 print:py-0">
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm print:rounded-none print:border-0 print:shadow-none print:p-0">

          {/* Cabecera */}
          <div className="flex items-start justify-between gap-6 pb-8 border-b border-border/60 print:pb-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="block size-5 rotate-45 rounded-[4px] shrink-0"
                  style={{ background: "linear-gradient(135deg, hsl(172 51% 42%), hsl(185 55% 62%))" }} />
                <span className="font-display text-lg font-semibold tracking-tight">{ctx.org.name}</span>
              </div>
              <p className="text-base text-muted-foreground">Valencia, España</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">Cotización</p>
              <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground">{quot.reference}</p>
              <span className={cn(
                "mt-1.5 inline-block rounded-full px-2 py-0.5 font-mono text-base font-semibold print:hidden",
                STATUS_COLOR[quot.status],
              )}>
                {STATUS_LABEL[quot.status]}
              </span>
            </div>
          </div>

          {/* Cliente + vigencia */}
          <div className="grid grid-cols-2 gap-6 py-6 border-b border-border/40">
            <div>
              <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground mb-2">Dirigido a</p>
              <p className="font-medium text-foreground">{quot.clientName || "—"}</p>
              {quot.clientEmail && (
                <p className="mt-0.5 font-mono text-base text-muted-foreground">{quot.clientEmail}</p>
              )}
            </div>
            <div className="text-right space-y-2">
              {quot.validUntil && (
                <div>
                  <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">Válida hasta</p>
                  <p className="mt-0.5 font-mono text-base text-foreground">{formatDate(quot.validUntil)}</p>
                </div>
              )}
              {quot.shipmentId && (
                <div>
                  <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">Expediente</p>
                  <Link href={`/expedientes/${quot.shipmentId}`}
                    className="mt-0.5 font-mono text-base text-primary/75 hover:text-primary print:text-foreground print:no-underline">
                    Ver expediente →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Líneas */}
          <div className="py-6">
            <div className="grid gap-3 pb-2 font-mono text-sm uppercase tracking-wider text-muted-foreground/60 border-b border-border/40"
              style={{ gridTemplateColumns: "1fr 72px 100px 100px" }}>
              <span>Concepto</span>
              <span className="text-right">Cant.</span>
              <span className="text-right">Precio ud.</span>
              <span className="text-right">Subtotal</span>
            </div>
            {quot.lines.map((line) => (
              <div key={line.id} className="grid gap-3 border-b border-border/30 py-3 last:border-0"
                style={{ gridTemplateColumns: "1fr 72px 100px 100px" }}>
                <div>
                  <span className="text-base text-foreground">{line.concept}</span>
                  <span className="ml-2 font-mono text-base text-muted-foreground/65">
                    / {line.unit}
                  </span>
                </div>
                <span className="text-right font-mono text-base text-muted-foreground">{line.quantity}</span>
                <span className="text-right font-mono text-base text-muted-foreground">
                  {formatMoney(line.unitPrice, quot.currency)}
                </span>
                <span className="text-right font-mono text-base text-foreground">
                  {formatMoney(line.subtotal, quot.currency)}
                </span>
              </div>
            ))}
          </div>

          {/* Totales */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-base text-muted-foreground">
                <span>Base imponible</span>
                <span className="font-mono">{formatMoney(quot.subtotal, quot.currency)}</span>
              </div>
              <div className="flex justify-between text-base text-muted-foreground">
                <span>IVA {quot.taxRate}%</span>
                <span className="font-mono">{formatMoney(taxAmount.toFixed(2), quot.currency)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-semibold text-foreground">
                <span>Total estimado</span>
                <span className="font-mono text-lg">{formatMoney(quot.total, quot.currency)}</span>
              </div>
            </div>
          </div>

          {/* Notas */}
          {quot.notes && (
            <div className="mt-8 rounded-lg border border-border/40 bg-surface-2/30 p-4">
              <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground mb-1.5">Notas</p>
              <p className="text-base text-muted-foreground whitespace-pre-line">{quot.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-10 border-t border-border/30 pt-4 text-center">
            <p className="font-mono text-base text-muted-foreground/60">
              {ctx.org.name} · {quot.reference} · Generado con Manann ERP
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
