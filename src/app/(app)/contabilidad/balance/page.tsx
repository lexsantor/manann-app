import { notFound } from "next/navigation";
import { TableProperties } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { BalanceSumasSaldos } from "@/components/app/balance-sumas-saldos";

export default async function BalancePage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/contabilidad" className="hover:text-foreground transition-colors">Contabilidad</Link>
        <span>/</span>
        <span className="text-foreground">Balance de sumas y saldos</span>
      </div>

      <PageHeader
        icon={<TableProperties strokeWidth={1.5} />}
        title="Balance de sumas y saldos"
        subtitle="Movimientos agregados por cuenta para el período seleccionado"
      />

      <BalanceSumasSaldos />
    </div>
  );
}
