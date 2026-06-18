import { notFound } from "next/navigation";
import { FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { Modelo303Panel } from "@/components/app/modelo303-panel";
import { SimBadge } from "@/components/ui/sim-badge";
import { PageHeader } from "@/components/ui/page-header";

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

      <PageHeader
        icon={<FileSpreadsheet strokeWidth={1.5} />}
        title="Modelo 303 — IVA trimestral"
        subtitle="Liquidación del Impuesto sobre el Valor Añadido"
        actions={<SimBadge>Simulación · AEAT en producción</SimBadge>}
      />

      <Modelo303Panel />
    </div>
  );
}
