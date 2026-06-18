import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { listIncidents } from "@/lib/calidad-actions";
import { IncidentsPanel } from "@/components/app/incidents-panel";

export default async function IncidenciasPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const items = await listIncidents();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/calidad" className="hover:text-foreground transition-colors">
          Calidad
        </Link>
        <span>/</span>
        <span className="text-foreground">Incidencias</span>
      </div>

      <PageHeader
        icon={<AlertTriangle strokeWidth={1.5} />}
        title="Incidencias"
        subtitle="Registro y seguimiento de incidencias operativas"
      />

      <IncidentsPanel initialItems={items} />
    </div>
  );
}
