import { notFound } from "next/navigation";
import { FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { Modelo303Panel } from "@/components/app/modelo303-panel";

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

      <div className="flex items-start justify-between">
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
        <span className="inline-flex items-center rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
          Simulación — presentación AEAT en producción
        </span>
      </div>

      <Modelo303Panel />
    </div>
  );
}
