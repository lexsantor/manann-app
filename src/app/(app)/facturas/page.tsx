import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, ExternalLink } from "lucide-react";
import { getOrgContext, listInvoices } from "@/lib/erp";
import { formatMoney, formatDate } from "@/lib/erp-format";
import { Icon } from "@/components/icon";
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
  anulada: "bg-border/30 text-muted-foreground/50",
};

interface PageProps {
  searchParams: Promise<{ created?: string }>;
}

export default async function FacturasPage({ searchParams }: PageProps) {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const invoices = await listInvoices(ctx.org.id);
  const { created } = await searchParams;

  return (
    <div className="space-y-5 p-5 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">Facturación</h1>
          <p className="mt-0.5 text-base text-muted-foreground">{invoices.length} facturas</p>
        </div>
      </div>

      {/* Banner de confirmación */}
      {created && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-base text-primary">
          <FileText className="size-4 shrink-0" />
          Factura <span className="font-mono font-medium">{created}</span> creada como borrador.
        </div>
      )}

      {/* Tabla */}
      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-20 text-center">
          <Icon icon={FileText} size={32} className="mb-3 text-muted-foreground/30" />
          <p className="text-base font-medium text-muted-foreground">Sin facturas todavía</p>
          <p className="mt-1 text-base text-muted-foreground/60">
            Genera una factura desde el panel de finanzas de un expediente.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {/* Cabecera */}
          <div
            className="grid items-center gap-3 border-b border-border/60 px-5 py-2.5 font-mono text-sm uppercase tracking-wider text-muted-foreground/60"
            style={{ gridTemplateColumns: "1fr 120px 100px 100px 100px 32px" }}
          >
            <span>Referencia</span>
            <span>Expediente</span>
            <span>Emisión</span>
            <span>Vencimiento</span>
            <span className="text-right">Total</span>
            <span />
          </div>

          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="grid items-center gap-3 border-b border-border/50 px-5 py-3 last:border-0 hover:bg-surface-2/40 transition-colors"
              style={{ gridTemplateColumns: "1fr 120px 100px 100px 100px 32px" }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Link href={`/facturas/${inv.id}`} className="font-mono text-base font-medium text-foreground hover:text-primary transition-colors">
                  {inv.reference}
                </Link>
                <span className={cn(
                  "rounded-full px-2 py-0.5 font-mono text-base font-semibold",
                  STATUS_COLOR[inv.status] ?? "bg-border/30 text-muted-foreground",
                )}>
                  {STATUS_LABEL[inv.status] ?? inv.status}
                </span>
              </div>
              <Link
                href={`/expedientes/${inv.shipmentId}`}
                className="font-mono text-base text-primary/75 hover:text-primary truncate"
              >
                {inv.shipmentRef}
              </Link>
              <span className="font-mono text-base text-muted-foreground">
                {inv.issueDate ? formatDate(inv.issueDate) : "—"}
              </span>
              <span className="font-mono text-base text-muted-foreground">
                {inv.dueDate ? formatDate(inv.dueDate) : "—"}
              </span>
              <span className="text-right font-mono text-base font-medium text-foreground">
                {formatMoney(inv.total, inv.currency)}
              </span>
              <Link
                href={`/expedientes/${inv.shipmentId}`}
                className="flex size-7 items-center justify-center rounded text-muted-foreground/40 hover:text-foreground"
                aria-label="Ver expediente"
              >
                <ExternalLink className="size-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
