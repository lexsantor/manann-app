import { notFound } from "next/navigation";
import { Plane } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { MASTER_AIRPORTS } from "@/lib/master-airports";
import { AirportsTable } from "@/components/app/airports-table";
import { PageHeader } from "@/components/ui/page-header";

export default async function AeropuertosPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/maestros" className="hover:text-foreground transition-colors">Maestros</Link>
        <span>/</span>
        <span className="text-foreground">Aeropuertos</span>
      </div>

      <PageHeader
        icon={<Plane strokeWidth={1.5} />}
        title="Aeropuertos"
        subtitle={`${MASTER_AIRPORTS.length} aeropuertos · Códigos IATA`}
      />

      <AirportsTable airports={MASTER_AIRPORTS} />
    </div>
  );
}
