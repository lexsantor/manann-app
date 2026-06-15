import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { listIncidents } from "@/lib/calidad-actions";
import { IncidentsPanel } from "@/components/app/incidents-panel";

export default async function IncidenciasPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const items = await listIncidents();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/calidad" className="hover:text-foreground transition-colors">
          Calidad
        </Link>
        <span>/</span>
        <span className="text-foreground">Incidencias</span>
      </div>

      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Incidencias
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Registro y seguimiento de incidencias operativas
          </p>
        </div>
      </div>

      <IncidentsPanel initialItems={items} />
    </div>
  );
}
