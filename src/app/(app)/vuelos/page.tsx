import { notFound } from "next/navigation";
import { PlaneTakeoff } from "lucide-react";
import { getOrgContext } from "@/lib/erp";
import { listFlights } from "@/lib/tier-s-actions";
import { FlightsPanel } from "@/components/app/flights-panel";
import { SimBadge } from "@/components/ui/sim-badge";
import { PageHeader } from "@/components/ui/page-header";

export default async function VuelosPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const flights = await listFlights();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operaciones"
        icon={<PlaneTakeoff strokeWidth={1.5} />}
        title="Catálogo de vuelos"
        subtitle="Vuelos de carga disponibles para asignación a manifiestos MAWB"
        actions={<SimBadge>Simulación · OAG/IATA en producción</SimBadge>}
      />

      <FlightsPanel flights={flights} />
    </div>
  );
}
