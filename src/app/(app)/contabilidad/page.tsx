import { notFound } from "next/navigation";
import { BookOpen, Lock, TableProperties, FileSpreadsheet, ArrowLeftRight } from "lucide-react";
import Link from "next/link";
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

      {/* Quick-access cards to Tier U submodules */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { href: "/contabilidad/cierres", icon: Lock, label: "Cierre de períodos", desc: "Bloquea meses cerrados" },
          { href: "/contabilidad/balance", icon: TableProperties, label: "Sumas y saldos", desc: "Balance por cuenta" },
          { href: "/contabilidad/modelo303", icon: FileSpreadsheet, label: "Modelo 303", desc: "IVA trimestral" },
          { href: "/contabilidad/conciliacion", icon: ArrowLeftRight, label: "Conciliación", desc: "Extracto vs. diario" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-start gap-2.5 rounded-md border border-border bg-card p-3 hover:border-primary/30 hover:bg-primary/5 transition-colors"
          >
            <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Two-column layout: diario + plan cuentas */}
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <DiarioContable entries={entries} accounts={accounts} />
        <PlanCuentas accounts={accounts} />
      </div>
    </div>
  );
}
