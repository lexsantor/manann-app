import { notFound } from "next/navigation";
import { PlaneTakeoff } from "lucide-react";
import { getOrgContext } from "@/lib/erp";
import { listFlights } from "@/lib/tier-s-actions";
import { FlightsPanel } from "@/components/app/flights-panel";
import { SimBadge } from "@/components/ui/sim-badge";

export default async function VuelosPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const flights = await listFlights();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <PlaneTakeoff className="h-5 w-5 shrink-0 self-start mt-1.5 text-muted-foreground" strokeWidth={1.5} />
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Catálogo de vuelos
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Vuelos de carga disponibles para asignación a manifiestos MAWB
            </p>
          </div>
        </div>
        <SimBadge>Simulación · OAG/IATA en producción</SimBadge>
      </div>

      <FlightsPanel flights={flights} />
    </div>
  );
}
