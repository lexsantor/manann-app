import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, ExternalLink, Receipt } from "lucide-react";
import { getOrgContext, listInvoices, type InvoiceItem } from "@/lib/erp";
import { formatMoney, formatDate } from "@/lib/erp-format";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, CellStacked, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badges";
import { StatusDonutChart } from "@/components/app/dashboard-charts";

interface PageProps {
  searchParams: Promise<{ created?: string }>;
}

export default async function FacturasPage({ searchParams }: PageProps) {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const invoices = await listInvoices(ctx.org.id);
  const { created } = await searchParams;

  const STATUS_META: Record<string, { label: string; color: string }> = {
    pagada: { label: "Pagada", color: "hsl(var(--success))" },
    enviada: { label: "Enviada", color: "hsl(var(--info))" },
    emitida: { label: "Emitida", color: "hsl(var(--info))" },
    vencida: { label: "Vencida", color: "hsl(var(--warning))" },
    borrador: { label: "Borrador", color: "hsl(var(--muted-foreground))" },
    anulada: { label: "Anulada", color: "hsl(var(--destructive))" },
  };
  const statusCounts = invoices.reduce<Record<string, number>>((acc, inv) => {
    acc[inv.status] = (acc[inv.status] ?? 0) + 1;
    return acc;
  }, {});
  const statusData = ["pagada", "enviada", "emitida", "vencida", "borrador", "anulada"]
    .filter((s) => statusCounts[s])
    .map((s) => ({ name: STATUS_META[s].label, value: statusCounts[s], color: STATUS_META[s].color }));

  const columns: Column<InvoiceItem>[] = [
    {
      key: "reference",
      header: "Referencia",
      cell: (inv) => (
        <CellStacked
          mono
          primary={
            <Link href={`/facturas/${inv.id}`} className="hover:text-primary transition-colors">
              {inv.reference}
            </Link>
          }
        />
      ),
    },
    {
      key: "status",
      header: "Estado",
      cell: (inv) => <StatusBadge status={inv.status} />,
    },
    {
      key: "shipment",
      header: "Expediente",
      cell: (inv) => (
        <Link
          href={`/expedientes/${inv.shipmentId}`}
          className="font-mono text-primary/75 hover:text-primary transition-colors"
        >
          {inv.shipmentRef}
        </Link>
      ),
    },
    {
      key: "issueDate",
      header: "Emisión",
      cell: (inv) => (
        <span className="font-mono text-muted-foreground">
          {inv.issueDate ? formatDate(inv.issueDate) : "—"}
        </span>
      ),
    },
    {
      key: "dueDate",
      header: "Vencimiento",
      cell: (inv) => (
        <span className="font-mono text-muted-foreground">
          {inv.dueDate ? formatDate(inv.dueDate) : "—"}
        </span>
      ),
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      cell: (inv) => (
        <span className="font-mono font-medium tabular-nums text-foreground">
          {formatMoney(inv.total, inv.currency)}
        </span>
      ),
    },
    {
      key: "action",
      header: "",
      align: "right",
      cell: (inv) => (
        <Link
          href={`/expedientes/${inv.shipmentId}`}
          className="inline-flex size-7 items-center justify-center rounded text-muted-foreground/65 hover:text-foreground transition-colors"
          aria-label="Ver expediente"
        >
          <ExternalLink className="size-3.5" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finanzas"
        icon={<Receipt strokeWidth={1.5} />}
        title="Facturación"
        subtitle={`${invoices.length} ${invoices.length === 1 ? "factura" : "facturas"}`}
      />

      {created && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
          <FileText className="size-4 shrink-0" />
          Factura <span className="font-mono font-medium">{created}</span> creada como borrador.
        </div>
      )}

      {statusData.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 sm:max-w-md">
          <p className="mb-3 label-mono text-muted-foreground">Facturas por estado</p>
          <StatusDonutChart data={statusData} />
        </div>
      )}

      <DataTable
        columns={columns}
        rows={invoices}
        getRowKey={(inv) => inv.id}
        empty="Sin facturas todavía. Genera una factura desde el panel de finanzas de un expediente."
      />
    </div>
  );
}
