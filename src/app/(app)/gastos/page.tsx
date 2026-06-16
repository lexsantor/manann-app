import { notFound } from "next/navigation";
import { CreditCard } from "lucide-react";
import { getOrgContext } from "@/lib/erp";
import { listExpenses } from "@/lib/expense-actions";
import { GastosPanel } from "@/components/app/gastos-panel";

export const metadata = { title: "Gastos — Manann" };

export default async function GastosPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const expenses = await listExpenses();

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <CreditCard className="h-5 w-5 shrink-0 self-start mt-1.5 text-muted-foreground" strokeWidth={1.5} />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Gastos</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Gastos operativos de la organización</p>
        </div>
      </header>

      <GastosPanel initialExpenses={expenses} />
    </div>
  );
}
