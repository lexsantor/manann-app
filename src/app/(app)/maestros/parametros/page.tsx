import { notFound } from "next/navigation";
import { Settings } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { listSystemParams } from "@/lib/maestros-actions";
import { SystemParamsPanel } from "@/components/app/system-params-panel";
import { PageHeader } from "@/components/ui/page-header";

export default async function ParametrosPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const params = await listSystemParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/maestros" className="hover:text-foreground transition-colors">Maestros</Link>
        <span>/</span>
        <span className="text-foreground">Parámetros del sistema</span>
      </div>

      <PageHeader
        icon={<Settings strokeWidth={1.5} />}
        title="Parámetros del sistema"
        subtitle="Configuración global de la organización — clave/valor"
      />

      <SystemParamsPanel params={params} />
    </div>
  );
}
