import { notFound } from "next/navigation";
import { Settings } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { listSystemParams } from "@/lib/maestros-actions";
import { SystemParamsPanel } from "@/components/app/system-params-panel";

export default async function ParametrosPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const params = await listSystemParams();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/maestros" className="hover:text-foreground transition-colors">Maestros</Link>
        <span>/</span>
        <span className="text-foreground">Parámetros del sistema</span>
      </div>

      <div className="flex items-center gap-3">
        <Settings className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Parámetros del sistema
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Configuración global de la organización — clave/valor
          </p>
        </div>
      </div>

      <SystemParamsPanel params={params} />
    </div>
  );
}
