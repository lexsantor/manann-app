import { notFound } from "next/navigation";
import { Tag } from "lucide-react";
import { getOrgContext, listRates } from "@/lib/erp";
import { formatMoney, formatDate } from "@/lib/erp-format";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable, CellStacked, type Column } from "@/components/ui/data-table";
import { RateFormTrigger, RateEditTrigger } from "@/components/app/rate-form";
import { RateRowActions } from "@/components/app/rate-row-actions";
import { RateCsvImport } from "@/components/app/rate-csv-import";
import { TarifasChart } from "@/components/app/tarifas-chart";
import { cn } from "@/lib/utils";

const SERVICE_LABEL: Record<string, string> = {
  flete: "Flete",
  aduana: "Aduana",
  manipulacion: "Manipulación",
  seguro: "Seguro",
  documentacion: "Documentación",
  almacenaje: "Almacenaje",
  otro: "Otro",
};

// Categoría = etiqueta, no estado: chip neutro consistente (sin color decorativo).
const SERVICE_CHIP = "bg-muted text-muted-foreground";

const UNIT_LABEL: Record<string, string> = {
  contenedor: "contenedor",
  bl: "BL",
  kg: "kg",
  cbm: "CBM",
  unidad: "ud.",
  plano: "precio fijo",
};

type RateRow = Awaited<ReturnType<typeof listRates>>[number];

function vigencia(r: RateRow): string {
  if (r.validFrom && r.validTo) return `${formatDate(r.validFrom)} – ${formatDate(r.validTo)}`;
  if (r.validFrom) return `Desde ${formatDate(r.validFrom)}`;
  if (r.validTo) return `Hasta ${formatDate(r.validTo)}`;
  return "Indefinida";
}

const columns: Column<RateRow>[] = [
  {
    key: "concept",
    header: "Concepto",
    cell: (r) => <CellStacked primary={r.concept} secondary={r.notes ?? undefined} />,
  },
  {
    key: "type",
    header: "Tipo",
    cell: (r) => (
      <span
        className={cn(
          "inline-flex w-fit rounded-md px-2 py-0.5 font-mono text-xs font-medium",
          SERVICE_CHIP,
        )}
      >
        {SERVICE_LABEL[r.serviceType] ?? r.serviceType}
      </span>
    ),
  },
  {
    key: "unit",
    header: "Unidad",
    cell: (r) => <span className="font-mono text-muted-foreground">{UNIT_LABEL[r.unit] ?? r.unit}</span>,
  },
  {
    key: "price",
    header: "Precio base",
    align: "right",
    cell: (r) => (
      <span className="font-mono font-medium tabular-nums text-foreground">{formatMoney(r.basePrice, r.currency)}</span>
    ),
  },
  {
    key: "vigencia",
    header: "Vigencia",
    cell: (r) => <span className="font-mono text-muted-foreground">{vigencia(r)}</span>,
  },
  {
    key: "actions",
    header: "",
    align: "right",
    cell: (r) => (
      <div className="flex items-center justify-end gap-1">
        <RateEditTrigger rate={r} />
        <RateRowActions rateId={r.id} active={r.active} />
      </div>
    ),
  },
];

function RatesTable({ rates, title, muted = false }: { rates: RateRow[]; title: string; muted?: boolean }) {
  return (
    <div>
      <p
        className={cn(
          "mb-2 font-mono text-xs uppercase tracking-wider",
          muted ? "text-muted-foreground/60" : "text-muted-foreground/60",
        )}
      >
        {title}
      </p>
      <DataTable
        className={muted ? "opacity-60" : undefined}
        columns={columns}
        rows={rates}
        getRowKey={(r) => r.id}
      />
    </div>
  );
}

export default async function TarifasPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const rates = await listRates(ctx.org.id);
  const active = rates.filter((r) => r.active);
  const inactive = rates.filter((r) => !r.active);

  const byService = Object.entries(SERVICE_LABEL)
    .map(([type, name]) => ({ name, value: rates.filter((r) => r.serviceType === type).length }))
    .filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finanzas"
        icon={<Tag strokeWidth={1.5} />}
        title="Tarifas"
        subtitle={`${active.length} activas · ${inactive.length} inactivas`}
      />

      {/* Barra de acciones (fuera del hero) */}
      <div className="flex sm:justify-end [&>button]:w-full sm:[&>button]:w-auto">
        <RateFormTrigger />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <p className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground/60">Importar desde CSV</p>
        <RateCsvImport />
      </div>

      {rates.length === 0 ? (
        <EmptyState
          icon={<Tag strokeWidth={1.5} />}
          title="Sin tarifas todavía"
          hint="Crea tu primera tarifa para usarla al generar facturas y cotizaciones."
        />
      ) : (
        <>
          {byService.length > 0 && <TarifasChart data={byService} />}
          <RatesTable rates={active} title="Activas" />
          {inactive.length > 0 && <RatesTable rates={inactive} title="Inactivas" muted />}
        </>
      )}
    </div>
  );
}
