import { notFound } from "next/navigation";
import { Plane } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { MASTER_AIRPORTS } from "@/lib/master-airports";
import { AirportsTable } from "@/components/app/airports-table";

export default async function AeropuertosPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/maestros" className="hover:text-foreground transition-colors">Maestros</Link>
        <span>/</span>
        <span className="text-foreground">Aeropuertos</span>
      </div>

      <div className="flex items-center gap-3">
        <Plane className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Aeropuertos
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {MASTER_AIRPORTS.length} aeropuertos · Códigos IATA
          </p>
        </div>
      </div>

      <AirportsTable airports={MASTER_AIRPORTS} />
    </div>
  );
}
