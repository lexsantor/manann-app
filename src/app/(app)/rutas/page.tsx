import { notFound } from "next/navigation";
import { Route } from "lucide-react";
import { getOrgContext } from "@/lib/erp";
import { listRouteTemplates } from "@/lib/tier-s-actions";
import { RouteTemplatesPanel } from "@/components/app/route-templates-panel";

export default async function RutasPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const templates = await listRouteTemplates();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Route className="h-5 w-5 shrink-0 self-start mt-1.5 text-muted-foreground" strokeWidth={1.5} />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Plantillas de ruta
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Rutas estándar para agilizar la apertura de expedientes
          </p>
        </div>
      </div>

      <RouteTemplatesPanel templates={templates} />
    </div>
  );
}
