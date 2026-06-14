import { notFound } from "next/navigation";
import { BookOpen } from "lucide-react";
import { getOrgContext, getAccountingAccounts, getJournalEntries, getTreasuryProjection } from "@/lib/erp";
import { Icon } from "@/components/icon";
import { PlanCuentas } from "@/components/app/plan-cuentas";
import { DiarioContable } from "@/components/app/diario-contable";
import { TesoreraWidget } from "@/components/app/tesorera-widget";

export default async function ContabilidadPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const [accounts, entries, treasury] = await Promise.all([
    getAccountingAccounts(ctx.org.id),
    getJournalEntries(ctx.org.id),
    getTreasuryProjection(ctx.org.id),
  ]);

  return (
    <div className="space-y-6 p-5 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-card">
          <Icon icon={BookOpen} size={16} className="text-muted-foreground" />
        </span>
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">Contabilidad</h1>
          <p className="text-sm text-muted-foreground">Plan contable PGC · Diario · Tesorería</p>
        </div>
      </div>

      {/* Treasury summary */}
      <TesoreraWidget
        totalCobrar={treasury.totalCobrar}
        totalPagar={treasury.totalPagar}
        pendingInvoices={treasury.pendingInvoices}
      />

      {/* Two-column layout: diario + plan cuentas */}
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <DiarioContable entries={entries} accounts={accounts} />
        <PlanCuentas accounts={accounts} />
      </div>
    </div>
  );
}
