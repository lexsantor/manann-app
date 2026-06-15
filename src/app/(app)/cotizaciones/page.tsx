import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { getOrgContext, listQuotations, listRates } from "@/lib/erp";
import { formatMoney, formatDate } from "@/lib/erp-format";
import { Icon } from "@/components/icon";
import { GenerarCotizacionButton } from "@/components/app/generar-cotizacion-button";
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
  expirada: "bg-border/30 text-muted-foreground/50",
};

interface PageProps {
  searchParams: Promise<{ created?: string }>;
}

export default async function CotizacionesPage({ searchParams }: PageProps) {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const [quotations, rates] = await Promise.all([
    listQuotations(ctx.org.id),
    listRates(ctx.org.id),
  ]);
  const { created } = await searchParams;

  return (
    <div className="space-y-5 p-5 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Cotizaciones</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{quotations.length} cotizaciones</p>
          </div>
        </div>
        <GenerarCotizacionButton rates={rates} />
      </div>

      {/* Banner de confirmación */}
      {created && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-base text-primary">
          <FileText className="size-4 shrink-0" />
          Cotización <span className="font-mono font-medium">{created}</span> creada como borrador.
        </div>
      )}

      {/* Tabla */}
      {quotations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-20 text-center">
          <Icon icon={FileText} size={32} className="mb-3 text-muted-foreground/30" />
          <p className="text-base font-medium text-muted-foreground">Sin cotizaciones todavía</p>
          <p className="mt-1 text-base text-muted-foreground/60">
            Crea tu primera cotización para un cliente.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div
            className="grid items-center gap-3 border-b border-border/60 px-5 py-2.5 font-mono text-sm uppercase tracking-wider text-muted-foreground/60"
            style={{ gridTemplateColumns: "1fr 140px 120px 100px 100px" }}
          >
            <span>Referencia</span>
            <span>Cliente</span>
            <span>Válida hasta</span>
            <span className="text-right">Total</span>
            <span />
          </div>

          {quotations.map((q) => (
            <div
              key={q.id}
              className="grid items-center gap-3 border-b border-border/50 px-5 py-3 last:border-0 hover:bg-surface-2/40 transition-colors"
              style={{ gridTemplateColumns: "1fr 140px 120px 100px 100px" }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Link href={`/cotizaciones/${q.id}`}
                  className="font-mono text-base font-medium text-foreground hover:text-primary transition-colors">
                  {q.reference}
                </Link>
                <span className={cn(
                  "rounded-full px-2 py-0.5 font-mono text-base font-semibold",
                  STATUS_COLOR[q.status] ?? "bg-border/30 text-muted-foreground",
                )}>
                  {STATUS_LABEL[q.status] ?? q.status}
                </span>
                {q.shipmentId && (
                  <Link href={`/expedientes/${q.shipmentId}`}
                    className="font-mono text-base text-primary/60 hover:text-primary transition-colors">
                    → EXP
                  </Link>
                )}
              </div>
              <span className="truncate text-base text-muted-foreground">{q.clientName || "—"}</span>
              <span className="font-mono text-base text-muted-foreground">
                {q.validUntil ? formatDate(q.validUntil) : "—"}
              </span>
              <span className="text-right font-mono text-base font-medium text-foreground">
                {formatMoney(q.total, q.currency)}
              </span>
              <Link href={`/cotizaciones/${q.id}`}
                className="flex h-7 items-center justify-end font-mono text-base text-primary/60 hover:text-primary transition-colors">
                Ver →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
