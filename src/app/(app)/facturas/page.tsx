import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, ExternalLink, Receipt } from "lucide-react";
import { getOrgContext, listInvoices, type InvoiceItem } from "@/lib/erp";
import { formatMoney, formatDate } from "@/lib/erp-format";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, CellStacked, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badges";

interface PageProps {
  searchParams: Promise<{ created?: string }>;
}

export default async function FacturasPage({ searchParams }: PageProps) {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const invoices = await listInvoices(ctx.org.id);
  const { created } = await searchParams;

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
    <div className="space-y-5">
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

      <DataTable
        columns={columns}
        rows={invoices}
        getRowKey={(inv) => inv.id}
        empty="Sin facturas todavía. Genera una factura desde el panel de finanzas de un expediente."
      />
    </div>
  );
}
