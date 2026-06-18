import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
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

      <PageHeader
        icon={<Lock strokeWidth={1.5} />}
        title="Cierre de períodos"
        subtitle="Bloquea meses cerrados para garantizar la integridad contable"
      />

      <AccountingPeriodsPanel periods={periods} />
    </div>
  );
}
