import { notFound } from "next/navigation";
import { PlaneTakeoff } from "lucide-react";
import { getOrgContext } from "@/lib/erp";
import { listFlights } from "@/lib/tier-s-actions";
import { FlightsPanel } from "@/components/app/flights-panel";

export default async function VuelosPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const flights = await listFlights();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <PlaneTakeoff className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Catálogo de vuelos
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Vuelos de carga disponibles para asignación a manifiestos MAWB
            </p>
          </div>
        </div>
        <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
          Simulación — integración OAG/IATA en producción
        </span>
      </div>

      <FlightsPanel flights={flights} />
    </div>
  );
}
