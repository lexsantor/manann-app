import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { getOrgContext, listQuotations, listRates, type QuotationItem } from "@/lib/erp";
import { formatMoney, formatDate } from "@/lib/erp-format";
import { GenerarCotizacionButton } from "@/components/app/generar-cotizacion-button";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, CellStacked, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badges";

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

  const columns: Column<QuotationItem>[] = [
    {
      key: "reference",
      header: "Referencia",
      cell: (q) => (
        <CellStacked
          mono
          primary={
            <Link href={`/cotizaciones/${q.id}`} className="hover:text-primary transition-colors">
              {q.reference}
            </Link>
          }
          secondary={q.notes ?? undefined}
        />
      ),
    },
    {
      key: "status",
      header: "Estado",
      cell: (q) => <StatusBadge status={q.status} />,
    },
    {
      key: "client",
      header: "Cliente",
      cell: (q) => <span className="text-muted-foreground">{q.clientName || "—"}</span>,
    },
    {
      key: "validUntil",
      header: "Válida hasta",
      cell: (q) => (
        <span className="font-mono text-muted-foreground">
          {q.validUntil ? formatDate(q.validUntil) : "—"}
        </span>
      ),
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      cell: (q) => (
        <span className="font-mono font-medium tabular-nums text-foreground">
          {formatMoney(q.total, q.currency)}
        </span>
      ),
    },
    {
      key: "action",
      header: "",
      align: "right",
      cell: (q) => (
        <Link
          href={`/cotizaciones/${q.id}`}
          className="font-mono text-xs text-primary/70 hover:text-primary transition-colors"
        >
          Ver →
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Comercial"
        icon={<FileText strokeWidth={1.5} />}
        title="Cotizaciones"
        subtitle={`${quotations.length} ${quotations.length === 1 ? "cotización" : "cotizaciones"}`}
        actions={<GenerarCotizacionButton rates={rates} />}
      />

      {created && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
          <FileText className="size-4 shrink-0" />
          Cotización <span className="font-mono font-medium">{created}</span> creada como borrador.
        </div>
      )}

      <DataTable
        columns={columns}
        rows={quotations}
        getRowKey={(q) => q.id}
        empty="Sin cotizaciones todavía. Crea tu primera cotización para un cliente."
      />
    </div>
  );
}
