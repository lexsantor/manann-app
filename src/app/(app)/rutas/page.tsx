import { notFound } from "next/navigation";
import { Route } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { getOrgContext } from "@/lib/erp";
import { listRouteTemplates } from "@/lib/tier-s-actions";
import { RouteTemplatesPanel } from "@/components/app/route-templates-panel";

export default async function RutasPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const templates = await listRouteTemplates();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operaciones"
        icon={<Route strokeWidth={1.5} />}
        title="Plantillas de ruta"
        subtitle="Rutas estándar para agilizar la apertura de expedientes"
      />

      <RouteTemplatesPanel templates={templates} />
    </div>
  );
}
