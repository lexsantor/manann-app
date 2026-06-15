import { notFound } from "next/navigation";
import { TableProperties } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { BalanceSumasSaldos } from "@/components/app/balance-sumas-saldos";

export default async function BalancePage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/contabilidad" className="hover:text-foreground transition-colors">Contabilidad</Link>
        <span>/</span>
        <span className="text-foreground">Balance de sumas y saldos</span>
      </div>

      <div className="flex items-center gap-3">
        <TableProperties className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Balance de sumas y saldos
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Movimientos agregados por cuenta para el período seleccionado
          </p>
        </div>
      </div>

      <BalanceSumasSaldos />
    </div>
  );
}
