import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getOrgContext, getInvoiceDetail } from "@/lib/erp";
import { formatMoney, formatDate } from "@/lib/erp-format";
import { FacturaActions } from "@/components/app/factura-actions";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  borrador: "Borrador",
  emitida: "Emitida",
  enviada: "Enviada",
  pagada: "Pagada",
  vencida: "Vencida",
  anulada: "Anulada",
};

const STATUS_COLOR: Record<string, string> = {
  borrador: "bg-border/40 text-muted-foreground",
  emitida: "bg-primary/10 text-primary",
  enviada: "bg-blue-500/10 text-blue-400",
  pagada: "bg-emerald-500/10 text-emerald-400",
  vencida: "bg-red-500/10 text-red-400",
  anulada: "bg-border/30 text-muted-foreground/50 line-through",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FacturaDetailPage({ params }: PageProps) {
  const { id } = await params;
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const inv = await getInvoiceDetail(ctx.org.id, id);
  if (!inv) notFound();

  const taxAmount = Number(inv.total) - Number(inv.subtotal);

  return (
    <div className="min-h-full">
      {/* Barra de acciones — oculta al imprimir */}
      <div className="print:hidden sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-3">
          <Link
            href="/facturas"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Facturas
          </Link>

          <div className="flex items-center gap-3">
            <span className={cn(
              "rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold",
              STATUS_COLOR[inv.status] ?? "bg-border/30 text-muted-foreground",
            )}>
              {STATUS_LABEL[inv.status] ?? inv.status}
            </span>
            <FacturaActions invoiceId={inv.id} status={inv.status} />
          </div>
        </div>
      </div>

      {/* Documento de factura */}
      <div className="mx-auto max-w-4xl px-5 py-8 print:px-0 print:py-0">
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm print:rounded-none print:border-0 print:shadow-none print:p-0">

          {/* Cabecera */}
          <div className="flex items-start justify-between gap-6 pb-8 border-b border-border/60 print:pb-6">
            {/* Emisor */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="block size-5 rotate-45 rounded-[4px] shrink-0"
                  style={{ background: "linear-gradient(135deg, hsl(172 51% 42%), hsl(185 55% 62%))" }}
                />
                <span className="font-display text-lg font-semibold tracking-tight">{ctx.org.name}</span>
              </div>
              <p className="text-sm text-muted-foreground">Valencia, España</p>
            </div>

            {/* Número e identificador */}
            <div className="text-right">
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Factura</p>
              <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground">{inv.reference}</p>
              <span className={cn(
                "mt-1.5 inline-block rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold print:hidden",
                STATUS_COLOR[inv.status],
              )}>
                {STATUS_LABEL[inv.status]}
              </span>
            </div>
          </div>

          {/* Datos cliente + fechas */}
          <div className="grid grid-cols-2 gap-6 py-6 border-b border-border/40">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Facturado a</p>
              <p className="font-medium text-foreground">{inv.clientName || "—"}</p>
              {inv.clientNif && (
                <p className="mt-0.5 font-mono text-sm text-muted-foreground">{inv.clientNif}</p>
              )}
            </div>
            <div className="text-right space-y-2">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Fecha de emisión</p>
                <p className="mt-0.5 font-mono text-sm text-foreground">{formatDate(inv.issueDate)}</p>
              </div>
              {inv.dueDate && (
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Fecha de vencimiento</p>
                  <p className="mt-0.5 font-mono text-sm text-foreground">{formatDate(inv.dueDate)}</p>
                </div>
              )}
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Expediente</p>
                <Link
                  href={`/expedientes/${inv.shipment.id}`}
                  className="mt-0.5 font-mono text-sm text-primary/75 hover:text-primary print:text-foreground print:no-underline"
                >
                  {inv.shipment.reference}
                </Link>
              </div>
            </div>
          </div>

          {/* Líneas */}
          <div className="py-6">
            {/* Cabecera tabla */}
            <div
              className="grid gap-3 pb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60 border-b border-border/40"
              style={{ gridTemplateColumns: "1fr 72px 100px 100px" }}
            >
              <span>Concepto</span>
              <span className="text-right">Cant.</span>
              <span className="text-right">Precio ud.</span>
              <span className="text-right">Subtotal</span>
            </div>

            {inv.lines.map((line) => (
              <div
                key={line.id}
                className="grid gap-3 border-b border-border/30 py-3 last:border-0"
                style={{ gridTemplateColumns: "1fr 72px 100px 100px" }}
              >
                <span className="text-sm text-foreground">{line.concept}</span>
                <span className="text-right font-mono text-sm text-muted-foreground">{line.quantity}</span>
                <span className="text-right font-mono text-sm text-muted-foreground">
                  {formatMoney(line.unitPrice, inv.currency)}
                </span>
                <span className="text-right font-mono text-sm text-foreground">
                  {formatMoney(line.subtotal, inv.currency)}
                </span>
              </div>
            ))}
          </div>

          {/* Totales */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Base imponible</span>
                <span className="font-mono">{formatMoney(inv.subtotal, inv.currency)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>IVA {inv.taxRate}%</span>
                <span className="font-mono">{formatMoney(taxAmount.toFixed(2), inv.currency)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-semibold text-foreground">
                <span>Total</span>
                <span className="font-mono text-lg">{formatMoney(inv.total, inv.currency)}</span>
              </div>
            </div>
          </div>

          {/* Notas */}
          {inv.notes && (
            <div className="mt-8 rounded-lg border border-border/40 bg-surface-2/30 p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Notas</p>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{inv.notes}</p>
            </div>
          )}

          {/* Footer legal */}
          <div className="mt-10 border-t border-border/30 pt-4 text-center">
            <p className="font-mono text-[10px] text-muted-foreground/40">
              {ctx.org.name} · {inv.reference} · Generado con Manann ERP
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
