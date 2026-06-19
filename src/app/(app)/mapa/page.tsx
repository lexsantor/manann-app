import { notFound } from "next/navigation";
import { MapPin, Map } from "lucide-react";
import { Icon } from "@/components/icon";
import { getOrgContext, listShipments } from "@/lib/erp";
import { WorldMap } from "@/components/app/world-map";
import { PageHeader } from "@/components/ui/page-header";
import { portCoords } from "@/lib/port-coords";
import { portLabel } from "@/lib/erp-format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Mapa de rutas — Manann" };

const STATUS_LABEL: Record<string, string> = {
  borrador: "Borrador",
  confirmado: "Confirmado",
  en_transito: "En tránsito",
  en_aduana: "En aduana",
  entregado: "Entregado",
  cerrado: "Cerrado",
};

const STATUS_DOT: Record<string, string> = {
  en_transito: "bg-primary",
  en_aduana: "bg-accent",
  confirmado: "bg-indigo-500",
  borrador: "bg-muted-foreground",
  entregado: "bg-green-500",
  cerrado: "bg-muted-foreground",
};

export default async function MapaPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const all = await listShipments(ctx.org.id);
  const active = all.filter((s) =>
    ["en_transito", "en_aduana", "confirmado"].includes(s.status),
  );

  const routes = all.map((s) => ({
    id: s.id,
    reference: s.reference,
    pol: s.pol,
    pod: s.pod,
    status: s.status,
    carrier: s.carrier,
  }));

  const mappable = active.filter(
    (s) => s.pol && s.pod && portCoords(s.pol) && portCoords(s.pod),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operaciones"
        icon={<Map strokeWidth={1.5} />}
        title="Mapa de rutas"
        subtitle={`${mappable.length} expediente${mappable.length !== 1 ? "s" : ""} activo${mappable.length !== 1 ? "s" : ""} en tránsito`}
      />

      <WorldMap routes={routes} />

      {/* Listado de rutas activas */}
      {active.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Expedientes activos
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((s) => (
              <a
                key={s.id}
                href={`/expedientes/${s.id}`}
                className="group flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/30 hover:bg-muted/40"
              >
                <span className={cn("mt-1 size-2 shrink-0 rounded-full", STATUS_DOT[s.status] ?? "bg-muted-foreground")} />
                <div className="min-w-0">
                  <p className="font-mono text-base font-medium text-foreground group-hover:text-primary">
                    {s.reference}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-base text-muted-foreground">
                    {s.pol ? portLabel(s.pol) : "—"}
                    <span className="text-muted-foreground/60">→</span>
                    {s.pod ? portLabel(s.pod) : "—"}
                  </p>
                  {s.carrier && (
                    <p className="mt-0.5 text-base text-muted-foreground/60">{s.carrier}</p>
                  )}
                </div>
                <span className="ml-auto shrink-0 text-base text-muted-foreground/60">
                  {STATUS_LABEL[s.status] ?? s.status}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {active.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Icon icon={MapPin} size={32} className="text-muted-foreground/55" />
          <p className="text-base text-muted-foreground">
            No hay expedientes activos en este momento.
          </p>
        </div>
      )}
    </div>
  );
}
