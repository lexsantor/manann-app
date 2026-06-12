import { notFound } from "next/navigation";
import { Tag } from "lucide-react";
import { getOrgContext, listRates } from "@/lib/erp";
import { formatMoney, formatDate } from "@/lib/erp-format";
import { Icon } from "@/components/icon";
import { RateFormTrigger, RateEditTrigger } from "@/components/app/rate-form";
import { RateRowActions } from "@/components/app/rate-row-actions";
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

const SERVICE_COLOR: Record<string, string> = {
  flete: "bg-blue-500/10 text-blue-400",
  aduana: "bg-amber-500/10 text-amber-400",
  manipulacion: "bg-violet-500/10 text-violet-400",
  seguro: "bg-emerald-500/10 text-emerald-400",
  documentacion: "bg-primary/10 text-primary",
  almacenaje: "bg-orange-500/10 text-orange-400",
  otro: "bg-border/40 text-muted-foreground",
};

const UNIT_LABEL: Record<string, string> = {
  contenedor: "contenedor",
  bl: "BL",
  kg: "kg",
  cbm: "CBM",
  unidad: "ud.",
  plano: "precio fijo",
};

export default async function TarifasPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const rates = await listRates(ctx.org.id);
  const active = rates.filter((r) => r.active);
  const inactive = rates.filter((r) => !r.active);

  return (
    <div className="space-y-5 p-5 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">
            Tarifas
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {active.length} activas · {inactive.length} inactivas
          </p>
        </div>
        <RateFormTrigger />
      </div>

      {rates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-20 text-center">
          <Icon icon={Tag} size={32} className="mb-3 text-muted-foreground/30" />
          <p className="text-sm font-medium text-muted-foreground">Sin tarifas todavía</p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Crea tu primer tarifa para usarla al generar facturas y cotizaciones.
          </p>
        </div>
      ) : (
        <>
          <RatesTable rates={active} title="Activas" />
          {inactive.length > 0 && <RatesTable rates={inactive} title="Inactivas" muted />}
        </>
      )}
    </div>
  );
}

type RateRow = Awaited<ReturnType<typeof listRates>>[number];

function RatesTable({
  rates,
  title,
  muted = false,
}: {
  rates: RateRow[];
  title: string;
  muted?: boolean;
}) {
  return (
    <div>
      <p className={cn(
        "mb-2 font-mono text-[10px] uppercase tracking-wider",
        muted ? "text-muted-foreground/40" : "text-muted-foreground/60",
      )}>
        {title}
      </p>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {/* Cabecera */}
        <div
          className="grid items-center gap-3 border-b border-border/60 px-5 py-2.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60"
          style={{ gridTemplateColumns: "1fr 110px 120px 110px 110px 90px 32px" }}
        >
          <span>Concepto</span>
          <span>Tipo</span>
          <span>Unidad</span>
          <span className="text-right">Precio base</span>
          <span>Vigencia</span>
          <span />
          <span />
        </div>

        {rates.map((r) => (
          <div
            key={r.id}
            className={cn(
              "grid items-center gap-3 border-b border-border/50 px-5 py-3 last:border-0 transition-colors",
              r.active ? "hover:bg-surface-2/40" : "opacity-50",
            )}
            style={{ gridTemplateColumns: "1fr 110px 120px 110px 110px 90px 32px" }}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{r.concept}</p>
              {r.notes && (
                <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground/60">
                  {r.notes}
                </p>
              )}
            </div>

            <span className={cn(
              "w-fit rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold",
              SERVICE_COLOR[r.serviceType] ?? "bg-border/30 text-muted-foreground",
            )}>
              {SERVICE_LABEL[r.serviceType] ?? r.serviceType}
            </span>

            <span className="font-mono text-xs text-muted-foreground">
              {UNIT_LABEL[r.unit] ?? r.unit}
            </span>

            <span className="text-right font-mono text-sm font-medium text-foreground">
              {formatMoney(r.basePrice, r.currency)}
            </span>

            <span className="font-mono text-xs text-muted-foreground">
              {r.validFrom && r.validTo
                ? `${formatDate(r.validFrom)} – ${formatDate(r.validTo)}`
                : r.validFrom
                  ? `Desde ${formatDate(r.validFrom)}`
                  : r.validTo
                    ? `Hasta ${formatDate(r.validTo)}`
                    : "Indefinida"}
            </span>

            <RateEditTrigger rate={r} />

            <RateRowActions rateId={r.id} active={r.active} />
          </div>
        ))}
      </div>
    </div>
  );
}
