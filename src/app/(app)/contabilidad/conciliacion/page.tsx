import { notFound } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";
import { getOrgContext, getJournalEntries } from "@/lib/erp";
import { listBankLines } from "@/lib/contabilidad-actions";
import { BankReconciliationPanel } from "@/components/app/bank-reconciliation-panel";

export default async function ConciliacionPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const [bankLines, journalEntries] = await Promise.all([
    listBankLines(),
    getJournalEntries(ctx.org.id),
  ]);

  const journalOptions = journalEntries.map((e) => ({
    id: e.id,
    reference: e.reference,
    date: e.date,
    description: e.description,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/contabilidad" className="hover:text-foreground transition-colors">Contabilidad</Link>
        <span>/</span>
        <span className="text-foreground">Conciliación bancaria</span>
      </div>

      <PageHeader
        icon={<ArrowLeftRight strokeWidth={1.5} />}
        title="Conciliación bancaria"
        subtitle="Cruza el extracto bancario con los asientos del diario contable"
      />

      <BankReconciliationPanel lines={bankLines} journalEntries={journalOptions} />
    </div>
  );
}
