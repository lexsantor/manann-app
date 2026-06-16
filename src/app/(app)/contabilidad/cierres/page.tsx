import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { listPeriods } from "@/lib/contabilidad-actions";
import { AccountingPeriodsPanel } from "@/components/app/accounting-periods-panel";

export default async function CierresPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const periods = await listPeriods();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/contabilidad" className="hover:text-foreground transition-colors">Contabilidad</Link>
        <span>/</span>
        <span className="text-foreground">Cierre de períodos</span>
      </div>

      <div className="flex items-center gap-3">
        <Lock className="h-5 w-5 shrink-0 self-start mt-1.5 text-muted-foreground" strokeWidth={1.5} />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Cierre de períodos
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Bloquea meses cerrados para garantizar la integridad contable
          </p>
        </div>
      </div>

      <AccountingPeriodsPanel periods={periods} />
    </div>
  );
}
