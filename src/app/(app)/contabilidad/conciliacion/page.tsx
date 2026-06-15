import { notFound } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";
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
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/contabilidad" className="hover:text-foreground transition-colors">Contabilidad</Link>
        <span>/</span>
        <span className="text-foreground">Conciliación bancaria</span>
      </div>

      <div className="flex items-center gap-3">
        <ArrowLeftRight className="h-5 w-5 shrink-0 self-start mt-1.5 text-muted-foreground" strokeWidth={1.5} />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Conciliación bancaria
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Cruza el extracto bancario con los asientos del diario contable
          </p>
        </div>
      </div>

      <BankReconciliationPanel lines={bankLines} journalEntries={journalOptions} />
    </div>
  );
}
