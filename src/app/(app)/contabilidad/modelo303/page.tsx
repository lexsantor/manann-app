import { notFound } from "next/navigation";
import { FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { Modelo303Panel } from "@/components/app/modelo303-panel";
import { SimBadge } from "@/components/ui/sim-badge";

export default async function Modelo303Page() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/contabilidad" className="hover:text-foreground transition-colors">Contabilidad</Link>
        <span>/</span>
        <span className="text-foreground">Modelo 303</span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="h-5 w-5 shrink-0 self-start mt-1.5 text-muted-foreground" strokeWidth={1.5} />
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Modelo 303 — IVA trimestral
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Liquidación del Impuesto sobre el Valor Añadido
            </p>
          </div>
        </div>
        <SimBadge>Simulación · AEAT en producción</SimBadge>
      </div>

      <Modelo303Panel />
    </div>
  );
}
